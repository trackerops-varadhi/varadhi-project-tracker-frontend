'use client'

import { usePathname } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'

export function TaskRouteShell({ children }) {
  const pathname = usePathname()
  return <AppShell fixedDesktop={pathname === '/tasks'}>{children}</AppShell>
}
