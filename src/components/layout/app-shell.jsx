'use client'

import { useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { Dialog } from 'radix-ui'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { InstallPrompt } from '@/components/shared/install-prompt'
import { OfflineBanner } from '@/components/shared/offline-banner'
import { SyncStatus } from '@/components/shared/sync-status'
import { SyncConflicts } from '@/components/shared/sync-conflicts'
import { cn } from '@/utils'

function subscribeToMobile(callback) {
  const query = window.matchMedia('(max-width: 767px)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

export function AppShell({ children, fixedDashboard = false, compactMobile = false, fixedDesktop = false }) {
  // Owned here rather than inside Sidebar: the main column has to shift with
  // the rail, so both need to read the same value. Sidebar keeps working
  // standalone because it falls back to its own state when no prop is passed.
  const [collapsed, setCollapsed] = useState(false)
  const [menuPath, setMenuPath] = useState(null)
  const pathname = usePathname()
  const mobile = useSyncExternalStore(
    subscribeToMobile,
    () => window.matchMedia('(max-width: 767px)').matches,
    () => false
  )
  const mobileOpen = mobile && menuPath === pathname

  return (
    <Dialog.Root open={mobileOpen} onOpenChange={open => setMenuPath(open ? pathname : null)}>
      <div className={cn('bg-slate-50', fixedDesktop && 'fixed-desktop-shell', compactMobile && 'compact-mobile-shell', fixedDashboard ? 'dashboard-shell h-dvh overflow-hidden' : 'min-h-screen')}>

        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content aria-describedby={undefined} className="fixed inset-y-0 left-0 z-50 h-dvh w-72 max-w-[85vw] bg-white shadow-xl outline-none">
            <Dialog.Title className="sr-only">Main navigation</Dialog.Title>
            <Sidebar mobileDrawer onNavigate={() => setMenuPath(null)} />
          </Dialog.Content>
        </Dialog.Portal>

        {/* Main content — pushed right to make room for sidebar */}
        <div
          className={cn(
            'flex flex-col min-w-0 transition-all duration-300 ease-in-out',
            fixedDesktop && 'fixed-desktop-content',
            fixedDashboard ? 'h-full min-h-0 overflow-hidden' : 'min-h-screen',
            collapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-60'
          )}
        >

          {/* Topbar */}
          <Topbar menuButton={
            <Dialog.Trigger asChild>
              <button type="button" aria-label="Open navigation" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </Dialog.Trigger>
          } />

          {/* Page content */}
          <main className={cn(fixedDesktop && 'fixed-desktop-main', fixedDashboard ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-4' : 'min-w-0 flex-1 p-3 sm:p-6')}>
            {/* Renders null while online. Above the install prompt because a
                user who can't reach the network needs to know that before
                they're invited to install anything. */}
            <OfflineBanner className="mb-5" />
            {/* Conflicts first — they need a decision before anything else
                queued behind them can sync. Both render null when empty. */}
            <SyncConflicts className="mb-5" />
            <SyncStatus className="mb-5" />
            {/* Renders null unless the browser offers an install and the user
                hasn't already installed or dismissed it this session. */}
            <InstallPrompt className="mb-5" />
            {children}
          </main>

        </div>

      </div>
      {fixedDesktop && <style>{`
        @media (min-width: 1024px) {
          .fixed-desktop-shell { height: 100dvh; min-height: 0; overflow: hidden; }
          .fixed-desktop-content { height: 100%; min-height: 0; overflow: hidden; }
          .fixed-desktop-main { display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding: 16px; }
        }
      `}</style>}
    </Dialog.Root>
  )
}
