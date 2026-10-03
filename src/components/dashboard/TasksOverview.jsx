'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { tasksApi } from '@/lib/api/tasks.api'

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
    { label: 'To Do', value: stats?.todo ?? 0 },
    { label: 'In Progress', value: stats?.inProgress ?? 0 },
    { label: 'Completed', value: stats?.completed ?? 0 },
  ]

  return (
    <Card className="task-overview-card flex h-full min-h-0 min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <h3 className="shrink-0 text-[13px] font-semibold leading-4 text-slate-800 sm:text-sm">Tasks Overview</h3>
      {isLoading ? (
        <div role="status" aria-label="Loading task overview" className="h-16 animate-pulse rounded-lg bg-slate-100" />
      ) : error ? (
        <p role="status" className="text-sm text-slate-500">{error}</p>
      ) : !stats || stats.total === 0 ? (
        <p className="text-sm text-slate-500">No tasks yet.</p>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-3">
          <div className="min-w-0">
            <p className="text-[15px] leading-5 text-slate-700">
              Total tasks{' '}
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

          <dl className="grid grid-cols-3 gap-2">
            {breakdown.map(item => (
              <div key={item.label} className="min-w-0">
                <dt className="truncate text-[12px] leading-4 text-slate-500">{item.label}</dt>
                <dd className="mt-1 text-[22px] font-semibold leading-none tabular-nums text-slate-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Card>
  )
}
