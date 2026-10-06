'use client'

import { Suspense } from 'react'

import { PageHeader } from '@/components/layout/topbar'
import { RoleGate } from '@/components/people/role-gate'
import { TabBar, useUrlTab } from '@/components/people/ui'
import { EmployeeDirectory } from '@/components/people/employee-directory'
import { AttritionList } from '@/components/people/attrition-list'
import { AttritionAnalytics } from '@/components/people/attrition-analytics'

// Attrition records are admin/hr; managers get the read-only directory and
// the aggregate analytics, exactly as /api/people allows.
const TABS = [
  { key: 'directory', label: 'Employee Directory', roles: ['admin', 'hr', 'manager'] },
  { key: 'attrition', label: 'Attrition', roles: ['admin', 'hr'] },
  { key: 'analytics', label: 'Attrition Analytics', roles: ['admin', 'hr', 'manager'] },
]

function PeopleWorkspace({ role }) {
  const tabs = TABS.filter((t) => t.roles.includes(role))
  const [tab, setTab] = useUrlTab(tabs, '/people')
  return (
    <div className="space-y-4">
      <div>
        <PageHeader>People</PageHeader>
        <p className="mt-0.5 text-sm text-slate-500">Employee master records, exits and attrition trends.</p>
      </div>
      <TabBar tabs={tabs} active={tab} onSelect={setTab} label="People sections" />
      {tab === 'directory' && <EmployeeDirectory canEdit={['admin', 'hr'].includes(role)} />}
      {tab === 'attrition' && <AttritionList />}
      {tab === 'analytics' && <AttritionAnalytics />}
    </div>
  )
}

export default function PeoplePage() {
  return (
    <RoleGate roles={['admin', 'hr', 'manager']} message="People is available to admin, HR and managers.">
      {(role) => (
        <Suspense fallback={null}>
          <PeopleWorkspace role={role} />
        </Suspense>
      )}
    </RoleGate>
  )
}
