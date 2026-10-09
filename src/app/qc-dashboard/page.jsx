import { QcDashboard } from '@/components/qc/qc-dashboard'

export const metadata = {
  title: 'QC Dashboard',
}

// The QC Workspace landing page (admin can open it too). WorkspaceGuard in
// AppShell keeps other roles out.
export default function QcDashboardPage() {
  return <QcDashboard />
}
