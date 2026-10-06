'use client'

import { useEffect, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { peopleApi } from '@/lib/api/people.api'
import { businessToday, addDays } from '@/lib/business-date'
import { EXIT_TYPE_LABELS, REASON_CATEGORY_LABELS } from '@/constants/people'
import { Banner, errorMessage, inputClass } from './ui'

const BAR = '#7c3aed'

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  )
}

function ChartCard({ title, data, labels }) {
  const rows = data.map((d) => ({ name: labels?.[d.key] ?? d.key, count: d.count }))
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="mb-2 text-xs font-semibold text-slate-800">{title}</h3>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-xs text-slate-400">No exits in this period.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={rows.length > 4 ? -20 : 0} textAnchor={rows.length > 4 ? 'end' : 'middle'} height={rows.length > 4 ? 48 : 24} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#f5f3ff' }} />
              <Bar dataKey="count" name="Exits" fill={BAR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

/** "Why are people leaving?" — admin/manager/hr. */
export function AttritionAnalytics() {
  const [to, setTo] = useState(businessToday())
  const [from, setFrom] = useState(addDays(businessToday(), -365))
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    peopleApi.getAttritionAnalytics({ from, to })
      .then((d) => { if (active) { setData(d); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load attrition analytics.')) })
    return () => { active = false }
  }, [from, to])

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Last working day between</span>
        <input type="date" aria-label="From" className={`${inputClass} w-auto`} value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-slate-500">and</span>
        <input type="date" aria-label="To" className={`${inputClass} w-auto`} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <Banner error={error} />
      {!data && !error && <p className="text-xs text-slate-400">Loading…</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Exits" value={data.totalExits} />
            <Stat label="Attrition rate" value={`${data.attritionRate}%`} hint={`against ${data.headcount} active people`} />
            <Stat label="Average tenure" value={data.averageTenureMonths != null ? `${data.averageTenureMonths} mo` : '—'} />
            <Stat label="Top reason" value={data.byReason[0] ? (REASON_CATEGORY_LABELS[data.byReason[0].key] ?? data.byReason[0].key) : '—'} />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <ChartCard title="By reason" data={data.byReason} labels={REASON_CATEGORY_LABELS} />
            <ChartCard title="By month" data={data.byMonth} />
            <ChartCard title="By product" data={data.byProduct} />
            <ChartCard title="By exit type" data={data.byType} labels={EXIT_TYPE_LABELS} />
          </div>
        </>
      )}
    </section>
  )
}
