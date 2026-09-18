'use client'

import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { usersApi } from '@/lib/api/users.api'
import { getInitials, getAvatarColor, formatRelativeTime, cn } from '@/utils'

function Shell({ children }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-3">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <UserPlus className="h-4 w-4 text-violet-600" />
        <h3 className="text-xs font-semibold leading-4 text-foreground">Recently Joined</h3>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pr-1">
        {children}
      </div>
    </div>
  )
}

export function RecentlyJoinedCard() {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await usersApi.getStats()
        if (!cancelled) setMembers(data?.recentlyJoined ?? [])
      } catch {
        if (!cancelled) setError('Failed to load recent members.')
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

  if (members.length === 0) {
    return (
      <Shell>
        <p className="py-4 text-sm text-muted-foreground">No members yet.</p>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-start gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                getAvatarColor(member.name || '?')
              )}
            >
              {getInitials(member.name || '?')}
            </div>

            <div className="min-w-0 flex-1">
              <p title={member.name} className="truncate text-[11px] font-medium leading-4 text-foreground">
                {member.name}
              </p>
              <p className="truncate text-[10px] leading-4 capitalize text-muted-foreground">
                {member.role}
              </p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                {formatRelativeTime(member.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}
