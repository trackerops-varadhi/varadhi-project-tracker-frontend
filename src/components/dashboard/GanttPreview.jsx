'use client'

import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Flag,
} from 'lucide-react'

import { dashboardApi } from '@/lib/api/dashboard.api'

const BAR_COLORS = [
  'bg-gradient-to-r from-indigo-600 to-violet-500',
  'bg-gradient-to-r from-violet-600 to-purple-500',
  'bg-gradient-to-r from-emerald-500 to-teal-400',
  'bg-gradient-to-r from-indigo-500 to-violet-400',
]

const DOT_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-indigo-400',
]

const shortDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '—'

function axisTicks(startIso, endIso) {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return []
  }

  return Array.from({ length: 4 }, (_, i) =>
    shortDate(
      new Date(
        start + ((end - start) * i) / 3
      )
    )
  )
}

export function GanttPreview() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await dashboardApi.getGantt()

        if (!cancelled) {
          setData(result)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load timeline.')
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

  const projects = (data?.projects ?? []).slice(0, 4)

  const ticks = data
    ? axisTicks(
        data.windowStart,
        data.windowEnd
      )
    : []

  return (
    <div
      className="
        relative
        flex
        h-full
        min-h-0
        min-w-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-violet-100/80
        bg-gradient-to-br
        from-violet-100/80
        via-purple-50/75
        to-blue-100/70
        px-3
        py-2
        shadow-[0_4px_16px_rgba(139,92,246,0.12)]
      "
    >
      {/* BACKGROUND EFFECT */}
      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-violet-300/20
          blur-3xl
        "
      />

      {/* TITLE */}
      <div
        className="
          relative
          z-10
          flex
          min-w-0
          shrink-0
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
          <CalendarDays
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
          Gantt Timeline Preview
        </h3>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div
          className="
            relative
            z-10
            mt-1.5
            min-h-0
            min-w-0
            flex-1
          "
        >
          <div
            className="
              h-full
              animate-pulse
              rounded-xl
              border
              border-white/60
              bg-white/50
            "
          />
        </div>
      )}

      {/* ERROR */}
      {!isLoading && error && (
        <div
          className="
            relative
            z-10
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

      {/* EMPTY */}
      {!isLoading &&
        !error &&
        projects.length === 0 && (
          <div
            className="
              relative
              z-10
              flex
              min-h-0
              flex-1
              items-center
              justify-center
              text-center
            "
          >
            <div>
              <p className="text-[8px] text-slate-500 sm:text-[9px]">
                No scheduled projects.
              </p>

              <p className="mt-0.5 text-[7px] text-slate-400 sm:text-[8px]">
                Add start and end dates.
              </p>
            </div>
          </div>
        )}

      {/* MAIN CONTENT */}
      {!isLoading &&
        !error &&
        projects.length > 0 && (
          <div
            className="
              relative
              z-10
              mt-1.5
              min-h-0
              min-w-0
              flex-1
              overflow-hidden
            "
          >
            {/* SCROLLING ONLY HERE */}
            <div
              className="
                gantt-scroll
                h-full
                min-h-0
                min-w-0
                overflow-auto
                overscroll-contain
                rounded-xl
                border
                border-white/60
                bg-white/55
                backdrop-blur-sm
              "
            >
              {/* 
                Keep proper readable width.
                If the card becomes narrow, scroll instead of squeezing.
              */}
              <div className="min-w-[620px]">

                {/* DATE HEADER */}
                <div
                  className="
                    grid
                    h-[22px]
                    min-h-[22px]
                    grid-cols-[145px_minmax(0,1fr)]
                    border-b
                    border-slate-100
                  "
                >
                  {/* PROJECT HEADER */}
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      border-r
                      border-slate-100
                      px-2
                      text-[7px]
                      font-medium
                      text-slate-400
                    "
                  >
                    Project
                  </div>

                  {/* DATES */}
                  <div className="grid min-w-0 grid-cols-4">
                    {ticks.map((tick, i) => (
                      <div
                        key={i}
                        className="
                          flex
                          min-w-0
                          items-center
                          justify-center
                          border-r
                          border-slate-100
                          px-1
                          text-[7px]
                          text-slate-500
                          last:border-r-0
                        "
                      >
                        <span className="truncate">
                          {tick}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROJECT ROWS */}
                {projects.map((project, index) => {
                  const offset = Math.min(
                    Math.max(
                      project.offsetPercent ?? 0,
                      0
                    ),
                    88
                  )

                  const width = Math.min(
                    Math.max(
                      project.widthPercent ?? 20,
                      18
                    ),
                    100 - offset
                  )

                  return (
                    <div
                      key={project.id}
                      className="
                        grid
                        h-[26px]
                        min-h-[26px]
                        grid-cols-[145px_minmax(0,1fr)]
                        border-b
                        border-slate-100
                        last:border-b-0
                      "
                    >
                      {/* PROJECT NAME */}
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-1.5
                          border-r
                          border-slate-100
                          px-2
                        "
                      >
                        <span
                          className={`
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                            ${
                              DOT_COLORS[
                                index %
                                  DOT_COLORS.length
                              ]
                            }
                          `}
                        />

                        <span
                          className="
                            min-w-0
                            flex-1
                            truncate
                            text-[7px]
                            font-medium
                            text-slate-600
                          "
                          title={project.name}
                        >
                          {project.name}
                        </span>
                      </div>

                      {/* TIMELINE */}
                      <div
                        className="
                          relative
                          min-w-0
                          overflow-hidden
                        "
                      >
                        {/* GRID LINES */}
                        <div
                          className="
                            absolute
                            inset-0
                            grid
                            grid-cols-8
                          "
                        >
                          {Array.from({
                            length: 8,
                          }).map((_, i) => (
                            <div
                              key={i}
                              className="
                                border-r
                                border-slate-100
                                last:border-r-0
                              "
                            />
                          ))}
                        </div>

                        {/* PROJECT BAR */}
                        <div
                          className={`
                            absolute
                            top-1/2
                            flex
                            h-[17px]
                            -translate-y-1/2
                            items-center
                            justify-between
                            overflow-hidden
                            rounded-full
                            px-2
                            text-white
                            shadow-sm
                            ${
                              BAR_COLORS[
                                index %
                                  BAR_COLORS.length
                              ]
                            }
                          `}
                          style={{
                            left: `${offset}%`,
                            width: `${width}%`,
                            minWidth: '85px',
                          }}
                        >
                          <div
                            className="
                              flex
                              min-w-0
                              flex-1
                              items-center
                              gap-1
                            "
                          >
                            <Flag
                              className="
                                h-2
                                w-2
                                shrink-0
                              "
                            />

                            <span
                              className="
                                min-w-0
                                truncate
                                text-[7px]
                                font-medium
                              "
                              title={project.name}
                            >
                              {project.name}
                            </span>
                          </div>

                          <span
                            className="
                              ml-1
                              shrink-0
                              whitespace-nowrap
                              text-[6px]
                            "
                          >
                            {project.percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      {/* SCROLLBAR */}
      <style>{`
        .gantt-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c4b5fd transparent;
        }

        .gantt-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        .gantt-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .gantt-scroll::-webkit-scrollbar-thumb {
          background: #c4b5fd;
          border-radius: 999px;
        }

        .gantt-scroll::-webkit-scrollbar-thumb:hover {
          background: #a78bfa;
        }
      `}</style>
    </div>
  )
}