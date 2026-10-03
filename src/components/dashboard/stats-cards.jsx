'use client'

import { useEffect, useState } from 'react'
import {
  FolderOpen,
  ListChecks,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
} from 'lucide-react'

import { Popover } from 'radix-ui'
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subWeeks } from 'date-fns'

import { dashboardApi } from '@/lib/api/dashboard.api'

const STAT_CONFIG = [
  {
    label: 'Total Projects',
    key: 'totalProjects',
    icon: FolderOpen,
    trend: 'All projects',
  },
  {
    label: 'Active Projects',
    key: 'activeProjects',
    icon: FolderOpen,
    trend: 'Currently running',
  },
  {
    label: 'Total Tasks',
    key: 'totalTasks',
    icon: ListChecks,
    trend: 'Across all projects',
  },
  {
    label: 'Completed',
    key: 'completedTasks',
    icon: CheckCircle2,
    trend: 'Tasks finished',
  },
  {
    label: 'In Progress',
    key: 'inProgressTasks',
    icon: Clock,
    trend: 'Being worked on',
  },
  {
    label: 'Overdue',
    key: 'overdueTasks',
    icon: AlertTriangle,
    trend: 'Needs attention',
  },
]

function StatSkeleton() {
  return (
    <div
      className="
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-4
        py-4
        shadow-sm
        animate-pulse
        sm:px-5
      "
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="h-2.5 w-20 rounded bg-slate-100 sm:w-24" />

        <div className="h-4 w-4 shrink-0 rounded bg-slate-100" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="h-7 w-12 rounded bg-slate-100 sm:h-8 sm:w-14" />
        <div className="h-2.5 w-16 rounded bg-slate-100" />
      </div>
    </div>
  )
}

export function StatsCards() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState(false)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      try {
        const data = await dashboardApi.getStats()
        // Missing counts are not genuine zeros.
        if (!data || STAT_CONFIG.some(({ key }) => data[key] == null)) {
          throw new Error('Incomplete dashboard stats')
        }
        if (!cancelled) setStats(data)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchStats()
    return () => { cancelled = true }
  }, [requestId])

  function retry() {
    setError(false)
    setIsLoading(true)
    setRequestId((value) => value + 1)
  }

  if (isLoading) {
    return (
      <div
        className="
          grid
          w-full
          min-w-0
          grid-cols-1
          gap-3

          min-[500px]:grid-cols-2
          min-[850px]:grid-cols-3
          min-[1250px]:grid-cols-6
        "
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex w-full items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2">
        <p className="text-xs text-red-700">Unable to load dashboard stats.</p>
        <button
          type="button"
          onClick={retry}
          className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div
      className="
        grid
        w-full
        min-w-0
        grid-cols-1
        gap-3

        min-[500px]:grid-cols-2
        min-[850px]:grid-cols-3
        min-[1250px]:grid-cols-6
      "
    >
      {STAT_CONFIG.map((stat) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.key}
            className="
              flex
              min-w-0
              flex-col
              justify-between
              overflow-hidden

              rounded-2xl

              border
              border-slate-200

              bg-white

              px-4
              py-4

              shadow-sm

              transition-shadow
              duration-200

              hover:shadow-md

              sm:px-5
            "
          >
            {/* HEADER */}
            <div
              className="
                flex
                min-w-0
                items-center
                justify-between
                gap-2
              "
            >
              <p
                className="
                  min-w-0
                  flex-1
                  truncate

                  text-[13px]
                  font-semibold
                  leading-none
                  text-slate-700
                "
                title={stat.label}
              >
                {stat.label}
              </p>

              <Icon
                className="
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />
            </div>

            {/* VALUE + TREND, same baseline. The number is shrink-0 — it must
                never truncate (a clipped "18" reading as "1…" is far worse
                than the trend label giving up space first), so only the
                trend text is allowed to shrink/ellipsize when the card is
                narrow. */}
            <div className="mt-3 flex min-w-0 items-end justify-between gap-2">
              <p
                className="
                  shrink-0

                  text-[26px]
                  font-bold
                  leading-none
                  tracking-tight
                  text-slate-900

                  sm:text-[28px]
                  lg:text-[30px]
                "
              >
                {stats[stat.key]}
              </p>

              <p
                className="
                  min-w-0
                  truncate

                  text-[11px]
                  leading-none
                  text-slate-500
                "
                title={stat.trend}
              >
                {stat.trend}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
const PRESETS = ['This week', 'Last week', 'This month', 'Custom range']

function presetRange(label) {
  const today = new Date()
  const date = label === 'Last week' ? subWeeks(today, 1) : today
  const start = label === 'This month' ? startOfMonth(date) : startOfWeek(date, { weekStartsOn: 1 })
  const end = label === 'This month' ? endOfMonth(date) : endOfWeek(date, { weekStartsOn: 1 })
  return { label, from: format(start, 'yyyy-MM-dd'), to: format(end, 'yyyy-MM-dd') }
}

// UI-only period selection; dashboard requests are unchanged.
export function DashboardPeriodSelector({ onRangeChange }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [draft, setDraft] = useState({ label: 'This week', from: '', to: '' })
  const valid = Boolean(draft.from && draft.to && draft.from <= draft.to)

  function handleOpen(nextOpen) {
    if (nextOpen) setDraft(selected ?? presetRange('This week'))
    setOpen(nextOpen)
  }

  function apply(event) {
    event.preventDefault()
    if (!valid) return
    setSelected(draft)
    onRangeChange?.(draft)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpen}>
      <div className="flex min-w-0 items-center gap-2">
        <Popover.Trigger asChild>
          <button type="button" className="flex h-7 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-primary">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {selected?.label === 'Custom range' ? `${selected.from} to ${selected.to}` : selected?.label ?? 'This week'}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </Popover.Trigger>
      </div>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={6} aria-label="Dashboard date range" className="z-50 w-64 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-xl">
          <form onSubmit={apply}>
            <h2 className="text-xs font-semibold">Dashboard period</h2>
            <p className="mt-1 text-[10px] text-slate-500">Weeks run Monday to Sunday.</p>
            <div className="my-2 grid grid-cols-2 gap-1.5" role="group" aria-label="Date presets">
              {PRESETS.map((label) => (
                <button key={label} type="button" aria-pressed={draft.label === label} onClick={() => setDraft(label === 'Custom range' ? { ...draft, label } : presetRange(label))} className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-[11px] ${draft.label === label ? 'border-violet-200 bg-violet-50 text-primary-hover' : 'border-slate-200 hover:bg-slate-50'}`}>
                  {label}
                  {draft.label === label && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
            {draft.label === 'Custom range' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[10px] text-slate-600">From
                    <input required type="date" value={draft.from} max={draft.to || undefined} onChange={(event) => setDraft({ ...draft, label: 'Custom range', from: event.target.value })} className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px]" />
                  </label>
                  <label className="text-[10px] text-slate-600">To
                    <input required type="date" value={draft.to} min={draft.from || undefined} onChange={(event) => setDraft({ ...draft, label: 'Custom range', to: event.target.value })} className="mt-1 w-full min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px]" />
                  </label>
                </div>
                {!valid && <p className="mt-2 text-xs text-red-600">Choose an end date on or after the start date.</p>}
              </>
            )}
            <p className="mt-2 text-[10px] leading-4 text-slate-500">Preview only. Dashboard data is not filtered yet.</p>
            <div className="mt-2 flex justify-end gap-2">
              <Popover.Close asChild><button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px]">Cancel</button></Popover.Close>
              <button type="submit" disabled={!valid} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-white hover:bg-primary-hover disabled:opacity-50">Select period</button>
            </div>
          </form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
