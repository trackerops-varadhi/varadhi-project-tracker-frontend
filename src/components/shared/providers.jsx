'use client'

import { ServiceWorkerRegistrar } from '@/components/shared/service-worker-registrar'

export function Providers({ children }) {
  return (
    <>
      <ServiceWorkerRegistrar />
      {children}
    </>
  )
}