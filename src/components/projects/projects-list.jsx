'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Table } from '@/components/ui/table'

import {
  Search,
  Plus,
  Download,
  Sparkles,
  FolderKanban,
  CheckCircle2,
  Clock3,
  PauseCircle,
  AlertTriangle,
  CalendarDays,
  LayoutGrid,
  Table2,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import {
  ExportModal,
  AnalyticsModal,
  TeamMembersModal,
} from './project-modals'

import { ProjectCard } from './project-card'
import { CreateProjectModal } from './create-project-modal'
import { useAuthStore } from '@/store/auth.store'
import { projectsApi } from '@/lib/api/projects.api'
import { useHasMounted } from '@/hooks/use-has-mounted'

function ProjectSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
      <div className="h-3 bg-slate-100 rounded w-full mb-2" />
      <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
      <div className="h-1.5 bg-slate-100 rounded-full mb-4" />

      <div className="flex gap-2">
        <div className="w-6 h-6 rounded-full bg-slate-100" />
        <div className="w-6 h-6 rounded-full bg-slate-100" />
      </div>
    </div>
  )
}

export function ProjectsList() {
  const { user } = useAuthStore()
  const mounted = useHasMounted()
  const dateInputRef = useRef(null)
  const searchParams = useSearchParams()

  const canCreate =
    mounted && ['admin', 'manager'].includes(user?.role)

  const [allProjects, setAllProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showExport, setShowExport] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [search, setSearch] = useState(
    searchParams.get('search') || ''
  )

  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDeadlineDate, setSelectedDeadlineDate] = useState('')

  const [view, setView] = useState('table')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Safely load saved view preference after mount
  // to avoid hydration mismatch
  useEffect(() => {
    const savedView = localStorage.getItem('projects-view')

    if (savedView === 'grid' || savedView === 'table') {
      setView(savedView)
    }
  }, [])

  const handleViewChange = (newView) => {
    setView(newView)
    localStorage.setItem('projects-view', newView)
  }

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  // Reset pagination whenever filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, selectedDeadlineDate])

  async function fetchProjects() {
    try {
      setIsLoading(true)
      setError(null)

      const filters = {}

      if (search.trim()) {
        filters.search = search
      }

      const response = await projectsApi.getAllPages(filters)

      setAllProjects(response)
    } catch (err) {
      setAllProjects([])
      setError('Failed to load projects.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects()
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Calculate statistics dynamically
  const statistics = useMemo(() => {
    const total = allProjects.length

    const active = allProjects.filter(
      (project) =>
        project.status === 'active' ||
        project.status === 'in_progress'
    ).length

    const completed = allProjects.filter(
      (project) => project.status === 'completed'
    ).length

    const hold = allProjects.filter(
      (project) => project.status === 'on_hold'
    ).length

    const overdue = allProjects.filter((project) => {
      if (!project.endDate || project.status === 'completed') {
        return false
      }

      const endDate = new Date(project.endDate)

      return (
        !isNaN(endDate.getTime()) &&
        endDate < new Date()
      )
    }).length

    return {
      total,
      active,
      completed,
      hold,
      overdue,
    }
  }, [allProjects])

  // Filter projects based on selected status
  const filteredProjects = useMemo(() => {
    const now = new Date()

    return allProjects.filter((project) => {
      if (statusFilter === 'all') {
        return true
      }

      if (statusFilter === 'overdue') {
        if (
          !project.endDate ||
          project.status === 'completed'
        ) {
          return false
        }

        const endDate = new Date(project.endDate)

        return (
          !isNaN(endDate.getTime()) &&
          endDate < now
        )
      }

      if (statusFilter === 'active') {
        return (
          project.status === 'active' ||
          project.status === 'in_progress'
        )
      }

      return project.status === statusFilter
    })
  }, [allProjects, statusFilter])

  // Pagination
  const totalPages = Math.ceil(
    filteredProjects.length / itemsPerPage
  )

  const startIndex =
    (currentPage - 1) * itemsPerPage

  const paginatedProjects = useMemo(() => {
    return filteredProjects.slice(
      startIndex,
      startIndex + itemsPerPage
    )
  }, [filteredProjects, startIndex, itemsPerPage])

  // Upcoming deadlines
  const upcomingProjects = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return [...allProjects]
      .filter((project) => {
        if (!project.endDate) {
          return false
        }

        const projectDate = new Date(project.endDate)

        if (isNaN(projectDate.getTime())) {
          return false
        }

        if (selectedDeadlineDate) {
          const filterDate = new Date(
            selectedDeadlineDate
          )

          return (
            projectDate.getFullYear() ===
              filterDate.getFullYear() &&
            projectDate.getMonth() ===
              filterDate.getMonth() &&
            projectDate.getDate() ===
              filterDate.getDate()
          )
        }

        return projectDate >= now
      })
      .sort(
        (a, b) =>
          new Date(a.endDate) - new Date(b.endDate)
      )
      .slice(0, 5)
  }, [allProjects, selectedDeadlineDate])

  return (
    <div className="w-full space-y-6 text-slate-800">

      {/* HEADER TOOLBAR SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Right Action Bar */}
          <div className="flex w-full flex-wrap items-center gap-3 md:justify-end">

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => handleViewChange('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                  view === 'grid'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </button>

              <button
                type="button"
                onClick={() => handleViewChange('table')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                  view === 'table'
                    ? 'bg-white text-primary shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                Table
              </button>
            </div>

            {/* Export Button */}
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="h-9 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 transition shadow-xs shrink-0"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export
            </button>

            {/* New Project CTA */}
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover active:bg-violet-800 text-white text-sm font-semibold inline-flex items-center gap-2 transition shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOP KPI STAT CARDS */}
      <div className="grid min-w-0 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            title: 'Total Projects',
            value: statistics.total,
            icon: FolderKanban,
            color: 'bg-violet-50 text-primary',
          },
          {
            title: 'Active Projects',
            value: statistics.active,
            icon: TrendingUp,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            title: 'Completed',
            value: statistics.completed,
            icon: CheckCircle2,
            color: 'bg-blue-50 text-blue-600',
          },
          {
            title: 'On Hold',
            value: statistics.hold,
            icon: PauseCircle,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            title: 'Overdue',
            value: statistics.overdue,
            icon: AlertTriangle,
            color: 'bg-red-50 text-red-500',
          },
        ].map((item) => {
          const Icon = item.icon

          const share =
            statistics.total === 0
              ? '—'
              : `${Math.round(
                  (item.value / statistics.total) * 100
                )}% of total`

          return (
            <div
              key={item.title}
              className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-2 min-w-0"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  {item.title}
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {item.value}
                </p>

                <p className="text-xs font-medium text-slate-400 mt-1">
                  {share}
                </p>
              </div>

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          )
        })}
      </div>

      {/* MIDDLE ANALYTICS SECTION */}
      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-3 gap-5 [&>*]:min-w-0">

        {/* Project Health Overview */}
        <div className="project-panel p-5 space-y-4">
          <h3 className="project-panel-title">
            Project Health Overview
          </h3>

          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-[10px] border-emerald-500 border-t-amber-500 border-r-red-400 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 leading-none">
                  {statistics.total}
                </p>

                <p className="text-xs text-slate-400 font-semibold uppercase mt-1">
                  Total
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 flex-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Completed
                </span>

                <span className="font-semibold text-slate-800">
                  {statistics.completed}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Active
                </span>

                <span className="font-semibold text-slate-800">
                  {statistics.active}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Overdue
                </span>

                <span className="font-semibold text-slate-800">
                  {statistics.overdue}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  On Hold
                </span>

                <span className="font-semibold text-slate-800">
                  {statistics.hold}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Status Distribution */}
        <div className="project-panel p-5 space-y-3">
          <h3 className="project-panel-title">
            Status Distribution
          </h3>

          <div className="space-y-3 text-xs">
            {[
              {
                label: 'Active',
                value: statistics.active,
                color: 'bg-emerald-500',
              },
              {
                label: 'Completed',
                value: statistics.completed,
                color: 'bg-blue-500',
              },
              {
                label: 'On Hold',
                value: statistics.hold,
                color: 'bg-amber-500',
              },
              {
                label: 'Overdue',
                value: statistics.overdue,
                color: 'bg-red-500',
              },
            ].map((item) => {
              const percent =
                statistics.total === 0
                  ? 0
                  : Math.round(
                      (item.value / statistics.total) * 100
                    )

              return (
                <div key={item.label}>
                  <div className="flex justify-between text-slate-600 mb-1 font-medium text-xs">
                    <span>{item.label}</span>

                    <span className="font-semibold text-slate-800">
                      {item.value} ({percent}%)
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="project-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="project-panel-title">
                Upcoming Deadlines
              </h3>

              {selectedDeadlineDate && (
                <button
                  onClick={() => setSelectedDeadlineDate('')}
                  className="text-xs text-primary hover:underline mt-0.5"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  dateInputRef.current?.showPicker()
                }
                className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                title="Filter by Date"
                aria-label="Filter deadlines by date"
              >
                <CalendarDays className="w-5 h-5 text-primary" />
              </button>

              <input
                ref={dateInputRef}
                type="date"
                value={selectedDeadlineDate}
                onChange={(e) =>
                  setSelectedDeadlineDate(e.target.value)
                }
                className="sr-only"
              />
            </div>
          </div>

          {upcomingProjects.length > 0 ? (
            <div className="space-y-3 text-xs">
              {upcomingProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                      {project.name}
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {project.manager?.name || 'Unassigned'}
                    </p>
                  </div>

                  <span
                    suppressHydrationWarning
                    className="shrink-0 px-2.5 py-1 text-xs font-semibold bg-violet-50 text-primary rounded-lg border border-violet-100"
                  >
                    {mounted
                      ? new Date(
                          project.endDate
                        ).toLocaleDateString()
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              {selectedDeadlineDate
                ? 'No projects due on this date'
                : 'No upcoming deadlines'}
            </div>
          )}
        </div>
      </div>

      {/* MAIN DATA SECTION */}
      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-3 gap-5 [&>*]:min-w-0">

        {/* MAIN PROJECTS TABLE/GRID */}
        <div className="xl:col-span-2 project-panel p-5 space-y-4">

          {/* TAB FILTERS */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-2 w-full">
              {[
                {
                  id: 'all',
                  label: `All (${statistics.total})`,
                },
                {
                  id: 'active',
                  label: `Active (${statistics.active})`,
                },
                {
                  id: 'on_hold',
                  label: `On Hold (${statistics.hold})`,
                },
                {
                  id: 'completed',
                  label: `Completed (${statistics.completed})`,
                },
                {
                  id: 'overdue',
                  label: `Overdue (${statistics.overdue})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`pb-2 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
                    statusFilter === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* LOADING STATE */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProjectSkeleton key={i} />
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {!isLoading && error && (
            <div className="py-14 text-center flex flex-col items-center">
              <AlertTriangle className="w-10 h-10 text-red-300 mb-2" />

              <p className="text-sm font-semibold text-slate-800">
                {error}
              </p>

              <button
                onClick={fetchProjects}
                className="mt-3 h-9 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* DATA VIEW */}
          {!isLoading &&
            !error &&
            filteredProjects.length > 0 && (
              <>
                {view === 'grid' ? (
                  <div className="space-y-4">

                    {/* GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {paginatedProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onUpdated={fetchProjects}
                        />
                      ))}
                    </div>

                    {/* GRID PAGINATION */}
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60">
                      <p className="text-xs text-slate-500">
                        Showing{' '}
                        <span className="font-semibold text-slate-700">
                          {filteredProjects.length > 0
                            ? startIndex + 1
                            : 0}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-slate-700">
                          {Math.min(
                            startIndex + itemsPerPage,
                            filteredProjects.length
                          )}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-slate-700">
                          {filteredProjects.length}
                        </span>{' '}
                        projects
                      </p>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.max(page - 1, 1)
                            )
                          }
                          disabled={currentPage === 1}
                          aria-label="Previous projects page"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-xs font-semibold text-slate-600 px-2">
                          {currentPage} / {totalPages || 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.min(
                                page + 1,
                                totalPages
                              )
                            )
                          }
                          disabled={
                            currentPage === totalPages ||
                            totalPages === 0
                          }
                          aria-label="Next projects page"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full min-w-0 overflow-x-auto">
                    <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200/80">
                      <Table
                        scrollable={false}
                        className="w-full text-left border-collapse min-w-[700px]"
                      >
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-4 w-[35%]">
                              Project Name
                            </th>

                            <th className="py-3 px-4 w-[18%]">
                              Manager
                            </th>

                            <th className="py-3 px-4 w-[15%]">
                              Team
                            </th>

                            <th className="py-3 px-4 w-[15%]">
                              Deadline
                            </th>

                            <th className="py-3 px-4 w-[17%] text-right">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                          {paginatedProjects.map((project) => {
                            const statusStyles = {
                              active:
                                'bg-emerald-50 text-emerald-700 border-emerald-200',
                              in_progress:
                                'bg-emerald-50 text-emerald-700 border-emerald-200',
                              completed:
                                'bg-blue-50 text-blue-700 border-blue-200',
                              on_hold:
                                'bg-amber-50 text-amber-700 border-amber-200',
                              overdue:
                                'bg-red-50 text-red-700 border-red-200',
                            }[project.status] ||
                              'bg-slate-50 text-slate-700 border-slate-200'

                            return (
                              <tr
                                key={project.id}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                {/* Project Title */}
                                <td className="py-3.5 px-4">
                                  <Link
                                    href={`/projects/${project.id}`}
                                    className="block group"
                                  >
                                    <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">
                                      {project.name}
                                    </p>
                                  </Link>
                                </td>

                                {/* Manager */}
                                <td className="py-3.5 px-4 text-sm text-slate-700 font-medium truncate">
                                  <div className="flex items-center gap-2 truncate">
                                    <div className="w-6 h-6 rounded-full bg-violet-100 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                      {project.manager?.name?.[0] ||
                                        'U'}
                                    </div>

                                    <span className="truncate">
                                      {project.manager?.name ||
                                        'Unassigned'}
                                    </span>
                                  </div>
                                </td>

                                {/* Members Badge */}
                                <td className="py-3.5 px-4 truncate">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs truncate">
                                    <Users className="w-3 h-3 text-slate-400 shrink-0" />

                                    <span className="truncate">
                                      {project.members?.length || 0}{' '}
                                      members
                                    </span>
                                  </span>
                                </td>

                                {/* Deadline */}
                                <td className="py-3.5 px-4 text-sm text-slate-600 font-medium truncate">
                                  {project.endDate ? (
                                    <span className="flex items-center gap-1.5 truncate">
                                      <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                                      <span
                                        suppressHydrationWarning
                                        className="truncate"
                                      >
                                        {mounted
                                          ? new Date(
                                              project.endDate
                                            ).toLocaleDateString()
                                          : ''}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">
                                      No deadline
                                    </span>
                                  )}
                                </td>

                                {/* Status Badge */}
                                <td className="py-3.5 px-4 text-right truncate">
                                  <Link
                                    href={`/projects/${project.id}`}
                                    className="inline-block"
                                  >
                                    <span
                                      className={`inline-block px-2.5 py-1 text-xs font-semibold border rounded-lg capitalize hover:opacity-80 transition ${statusStyles}`}
                                    >
                                      {project.status
                                        ? project.status.replace(
                                            '_',
                                            ' '
                                          )
                                        : 'Draft'}
                                    </span>
                                  </Link>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </Table>

                      {/* TABLE PAGINATION BAR */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                        <p className="text-xs text-slate-500">
                          Showing{' '}
                          <span className="font-semibold text-slate-700">
                            {filteredProjects.length > 0
                              ? startIndex + 1
                              : 0}
                          </span>{' '}
                          to{' '}
                          <span className="font-semibold text-slate-700">
                            {Math.min(
                              startIndex + itemsPerPage,
                              filteredProjects.length
                            )}
                          </span>{' '}
                          of{' '}
                          <span className="font-semibold text-slate-700">
                            {filteredProjects.length}
                          </span>{' '}
                          projects
                        </p>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((page) =>
                                Math.max(page - 1, 1)
                              )
                            }
                            disabled={currentPage === 1}
                            aria-label="Previous projects page"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <span className="text-xs font-semibold text-slate-600 px-2">
                            {currentPage} / {totalPages || 1}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((page) =>
                                Math.min(
                                  page + 1,
                                  totalPages
                                )
                              )
                            }
                            disabled={
                              currentPage === totalPages ||
                              totalPages === 0
                            }
                            aria-label="Next projects page"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          {/* EMPTY STATE */}
          {!isLoading &&
            !error &&
            filteredProjects.length === 0 && (
              <div className="py-14 text-center flex flex-col items-center">
                <FolderKanban className="w-12 h-12 text-slate-300 mb-2" />

                <p className="text-base font-semibold text-slate-800">
                  No Projects Found
                </p>

                <p className="text-xs sm:text-sm text-slate-400 max-w-xs mt-1">
                  There are no projects matching your search or
                  status filter.
                </p>

                {canCreate && (
                  <button
                    onClick={() =>
                      setShowCreateModal(true)
                    }
                    className="mt-4 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-2"
                  >
                    Create Project
                  </button>
                )}
              </div>
            )}
        </div>

        {/* RIGHT WIDGET PANEL */}
        <div className="space-y-5">

          {/* Project summary */}
          <div className="bg-gradient-to-br from-primary to-indigo-700 text-white p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-base font-bold">
                Project Summary
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-violet-100">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />

                <span>
                  <strong>{statistics.completed}</strong>{' '}
                  project(s) completed successfully.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock3 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />

                <span>
                  <strong>{statistics.active}</strong>{' '}
                  project(s) actively in progress.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />

                <span>
                  <strong>{statistics.overdue}</strong>{' '}
                  project(s) require immediate attention.
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="project-panel p-5 space-y-4">
            <h3 className="project-panel-title">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {canCreate && (
                <button
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                  className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition text-left space-y-1.5"
                >
                  <Plus className="w-5 h-5 text-primary" />

                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    New Project
                  </p>
                </button>
              )}

              <button
                onClick={() => setShowExport(true)}
                className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition text-left space-y-1.5"
              >
                <Download className="w-5 h-5 text-blue-600" />

                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Export Report
                </p>
              </button>

              <button
                onClick={() => setShowAnalytics(true)}
                className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition text-left space-y-1.5"
              >
                <TrendingUp className="w-5 h-5 text-emerald-600" />

                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Analytics
                </p>
              </button>

              <button
                onClick={() => setShowTeam(true)}
                className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition text-left space-y-1.5"
              >
                <Users className="w-5 h-5 text-amber-600" />

                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Team Members
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        projects={allProjects}
      />

      <AnalyticsModal
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        projects={allProjects}
      />

      <TeamMembersModal
        open={showTeam}
        onClose={() => setShowTeam(false)}
        members={[]}
      />

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchProjects()
          }}
        />
      )}
    </div>
  )
}