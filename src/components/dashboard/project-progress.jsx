'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { calcProgress, cn } from '@/utils'
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
} from '@/constants'
import { dashboardApi } from '@/lib/api/dashboard.api'

export function ProjectProgress() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await dashboardApi.getProjects()
        setItems(Array.isArray(data) ? data : [])
      } catch {
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  return (
    <div style={{ padding: 0 }} className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* FIXED HEADER */}
      <div className="flex h-[38px] shrink-0 items-center justify-between border-b border-slate-100 px-4">
        <h3 className="text-[12px] font-semibold text-slate-800 ">
          Project Progress
        </h3>

        <Link
          href="/projects"
          className="text-[11px] font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {/* SCROLL BODY */}
      <div
        role="region"
        aria-label="Project progress"
        tabIndex={0}
        style={{ padding: '6px 0 0' }}
        className="dashboard-project-scroll dashboard-scroll-preview min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain focus-visible:outline-2 focus-visible:outline-primary"
      >
        {isLoading || error || items.length === 0 ? (
          <p role="status" className="py-8 text-center text-[11px] text-slate-500">
            {isLoading ? 'Loading project progress...' : error ? 'Unable to load project progress.' : 'No projects yet.'}
          </p>
        ) : items.map((project) => {
            const progress = calcProgress(
              project.completedTasksCount,
              project.tasksCount
            )

            return (
              <div key={project.id} style={{ minHeight: 54, padding: '4px 8px', width: '100%' }} className="dashboard-project-details">
                <div className="flex items-center justify-between gap-2">

                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-[11px] leading-4 font-medium text-slate-700"
                      title={project.name}>
                      {project.name}
                    </p>

                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        PROJECT_STATUS_COLORS[project.status]
                      )}
                    >
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>

                  <span className="shrink-0 text-[11px] font-semibold text-slate-500">
                    {progress}%
                  </span>
                </div>

                <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      progress === 100
                        ? 'bg-green-500'
                        : progress > 60
                        ? 'bg-violet-500'
                        : progress > 30
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                    )}
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-[10px] leading-3 text-slate-500">
                    {project.manager_name}
                  </p>

                  <p className="shrink-0 text-[10px] leading-3 text-slate-500">
                    {project.completedTasksCount}/
                    {project.tasksCount} tasks
                  </p>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
