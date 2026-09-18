'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

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
    <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">

      {/* TITLE - SAME CARD */}
      <h3 className="shrink-0 truncate text-[11px] font-semibold text-slate-800 sm:text-xs">
        Project Health Overview
      </h3>

      {/* LOADING - SAME CARD */}
      {loading && (
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2">
          <div className="h-[68px] w-[68px] shrink-0 animate-pulse rounded-full bg-slate-100 sm:h-[76px] sm:w-[76px]" />

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-5/6 rounded bg-slate-100" />
            <div className="h-2 w-4/6 rounded bg-slate-100" />
          </div>
        </div>
      )}

      {/* ERROR - SAME CARD */}
      {!loading && error && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-[8px] text-slate-500">
            {error}
          </p>
        </div>
      )}

      {/* MAIN CONTENT - SAME CARD */}
      {!loading && !error && (
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2">

          {/* DONUT */}
          <div className="h-[68px] w-[68px] shrink-0 sm:h-[76px] sm:w-[76px] lg:h-[82px] lg:w-[82px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={chartData}
                innerRadius="68%"
                outerRadius="88%"
                startAngle={90}
                endAngle={-270}
                barSize={7}
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
                  y="42%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-500 text-[6px]"
                >
                  Health
                </text>

                <text
                  x="50%"
                  y="59%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-900 text-[13px] font-bold sm:text-[14px]"
                >
                  {overall}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* PROJECT INFORMATION */}
          <div className="min-w-0 flex-1">
            <div className="space-y-1">
              {projects.map((project) => {
                const style =
                  HEALTH_STYLES[project.health] ??
                  HEALTH_STYLES.on_track

                return (
                  <div
                    key={project.id}
                    className="flex min-w-0 items-center justify-between gap-1.5"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
                      />

                      <span
                        className="min-w-0 truncate text-[8px] font-medium text-slate-600 sm:text-[9px]"
                        title={project.name}
                      >
                        {project.name}
                      </span>
                    </div>

                    <span
                      className={`shrink-0 whitespace-nowrap text-[7px] font-medium sm:text-[8px] ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

    </Card>
  )
}