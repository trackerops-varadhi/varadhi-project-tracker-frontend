'use client'

const CIRCUMFERENCE = 2 * Math.PI * 29

export function ProjectHealthRing({ total, overdue, loading = false, error = false }) {
  const ready = !loading && !error
  const percent = total > 0 ? Math.max(0, Math.min(100, Math.round(((total - overdue) / total) * 100))) : 0
  const label = ready
    ? `${percent}% of projects are not overdue (${total - overdue} of ${total})`
    : error ? 'Project health unavailable' : 'Loading project health'

  return (
    <div
      role={ready ? 'progressbar' : 'status'}
      aria-label={label}
      aria-valuenow={ready ? percent : undefined}
      aria-valuemin={ready ? 0 : undefined}
      aria-valuemax={ready ? 100 : undefined}
      title={label}
      className="relative h-16 w-16 shrink-0"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r="29" fill="none" strokeWidth="6" className="stroke-violet-100" />
        {ready && percent > 0 && (
          <circle
            cx="32" cy="32" r="29" fill="none" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
            className="stroke-primary"
          />
        )}
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-lg font-bold leading-5 tabular-nums text-slate-900">{ready ? `${percent}%` : '—'}</p>
        <p className="mt-0.5 text-[10px] leading-3 text-slate-500">{ready ? 'On time' : error ? 'Unavailable' : 'Loading'}</p>
      </div>
    </div>
  )
}
