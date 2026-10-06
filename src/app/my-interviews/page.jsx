'use client'

import { PageHeader } from '@/components/layout/topbar'
import { InterviewsList } from '@/components/recruitment/interviews-list'

// Every role: anyone can be an interviewer and record their own round.
export default function MyInterviewsPage() {
  return (
    <div className="space-y-4">
      <div>
        <PageHeader>My Interviews</PageHeader>
        <p className="mt-0.5 text-sm text-slate-500">Interview rounds assigned to you. Record the outcome once the round is done.</p>
      </div>
      <InterviewsList mine />
    </div>
  )
}
