/*
 * Who is talking: the application, or something in front of it?
 *
 * The backend answers EVERY error with `{ success, message, data }`
 * (utils/response.js). So a body carrying a string `message` is our API talking
 * about this request. A plain-text body is an edge — Vercel's proxy or Render's
 * router — talking about infrastructure, and it knows nothing about the email
 * or the password.
 *
 * Why this matters: on 2026-10-14 nobody could sign in and the form said
 * "Invalid email or password" for every correct credential. The real answer was
 * a 429 carrying `x-render-routing: hibernate-rate-limited` — Render's router
 * shedding requests aimed at a free instance that had gone to sleep, so the
 * password check never ran. The form blamed passwords only because it fell back
 * to a password error whenever `response.data.message` was missing, and an
 * edge's body ("Too Many Requests") has no `message`.
 */

const isAppErrorBody = (err) => {
  const data = err?.response?.data
  return Boolean(data) && typeof data === 'object' && typeof data.message === 'string'
}

// A throttle imposed in FRONT of the application: our own limiter answers with
// the envelope and its own message, so it is not this.
const isEdgeThrottle = (err) =>
  err?.response?.status === 429 && !isAppErrorBody(err)

// The instance is down, restarting, or still cold; the router answers for it.
const isGatewayError = (err) =>
  [502, 503, 504].includes(err?.response?.status) && !isAppErrorBody(err)

/**
 * One sentence to put in front of a person.
 *
 * `fallback` is used ONLY when the APPLICATION rejected the request without a
 * message of its own — never for an edge response, and never for a network
 * failure. That restriction is the whole fix.
 */
export function describeApiError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err?.response) {
    return "Can't reach the server. Check your connection and try again."
  }
  if (isEdgeThrottle(err)) {
    // Deliberately says nothing about credentials: the server never read them.
    return 'The server is waking up and turned away too many requests at once. Wait about a minute, then try again.'
  }
  if (isGatewayError(err)) {
    return 'The server is starting up and is not answering yet. Wait about a minute, then try again.'
  }
  if (isAppErrorBody(err)) return err.response.data.message

  return err.response.status >= 500
    ? 'The server hit an error. Please try again in a moment.'
    : fallback
}
