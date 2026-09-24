import { CalendarDays } from 'lucide-react'

export default function LeaveOverview({ planned = 3, unplanned = 6, pending = 3 }) {
  const total = planned + unplanned
  const categories = [
    { label: 'Planned', count: planned, color: 'bg-violet-500' },
    { label: 'Unplanned', count: unplanned, color: 'bg-amber-500' },
  ]

  return (
    <section
      aria-labelledby="leave-overview-title"
      className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h2 id="leave-overview-title" className="text-xs font-semibold text-slate-900">Leave Overview</h2>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">Today / leave breakdown</p>
        </div>
        <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
        <div>
          <p className="text-xl font-bold leading-none tabular-nums text-slate-900">{total}</p>
          <p className="mt-1 text-[11px] text-slate-500">Employees on leave</p>
        </div>
        <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">{pending} pending</span>
      </div>

      <dl className="my-2 space-y-1.5">
        {categories.map((category) => (
          <div key={category.label} className="rounded-lg border border-slate-100 px-2.5 py-1.5">
            <div className="mb-1 flex items-center justify-between text-xs">
              <dt className="text-[11px] text-slate-600">{category.label}</dt>
              <dd className="text-[11px] font-semibold tabular-nums text-slate-900">
                {category.count} <span className="ml-1 font-normal text-slate-400">({total > 0 ? Math.round(category.count / total * 100) : 0}%)</span>
              </dd>
            </div>
            <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${category.color}`}
                style={{ width: `${total > 0 ? category.count / total * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </dl>

      <p className="text-[10px] leading-4 text-slate-500">Pending requests await admin or manager approval.</p>
    </section>
  )
}
