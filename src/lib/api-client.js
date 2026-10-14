import axios from 'axios'
import { clearOfflineCaches } from '@/lib/offline-cache'
import { clearAll as clearAllOutbox } from '@/lib/outbox'
import { useConnectivityStore } from '@/store/connectivity.store'
import { publishSessionEvent, SESSION_EVENTS } from '@/lib/session-channel'
// Imported for its getState() teardown, not as a hook. No cycle: auth.store
// pulls only auth-hint and utils, neither of which reaches back here.
import { useAuthStore } from '@/store/auth.store'
import {
  isEdgeThrottle,
  isGatewayError,
  retryAfterSeconds,
} from '@/lib/api-error'

/*
 * Relative by default, and that is the important part.
 *
 * '/api' resolves against whatever origin the page is served from, and
 * next.config.mjs rewrites it to the backend server-side. The browser therefore
 * only ever sees ONE origin, which is what makes the auth cookies first-party.
 *
 * Pointing this at an absolute cross-domain URL is what broke production:
 * Safari and mobile Chrome refused to store the backend's cookies because they
 * were third-party, so every user logged in successfully and was then
 * immediately signed out. Keep this relative unless the API is genuinely
 * same-site with the frontend (e.g. app.varadhi.com + api.varadhi.com).
 */
const BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

const apiClient = axios.create({
  baseURL: BASE,
  timeout: 10000,
  // Non-negotiable: the access and refresh tokens are httpOnly cookies on a
  // different origin, so without this the browser sends no credentials at all.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    // CSRF defence. Auth cookies must be SameSite=None on this split
    // Vercel/Render deployment, so SameSite protects nothing; the backend
    // instead requires this header on every mutation. Its presence forces a
    // CORS preflight, which only allow-listed origins can pass — a hostile page
    // can neither set it nor avoid needing it. Sent on every request (not just
    // mutations) so no call site can forget it.
    'X-Requested-With': 'XMLHttpRequest',
  },
})

/*
 * No Authorization header is set anywhere in this file, deliberately.
 *
 * Tokens live in httpOnly cookies and the backend no longer accepts Bearer at
 * all. The previous version read a token out of sessionStorage and attached it
 * here, which is what made revocation impossible — a header token skipped the
 * database check entirely, so a "revoked" session kept working. If you find
 * yourself re-adding an Authorization header, the bug is elsewhere.
 */

// ─── Forced sign-out ────────────────────────────────────────────────────────

/*
 * Runs when the session is definitively over and no refresh can save it.
 *
 * `notifySiblings` is false when this tab is REACTING to another tab's logout
 * broadcast — re-broadcasting would bounce the event around every tab forever.
 */
let signingOut = false

export async function forceSignOut({ notifySiblings = true } = {}) {
  // A burst of parallel 401s must produce exactly one sign-out, not one per
  // failed request — otherwise the user gets N redirects and N cache wipes.
  if (signingOut) return
  signingOut = true

  /*
   * Already on an auth route — clear local state and STOP. No broadcast, no
   * navigation.
   *
   * This check must come BEFORE the broadcast, and that ordering is the whole
   * fix for a logout storm. Previously it sat further down, after the
   * publish, which created a feedback loop across tabs:
   *
   *   tab 1 logs out and broadcasts
   *     -> tab 3 navigates to /auth/login
   *     -> tab 3's still-in-flight React Query request 401s with NO_TOKEN
   *     -> the interceptor tries a refresh, which fails
   *     -> forceSignOut() fires and BROADCASTS ANOTHER LOGOUT
   *     -> every tab navigates to /auth/login again, remounting the login form
   *     -> repeat
   *
   * Each re-navigation remounted LoginForm and cancelled its in-flight session
   * probe, so the spinner never resolved. Returning early here means a 401 on
   * an auth route can no longer re-trigger the cycle: the tab is already where
   * a signed-out user belongs, and its siblings already know.
   */
  /*
   * Same teardown the sidebar's logout uses — the store's clearAuth().
   *
   * This used to call clearAuthHint() alone, which removed the route-gate
   * cookie but left `varadhi_user` in localStorage. A user whose session died
   * server-side was redirected to the login page with the previous identity
   * still cached on the device. Routing every terminal path through one
   * function is what stops the two cleanups drifting apart again.
   *
   * clearAuth touches only storage and store state — no network call, no
   * broadcast — so it cannot re-enter this function or restart a logout storm.
   */
  useAuthStore.getState().clearAuth()

  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/auth/')
  ) {
    await Promise.allSettled([clearOfflineCaches(), clearAllOutbox()])
    signingOut = false
    return
  }

  if (notifySiblings) {
    publishSessionEvent(SESSION_EVENTS.LOGOUT, { reason: 'unauthorized' })
  }

  // This user's cached responses and queued mutations must not survive into
  // whoever signs in next on this device — the same reasoning the sidebar's
  // logout already follows. Best-effort: a failure here must not block the
  // redirect, or the user is stranded on an authenticated-looking page.
  await Promise.allSettled([clearOfflineCaches(), clearAllOutbox()])

  if (typeof window !== 'undefined') {
    // Hard navigation rather than a router push: it tears down all in-memory
    // React state, which is the only way to be sure no component keeps
    // rendering the previous user's data. (The already-on-/auth/ case returned
    // early above.)
    window.location.href = '/auth/login'
  }
}

// ─── Single-flight silent refresh ───────────────────────────────────────────

/*
 * THE MOST IMPORTANT FUNCTION IN THIS FILE.
 *
 * The dashboard fires many requests at once. When the 15-minute access token
 * expires, they all 401 together. The previous implementation called
 * /auth/refresh from each one independently, and with refresh-token rotation
 * that is fatal: the first call rotates the token and revokes the old one, and
 * every other in-flight call then presents a token the server has just killed.
 * The backend's reuse detection treats a replayed refresh token as a stolen
 * credential and revokes EVERY session for the user — so a perfectly normal
 * page load would sign the user out of all their devices.
 *
 * The fix is to let exactly one refresh be in flight. Every other 401 awaits
 * the same promise and then retries. The backend also has a 15-second grace
 * window as a second line of defence, but correctness should not depend on it.
 *
 * The promise is cleared in `finally` so a failed refresh does not poison
 * subsequent attempts with a permanently rejected promise.
 */
let refreshPromise = null

function refreshSession() {
  if (refreshPromise) return refreshPromise

  refreshPromise = axios
    .post(
      `${BASE}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        // Deliberately longer than the client's 10s default. Render's free tier
        // spins containers down when idle, and a cold start can exceed 10
        // seconds — a refresh that times out is indistinguishable from a failed
        // one, and would sign out every user whose first request of the morning
        // happens to wake the server.
        timeout: 30000,
      }
    )
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

// ─── Cold-start / edge-throttle retry ─────────────────────────

/*
 * WHY THIS EXISTS
 *
 * The API runs on a Render free instance, which hibernates after ~15 minutes
 * of inactivity. The first person to open the app in the morning does not send
 * one request, they send several at once (the session probe, then the login
 * POST, then the dashboard's queries), and Render's router answers a burst
 * aimed at a sleeping instance with a bare 429 carrying
 * `x-render-routing: hibernate-rate-limited`. Nothing of ours runs. On
 * 2026-10-14 that locked the whole office out of logging in, and because the
 * body is plain text rather than our envelope the form blamed their passwords.
 *
 * Retrying is correct here in a way it would NOT be for our own 429: an edge
 * throttle means the request was never processed, so replaying it cannot
 * duplicate anything — not even a login. `isEdgeThrottle` is what draws that
 * line, and our application limiter (envelope with `code: rate_limited`) is
 * deliberately left to pass straight through to the caller.
 *
 * A gateway error (502/503/504) is retried only for methods that are safe to
 * replay, because unlike a 429 it cannot prove the request went unprocessed —
 * the instance may have handled it and died before answering.
 *
 * THIS IS A CUSHION, NOT THE FIX. It converts "everyone is locked out" into
 * "the first request of the morning is slow". The fix for hibernation itself is
 * to stop the instance hibernating — see backend/.github/workflows/keep-warm.yml
 * and the paid-instance note in backend/docs/PRODUCTION-DEPLOYMENT.md.
 */
const INFRA_RETRY_LIMIT = 3

// Longer than the 10s default: a retry is usually racing a cold start, and a
// 10s timeout would abort the very request that is waking the container.
const COLD_START_TIMEOUT = 30000

const REPLAYABLE_METHODS = ['get', 'head', 'options']

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function infraRetryDelay(error, attempt) {
  const asked = retryAfterSeconds(error)
  // Honour Retry-After, but never park a user behind a long one — Render's
  // hibernate throttle clears in seconds once the container is up.
  if (asked) return Math.min(asked, 15) * 1000
  return Math.min(1500 * 2 ** attempt, 8000) // 1.5s, 3s, 6s
}

/*
 * A cold start can out-last the 10s client timeout. Axios then aborts with no
 * response at all, which is byte-for-byte indistinguishable from being offline
 * — so the request that was busy WAKING the server would raise the offline
 * banner and fail. One more attempt with a cold-start timeout settles it.
 *
 * Replayable methods only: a timeout, unlike a shed 429, cannot prove the
 * request went unprocessed. The server may have applied it and simply answered
 * too late, so replaying a POST could duplicate a mutation.
 */
const TIMEOUT_RETRY_LIMIT = 1

function isTimeout(error) {
  if (error?.response) return false
  return (
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ETIMEDOUT' ||
    /timeout/i.test(error?.message || '')
  )
}

function shouldRetryTimeout(error, config) {
  if (!isTimeout(error)) return false
  if ((config?._timeoutRetries || 0) >= TIMEOUT_RETRY_LIMIT) return false
  const method = String(config?.method || 'get').toLowerCase()
  return REPLAYABLE_METHODS.includes(method)
}

function shouldRetryInfra(error, config) {
  if ((config?._infraRetries || 0) >= INFRA_RETRY_LIMIT) return false
  if (isEdgeThrottle(error)) return true
  const method = String(config?.method || 'get').toLowerCase()
  return isGatewayError(error) && REPLAYABLE_METHODS.includes(method)
}

// ─── Interceptors ───────────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => {
    // Proof the API is reachable — outranks navigator.onLine, which stays true
    // on a captive portal. Clears the offline banner as soon as data arrives.
    useConnectivityStore.getState().reportNetworkSuccess()
    return response
  },
  async (error) => {
    const status = error.response?.status
    const code = error.response?.data?.code
    const original = error.config

    if (!error.response) {
      // Give a cold start one more chance before calling the network broken.
      if (shouldRetryTimeout(error, original)) {
        original._timeoutRetries = (original._timeoutRetries || 0) + 1
        original.timeout = COLD_START_TIMEOUT
        return apiClient(original)
      }

      // No response at all — DNS failure, refused connection, timeout, or the
      // device really is offline. The signal navigator.onLine misses.
      useConnectivityStore.getState().reportNetworkError()
      return Promise.reject(error)
    }

    // Infrastructure said no before the application saw the request. Replay it
    // rather than surfacing a failure the user cannot act on.
    if (shouldRetryInfra(error, original)) {
      original._infraRetries = (original._infraRetries || 0) + 1
      original.timeout = Math.max(Number(original.timeout) || 0, COLD_START_TIMEOUT)
      await sleep(infraRetryDelay(error, original._infraRetries - 1))
      return apiClient(original)
    }

    if (status !== 401) return Promise.reject(error)

    // Never try to refresh a failed refresh — that is an infinite loop with a
    // network request in it.
    if (original?.url?.includes('/auth/refresh')) {
      await forceSignOut()
      return Promise.reject(error)
    }

    /*
     * Two codes are worth a refresh attempt:
     *
     *   TOKEN_EXPIRED  the access token lapsed but was still sent.
     *   NO_TOKEN       no access cookie arrived at all. This is NOT only the
     *                  signed-out case — a browser deletes a cookie once its
     *                  Max-Age passes, so a returning user whose access cookie
     *                  aged out looks identical to one who never had it. Since
     *                  httpOnly cookies are invisible to this code, the only
     *                  way to tell them apart is to try the refresh: it costs
     *                  one request and it is what keeps a genuinely valid
     *                  7-day session alive.
     *
     * Everything else is terminal, and refreshing would waste a round trip:
     *
     *   SESSION_REVOKED   signed out elsewhere, password changed, or expired.
     *                     The refresh token is dead too.
     *   TOKEN_REUSE       a replayed refresh token was detected and every
     *                     session for this user has already been revoked.
     *   TOKEN_INVALID     bad signature, wrong token type, or a pre-migration
     *                     token with no sessionId claim.
     */
    if (code !== 'TOKEN_EXPIRED' && code !== 'NO_TOKEN') {
      await forceSignOut()
      return Promise.reject(error)
    }

    // One retry per request, ever. Without this a request that 401s again after
    // a successful refresh (a genuinely revoked session, say) would loop.
    if (original._retriedAfterRefresh) {
      await forceSignOut()
      return Promise.reject(error)
    }

    try {
      await refreshSession()
    } catch (refreshError) {
      await forceSignOut()
      return Promise.reject(refreshError)
    }

    // Tell sibling tabs the session is alive so their own timers can reset.
    // Carries no token — the new cookies are already shared browser-wide.
    publishSessionEvent(SESSION_EVENTS.REFRESHED)

    original._retriedAfterRefresh = true
    return apiClient(original)
  }
)

export default apiClient

// Collect paginated resources for boards and selectors that need the complete list.
export async function fetchAllPages(fetchPage) {
  const items = []
  let page = 1
  while (true) {
    const result = await fetchPage(page)
    if (!result || !Array.isArray(result.data) || !Number.isFinite(Number(result.totalPages))) {
      throw new Error('Invalid paginated response')
    }
    items.push(...result.data)
    if (page >= Number(result.totalPages)) return items
    if (result.data.length === 0) throw new Error('Incomplete paginated response')
    page += 1
  }
}
