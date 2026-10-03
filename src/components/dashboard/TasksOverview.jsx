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
    <Card className="task-overview-card flex h-full min-h-0 min-w-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <h3 className="text-xs font-semibold leading-4 text-slate-800">Tasks Overview</h3>
      {isLoading ? (
        <div role="status" aria-label="Loading task overview" className="h-16 animate-pulse rounded-lg bg-slate-100" />
      ) : error ? (
        <p role="status" className="text-xs text-slate-500">{error}</p>
      ) : !stats || stats.total === 0 ? (
        <p className="text-xs text-slate-500">No tasks yet.</p>
      ) : (
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2 text-[10px] leading-4 text-slate-600">
            <span>Total tasks <strong className="tabular-nums text-slate-900">{stats.total}</strong></span>
            <span className="shrink-0 font-medium text-primary">{progress}% done</span>
          </div>
          <div role="progressbar" aria-label="Tasks completed" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {breakdown.map(item => (
              <div key={item.label} className="min-w-0">
                <dt className="text-[10px] leading-4 text-slate-500">{item.label}</dt>
                <dd className="text-base font-semibold leading-5 tabular-nums text-slate-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Card>
  )
}
