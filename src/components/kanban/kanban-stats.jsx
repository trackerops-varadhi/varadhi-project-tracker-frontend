'use client'

import { StatCard } from '@/components/shared/stat-card'

import { useEffect, useState } from 'react'
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  Eye,
} from 'lucide-react'
import { tasksApi } from '@/lib/api/tasks.api'

export function KanbanStats() {
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
        if (!cancelled) setError('Failed to load board stats.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (isLoading) {
    return (
      <div className="grid w-full min-w-0 grid-cols-2 md:grid-cols-4 gap-2 lg:gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[92px] animate-pulse rounded-xl border border-border bg-card p-4"
          >
            <div className="mb-3 h-8 w-8 rounded-lg bg-slate-100" />
            <div className="h-5 w-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        {error ?? 'No board data available.'}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      change:
        stats.completedThisWeek > 0
          ? `+${stats.completedThisWeek} completed this week`
          : 'Across all projects',
      icon: ClipboardList,
      iconBg: 'bg-violet-100',
      iconColor: 'text-primary',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      change: `${stats.inProgressPercent}% of total`,
      icon: Clock3,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Review',
      value: stats.inReview,
      change: `${stats.inReviewPercent}% of total`,
      icon: Eye,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Completed',
      value: stats.completed,
      change: `${stats.completedPercent}% of total`,
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ]

return (
  <div
    className="
      grid
      w-full
      min-w-0
      grid-cols-2 md:grid-cols-4
      gap-2
      lg:gap-3
    "
  >
    {cards.map(card => <StatCard key={card.title} title={card.title} value={card.value} subtitle={card.change} icon={card.icon} />)}
  </div>
)
}
