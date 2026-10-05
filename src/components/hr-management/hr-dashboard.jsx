'use client'

import { useCallback, useEffect, useState } from 'react'
import { ShieldAlert, RefreshCw } from 'lucide-react'

import { useAuthStore } from '@/store/auth.store'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { peopleApi } from '@/lib/api/people.api'
import { CANDIDATE_STAGES } from '@/constants/people'
import { HRStats } from './hr-stats'
import { EmployeeOverview } from './employee-overview'
import { HRQuickActions } from './hr-quick-actions'
import { AttendanceSnapshot } from './attendance-snapshot'
import LeaveOverview from './leave-overview'
import { RecruitmentPipeline } from './recruitment-pipeline'
import { HrModules } from './hr-modules'

// Matches the backend's restrictTo('admin','manager') on /api/people. The
// backend is the real boundary; this only avoids rendering a page of 403s.
const HR_ROLES = ['admin', 'manager']

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback

/**
 * The HR Management page's data owner. Loads the dashboard figures and the
 * employee directory once, hands them to the presentational widgets, and
 * reloads both whenever a workspace modal saves a record.
 */
export function HrDashboard() {
  const mounted = useHasMounted()
  const user = useAuthStore((s) => s.user)
  const canView = HR_ROLES.includes(user?.role)

  const [dashboard, setDashboard] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State is only ever set from the promise callbacks, never synchronously in
  // the effect body.
  const apply = useCallback(([dash, list]) => {
    setDashboard(dash)
    setEmployees(list)
    setError('')
    setLoading(false)
  }, [])
  const fail = useCallback((err) => {
    setError(errorMessage(err, 'Failed to load HR data.'))
    setLoading(false)
  }, [])

  // Retry button, and the workspace modals after a save. Returns the promise so
  // a modal can wait for fresh figures before it re-enables its form.
  const load = useCallback(
    () => Promise.all([peopleApi.getDashboard(), peopleApi.getEmployees()]).then(apply, fail),
    [apply, fail]
  )

  useEffect(() => {
    if (!canView) return undefined
    let active = true
    Promise.all([peopleApi.getDashboard(), peopleApi.getEmployees()]).then(
      (result) => { if (active) apply(result) },
      (err) => { if (active) fail(err) }
    )
    return () => { active = false }
  }, [canView, apply, fail])

  if (!mounted) return null

  if (!canView) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <ShieldAlert aria-hidden="true" className="h-6 w-6 text-slate-400" />
        <p className="text-sm font-semibold text-slate-800">HR Management is available to admins and managers.</p>
      </div>
    )
  }

  const stats = dashboard && {
    totalEmployees: dashboard.employees.total,
    newEmployeesThisMonth: dashboard.employees.newThisMonth,
    presentToday: dashboard.attendance.presentToday,
    attendancePercent: dashboard.attendance.attendancePercent,
    onLeave: dashboard.leave.onLeaveToday,
    plannedLeave: dashboard.leave.planned,
    unplannedLeave: dashboard.leave.unplanned,
    activeCandidates: dashboard.recruitment.activeCandidates,
    interviewsToday: dashboard.recruitment.interviewsToday,
  }

  const stages = CANDIDATE_STAGES.map((stage) => ({
    ...stage,
    count: dashboard?.recruitment.pipeline[stage.key] ?? 0,
  }))

  return (
    <>
      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold hover:bg-rose-100"
          >
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      <HRStats stats={stats} loading={loading} />

      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 md:grid-cols-2">
        <EmployeeOverview employees={employees} loading={loading} />
        <HRQuickActions dashboard={dashboard} />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-3">
        <AttendanceSnapshot
          days={dashboard?.attendance.week ?? []}
          totalEmployees={dashboard?.employees.total ?? 0}
          loading={loading}
        />
        <LeaveOverview
          planned={dashboard?.leave.planned ?? 0}
          unplanned={dashboard?.leave.unplanned ?? 0}
          pending={dashboard?.leave.pending ?? 0}
        />
        <RecruitmentPipeline stages={stages} />
      </div>

      <HrModules employees={employees} onChanged={load} />
    </>
  )
}
