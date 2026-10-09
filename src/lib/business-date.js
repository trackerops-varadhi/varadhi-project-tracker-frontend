// The office's calendar day, as the backend computes it (BUSINESS_TZ,
// Asia/Kolkata). Used only to pick default date ranges for requests — every
// decision about "today" is still made by the server.

const BUSINESS_TZ = 'Asia/Kolkata'

export function businessToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export function addDays(ymd, n) {
  const d = new Date(`${ymd}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/**
 * Whole days from `from` to `to`, both 'YYYY-MM-DD'. Positive when `to` is
 * later. Parsed at UTC midnight so a daylight-saving change cannot turn a
 * difference of one day into 0.96 and then, floored, into zero.
 */
export function daysBetween(from, to) {
  if (!from || !to) return null
  const a = new Date(`${from}T00:00:00Z`)
  const b = new Date(`${to}T00:00:00Z`)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
  return Math.round((b - a) / 86400000)
}

export function weekdayShort(ymd) {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' })
}

export function shortDate(ymd) {
  if (!ymd) return '—'
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', timeZone: 'UTC',
  })
}
