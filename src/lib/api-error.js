/*
 * What an API failure actually MEANS to a person.
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *
 * On 2026-10-14 nobody in the office could sign in. The form said "Invalid
 * email or password. Try again." for every correct credential, while the
 * console showed the real answer:
 *
 *   GET  /api/auth/me    429 (Too Many Requests)
 *   POST /api/auth/login 429 (Too Many Requests)
 *
 * The 429 was not ours. It carried `x-render-routing: hibernate-rate-limited`,
 * which is Render's router refusing a burst of requests aimed at a free-tier
 * instance that had spun down. The request never reached Express, so neither
 * the login rate limiter nor the password check ever ran — and `/auth/me` is
 * not rate limited by this application at all, which is the tell.
 *
 * The form showed a password error because it fell back to a password error
 * whenever `response.data.message` was missing. An edge's body is plain text
 * ("Too Many Requests"), not our envelope, so the fallback fired and told
 * everyone a lie about their own credentials.
 *
 * THE RULE THIS ENCODES
 * The backend answers EVERY error with `{ success, message, data }`
 * (utils/response.js). So a body carrying a string `message` is the
 * application talking about this request. A plain-text body is an edge —
 * Vercel's proxy or Render's router — talking about infrastructure, and it
 * knows nothing about the email or the password. Never translate one into a
 * statement about the other.
 */

const EDGE_THROTTLE = 429
const GATEWAY_STATUSES = [502, 503, 504]

/**
 * Did this error body come from our own application?
 * @returns {boolean}
 */
export function isAppErrorBody(err) {
  const data = err?.response?.data
  return Boolean(data) && typeof data === 'object' && typeof data.message === 'string'
}

/*
 * A throttle imposed in FRONT of the application: the request was rejected
 * before any handler saw it, so retrying it is safe for any HTTP method. That
 * is the difference from our own limiter, whose 429 means "we counted this and
 * we are refusing you" — retrying that one just burns the next slot.
 */
export function isEdgeThrottle(err) {
  return err?.response?.status === EDGE_THROTTLE && !isAppErrorBody(err)
}

/*
 * The instance is down, restarting, or still cold. Render's router answers for
 * it until it is back. Also not the application's own voice.
 */
export function isGatewayError(err) {
  const status = err?.response?.status
  return GATEWAY_STATUSES.includes(status) && !isAppErrorBody(err)
}

/** Seconds the edge asked us to wait, if it said. @returns {number|null} */
export function retryAfterSeconds(err) {
  const header = err?.response?.headers?.['retry-after']
  const fromBody = err?.response?.data?.data?.retryAfter
  const value = Number(header ?? fromBody)
  return Number.isFinite(value) && value > 0 ? value : null
}

/**
 * One sentence to put in front of a person.
 *
 * `fallback` is used ONLY when the failure really is the application rejecting
 * this request without a message of its own — never for an edge response, and
 * never for a network failure. That restriction is the bug fix.
 *
 * @param {unknown} err      an axios error
 * @param {string} fallback  caller's domain-specific default (e.g. a bad password)
 * @returns {string}
 */
export function describeApiError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err?.response) {
    return "Can't reach the server. Check your connection and try again."
  }

  if (isEdgeThrottle(err)) {
    // Deliberately says nothing about credentials. The server did not look at
    // them. "Waking up" is the honest description of a hibernating instance
    // shedding a burst of requests.
    return 'The server is waking up and turned away too many requests at once. Wait about a minute, then try again.'
  }

  if (isGatewayError(err)) {
    return 'The server is starting up and is not answering yet. Wait about a minute, then try again.'
  }

  // Our own limiter, our own message — it already says how long to wait.
  if (isAppErrorBody(err)) return err.response.data.message

  // An HTML error page, an empty body, an unexpected proxy. Not a credential
  // problem either, so say what is actually known.
  return err.response.status >= 500
    ? 'The server hit an error. Please try again in a moment.'
    : fallback
}
