'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'

import {
  useUpcomingDeadlines,
  formatDueLabel,
  priorityBadgeClass,
  priorityLabel,
} from '@/lib/deadline-format'

export function UpcomingDeadlines() {
  const { tasks, isLoading, error } = useUpcomingDeadlines({ limit: 5, days: 30 })

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
      {/* TITLE */}
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
        Upcoming Deadlines
      </h3>

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
          <p className="text-[8px] text-slate-500 sm:text-[9px]">
            {error}
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && !error && tasks.length === 0 && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[8px] text-slate-400 sm:text-[9px]">
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
                    w-[54px]
                    shrink-0
                    truncate
                    text-[7px]
                    sm:w-[62px]
                    sm:text-[8px]
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
                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate
                      text-[8px]
                      font-medium
                      text-slate-800
                      sm:text-[9px]
                    "
                    title={task.title}
                  >
                    {task.title}
                  </p>

                  {task.projectName && (
                    <p
                      className="
                        truncate
                        text-[7px]
                        text-slate-400
                        sm:text-[8px]
                      "
                      title={task.projectName}
                    >
                      {task.projectName}
                    </p>
                  )}
                </div>

                {/* PRIORITY */}
                <span
                  className={`
                    shrink-0
                    whitespace-nowrap
                    rounded-full
                    px-1.5
                    py-0.5
                    text-[7px]
                    font-medium
                    sm:px-2
                    sm:text-[8px]
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