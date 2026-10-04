'use client'

import { useState, useEffect } from 'react'
import { dashboardApi } from '@/lib/api/dashboard.api'
import { getInitials, getAvatarColor, cn } from '@/utils'
import { ScrollPreview } from './scroll-preview'
import { RelativeTime } from '@/components/shared/relative-time'

export function RecentActivity() {
  const [activity, setActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const data = await dashboardApi.getActivity()
        setActivity(Array.isArray(data) ? data : [])
      } catch {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* FIXED HEADER */}
      <div className="flex h-[38px] shrink-0 items-center border-b border-slate-100 px-4">
        <h3 className="text-[12px] font-semibold text-slate-800 ">
          Recent Activity
        </h3>
      </div>

      {isLoading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[11px] text-slate-500">
            Loading...
          </p>
        </div>
      ) : error ? (
        <div role="status" className="flex min-h-0 flex-1 items-center justify-center px-4 text-center">
          <p className="text-[11px] text-slate-500">Unable to load recent activity.</p>
        </div>
      ) : activity.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[11px] text-slate-500">
            No recent activity yet.
          </p>
        </div>
      ) : (
        /* ONLY CONTENT SCROLLS */
        <div className="min-h-0 flex-1 overflow-hidden px-4 py-1">
          <ScrollPreview rowHeight={42} label="activity" fill>
            {activity.map((item) => (
              <div
                key={item.id}
                className="dashboard-activity-row relative flex items-start gap-2.5 pr-0"
              >
                <div
                  className={cn(
                    `
                      flex h-7 w-7
                      shrink-0 items-center justify-center
                      rounded-full text-[11px]
                      font-semibold text-white
                    `,
                    getAvatarColor(item.user?.name || 'Unknown user')
                  )}
                >
                  {getInitials(item.user?.name || 'Unknown user')}
                </div>

                <div className="min-w-0 flex-1">
                <p className="min-w-0 line-clamp-1 text-[11px] leading-4 text-slate-600"
                  title={`${item.user?.name || 'Unknown user'} ${item.message || ''}`}>
                  <span className="font-semibold text-slate-800">
                    {item.user?.name || 'Unknown user'}
                  </span>{' '}
                  {item.message}
                </p>

                <RelativeTime
                  date={item.createdAt}
                  className="mt-0.5 block text-[10px] leading-3 text-slate-500"
                />
                </div>
              </div>
            ))}
          </ScrollPreview>
        </div>
      )}
    </div>
  )
}
