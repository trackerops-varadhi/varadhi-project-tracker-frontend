'use client'

import { useState, useEffect } from 'react'
import { dashboardApi } from '@/lib/api/dashboard.api'
import { getInitials, getAvatarColor, cn } from '@/utils'
import { RelativeTime } from '@/components/shared/relative-time'

export function RecentActivity() {
  const [activity, setActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const data = await dashboardApi.getActivity()
        setActivity(data)
      } catch {
        setActivity([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* FIXED HEADER */}
      <div className="flex h-[44px] shrink-0 items-center border-b border-slate-100 px-4">
        <h3 className="text-[13px] font-semibold text-slate-800 sm:text-sm">
          Recent Activity
        </h3>
      </div>

      {isLoading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[12px] text-slate-400">
            Loading...
          </p>
        </div>
      ) : activity.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[12px] text-slate-400">
            No recent activity yet.
          </p>
        </div>
      ) : (
        /* ONLY CONTENT SCROLLS */
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2">
          <div className="flex flex-col gap-3">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5"
              >
                <div
                  className={cn(
                    `
                      flex h-8 w-8
                      shrink-0 items-center justify-center
                      rounded-full text-[11px]
                      font-semibold text-white
                    `,
                    getAvatarColor(item.user.name)
                  )}
                >
                  {getInitials(item.user.name)}
                </div>

                <p className="min-w-0 flex-1 truncate text-[12px] leading-4 text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {item.user.name}
                  </span>{' '}
                  {item.message}
                </p>

                <RelativeTime
                  date={item.createdAt}
                  className="shrink-0 whitespace-nowrap text-[11px] text-slate-400"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}