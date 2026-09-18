'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'

export default function KanbanLayout({ children }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const container = containerRef.current
    let frame

    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const width = container.getBoundingClientRect().width
        if (width > 0) setScale(Math.min(1, width / 1000))
      })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    measure()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <AppShell compactMobile>
      <div ref={containerRef} className="w-full min-w-0">
        <div style={{ width: `${100 / scale}%`, zoom: scale }}>
          {children}
        </div>
      </div>
    </AppShell>
  )
}
