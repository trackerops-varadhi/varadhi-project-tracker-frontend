import { PageHeader } from '@/components/layout/topbar'
import { HRStats } from '@/components/hr-management/hr-stats'
import { EmployeeOverview } from '@/components/hr-management/employee-overview'
import { HRQuickActions } from '@/components/hr-management/hr-quick-actions'
import { AttendanceSnapshot } from '@/components/hr-management/attendance-snapshot'
import LeaveOverview from '@/components/hr-management/leave-overview'
import { RecruitmentPipeline } from '@/components/hr-management/recruitment-pipeline'
import { HrModules } from '@/components/hr-management/hr-modules'

export default function HRManagementPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-3 bg-slate-50 sm:space-y-4">
      <PageHeader>HR Management</PageHeader>
      <HRStats />

      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 md:grid-cols-2">
        <EmployeeOverview />
        <HRQuickActions />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 lg:grid-cols-3">
        <AttendanceSnapshot />
        <LeaveOverview />
        <RecruitmentPipeline />
      </div>

      <HrModules />
    </div>
  )
}
