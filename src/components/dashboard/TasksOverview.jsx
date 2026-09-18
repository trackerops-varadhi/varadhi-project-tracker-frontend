'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { tasksApi } from '@/lib/api/tasks.api'

export function TasksOverview() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await tasksApi.getStats()

        if (!cancelled) {
          setStats(data)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load task stats.')
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

  const progress = stats?.completedPercent ?? 0

  const breakdown = [
    {
      label: 'To Do',
      value: stats?.todo ?? 0,
    },
    {
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
    },
  ]

  return (
    <Card
      className="
        flex
        h-full
        min-h-0
        min-w-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-3
        py-2
        shadow-sm
      "
    >
      {/* =================================================
          TITLE
          SAME STYLE AS PROJECT HEALTH
      ================================================== */}

      <h3
        className="
          shrink-0
          truncate
          text-[11px]
          font-semibold
          text-slate-800
          sm:text-xs
        "
      >
        Tasks Overview
      </h3>

      {/* =================================================
          LOADING
      ================================================== */}

      {isLoading && (
        <div
          className="
            flex
            min-h-0
            min-w-0
            flex-1
            flex-col
            justify-center
          "
        >
          <div className="animate-pulse">
            <div className="h-2 w-20 rounded bg-slate-100" />

            <div className="mt-2.5 h-[16px] w-full rounded-md bg-slate-100 sm:h-[18px]" />

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <div className="h-2 w-8 rounded bg-slate-100" />
                <div className="mt-1.5 h-4 w-5 rounded bg-slate-100" />
              </div>

              <div>
                <div className="h-2 w-12 rounded bg-slate-100" />
                <div className="mt-1.5 h-4 w-5 rounded bg-slate-100" />
              </div>

              <div>
                <div className="h-2 w-10 rounded bg-slate-100" />
                <div className="mt-1.5 h-4 w-5 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================== */}

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
          <p className="text-[8px] text-slate-500 sm:text-[9px]">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          EMPTY STATE
      ================================================== */}

      {!isLoading && !error && (!stats || stats.total === 0) && (
        <div
          className="
            flex
            min-h-0
            flex-1
            items-center
            justify-center
          "
        >
          <p className="text-[8px] text-slate-400 sm:text-[9px]">
            No tasks yet.
          </p>
        </div>
      )}

      {/* =================================================
          MAIN CONTENT
      ================================================== */}

      {!isLoading && !error && stats && stats.total > 0 && (
        <div
          className="
            flex
            min-h-0
            min-w-0
            flex-1
            flex-col
            justify-center
          "
        >
          {/* TOTAL TASKS */}

          <p
            className="
              shrink-0
              truncate
              text-[8px]
              font-medium
              text-slate-700
              sm:text-[9px]
            "
          >
            Total tasks {stats.total}
          </p>

          {/* =================================================
              PROGRESS BAR
          ================================================== */}

          <div className="mt-2 shrink-0">
            <div
              className="
                relative
                h-[16px]
                w-full
                overflow-hidden
                rounded-md
                bg-slate-200
                sm:h-[18px]
              "
            >
              <div
                className="
                  flex
                  h-full
                  min-w-[24px]
                  items-center
                  rounded-md
                  bg-gradient-to-r
                  from-violet-600
                  to-cyan-400
                  px-1.5
                "
                style={{
                  width: `${Math.max(progress, 10)}%`,
                }}
              >
                <span
                  className="
                    truncate
                    text-[7px]
                    font-semibold
                    text-white
                    sm:text-[8px]
                  "
                >
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              BREAKDOWN
          ================================================== */}

          <div
            className="
              mt-2.5
              grid
              min-w-0
              grid-cols-3
              gap-1.5
              sm:gap-2
            "
          >
            {breakdown.map((item) => (
              <div
                key={item.label}
                className="min-w-0"
              >
                <p
                  className="
                    truncate
                    text-[7px]
                    text-slate-500
                    sm:text-[8px]
                  "
                  title={item.label}
                >
                  {item.label}
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-[14px]
                    font-medium
                    leading-none
                    text-slate-800
                    sm:text-[16px]
                  "
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}