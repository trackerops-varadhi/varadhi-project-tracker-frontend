'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'

export default function DashboardLayout({ children }) {
  const viewportRef = useRef(null)
  const [size, setSize] = useState(null)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    let frame

    function measure() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const { width, height } = viewport.getBoundingClientRect()
        if (width <= 0 || height <= 0) return
        const mobile = window.matchMedia('(max-width: 767px)').matches
        const scale = Math.min(1, width / (mobile ? 340 : 1100), height / 640)
        setSize({ width: width / scale, height: height / scale, scale, mobile })
      })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    window.addEventListener('resize', measure)
    measure()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <AppShell fixedDashboard>
      <div ref={viewportRef} className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          className="dashboard-canvas"
          data-mobile={size?.mobile ? 'true' : 'false'}
          style={{
            position: 'absolute',
            inset: '0 auto auto 0',
            width: size?.width ?? '100%',
            height: size?.height ?? '100%',
            transform: `scale(${size?.scale ?? 1})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </AppShell>
  )
}
