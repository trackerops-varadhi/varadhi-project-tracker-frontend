import { HRStats } from '@/components/hr-management/hr-stats'
import { EmployeeOverview } from '@/components/hr-management/employee-overview'
import { HRQuickActions } from '@/components/hr-management/hr-quick-actions'

export default function HRManagementPage() {
  return (
    <main className="min-h-full w-full bg-slate-50 p-4">
      <h1 className="text-lg font-semibold text-slate-900">
        HR Management
      </h1>

      <p className="mt-1 text-xs text-slate-500">
        Manage recruitment, resumes, attrition, teams, leave and attendance.
      </p>
      <div className="mt-4">
        <HRStats />
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-1 items-stretch gap-3 md:grid-cols-2">
        <EmployeeOverview />
        <HRQuickActions />
      </div>
    </main>
  )
}
