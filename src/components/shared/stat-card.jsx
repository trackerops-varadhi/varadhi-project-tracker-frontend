import Link from 'next/link'

export function StatCard({ title, value, subtitle, icon: Icon, iconElement, href, loading = false }) {
  const Component = href ? Link : 'div'

  return (
    <Component
      {...(href ? { href, 'aria-label': `Open ${title.toLowerCase()}` } : {})}
      className="flex min-h-[92px] min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p title={title} className="min-w-0 flex-1 truncate text-xs font-semibold leading-4 text-slate-700">{title}</p>
        {Icon ? <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" /> : iconElement ? (
          <span aria-hidden="true" className="shrink-0 text-slate-500 [&>svg]:h-4 [&>svg]:w-4">{iconElement}</span>
        ) : null}
      </div>
      <div className="flex min-w-0 shrink-0 items-baseline gap-2">
        {loading ? (
          <div role="status" aria-label={`Loading ${title.toLowerCase()}`} className="h-6 w-12 shrink-0 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="min-w-0 shrink-0 text-2xl font-bold leading-[26px] tabular-nums tracking-tight text-slate-900">{value}</p>
        )}
        {subtitle && <p title={subtitle} className="min-w-0 truncate text-[10px] leading-[14px] text-slate-500">{subtitle}</p>}
      </div>
    </Component>
  )
}
