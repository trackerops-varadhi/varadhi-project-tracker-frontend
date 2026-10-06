'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

import { timeManagementApi } from '@/lib/api/time-management.api'
import { businessToday } from '@/lib/business-date'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

/** admin/manager/hr: who submitted a work status for a day, and who did not. */
export function TeamWorkStatus() {
  const [date, setDate] = useState(businessToday())
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let active = true
    timeManagementApi.getTeamWorkStatus(date)
      .then((d) => { if (active) { setData(d); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load team work status.')) })
    return () => { active = false }
  }, [date])

  const items = (data?.items ?? []).filter((i) => {
    if (filter === 'submitted') return Boolean(i.status)
    if (filter === 'missing') return !i.status && i.checkedIn
    return true
  })

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="team-status-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="team-status-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Users size={18} className="text-primary" /> Team work status
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" aria-label="Date" value={date} max={businessToday()}
            onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-slate-200 p-1.5 text-xs" />
          <select aria-label="Filter" value={filter} onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-200 p-1.5 text-xs">
            <option value="all">Everyone</option>
            <option value="submitted">Submitted</option>
            <option value="missing">Logged time, no status</option>
          </select>
        </div>
      </div>
      {data && (
        <p className="mt-2 text-xs text-slate-500">
          {data.submitted} submitted · {data.missing} logged time without a status · {data.items.length} active people
        </p>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
      {!data && !error && <p className="mt-2 text-xs text-slate-400">Loading…</p>}
      <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((i) => (
          <li key={i.userId} className="rounded-xl border border-slate-100 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-800">{i.userName}</p>
              {i.status ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Submitted</span>
              ) : i.checkedIn ? (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">Missing</span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">No time logged</span>
              )}
            </div>
            {i.status && (
              <div className="mt-1.5 space-y-1 text-slate-600">
                <p className="whitespace-pre-wrap">{i.status.summary}</p>
                {i.status.blockers && <p className="text-rose-700">Blockers: {i.status.blockers}</p>}
                {i.status.tomorrowPlan && <p className="text-slate-500">Next: {i.status.tomorrowPlan}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
