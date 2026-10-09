import { HrHome } from '@/components/hr-management/hr-home'

export const metadata = {
  title: 'HR Dashboard',
}

// The HR Workspace landing page (admin can open it too). WorkspaceGuard in
// AppShell keeps other roles out.
export default function HrDashboardPage() {
  return <HrHome />
}
