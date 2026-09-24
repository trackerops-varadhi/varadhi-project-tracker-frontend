'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { usersApi } from '@/lib/api/users.api'
import { getInitials, getAvatarColor, cn } from '@/utils'

function Shell({ children }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-3">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-500" />
        <h3 className="text-xs font-semibold leading-4 text-foreground">Top Performers</h3>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pr-1">
        {children}
      </div>
    </div>
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
        <p className="text-sm text-muted-foreground">{error}</p>
      </Shell>
    )
  }

  if (performers.length === 0) {
    return (
      <Shell>
        <p className="py-4 text-sm text-muted-foreground">
          No completed tasks yet.
        </p>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-3">
        {performers.map((person, index) => (
          <div key={person.id} className="flex items-start gap-2">
            <span className="w-4 shrink-0 text-xs font-semibold text-slate-400">
              {index + 1}
            </span>

            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                getAvatarColor(person.name || '?')
              )}
            >
              {getInitials(person.name || '?')}
            </div>

            <div className="min-w-0 flex-1">
              <p title={person.name} className="truncate text-[11px] font-medium leading-4 text-foreground">
                {person.name}
              </p>
              <p className="truncate text-[10px] leading-4 capitalize text-muted-foreground">
                {person.role}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] leading-4 text-muted-foreground">
                <span>{person.completedTasks} completed</span>
                <span>{person.score}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}
