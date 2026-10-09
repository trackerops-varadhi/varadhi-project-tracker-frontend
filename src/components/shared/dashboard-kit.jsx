'use client'

/**
 * The shared furniture for the role workspace dashboards (HR and QC).
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT StatCard
 * The tracker dashboard styles StatCard's internals from the page itself —
 * `.dashboard-stats p[title] { font-size:12px }` and a dozen rules like it in
 * app/dashboard/page.jsx reach into its DOM. Adding a tone or a slot to
 * StatCard would therefore change a page that is not being redesigned, so the
 * workspace dashboards get their own tiles and leave StatCard alone.
 *
 * THE ONE RULE HERE: colour carries meaning, never decoration. A tile, pill or
 * bar turns amber or rose because the number is bad, not because the row
 * needed variety. So a dashboard that is entirely calm-coloured is itself the
 * message — nothing needs you — and anything coloured is worth a click.
 *
 * Bars are divs, not recharts. These charts are five to eight columns of a
 * single integer; recharts would add a ResponsiveContainer that wants a
 * measured parent height inside cards that are content-height, for a chart
 * with no axes, no tooltip and no interaction.
 */

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

import { cn } from '@/utils'

/**
 * A tone is one judgement — this is fine / this needs a look / this is wrong —
 * rendered in five places, so every surface agrees about what red means.
 */
export const TONES = {
  neutral: {
    chip: 'bg-slate-100 text-slate-600',
    value: 'text-slate-900',
    ring: 'border-slate-200',
    bar: 'bg-slate-400',
    pill: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  },
  primary: {
    chip: 'bg-violet-100 text-violet-700',
    value: 'text-slate-900',
    ring: 'border-violet-200',
    bar: 'bg-violet-500',
    pill: 'border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100',
  },
  info: {
    chip: 'bg-sky-100 text-sky-700',
    value: 'text-slate-900',
    ring: 'border-sky-200',
    bar: 'bg-sky-500',
    pill: 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100',
  },
  positive: {
    chip: 'bg-emerald-100 text-emerald-700',
    value: 'text-emerald-700',
    ring: 'border-emerald-200',
    bar: 'bg-emerald-500',
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
  },
  caution: {
    chip: 'bg-amber-100 text-amber-700',
    value: 'text-amber-700',
    ring: 'border-amber-300',
    bar: 'bg-amber-500',
    pill: 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100',
  },
  critical: {
    chip: 'bg-rose-100 text-rose-700',
    value: 'text-rose-700',
    ring: 'border-rose-300',
    bar: 'bg-rose-500',
    pill: 'border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100',
  },
}

const toneOf = (name) => TONES[name] || TONES.neutral

const ACCENTS = {
  violet: {
    band: 'border-violet-200 bg-gradient-to-br from-violet-50 via-white to-white',
    glow: 'bg-violet-300/30',
    eyebrow: 'text-violet-700',
  },
  teal: {
    band: 'border-teal-200 bg-gradient-to-br from-teal-50 via-white to-white',
    glow: 'bg-teal-300/30',
    eyebrow: 'text-teal-700',
  },
}

/**
 * The page's opening band: who you are, what day it is, and the one sentence
 * that summarises the whole screen — assembled from the numbers below it, so
 * on a day when nothing is wrong a glance at the top is the whole visit.
 */
export function HeroBand({ accent = 'violet', eyebrow, title, headline, action, children }) {
  const a = ACCENTS[accent] || ACCENTS.violet

  return (
    <section className={cn('relative overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5', a.band)}>
      {/* Decoration, and the only decoration on the page. */}
      <div
        aria-hidden="true"
        className={cn('pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full blur-3xl', a.glow)}
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className={cn('text-[11px] font-semibold uppercase tracking-[0.08em]', a.eyebrow)}>{eyebrow}</p>
          )}
          <h1 className="mt-0.5 text-xl font-bold leading-7 tracking-tight text-slate-900">{title}</h1>
          {headline && <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">{headline}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {children && <div className="relative mt-4">{children}</div>}
    </section>
  )
}

/** A headline number. `tone` is the verdict on the number, not its category. */
export function MetricTile({ label, value, hint, icon: Icon, href, tone = 'neutral', loading = false, children }) {
  const t = toneOf(tone)
  const Wrapper = href ? Link : 'div'

  return (
    <Wrapper
      {...(href ? { href, 'aria-label': `Open ${String(label).toLowerCase()}` } : {})}
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-2xl border bg-white p-4 shadow-sm transition-shadow focus-visible:outline-2 focus-visible:outline-primary',
        href && 'hover:shadow-md',
        t.ring
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <p title={label} className="min-w-0 flex-1 truncate text-xs font-semibold leading-4 text-slate-600">
          {label}
        </p>
        {Icon && (
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', t.chip)}>
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
        )}
      </div>

      {loading ? (
        <div
          role="status"
          aria-label={`Loading ${String(label).toLowerCase()}`}
          className="h-7 w-14 animate-pulse rounded bg-slate-100"
        />
      ) : (
        <p className={cn('text-[26px] font-bold leading-7 tabular-nums tracking-tight', t.value)}>{value}</p>
      )}

      {hint && <p title={hint} className="truncate text-[11px] leading-4 text-slate-500">{hint}</p>}
      {children}
    </Wrapper>
  )
}

/**
 * The derived part of the dashboard, and the reason to open it at all.
 *
 * Every item is a question already answered — six requests are waiting on a
 * manager, the oldest fix has sat unverified for four days — and an item with
 * nothing behind it is not rendered. When they are all empty the strip says so
 * in as many words: an all-clear is a real state, not a blank.
 */
export function AttentionStrip({ items = [], loading = false, allClear = 'Nothing needs you right now.' }) {
  const live = items.filter((i) => i && i.count > 0)

  return (
    <section aria-label="Needs your attention" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Needs your attention
      </p>

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} role="status" aria-label="Loading" className="h-9 w-40 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : live.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />
          {allClear}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {live.map((item) => {
            const t = toneOf(item.tone)
            const Wrapper = item.href ? Link : 'div'
            return (
              <li key={item.key} className="min-w-0">
                <Wrapper
                  {...(item.href ? { href: item.href } : {})}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary',
                    t.pill
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-bold tabular-nums',
                      t.chip
                    )}
                  >
                    {item.count}
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                </Wrapper>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** A titled card. `href` renders the corner link. */
export function Panel({ title, icon: Icon, href, linkLabel = 'Open', badge, children, className }) {
  return (
    <section className={cn('flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm', className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-800">
          {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />}
          <span className="truncate">{title}</span>
          {badge != null && (
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-600">
              {badge}
            </span>
          )}
        </h2>
        {href && (
          <Link href={href} className="shrink-0 text-xs font-medium text-primary hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

/**
 * A column chart in divs. A column may hold more than one bar, which is how
 * one component draws both "present each day this week" and "reported versus
 * resolved each week".
 *
 * `columns`: [{ key, label, bars: [{ value, tone, title }], muted, active }]
 * The scale is shared by every column (the largest value, or `max`), so the
 * heights are comparable — the whole point of drawing them.
 */
export function MiniBars({ columns = [], max, label, height = 64, legend }) {
  const peak = Math.max(1, max ?? Math.max(0, ...columns.flatMap((c) => c.bars.map((b) => b.value || 0))))

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div role="img" aria-label={label} className="flex items-end gap-1.5" style={{ height }}>
        {columns.map((col) => (
          <div key={col.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <div className="flex w-full flex-1 items-end justify-center gap-[2px]">
              {col.bars.map((bar, i) => (
                <div
                  key={i}
                  title={bar.title}
                  className={cn('w-full max-w-[14px] rounded-t', toneOf(bar.tone).bar, col.muted && 'opacity-25')}
                  // A zero still draws a 2px stub, so an empty day reads as a
                  // measured zero rather than a column that failed to load.
                  style={{ height: `${Math.max(2, Math.round(((bar.value || 0) / peak) * 100))}%` }}
                />
              ))}
            </div>
            <span
              className={cn(
                'w-full truncate text-center text-[10px] leading-3',
                col.active ? 'font-bold text-slate-800' : 'text-slate-400'
              )}
            >
              {col.label}
            </span>
          </div>
        ))}
      </div>

      {legend && <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">{legend}</div>}
    </div>
  )
}

/** One swatch and one word, for a MiniBars legend. */
export function LegendDot({ tone = 'neutral', children }) {
  return (
    <span className="flex items-center gap-1">
      <span aria-hidden="true" className={cn('h-2 w-2 rounded-sm', toneOf(tone).bar)} />
      {children}
    </span>
  )
}

/**
 * One bar split by share, for a mix that adds up to a whole: the hiring
 * pipeline by stage, defects by severity. A segment under 4% keeps 4% so a
 * stage holding one person stays visible and stays hoverable.
 *
 * `segments`: [{ key, label, value, className }]
 */
export function ShareBar({ segments = [], empty = 'Nothing to show yet.' }) {
  const live = segments.filter((s) => (s.value || 0) > 0)
  const total = live.reduce((n, s) => n + s.value, 0)

  if (total === 0) return <p className="py-4 text-center text-xs text-slate-500">{empty}</p>

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div
        role="img"
        aria-label={live.map((s) => `${s.label} ${s.value}`).join(', ')}
        className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
      >
        {live.map((s) => (
          <div
            key={s.key}
            title={`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}
            className={cn('h-full', s.className)}
            style={{ width: `${Math.max(4, (s.value / total) * 100)}%` }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {live.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span aria-hidden="true" className={cn('h-2 w-2 shrink-0 rounded-sm', s.className)} />
            <span className="truncate">{s.label}</span>
            <span className="font-bold tabular-nums text-slate-800">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A small tone-coloured label: "4d waiting", "unplanned", "breached". */
export function Flag({ tone = 'neutral', children, title }) {
  return (
    <span
      title={title}
      className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-4', toneOf(tone).chip)}
    >
      {children}
    </span>
  )
}

export const Empty = ({ children }) => <p className="py-4 text-center text-xs text-slate-500">{children}</p>
export const Loading = () => <p className="py-4 text-center text-xs text-slate-400">Loading…</p>

/** A row list that scrolls inside its card instead of growing it. */
export function RowList({ children, className }) {
  return <ul className={cn('-mx-1 max-h-[232px] min-w-0 space-y-0.5 overflow-y-auto px-1', className)}>{children}</ul>
}
