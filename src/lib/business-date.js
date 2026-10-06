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

export function weekdayShort(ymd) {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' })
}

export function shortDate(ymd) {
  if (!ymd) return '—'
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', timeZone: 'UTC',
  })
}
