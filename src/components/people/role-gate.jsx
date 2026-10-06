'use client'

import { ShieldAlert } from 'lucide-react'

import { useAuthStore } from '@/store/auth.store'
import { useHasMounted } from '@/hooks/use-has-mounted'

/**
 * Renders children only for `roles`. Presentation only — it saves a page of
 * 403s; the backend's restrictTo is the real boundary (plan §7.4).
 */
export function RoleGate({ roles, children, message = 'This page is available to admin and HR.' }) {
  const mounted = useHasMounted()
  const role = useAuthStore((s) => s.user?.role)
  if (!mounted) return null
  if (!roles.includes(role)) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <ShieldAlert aria-hidden="true" className="h-6 w-6 text-slate-400" />
        <p className="text-sm font-semibold text-slate-800">{message}</p>
      </div>
    )
  }
  return typeof children === 'function' ? children(role) : children
}
