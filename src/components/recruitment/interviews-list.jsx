'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { peopleApi } from '@/lib/api/people.api'
import {
  INTERVIEW_OUTCOME_COLORS, INTERVIEW_OUTCOME_LABELS, INTERVIEW_STATUS_LABELS, INTERVIEW_TYPE_LABELS,
} from '@/constants/people'
import { formatDate } from '@/utils'
import { InterviewOutcomeModal } from './interview-modals'
import { Banner, errorMessage, inputClass, secondaryButton } from '@/components/people/ui'

/**
 * A table of interview rounds. `mine` lists the caller's own rounds (any role,
 * /interviews/mine); otherwise every round (admin/hr) with a status filter.
 */
export function InterviewsList({ mine = false }) {
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState('all')
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    const load = mine ? peopleApi.getMyInterviews() : peopleApi.getInterviews({ status })
    load
      .then((d) => { if (active) { setRows(d); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load interviews.')) })
    return () => { active = false }
  }, [mine, status, reload])

  const shown = mine && status !== 'all' ? (rows ?? []).filter((r) => r.status === status) : rows ?? []

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <select aria-label="Status" className={`${inputClass} w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All rounds</option>
          {Object.entries(INTERVIEW_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <Banner error={error} />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm" role="region" aria-label="Interviews" tabIndex={0}>
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500">
            <tr>
              {['Date', 'Candidate', 'Round', 'Interviewer', 'Status', 'Outcome', ''].map((h) => (
                <th key={h} scope="col" className="px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!rows && !error && <tr><td colSpan={7} className="py-6 text-center text-slate-400">Loading…</td></tr>}
            {rows && shown.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-center text-slate-500">{mine ? 'No interviews are assigned to you.' : 'No interviews.'}</td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">{formatDate(r.interviewDate, 'dd MMM yyyy')}{r.startTime && <span className="block text-[10px] text-slate-400">{r.startTime}</span>}</td>
                <td className="px-3 py-2">
                  {mine ? <span className="font-semibold">{r.candidateName}</span> : (
                    <Link href={`/recruitment/${r.candidateId}`} className="font-semibold text-slate-800 hover:text-primary">{r.candidateName}</Link>
                  )}
                  <span className="block text-[10px] text-slate-400">{r.roleApplied}</span>
                </td>
                <td className="px-3 py-2">{r.roundNumber}{r.interviewType && ` · ${INTERVIEW_TYPE_LABELS[r.interviewType]}`}</td>
                <td className="px-3 py-2 text-slate-500">{r.interviewer?.name ?? '—'}</td>
                <td className="px-3 py-2">{INTERVIEW_STATUS_LABELS[r.status] ?? r.status}</td>
                <td className="px-3 py-2">
                  {r.outcome ? (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${INTERVIEW_OUTCOME_COLORS[r.outcome]}`}>{INTERVIEW_OUTCOME_LABELS[r.outcome]}</span>
                  ) : '—'}
                  {r.rating && <span className="ml-1 text-[10px] text-slate-400">{r.rating}/5</span>}
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className={secondaryButton} onClick={() => setEditing(r)}>
                    {r.status === 'scheduled' ? 'Record outcome' : 'Edit'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <InterviewOutcomeModal
          interview={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); setReload((n) => n + 1) }}
        />
      )}
    </section>
  )
}
