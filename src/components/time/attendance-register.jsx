'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, Download } from 'lucide-react'

import { timeManagementApi } from '@/lib/api/time-management.api'
import { businessToday, addDays, shortDate, weekdayShort } from '@/lib/business-date'
import { ATTENDANCE_STATUS_META } from '@/constants/people'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

const mondayOf = (ymd) => {
  const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay()
  return addDays(ymd, dow === 0 ? -6 : 1 - dow)
}

/**
 * admin/manager/hr: the attendance register — one row per person, one cell
 * per day, derived server-side from time logs (present / WFH / half day),
 * approved leave and weekends. Defaults to the current week.
 */
export function AttendanceRegister() {
  const [from, setFrom] = useState(() => mondayOf(businessToday()))
  const [to, setTo] = useState(() => addDays(mondayOf(businessToday()), 6))
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    timeManagementApi.getAttendance(from, to)
      .then((d) => { if (active) { setData(d); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load attendance.')) })
    return () => { active = false }
  }, [from, to])

  const shiftWeek = (n) => {
    setFrom((f) => addDays(f, 7 * n))
    setTo((t) => addDays(t, 7 * n))
  }

  const exportCsv = () => {
    if (!data) return
    const header = ['Employee', ...data.dates]
    const rows = data.items.map((i) => [i.userName, ...i.days.map((d) => ATTENDANCE_STATUS_META[d.status]?.label ?? '')])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${data.from}-to-${data.to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="attendance-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="attendance-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <CalendarCheck size={18} className="text-primary" /> Attendance register
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button type="button" onClick={() => shiftWeek(-1)} className="rounded-lg border px-2 py-1.5 hover:bg-slate-50">← Prev week</button>
          <input type="date" aria-label="From" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-slate-200 p-1.5" />
          <input type="date" aria-label="To" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-slate-200 p-1.5" />
          <button type="button" onClick={() => shiftWeek(1)} className="rounded-lg border px-2 py-1.5 hover:bg-slate-50">Next week →</button>
          <button type="button" onClick={exportCsv} disabled={!data} className="flex items-center gap-1 rounded-lg border px-2 py-1.5 hover:bg-slate-50 disabled:opacity-50">
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
        {Object.entries(ATTENDANCE_STATUS_META).map(([key, m]) => (
          <span key={key} className={`rounded px-1.5 py-0.5 ${m.className}`}>{m.short} = {m.label}</span>
        ))}
      </div>

      {error && <p role="alert" className="mt-3 text-xs text-rose-600">{error}</p>}
      {!data && !error && <p className="mt-3 text-xs text-slate-400">Loading…</p>}

      {data && (
        <div className="mt-3 overflow-x-auto" role="region" aria-label="Attendance by person and day" tabIndex={0}>
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th scope="col" className="py-2 pr-2 text-left font-medium">Employee</th>
                {data.dates.map((d) => (
                  <th key={d} scope="col" className="px-1 py-2 text-center font-medium">
                    <span className="block">{weekdayShort(d)}</span>
                    <span className="block text-[10px] text-slate-400">{shortDate(d)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((i) => (
                <tr key={i.userId} className="border-b border-slate-100">
                  <th scope="row" className="py-1.5 pr-2 text-left font-medium text-slate-800">{i.userName}</th>
                  {i.days.map((d) => {
                    const m = ATTENDANCE_STATUS_META[d.status]
                    return (
                      <td key={d.date} className="px-1 py-1.5 text-center">
                        {m ? (
                          <span className={`inline-block min-w-8 rounded px-1 py-0.5 text-[10px] font-semibold ${m.className}`}
                            title={`${m.label}${d.hours ? ` · ${d.hours}h` : ''}`}>
                            {m.short}
                          </span>
                        ) : <span className="text-slate-300">·</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="text-[11px] text-slate-500">
                <th scope="row" className="py-2 pr-2 text-left font-medium">Present / leave / absent</th>
                {data.dates.map((d) => {
                  const s = data.summary[d]
                  return (
                    <td key={d} className="px-1 py-2 text-center tabular-nums">
                      {s.present + s.wfh}/{s.on_leave + s.half_day}/{s.absent}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
