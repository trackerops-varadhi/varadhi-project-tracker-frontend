'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { tasksApi } from '@/lib/api/tasks.api'
import { ViewAllLink } from './view-all-link'

export function TasksOverview() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await tasksApi.getStats()
        if (!cancelled) setStats(data)
      } catch {
        if (!cancelled) setError('Failed to load task stats.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const progress = stats?.completedPercent ?? 0
  const breakdown = [
    { label: 'To Do', value: stats?.todo ?? 0, color: 'bg-slate-400' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, color: 'bg-amber-400' },
    { label: 'In Review', value: stats?.inReview ?? 0, color: 'bg-blue-400' },
    { label: 'Completed', value: stats?.completed ?? 0, color: 'bg-emerald-500' },
  ]

  return (
    <Card className="task-overview-card flex h-full min-h-0 min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-[13px] font-semibold leading-4 text-slate-800 sm:text-sm">Tasks Overview</h3>
        <ViewAllLink href="/tasks" label="tasks" />
      </div>
      {isLoading ? (
        <div role="status" aria-label="Loading task overview" className="h-16 animate-pulse rounded-lg bg-slate-100" />
      ) : error ? (
        <p role="status" className="text-sm text-slate-500">{error}</p>
      ) : !stats || stats.total === 0 ? (
        <p className="text-sm text-slate-500">No tasks yet.</p>
      ) : (
        <div className="task-overview-body flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="min-w-0 shrink-0 rounded-xl bg-slate-50 px-3 py-2">
            <p className="flex items-center gap-2 text-[15px] leading-5 text-slate-700">
              Total tasks
              <span className="font-bold tabular-nums text-slate-900">{stats.total}</span>
            </p>

            {typeof stats.completedThisWeek === 'number' && (
              <p className="mt-0.5 text-[12px] leading-4 text-slate-500">
                {stats.completedThisWeek} completed this week
              </p>
            )}
          </div>

          <div
            role="progressbar"
            aria-label="Tasks completed"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-7 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-primary to-purple-500 px-3"
              style={{ width: `${Math.max(14, Math.min(100, progress))}%` }}
            >
              <span className="text-[12px] font-semibold text-white">{progress}%</span>
            </div>
          </div>

          <dl className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
            {breakdown.map(item => (
              <div key={item.label} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-2">
                <dt className="flex min-w-0 items-center gap-2 text-[12px] leading-4 text-slate-600">
                  <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                  <span className="truncate">{item.label}</span>
                </dt>
                <dd className="shrink-0 text-[22px] font-semibold leading-none tabular-nums text-slate-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Card>
  )
}
