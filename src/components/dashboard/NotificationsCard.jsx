'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

import { notificationsApi } from '@/lib/api/notifications.api'

const PRIORITY_STYLES = {
  urgent: {
    label: 'Urgent',
    text: 'text-red-700',
    dot: 'bg-red-600',
  },

  high: {
    label: 'High',
    text: 'text-red-600',
    dot: 'bg-red-500',
  },

  normal: {
    label: 'Normal',
    text: 'text-yellow-600',
    dot: 'bg-yellow-500',
  },

  low: {
    label: 'Low',
    text: 'text-green-600',
    dot: 'bg-green-500',
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
            limit: 3,
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
        px-3
        py-2
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
          gap-1.5
        "
      >
        <div
          className="
            flex
            h-[18px]
            w-[18px]
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-violet-500
            sm:h-5
            sm:w-5
          "
        >
          <Bell
            className="
              h-2.5
              w-2.5
              text-white
              sm:h-3
              sm:w-3
            "
          />
        </div>

        <h3
          className="
            min-w-0
            truncate
            text-[11px]
            font-semibold
            text-slate-800
            sm:text-xs
          "
        >
          Notifications
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
              text-[8px]
              text-slate-400
              sm:text-[9px]
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
              text-[8px]
              text-slate-500
              sm:text-[9px]
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
              text-[8px]
              text-slate-400
              sm:text-[9px]
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
            mt-1.5
            min-h-0
            min-w-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            overscroll-contain
            pr-0.5
          "
        >
          <div className="space-y-1">
            {items.map((item) => {
              const style =
                PRIORITY_STYLES[item.priority] ??
                PRIORITY_STYLES.normal

              const body = (
                <div
                  className="
                    flex
                    min-w-0
                    items-start
                    gap-1.5
                    rounded-lg
                    border
                    border-white/50
                    bg-white/70
                    px-1.5
                    py-1
                    transition
                    hover:bg-white/90
                    sm:px-2
                    sm:py-1.5
                  "
                >
                  {/* PRIORITY DOT */}
                  <span
                    className={`
                      mt-[3px]
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      ${style.dot}
                    `}
                  />

                  {/* NOTIFICATION TEXT */}
                  <p
                    className="
                      min-w-0
                      flex-1
                      line-clamp-2
                      text-[7px]
                      leading-[1.25]
                      text-slate-700
                      sm:text-[8px]
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
          </div>
        </div>
      )}
    </div>
  )
}