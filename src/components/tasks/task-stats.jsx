'use client'

import { StatCard } from '@/components/shared/stat-card'

import { useEffect, useState } from 'react'
import {
  CheckSquare,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Eye,
} from 'lucide-react'

import { tasksApi } from '@/lib/api/tasks.api'

export function TaskStats() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      try {
        const data = await tasksApi.getStats()

        if (!cancelled) {
          setStats(data)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load task stats.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="task-summary-grid grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" role="status" aria-label="Loading task statistics">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="min-w-0 animate-pulse rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-slate-100" />
              <div className="h-4 w-4 rounded bg-slate-100" />
            </div>
            <div className="h-7 w-12 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div role="status" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        {error ?? 'No task statistics available.'}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total ?? 0,
      subtitle:
        stats.completedThisWeek > 0
          ? `+${stats.completedThisWeek} this week`
          : 'Across all projects',
      icon: CheckSquare,
      iconColor: 'text-primary',
    },

    {
      title: 'Completed',
      value: stats.completed ?? 0,
      subtitle: `${stats.completedPercent ?? 0}% of total`,
      icon: CheckCircle2,
      iconColor: 'text-green-600',
    },

    {
      title: 'In Progress',
      value: stats.inProgress ?? 0,
      subtitle: `${stats.inProgressPercent ?? 0}% of total`,
      icon: Clock3,
      iconColor: 'text-blue-600',
    },

    {
      title: 'Overdue',
      value: stats.overdue ?? 0,
      subtitle: `${stats.overduePercent ?? 0}% of total`,
      icon: AlertTriangle,
      iconColor: 'text-red-600',
    },

    {
      title: 'In Review',
      value: stats.inReview ?? 0,
      subtitle: `${stats.inReviewPercent ?? 0}% of total`,
      icon: Eye,
      iconColor: 'text-amber-600',
    },
  ]

  return (
    <div className="task-summary-grid grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {cards.map(card => <StatCard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} />)}
    </div>
  )
}
