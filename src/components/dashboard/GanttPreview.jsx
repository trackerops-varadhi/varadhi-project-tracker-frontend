'use client'

import { useEffect, useState } from 'react'
import { ScrollPreview } from './scroll-preview'
import { dashboardApi } from '@/lib/api/dashboard.api'

const BAR_COLORS = [
  'bg-gradient-to-r from-indigo-600 to-violet-500',
  'bg-gradient-to-r from-primary to-purple-500',
  'bg-gradient-to-r from-emerald-500 to-teal-400',
  'bg-gradient-to-r from-indigo-500 to-violet-400',
]

const shortDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '—'

// Readable dates inside each preview bar.
function barRange(startIso, endIso) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''

  return `${shortDate(start)} - ${shortDate(end)}`
}

function axisTicks(startIso, endIso) {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return []
  }

  return Array.from({ length: 6 }, (_, i) =>
    shortDate(
      new Date(
        start + ((end - start) * i) / 5
      )
    )
  )
}

function Shell({ children }) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-2">
      <h3 className="min-w-0 truncate text-[12px] font-semibold text-slate-800 ">
        Gantt Timeline Preview
      </h3>
      </div>

      {children}
    </div>
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

  if (isLoading) {
    return (
      <Shell>
        <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-100">
          <div className="space-y-3 p-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-lg bg-slate-100"
                style={{ width: `${70 - i * 8}%` }}
              />
            ))}
          </div>
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[11px] text-slate-500">{error}</p>
        </div>
      </Shell>
    )
  }

  const projects = (data?.projects ?? [])

  if (projects.length === 0) {
    return (
      <Shell>
        <div className="flex min-h-0 flex-1 items-center justify-center text-center">
          <div>
            <p className="text-[11px] text-slate-500">No scheduled projects.</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Projects need start and end dates to appear here.
            </p>
          </div>
        </div>
      </Shell>
    )
  }

  const ticks = axisTicks(data.windowStart, data.windowEnd)

  return (
    <Shell>
      <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-100">
        {/* SCROLLING ONLY HERE — keeps a readable minimum width and scrolls
            horizontally instead of squeezing the bars illegible. */}
        <div className="gantt-scroll h-full min-h-0 min-w-0 overflow-hidden overscroll-contain">
          <div className="gantt-table min-w-0" >

            {/* DATE HEADER */}
            <div
              className="gantt-date-header grid h-[32px] min-h-[32px] border-b border-slate-100 bg-slate-50/60"
              style={{ gridTemplateColumns: 'minmax(80px, 14%) repeat(6, minmax(0,1fr))' }}
            >
              <div className="flex min-w-0 items-center border-r border-slate-100 px-3 text-[11px] font-medium text-slate-500">
                Task
              </div>

              {ticks.map((tick, i) => (
                <div
                  key={i}
                  className="flex min-w-0 items-center justify-center border-r border-slate-100 px-1 text-[11px] text-slate-500 last:border-r-0"
                >
                  <span className="truncate">{tick}</span>
                </div>
              ))}
            </div>

            {/* PROJECT ROWS */}
            <ScrollPreview rowHeight={44} label="timeline projects" fill>
            {projects.map((project, index) => {
              const offset = Math.min(Math.max(project.offsetPercent ?? 0, 0), 88)
              const width = Math.min(Math.max(project.widthPercent ?? 20, 18), 100 - offset)
              const range = barRange(project.startDate, project.endDate)

              return (
                <div
                  key={project.id}
                  className="gantt-project-row grid h-[48px] min-h-[48px] border-b border-slate-100 last:border-b-0"
                  style={{ gridTemplateColumns: 'minmax(80px, 14%) minmax(0,1fr)' }}
                >
                  {/* TASK NAME */}
                  <div className="flex min-w-0 items-center border-r border-slate-100 px-3">
                    <span
                      className="min-w-0 flex-1 truncate text-[11px] text-slate-700"
                      title={project.name}
                    >
                      {project.name}
                    </span>
                  </div>

                  {/* TIMELINE */}
                  <div className="relative min-w-0 overflow-hidden">
                    {/* GRID LINES */}
                    <div className="absolute inset-0 grid grid-cols-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border-r border-slate-100 last:border-r-0" />
                      ))}
                    </div>

                    {/* PROJECT BAR */}
                    <div
                      title={`${project.name} · ${shortDate(project.startDate)} – ${shortDate(project.endDate)} · ${project.percent}% complete`}
                      className={`
                        gantt-project-bar absolute top-1/2 flex h-8 -translate-y-1/2
                        items-center justify-between gap-2
                        overflow-hidden rounded-full px-3
                        text-white shadow-sm
                        ${BAR_COLORS[index % BAR_COLORS.length]}
                      `}
                      style={{
                        left: `${offset}%`,
                        width: `${width}%`,
                        minWidth: '110px',
                      }}
                    >
                      <span
                        className="min-w-0 truncate text-[11px] font-semibold"
                        title={project.name}
                      >
                        {project.name}
                      </span>

                      {range && (
                        <span className="ml-1 shrink-0 whitespace-nowrap text-[11px] text-white/85">
                          {range}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            </ScrollPreview>
          </div>
        </div>
      </div>

      {/* SCROLLBAR */}
      <style>{`
        .gantt-table { height: 100%; display: flex; flex-direction: column; }
        .gantt-table > div:last-child { height: auto; flex: 1; min-height: 0; }
        .gantt-table .gantt-date-header { flex-shrink: 0; height: 22px; min-height: 22px; }
        .gantt-table .gantt-project-row { height: 100%; min-height: 0; }
        .gantt-table .gantt-project-bar { height: min(22px, 85%); }
        .gantt-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c4b5fd transparent;
        }

        .gantt-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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
    </Shell>
  )
}
