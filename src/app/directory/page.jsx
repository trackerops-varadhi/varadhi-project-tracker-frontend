import { PageHeader } from '@/components/layout/topbar'
import { TeamDirectory } from '@/components/people/team-directory'

export const metadata = {
  title: 'Team Directory',
}

// Part of the HR workspace (and admin's) — WorkspaceGuard and the backend's
// restrictTo on /api/people/team keep other roles out. Everyone's own HR
// profile lives under Settings → My HR Profile.
export default function DirectoryPage() {
  return (
    <div className="space-y-4">
      <div>
        <PageHeader>Team Directory</PageHeader>
        <p className="mt-0.5 text-sm text-slate-500">Who works here, what they do, and who they report to.</p>
      </div>
      <TeamDirectory />
    </div>
  )
}
