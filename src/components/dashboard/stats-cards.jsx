'use client'

import { useEffect, useState } from 'react'
import {
  FolderOpen,
  ListChecks,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'

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
        px-2.5
        py-2
        shadow-sm
        animate-pulse
        sm:px-3
      "
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="h-2 w-14 rounded bg-slate-100 sm:w-16" />

        <div className="h-3.5 w-3.5 shrink-0 rounded bg-slate-100" />
      </div>

      <div className="mt-2 h-5 w-9 rounded bg-slate-100 sm:h-6 sm:w-10" />

      <div className="mt-1.5 h-2 w-16 rounded bg-slate-100 sm:w-20" />
    </div>
  )
}

export function StatsCards() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await dashboardApi.getStats()

        setStats(data)
      } catch {
        setStats({
          totalProjects: 0,
          activeProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          overdueTasks: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div
        className="
          grid
          w-full
          min-w-0
          grid-cols-1
          gap-2

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

  return (
    <div
      className="
        grid
        w-full
        min-w-0
        grid-cols-1
        gap-2

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

              px-2.5
              py-2

              shadow-sm

              transition-shadow
              duration-200

              hover:shadow-md

              sm:px-3
            "
          >
            {/* HEADER */}
            <div
              className="
                flex
                min-w-0
                items-center
                justify-between
                gap-1.5
              "
            >
              <p
                className="
                  min-w-0
                  flex-1
                  truncate

                  text-[8px]
                  font-semibold
                  leading-none
                  text-slate-700

                  sm:text-[9px]
                  lg:text-[10px]
                "
                title={stat.label}
              >
                {stat.label}
              </p>

              <Icon
                className="
                  h-3
                  w-3
                  shrink-0
                  text-slate-400

                  sm:h-3.5
                  sm:w-3.5
                "
              />
            </div>

            {/* VALUE */}
            <p
              className="
                mt-1.5
                min-w-0
                truncate

                text-[18px]
                font-bold
                leading-none
                text-slate-900

                sm:text-[21px]
                lg:text-[24px]
              "
            >
              {stats?.[stat.key] ?? 0}
            </p>

            {/* DESCRIPTION */}
            <p
              className="
                mt-1
                min-w-0
                truncate

                text-[7px]
                leading-none
                text-slate-500

                sm:text-[8px]
                lg:text-[9px]
              "
              title={stat.trend}
            >
              {stat.trend}
            </p>
          </div>
        )
      })}
    </div>
  )
}