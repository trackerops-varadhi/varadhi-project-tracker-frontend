'use client'

import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import { usersApi } from '@/lib/api/users.api'
import { formatRelativeTime } from '@/utils'

function Shell({ children }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-3">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <Mail className="h-4 w-4 text-amber-600" />
        <h3 className="text-xs font-semibold leading-4 text-foreground">Pending Invites</h3>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pr-1">
        {children}
      </div>
    </div>
  )
}

export function PendingInvitesCard() {
  const [invites, setInvites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Invited users are just users with status='invited' — the existing
        // list endpoint already supports that filter.
        const data = await usersApi.getAll({ status: 'invited' })
        if (!cancelled) setInvites(data ?? [])
      } catch {
        if (!cancelled) setError('Failed to load pending invites.')
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
          {[0, 1].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
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

  if (invites.length === 0) {
    return (
      <Shell>
        <p className="py-4 text-sm text-muted-foreground">No pending invites.</p>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="space-y-1.5 rounded-lg border border-border p-2"
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium leading-4 text-foreground">
                {invite.name || invite.email}
              </p>
              <p title={invite.email} className="truncate text-[10px] leading-4 text-muted-foreground">{invite.email}</p>
            </div>

            <span className="block text-[10px] leading-4 text-slate-400">
              {formatRelativeTime(invite.created_at ?? invite.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </Shell>
  )
}
