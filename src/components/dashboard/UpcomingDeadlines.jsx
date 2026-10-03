'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

import {
  useUpcomingDeadlines,
  formatDueLabel,
  priorityBadgeClass,
  priorityLabel,
} from '@/lib/deadline-format'

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
]

export function UpcomingDeadlines() {
  const [days, setDays] = useState(30)
  const { tasks, isLoading, error } = useUpcomingDeadlines({ limit: 5, days })

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
        px-4
        py-3
        shadow-sm
      "
    >
      {/* HEADER — title + 7d/30d range toggle */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h3
          className="
            min-w-0
            truncate
            text-[13px]
            font-semibold
            text-slate-800
            sm:text-sm
          "
        >
          Upcoming Deadlines
        </h3>

        <div
          role="group"
          aria-label="Deadline range"
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-slate-100 p-0.5"
        >
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              aria-pressed={days === range.days}
              onClick={() => setDays(range.days)}
              className={`
                rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors
                ${
                  days === range.days
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden pt-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="
                flex
                min-w-0
                animate-pulse
                items-center
                gap-2
                py-1.5
              "
            >
              <div className="h-2 w-[54px] shrink-0 rounded bg-slate-100 sm:w-[62px]" />

              <div className="min-w-0 flex-1">
                <div className="h-2 w-full rounded bg-slate-100" />
              </div>

              <div className="h-3 w-[34px] shrink-0 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR */}
      {!isLoading && error && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[11px] text-slate-500 sm:text-[12px]">
            {error}
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && !error && tasks.length === 0 && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[11px] text-slate-400 sm:text-[12px]">
            No upcoming deadlines.
          </p>
        </div>
      )}

      {/* MAIN CONTENT */}
      {!isLoading && !error && tasks.length > 0 && (
        <div
          className="
            mt-1
            min-h-0
            min-w-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            overscroll-contain
            pr-0.5
          "
        >
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  py-1.5
                  transition
                  hover:bg-slate-50
                "
              >
                {/* DUE DATE */}
                <div
                  className={`
                    w-[64px]
                    shrink-0
                    truncate
                    text-[10px]
                    sm:w-[74px]
                    sm:text-[11px]
                    ${
                      task.isOverdue
                        ? 'font-medium text-red-600'
                        : 'text-slate-500'
                    }
                  `}
                  title={formatDueLabel(
                    task.daysLeft,
                    task.dueDate
                  )}
                >
                  {formatDueLabel(
                    task.daysLeft,
                    task.dueDate
                  )}
                </div>

                {/* TASK DETAILS */}
                <div className="flex min-w-0 flex-1 items-start gap-1.5">
                  <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-slate-300" />

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        truncate
                        text-[11px]
                        font-medium
                        text-slate-800
                        sm:text-[12px]
                      "
                      title={task.title}
                    >
                      {task.title}
                    </p>

                    {task.projectName && (
                      <p
                        className="
                          truncate
                          text-[10px]
                          text-slate-400
                          sm:text-[11px]
                        "
                        title={task.projectName}
                      >
                        {task.projectName}
                      </p>
                    )}
                  </div>
                </div>

                {/* PRIORITY */}
                <span
                  className={`
                    shrink-0
                    whitespace-nowrap
                    rounded-full
                    px-1.5
                    py-0.5
                    text-[10px]
                    font-medium
                    sm:px-2
                    sm:text-[11px]
                    ${priorityBadgeClass(task.priority)}
                  `}
                >
                  {priorityLabel(task.priority)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}