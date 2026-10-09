'use client'

import { useEffect, useState } from 'react'

import { peopleApi } from '@/lib/api/people.api'
import { usersApi } from '@/lib/api/users.api'
import { businessToday } from '@/lib/business-date'
import { INTERVIEW_OUTCOME_LABELS, INTERVIEW_TYPE_LABELS } from '@/constants/people'
import { Banner, Field, Modal, errorMessage, inputClass, primaryButton, secondaryButton } from '@/components/people/ui'

/** Schedule the next round for a candidate (admin/hr). */
export function ScheduleInterviewModal({ candidate, onClose, onSaved }) {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ interviewDate: businessToday(), startTime: '', interviewType: 'technical', interviewerId: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    let active = true
    usersApi.getAll({ status: 'active' })
      .then((u) => { if (active) setUsers(u) })
      .catch(() => { if (active) setError('Could not load interviewers.') })
    return () => { active = false }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const saved = await peopleApi.createInterview({
        candidateId: candidate.id,
        ...form,
        startTime: form.startTime || null,
        interviewerId: form.interviewerId || null,
      })
      onSaved(saved)
    } catch (err) {
      setError(errorMessage(err, 'Could not schedule the interview.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`Schedule interview — ${candidate.fullName}`}
      subtitle="The interviewer is notified and can record the outcome themselves."
      onClose={onClose}
      busy={saving}
      footer={(
        <>
          <button type="button" className={secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="schedule-form" className={primaryButton} disabled={saving}>{saving ? 'Scheduling…' : 'Schedule'}</button>
        </>
      )}
    >
      <form id="schedule-form" onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2"><Banner error={error} /></div>
        <Field label="Interview / call date" required><input type="date" required className={inputClass} value={form.interviewDate} onChange={set('interviewDate')} /></Field>
        <Field label="Start time"><input type="time" className={inputClass} value={form.startTime} onChange={set('startTime')} /></Field>
        <Field label="Interview type">
          <select className={inputClass} value={form.interviewType} onChange={set('interviewType')}>
            {Object.entries(INTERVIEW_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Interviewer">
          <select className={inputClass} value={form.interviewerId} onChange={set('interviewerId')}>
            <option value="">Not assigned</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
      </form>
    </Modal>
  )
}

/**
 * Record what happened in a round — used by HR on the candidate page and by
 * the interviewer on My Interviews (the backend allows both).
 */
export function InterviewOutcomeModal({ interview, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: 'completed',
    outcome: interview.outcome ?? 'next_round',
    rating: interview.rating ?? '',
    feedback: interview.feedback ?? '',
    notSelectedReason: interview.notSelectedReason ?? '',
    candidateExpectations: interview.candidateExpectations ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const completed = form.status === 'completed'

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const saved = await peopleApi.recordInterviewOutcome(interview.id, {
        ...form,
        rating: form.rating === '' ? null : Number(form.rating),
      })
      onSaved(saved)
    } catch (err) {
      setError(errorMessage(err, 'Could not save the outcome.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`Round ${interview.roundNumber} — ${interview.candidateName}`}
      subtitle={`${interview.roleApplied} · ${interview.interviewDate}`}
      onClose={onClose}
      busy={saving}
      footer={(
        <>
          <button type="button" className={secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="outcome-form" className={primaryButton} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </>
      )}
    >
      <form id="outcome-form" onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2"><Banner error={error} /></div>
        <Field label="What happened">
          <select className={inputClass} value={form.status} onChange={set('status')}>
            <option value="completed">Interview completed</option>
            <option value="no_show">Candidate did not show up</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Field>
        {completed && (
          <>
            <Field label="Outcome" required>
              <select className={inputClass} value={form.outcome} onChange={set('outcome')}>
                {Object.entries(INTERVIEW_OUTCOME_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Rating (1–5)">
              <select className={inputClass} value={form.rating} onChange={set('rating')}>
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            {form.outcome === 'rejected' && (
              <Field label="Not selected reason">
                <input className={inputClass} maxLength={2000} value={form.notSelectedReason} onChange={set('notSelectedReason')} />
              </Field>
            )}
            <Field label="Feedback / for future reference" className="md:col-span-2">
              <textarea className={inputClass} rows={3} maxLength={4000} value={form.feedback} onChange={set('feedback')} />
            </Field>
            <Field label="Candidate expectations to improve our organisation (e.g. pay / shift)" className="md:col-span-2">
              <textarea className={inputClass} rows={2} maxLength={2000} value={form.candidateExpectations} onChange={set('candidateExpectations')} />
            </Field>
          </>
        )}
      </form>
    </Modal>
  )
}
