'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ViewAllLink } from './view-all-link'

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

import { dashboardApi } from '@/lib/api/dashboard.api'

const HEALTH_STYLES = {
  on_track: {
    label: 'On Track',
    dot: 'bg-green-500',
    text: 'text-green-600',
  },
  at_risk: {
    label: 'At Risk',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
  },
  delayed: {
    label: 'Delayed',
    dot: 'bg-red-500',
    text: 'text-red-600',
  },
}

export function ProjectHealth() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await dashboardApi.getProjectHealth()

        if (!cancelled) {
          setData(res)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load project health.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const overall = data?.overallPercent ?? 0
  const projects = (data?.projects ?? []).slice(0, 4)

  const chartData = [
    {
      value: overall,
      fill: '#7C3AED',
    },
  ]

  return (
    <Card className="project-health-card flex h-full min-h-0 min-w-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

      {/* TITLE */}
      <div className="flex shrink-0 items-center justify-between gap-2">
      <h3 className="min-w-0 truncate text-[13px] font-semibold text-slate-800 sm:text-sm">
        Project Health Overview
      </h3>
      <ViewAllLink href="/projects" label="projects" />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-slate-100" />

          <div className="w-full space-y-1.5">
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-5/6 rounded bg-slate-100" />
          </div>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-xs text-slate-500">
            {error}
          </p>
        </div>
      )}

      {/* MAIN CONTENT — donut on top, legend below in two columns, matching
          the reference's vertical layout rather than a side-by-side split. */}
      {!loading && !error && (
        <div className="project-health-body flex min-h-0 min-w-0 flex-1 flex-col items-center gap-3">

          {/* DONUT — the wrapper takes the leftover height (flex-1, no
              fixed px) and centers a capped-size square inside it, so it
              scales with whatever room the card actually has instead of a
              hardcoded size that only looks right at one card height. The
              230px ceiling is a sanity cap for very tall cards, not the
              normal size — on a typical row it still shrinks to fit. */}
          <div className="project-health-chart flex min-h-0 w-full flex-1 items-center justify-center py-1">
            <div className="project-health-ring aspect-square h-full max-h-[230px] w-auto max-w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={chartData}
                  innerRadius="72%"
                  outerRadius="92%"
                  startAngle={90}
                  endAngle={-270}
                  barSize={10}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />

                  <RadialBar
                    dataKey="value"
                    background={{ fill: '#ECEEF3' }}
                    cornerRadius={20}
                  />

                  <text
                    x="50%"
                    y="43%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-500 text-[10px]"
                  >
                    Overall Health
                  </text>

                  <text
                    x="50%"
                    y="62%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-900 text-[24px] font-bold"
                  >
                    {overall}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LEGEND — one row per project, name on the left and that same
              project's status on the right, as in the reference. */}
          <div className="project-health-legend flex w-full shrink-0 flex-col gap-1.5">
            {projects.map((project) => {
              const style = HEALTH_STYLES[project.health] ?? HEALTH_STYLES.on_track

              return (
                <div key={project.id} className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                    <span
                      className="min-w-0 truncate text-[12px] leading-4 font-medium text-slate-600"
                      title={project.name}
                    >
                      {project.name}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
                    <span className={`whitespace-nowrap text-[12px] leading-4 font-medium ${style.text}`}>
                      {style.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      )}

    </Card>
  )
}
