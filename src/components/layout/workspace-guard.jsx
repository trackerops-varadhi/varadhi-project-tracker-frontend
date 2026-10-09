'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'

import { useAuthStore } from '@/store/auth.store'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { WORKSPACE_LABELS, canAccessPath, homeFor } from '@/constants'

/**
 * Keeps each role inside its own workspace.
 *
 * - The tracker dashboard is not part of the HR or QC workspace, so an hr/qc
 *   user landing on /dashboard (the default after many links and the proxy's
 *   signed-in redirect) is sent to their own home instead.
 * - Any other page outside the role's workspace renders a "not available"
 *   notice rather than a page of 403s.
 *
 * Presentation only: the backend's restrictTo is still what stops the data.
 */
export function WorkspaceGuard({ children }) {
  const mounted = useHasMounted()
  const pathname = usePathname()
  const router = useRouter()
  const role = useAuthStore((s) => s.user?.role)

  const allowed = !role || canAccessPath(role, pathname)
  const redirectHome = Boolean(role) && !allowed && pathname === '/dashboard'

  useEffect(() => {
    if (redirectHome) router.replace(homeFor(role))
  }, [redirectHome, role, router])

  // Until the auth store has hydrated there is no role to judge by.
  if (!mounted || allowed) return children
  if (redirectHome) return null

  return (
    <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <ShieldAlert aria-hidden="true" className="h-7 w-7 text-slate-400" />
      <p className="text-sm font-semibold text-slate-800">This page is not part of your workspace.</p>
      <p className="text-xs text-slate-500">You are signed in to the {WORKSPACE_LABELS[role] ?? 'tracker'}.</p>
      <Link href={homeFor(role)} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover">
        Go to my workspace
      </Link>
    </div>
  )
}
