'use client'

import { ServiceWorkerRegistrar } from '@/components/shared/service-worker-registrar'
import { SessionGuard } from '@/components/auth/session-guard'

export function Providers({ children }) {
  return (
    <>
      <ServiceWorkerRegistrar />
      {/* Hydrates the auth store, keeps every tab's session in sync, and runs
          the inactivity clock. Mounted here rather than in AppShell so it also
          covers the auth routes — a signed-in user landing on /auth/login must
          hydrate too, or they render as signed out for a frame. */}
      <SessionGuard />
      {children}
    </>
  )
}