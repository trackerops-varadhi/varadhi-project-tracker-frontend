'use client'

import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { usersApi } from '@/lib/api/users.api'
import { getInitials, getAvatarColor, cn } from '@/utils'

function Shell({ children }) {
  return (
    <Card layout="custom" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex shrink-0 items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-500" />
        <h3 className="text-xs font-semibold leading-4 text-foreground">Top Performers</h3>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pr-0.5">
        {children}
      </div>
    </Card>
  )
}

export function TopPerformersCard() {
  const [performers, setPerformers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await usersApi.getStats()
        if (!cancelled) setPerformers(data?.topPerformers ?? [])
      } catch {
        if (!cancelled) setError('Failed to load top performers.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100" />
              <div className="h-3 flex-1 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <p className="text-[11px] leading-4 text-muted-foreground">{error}</p>
      </Shell>
    )
  }

  if (performers.length === 0) {
    return (
      <Shell>
        <p className="py-4 text-[11px] leading-4 text-muted-foreground">
          No completed tasks yet.
        </p>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="divide-y divide-slate-100">
        {performers.map((person, index) => (
          <div key={person.id} className="grid min-w-0 grid-cols-[12px_24px_minmax(0,1fr)_auto] items-center gap-1.5 py-1.5 first:pt-0 last:pb-0">
            <span className="text-[10px] font-semibold tabular-nums text-slate-400">{index + 1}</span>
            <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white', getAvatarColor(person.name || '?'))}>{getInitials(person.name || '?')}</div>
            <div className="min-w-0">
              <p title={person.name} className="truncate text-[11px] font-medium leading-4 text-foreground">{person.name}</p>
              <p className="truncate text-[10px] leading-3 capitalize text-muted-foreground">{person.role}</p>
            </div>
            <div className="text-right text-[10px] leading-3 tabular-nums">
              <p className="font-medium text-foreground" title="Completed tasks">{person.completedTasks} done</p>
              <p className="mt-0.5 text-muted-foreground" title="Performance score">{person.score}%</p>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}
