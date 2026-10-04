'use client'

import { StatCard } from '@/components/shared/stat-card'

import { useEffect, useState } from 'react'
import {
  FolderOpen,
  ListChecks,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react'


import { dashboardApi } from '@/lib/api/dashboard.api'

const STAT_CONFIG = [
  {
    label: 'Total Projects',
    key: 'totalProjects',
    href: '/projects',
    icon: FolderOpen,
    trend: 'All projects',
  },
  {
    label: 'Active Projects',
    key: 'activeProjects',
    href: '/projects',
    icon: FolderOpen,
    trend: 'Currently running',
  },
  {
    label: 'Total Tasks',
    key: 'totalTasks',
    href: '/tasks',
    icon: ListChecks,
    trend: 'Across all projects',
  },
  {
    label: 'Completed',
    key: 'completedTasks',
    href: '/tasks',
    icon: CheckCircle2,
    trend: 'Tasks finished',
  },
  {
    label: 'In Progress',
    key: 'inProgressTasks',
    href: '/tasks',
    icon: Clock,
    trend: 'Being worked on',
  },
  {
    label: 'Overdue',
    key: 'overdueTasks',
    href: '/tasks/upcoming-deadlines',
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
        px-3
        py-3
        shadow-sm
        animate-pulse
        sm:px-3
      "
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="h-2.5 w-20 rounded bg-slate-100 sm:w-24" />

        <div className="h-4 w-4 shrink-0 rounded bg-slate-100" />
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
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
        <p className="text-[11px] text-red-700">Unable to load dashboard stats.</p>
        <button
          type="button"
          onClick={retry}
          className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-600"
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
      {STAT_CONFIG.map(stat => <StatCard key={stat.key} title={stat.label} value={stats[stat.key]} subtitle={stat.trend} icon={stat.icon} href={stat.href} />)}
    </div>
  )
}
export function DashboardPeriodSelector() {
  return (
    <button type="button" disabled title="Date filtering is not available. Showing all-time data." className="flex h-7 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-600 shadow-sm">
      <CalendarDays className="h-3.5 w-3.5 text-primary" />
      All time
    </button>
  )
}
