'use client'

import { Suspense } from 'react'

import { PageHeader } from '@/components/layout/topbar'
import { RoleGate } from '@/components/people/role-gate'
import { TabBar, useUrlTab } from '@/components/people/ui'
import { CandidatePipeline } from '@/components/recruitment/candidate-pipeline'
import { InterviewsList } from '@/components/recruitment/interviews-list'
import { ResumeFolder } from '@/components/recruitment/resume-folder'
import { ExpectationsReport } from '@/components/recruitment/expectations-report'

const TABS = [
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'interviews', label: 'Interviews' },
  { key: 'resumes', label: 'Resume Folder' },
  { key: 'expectations', label: 'Expectations Report' },
]

function RecruitmentContent() {
  const [tab, setTab] = useUrlTab(TABS, '/recruitment')
  return (
    <div className="space-y-4">
      <div>
        <PageHeader>Recruitment</PageHeader>
        <p className="mt-0.5 text-sm text-slate-500">Candidates, interview rounds, resumes and what candidates expect from us.</p>
      </div>
      <TabBar tabs={TABS} active={tab} onSelect={setTab} label="Recruitment sections" />
      {tab === 'pipeline' && <CandidatePipeline />}
      {tab === 'interviews' && <InterviewsList />}
      {tab === 'resumes' && <ResumeFolder />}
      {tab === 'expectations' && <ExpectationsReport />}
    </div>
  )
}

// admin/hr, matching restrictTo on /api/people/candidates.
export default function RecruitmentPage() {
  return (
    <RoleGate roles={['admin', 'hr']}>
      <Suspense fallback={null}>
        <RecruitmentContent />
      </Suspense>
    </RoleGate>
  )
}
