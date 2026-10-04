'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarSync,
  CircleCheck,
} from 'lucide-react'
import { addDays, format, isSameDay, isToday, startOfWeek } from 'date-fns'

import { calendarApi } from '@/lib/api/calendar.api'
import { formatRelativeTime } from '@/utils'
import { ScrollPreview } from './scroll-preview'

const MAX_ROWS = 20
const WEEK_DAYS = Array.from({ length: 7 }, (_, i) =>
  addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
)

export function CalendarSyncWidget() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      const result = await calendarApi.getUpcomingEvents({
        limit: MAX_ROWS,
        days: 14,
      })

      setData(result)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    calendarApi.getUpcomingEvents({ limit: MAX_ROWS, days: 14 })
      .then(result => { if (!cancelled) setData(result) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const events = data?.events || []
  const connected = Boolean(data?.connected)

  return (
    <div
      className="
        flex h-full min-h-0 flex-col
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* =========================================
          FIXED HEADER
      ========================================== */}
      <div
        className="
          flex h-[38px] shrink-0
          items-center justify-between
          border-b border-slate-100
          px-4
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="
              flex h-6 w-6 shrink-0
              items-center justify-center
              rounded-full
              bg-violet-50
            "
          >
            <CalendarSync className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="min-w-0">
            <h3
              className="
                truncate
                text-[12px]
                font-semibold
                leading-none
                text-slate-700

              "
            >
              Calendar Sync
            </h3>

            {connected && data?.lastSyncedAt && (
              <p
                className="
                  mt-0.5 truncate
                  text-[10px]
                  leading-none
                  text-slate-500
                "
              >
                Last synced {formatRelativeTime(data.lastSyncedAt)}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* =========================================
          LOADING
      ========================================== */}
      {isLoading ? (
        <div className="min-h-0 flex-1 space-y-1.5 p-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="
                h-[24px]
                animate-pulse
                rounded-lg
                bg-slate-100
              "
            />
          ))}
        </div>
      ) : error ? (

        /* =======================================
           ERROR
        ======================================== */

        <div
          className="
            flex min-h-0 flex-1
            items-center justify-center
            px-3 text-center
          "
        >
          <p className="text-[11px] text-red-500">
            Couldn&apos;t load calendar sync.{' '}

            <button
              type="button"
              onClick={() => {
                setIsLoading(true)
                setError(false)
                load()
              }}
              className="
                font-medium
                underline
                underline-offset-2
              "
            >
              Retry
            </button>
          </p>
        </div>
      ) : !connected ? (

        /* =======================================
           NOT CONNECTED
        ======================================== */

        <div
          className="
            calendar-empty-state flex min-h-0 flex-1
            flex-col
            items-center justify-center
            px-3
            text-center
          "
        >
          <div
            className="
              mb-1.5
              flex h-7 w-7
              items-center justify-center
              rounded-full
              bg-violet-50
            "
          >
            <CalendarSync className="h-3.5 w-3.5 text-violet-500" />
          </div>

          <p className="text-[11px] font-medium text-slate-600">
            No calendar connected
          </p>

          <p className="mt-0.5 text-[10px] text-slate-500">
            Connect Google or Outlook
          </p>

          <Link
            href="/calendar"
            className="
              mt-1.5
              rounded-md
              bg-primary
              px-2 py-1
              text-[10px]
              font-medium
              text-white
              hover:bg-primary-hover
            "
          >
            Connect calendar
          </Link>
        </div>
      ) : events.length === 0 ? (

        /* =======================================
           CONNECTED - NO EVENTS
        ======================================== */

        <div
          className="
            flex min-h-0 flex-1
            flex-col
            items-center justify-center
            px-3
            text-center
          "
        >
          <CircleCheck className="mb-1.5 h-5 w-5 text-emerald-500" />

          <p className="text-[11px] font-medium text-slate-600">
            Everything is up to date
          </p>

          <p className="mt-0.5 text-[10px] text-slate-500">
            Nothing due in the next two weeks.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3">

          {/* =====================================
              MINI WEEK GRID — real dates, days with
              a synced event highlighted in purple.
          ====================================== */}
          <div className="grid shrink-0 grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => (
              <span
                key={`dow-${day.toISOString()}`}
                className="text-center text-[10px] font-medium text-slate-500"
              >
                {format(day, 'EEEEE')}
              </span>
            ))}

            {WEEK_DAYS.map((day) => {
              const hasEvent = events.some((event) =>
                event.dueDate && isSameDay(new Date(event.dueDate), day)
              )

              return (
                <span
                  key={day.toISOString()}
                  className={`
                    flex h-7 items-center justify-center rounded-lg text-[11px] font-medium
                    ${
                      hasEvent
                        ? 'bg-primary text-white'
                        : isToday(day)
                        ? 'bg-violet-50 text-primary'
                        : 'text-slate-500'
                    }
                  `}
                >
                  {format(day, 'd')}
                </span>
              )
            })}
          </div>

          {/* =====================================
              EVENT LIST — condensed "date: title"
              pairs, two columns. Only this scrolls.
          ====================================== */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ScrollPreview rowHeight={40} label="calendar events" columns={2} fill>
              {events.slice(0, MAX_ROWS).map((event) => (
                <Link
                  key={event.sourceId}
                  href={event.link}
                  className="min-w-0 truncate text-[11px] leading-5 text-slate-600 hover:text-primary"
                  title={event.title}
                >
                  <span className="font-semibold text-slate-800">
                    {event.dueDate ? format(new Date(event.dueDate), 'd MMM') : '—'}:
                  </span>{' '}
                  {event.title}
                </Link>
              ))}
            </ScrollPreview>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarSyncWidget
