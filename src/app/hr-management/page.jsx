import { PageHeader } from '@/components/layout/topbar'
import { HrDashboard } from '@/components/hr-management/hr-dashboard'

export default function HRManagementPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-3 bg-slate-50 sm:space-y-4">
      <PageHeader>HR Management</PageHeader>
      <HrDashboard />
    </div>
  )
}
