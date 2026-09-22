'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import {
  LayoutDashboard, FolderOpen, FolderKanban, ListChecks,
  Kanban, KanbanSquare, Files, BarChart3, Users, Settings,
  LogOut, ChevronLeft, ChevronRight, Bell,
  CalendarSync, MessageSquare, CalendarDays, Clock3,CalendarCheck2,
} from 'lucide-react'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/lib/api/auth.api'
import { clearOfflineCaches } from '@/lib/offline-cache'
import { disablePush } from '@/lib/push'
import { countForUser, clearForUser } from '@/lib/outbox'
import { release as releaseReplayLock } from '@/lib/replay-lock'
import { useOutboxStore } from '@/store/outbox.store'
import { NAV_ITEMS } from '@/constants'
import { getInitials, getAvatarColor, cn } from '@/utils'
import { useHasMounted } from '@/hooks/use-has-mounted'

const ICON_MAP = {
  LayoutDashboard,
  FolderOpen: FolderKanban,
  ListChecks,
  LayoutKanban: KanbanSquare,
  Files,
  BarChart3,
  CalendarCheck2,
  Users,
  Settings,
  Bell,
  CalendarSync,
  MessageSquare,
  CalendarDays,
  Clock3,
}

export function Sidebar({ collapsed: collapsedProp, setCollapsed: setCollapsedProp }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const [collapsedLocal, setCollapsedLocal] = useState(false)
  const collapsed = collapsedProp ?? collapsedLocal
  const setCollapsed = setCollapsedProp ?? setCollapsedLocal

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [pendingLogout, setPendingLogout] = useState(null)
  const mounted = useHasMounted()

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.hidden && item.roles.includes(user?.role || 'employee')
  )

  async function handleLogout() {
    const uid = user?.id
    if (uid) {
      const queued = await countForUser(uid).catch(() => 0)
      if (queued > 0 && !pendingLogout) {
        setPendingLogout({ count: queued })
        return
      }
    }

    setIsLoggingOut(true)
    setPendingLogout(null)

    try {
      await disablePush()
    } catch {
      /* non-fatal */
    }

    try {
      await authApi.logout()
    } catch {
      // Ignore logout API error
    } finally {
      clearAuth()
      document.cookie =
        'varadhi_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      await clearOfflineCaches()

      if (uid) {
        await clearForUser(uid).catch(() => {})
        releaseReplayLock(uid)
      }
      useOutboxStore.getState().reset()

      router.push('/auth/login')
    }
  }

  // Prevent rendering mismatched markup until mounted on client
  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 flex flex-col z-30" />
    )
  }

  return (
    <aside
      className={cn(
        'fixed rounded-r-2xl left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-30 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center pl-1 pr-4 py-5 border-b border-slate-100">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 select-none">
          <img
            src="/projectlogo-removebg-preview.png"
            alt="Varadhi Logo"
            className="w-full h-full object-contain pointer-events-none mb-2"
          />
        </div>

        {!collapsed && (
          <div>
            <p className="text-base font-semibold text-slate-800 leading-tight">
              Varadhi
            </p>
            <p className="text-xs text-slate-500 font-medium">Project Tracker 2.0</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div> 

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = ICON_MAP[item.icon]
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
                isActive
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground'
              )}
            >
              {Icon && (
                <Icon
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={cn(
                    'w-[18px] h-[18px] flex-shrink-0 transition-all duration-200',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
              )}

              {!collapsed && (
                <span>{item.label}</span>
              )}

              {collapsed && isActive && (
                <span className="absolute left-0 w-1 h-6 bg-violet-600 rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        <div className={cn(
          'flex items-center gap-3 px-2 py-2 rounded-lg',
          collapsed ? 'justify-center' : ''
        )}>
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
            getAvatarColor(user?.name || 'U')
          )}>
            {getInitials(user?.name || 'User')}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {user?.role}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600',
            collapsed ? 'justify-center' : ''
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {pendingLogout && (
          <div
            role="alertdialog"
            aria-label="Unsynced changes"
            className="absolute bottom-16 left-2 right-2 z-30 rounded-lg border border-amber-300 bg-white p-3 shadow-lg"
          >
            <p className="text-xs font-semibold text-slate-800">
              {pendingLogout.count} unsynced change
              {pendingLogout.count === 1 ? '' : 's'}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              These were made offline and haven&apos;t reached the server. If you
              log out now they will be <strong>permanently lost</strong>.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-700"
              >
                Discard &amp; log out
              </button>
              <button
                onClick={() => setPendingLogout(null)}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}