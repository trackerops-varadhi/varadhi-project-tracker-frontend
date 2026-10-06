'use client'

import { Suspense } from 'react'

import { PageHeader } from '@/components/layout/topbar'
import { TabBar, useUrlTab } from '@/components/people/ui'
import { TeamDirectory } from '@/components/people/team-directory'
import { MyProfile } from '@/components/people/my-profile'

const TABS = [
  { key: 'team', label: 'Team Directory' },
  { key: 'me', label: 'My Profile' },
]

function DirectoryContent() {
  const [tab, setTab] = useUrlTab(TABS, '/directory')
  return (
    <div className="space-y-4">
      <div>
        <PageHeader>Team Directory</PageHeader>
        <p className="mt-0.5 text-sm text-slate-500">Who works here, what they do, and who they report to.</p>
      </div>
      <TabBar tabs={TABS} active={tab} onSelect={setTab} label="Directory sections" />
      {tab === 'team' ? <TeamDirectory /> : <MyProfile />}
    </div>
  )
}

// Every role. useSearchParams needs the Suspense boundary.
export default function DirectoryPage() {
  return (
    <Suspense fallback={null}>
      <DirectoryContent />
    </Suspense>
  )
}
