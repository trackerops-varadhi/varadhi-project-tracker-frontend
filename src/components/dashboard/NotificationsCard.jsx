'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ScrollPreview } from './scroll-preview'
import { Bell, TriangleAlert, RefreshCw, Users } from 'lucide-react'

import { notificationsApi } from '@/lib/api/notifications.api'

const PRIORITY_STYLES = {
  urgent: {
    label: 'Urgent',
    text: 'text-red-700',
    chip: 'bg-red-100 text-red-600',
    icon: TriangleAlert,
  },

  high: {
    label: 'High',
    text: 'text-red-600',
    chip: 'bg-red-100 text-red-600',
    icon: TriangleAlert,
  },

  normal: {
    label: 'Medium',
    text: 'text-amber-600',
    chip: 'bg-amber-100 text-amber-600',
    icon: RefreshCw,
  },

  low: {
    label: 'Low',
    text: 'text-green-600',
    chip: 'bg-green-100 text-green-600',
    icon: Users,
  },
}

export function NotificationsCard() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { notifications } =
          await notificationsApi.list({
            limit: 20,
            unreadOnly: true,
          })

        if (!cancelled) {
          setItems(notifications ?? [])
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load notifications.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className="
        flex
        dashboard-notifications-card
        h-full
        min-h-0
        min-w-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-violet-100
        bg-gradient-to-br
        from-violet-100/80
        via-purple-50/60
        to-blue-100/70
        px-4
        py-3
        shadow-sm
      "
    >
      {/* TITLE */}
      <div
        className="
          flex
          shrink-0
          min-w-0
          items-center
          gap-2
        "
      >
        <div
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-violet-500
          "
        >
          <Bell
            className="
              h-3.5
              w-3.5
              text-white
            "
          />
        </div>

        <h3
          className="
            min-w-0
            truncate
            text-[12px]
            font-semibold
            text-slate-800

          "
        >
          Smart Notifications
        </h3>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div
          className="
            flex
            min-h-0
            flex-1
            items-center
            justify-center
          "
        >
          <p
            className="
              text-[11px]
              text-slate-500

            "
          >
            Loading...
          </p>
        </div>
      )}

      {/* ERROR */}
      {!isLoading && error && (
        <div
          className="
            flex
            min-h-0
            flex-1
            items-center
            justify-center
          "
        >
          <p
            className="
              text-[11px]
              text-slate-500

            "
          >
            {error}
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && !error && items.length === 0 && (
        <div
          className="
            flex
            min-h-0
            flex-1
            items-center
            justify-center
          "
        >
          <p
            className="
              text-[11px]
              text-slate-500

            "
          >
            No new notifications.
          </p>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!isLoading && !error && items.length > 0 && (
        <div
          className="
            dashboard-edge-scroll mt-1.5
            min-h-0
            min-w-0
            flex-1
            overflow-hidden
            overflow-x-hidden
            overscroll-contain
          "
        >
          <ScrollPreview rowHeight={46} label="notifications" fill>
            {items.map((item) => {
              const style =
                PRIORITY_STYLES[item.priority] ??
                PRIORITY_STYLES.normal
              const Icon = style.icon

              const body = (
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-2.5
                    rounded-full
                    border
                    border-white/50
                    bg-white/70
                    px-3
                    py-0.5
                    transition
                    hover:bg-white/90
                  "
                >
                  {/* PRIORITY ICON CHIP */}
                  <span
                    className={`
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      ${style.chip}
                    `}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>

                  {/* NOTIFICATION TEXT */}
                  <p
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-[11px]
                      leading-[1.3]
                      text-slate-700

                    "
                    title={item.title || item.message}
                  >
                    <span
                      className={`
                        font-semibold
                        ${style.text}
                      `}
                    >
                      {style.label}:
                    </span>{' '}

                    {item.title || item.message}
                  </p>
                </div>
              )

              return item.linkTo ? (
                <Link
                  key={item.id}
                  href={item.linkTo}
                  className="block min-w-0"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={item.id}
                  className="min-w-0"
                >
                  {body}
                </div>
              )
            })}
          </ScrollPreview>
        </div>
      )}
    </div>
  )
}
