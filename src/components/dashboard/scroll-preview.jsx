'use client'

import { Children } from 'react'

export function ScrollPreview({ children, rowHeight = 40, label = 'Items', fill = false, columns = 1 }) {
  const rows = Children.toArray(children)

  return (
    <div
      style={{
        height: fill ? '100%' : rowHeight * 5,
        maxHeight: fill ? '100%' : rowHeight * 5,
        flex: 'none',
        ...(columns > 1 ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: 12, alignContent: 'start' } : {}),
      }}
      role="region"
      aria-label={label}
      tabIndex={0}
      className="dashboard-scroll-preview h-full min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pr-1 focus-visible:outline-2 focus-visible:outline-primary"
    >
      {rows.map((row, index) => (
        <div key={row.key ?? index} style={{ minHeight: rowHeight }} className="flex min-w-0 flex-col justify-center py-1">
          {row}
        </div>
      ))}
    </div>
  )
}
