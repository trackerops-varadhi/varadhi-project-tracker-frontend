'use client'

import { use, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarPlus, Download, FileText, Pencil, Trash2, Upload, UserPlus } from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { usersApi } from '@/lib/api/users.api'
import { businessToday } from '@/lib/business-date'
import {
  CANDIDATE_SOURCE_LABELS, CANDIDATE_STAGES, INTERVIEW_OUTCOME_COLORS, INTERVIEW_OUTCOME_LABELS,
  INTERVIEW_STATUS_LABELS, INTERVIEW_TYPE_LABELS, formatTenure,
} from '@/constants/people'
import { formatDate, formatFileSize } from '@/utils'
import { RoleGate } from '@/components/people/role-gate'
import { CandidateFormModal } from '@/components/recruitment/candidate-form-modal'
import { InterviewOutcomeModal, ScheduleInterviewModal } from '@/components/recruitment/interview-modals'
import { openResume } from '@/components/recruitment/resume-folder'
import {
  Banner, Field, Modal, errorMessage, inputClass, primaryButton, secondaryButton,
} from '@/components/people/ui'

const RESUME_ACCEPT = '.pdf,.doc,.docx'

function ConvertModal({ candidate, onClose, onDone }) {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    designation: candidate.appliedFor, dateOfJoining: businessToday(), reportingManagerId: '', employeeCode: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    let active = true
    usersApi.getAll({ status: 'active' }).then((u) => { if (active) setUsers(u) }).catch(() => {})
    return () => { active = false }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const result = await peopleApi.convertCandidate(candidate.id, {
        ...form, reportingManagerId: form.reportingManagerId || null,
      })
      onDone(result)
    } catch (err) {
      setError(errorMessage(err, 'Could not convert the candidate.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`Convert ${candidate.fullName} to an employee`}
      subtitle={`An invite email goes to ${candidate.email}; their HR profile is created now.`}
      onClose={onClose}
      busy={saving}
      size="max-w-xl"
      footer={(
        <>
          <button type="button" className={secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="convert-form" className={primaryButton} disabled={saving}>{saving ? 'Converting…' : 'Invite & create profile'}</button>
        </>
      )}
    >
      <form id="convert-form" onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2"><Banner error={error} /></div>
        <Field label="Role / designation" required><input className={inputClass} required maxLength={120} value={form.designation} onChange={set('designation')} /></Field>
        <Field label="Date of joining"><input type="date" className={inputClass} value={form.dateOfJoining} onChange={set('dateOfJoining')} /></Field>
        <Field label="Employee code"><input className={inputClass} maxLength={30} value={form.employeeCode} onChange={set('employeeCode')} /></Field>
        <Field label="Reporting manager">
          <select className={inputClass} value={form.reportingManagerId} onChange={set('reportingManagerId')}>
            <option value="">None</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
      </form>
    </Modal>
  )
}

function CandidateDetail({ candidateId }) {
  const router = useRouter()
  const fileInput = useRef(null)
  const [candidate, setCandidate] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null) // 'edit' | 'schedule' | 'convert' | interview
  const [uploading, setUploading] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    peopleApi.getCandidate(candidateId)
      .then((c) => { if (active) { setCandidate(c); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load this candidate.')) })
    return () => { active = false }
  }, [candidateId, reload])

  const refresh = (message) => {
    setModal(null)
    if (message) setNotice(message)
    setReload((n) => n + 1)
  }

  const changeStatus = async (status) => {
    setError('')
    try {
      setCandidate(await peopleApi.setCandidateStatus(candidateId, status))
    } catch (err) {
      setError(errorMessage(err, 'Could not change the status.'))
    }
  }

  const upload = async (file) => {
    if (!file) return
    setError('')
    setUploading(0)
    try {
      await peopleApi.uploadResume(candidateId, file, (e) => {
        if (e.total) setUploading(Math.round((e.loaded / e.total) * 100))
      })
      refresh('Resume uploaded.')
    } catch (err) {
      setError(errorMessage(err, 'Could not upload the resume.'))
    } finally {
      setUploading(null)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const removeResume = async (r) => {
    if (!window.confirm(`Delete ${r.fileName}? This cannot be undone.`)) return
    try {
      await peopleApi.deleteResume(candidateId, r.id)
      refresh('Resume deleted.')
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the resume.'))
    }
  }

  const removeCandidate = async () => {
    if (!window.confirm(`Delete ${candidate.fullName}, their interview rounds and resumes? This cannot be undone.`)) return
    try {
      await peopleApi.deleteCandidate(candidateId)
      router.push('/recruitment')
    } catch (err) {
      setError(errorMessage(err, 'Could not delete the candidate.'))
    }
  }

  const download = async (r) => {
    try {
      await openResume(candidateId, r.id)
    } catch (err) {
      setError(errorMessage(err, 'Could not open the resume.'))
    }
  }

  if (!candidate) {
    return error ? <Banner error={error} /> : <p className="text-xs text-slate-400">Loading…</p>
  }

  const facts = [
    ['Email', candidate.email], ['Phone', candidate.phone],
    ['Source', CANDIDATE_SOURCE_LABELS[candidate.source]], ['Product', candidate.product],
    ['Current company', candidate.currentCompany],
    ['Experience', candidate.totalExperienceMonths != null ? formatTenure(candidate.totalExperienceMonths) : null],
    ['Notice period', candidate.noticePeriodDays != null ? `${candidate.noticePeriodDays} days` : null],
    ['Expected shift', candidate.expectedShift],
  ]
  const canConvert = ['selected', 'offered'].includes(candidate.status) && !candidate.convertedUserId

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-slate-900">{candidate.fullName}</h1>
          <p className="text-xs text-slate-500">Applied for {candidate.appliedFor}</p>
        </div>
        <label className="text-xs text-slate-500">
          <span className="sr-only">Status</span>
          <select className={`${inputClass} w-auto`} value={candidate.status} disabled={Boolean(candidate.convertedUserId)}
            onChange={(e) => changeStatus(e.target.value)}>
            {CANDIDATE_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <button type="button" className={secondaryButton} onClick={() => setModal('edit')}><Pencil size={13} /> Edit</button>
        <button type="button" className={secondaryButton} onClick={() => setModal('schedule')}><CalendarPlus size={13} /> Schedule round</button>
        {canConvert && (
          <button type="button" className={primaryButton} onClick={() => setModal('convert')}
            disabled={!candidate.email} title={candidate.email ? undefined : 'Add an email first'}>
            <UserPlus size={13} /> Convert to employee
          </button>
        )}
        {candidate.convertedUserId && (
          <Link href={`/people/${candidate.convertedUserId}`} className={secondaryButton}>View employee profile</Link>
        )}
        <button type="button" className={`${secondaryButton} text-rose-600`} onClick={removeCandidate} aria-label="Delete candidate"><Trash2 size={13} /></button>
      </div>

      <Banner error={error} success={notice} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <dl className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label} className="border-b border-slate-100 py-2">
              <dt className="text-[10px] font-medium text-slate-500">{label}</dt>
              <dd className="mt-0.5 text-xs font-semibold text-slate-800">{value || '—'}</dd>
            </div>
          ))}
        </dl>
        {candidate.notes && <p className="mt-3 whitespace-pre-wrap text-xs text-slate-600">{candidate.notes}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Interview rounds</h2>
        {candidate.interviews.length === 0 && <p className="text-xs text-slate-500">No rounds yet.</p>}
        <ul className="space-y-2">
          {candidate.interviews.map((i) => (
            <li key={i.id} className="rounded-xl border border-slate-100 p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">
                  Round {i.roundNumber}{i.interviewType ? ` · ${INTERVIEW_TYPE_LABELS[i.interviewType]}` : ''}
                  <span className="ml-2 font-normal text-slate-500">
                    {formatDate(i.interviewDate, 'dd MMM yyyy')}{i.startTime ? ` ${i.startTime}` : ''} · {i.interviewer?.name ?? 'No interviewer'}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{INTERVIEW_STATUS_LABELS[i.status]}</span>
                  {i.outcome && <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${INTERVIEW_OUTCOME_COLORS[i.outcome]}`}>{INTERVIEW_OUTCOME_LABELS[i.outcome]}</span>}
                  {i.rating && <span className="text-slate-400">{i.rating}/5</span>}
                  <button type="button" className={secondaryButton} onClick={() => setModal(i)}>
                    {i.status === 'scheduled' ? 'Record outcome' : 'Edit'}
                  </button>
                </div>
              </div>
              {i.feedback && <p className="mt-1 text-slate-600">Feedback: {i.feedback}</p>}
              {i.notSelectedReason && <p className="mt-1 text-rose-700">Not selected: {i.notSelectedReason}</p>}
              {i.candidateExpectations && <p className="mt-1 italic text-slate-500">Expects: &quot;{i.candidateExpectations}&quot;</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-800">Resumes</h2>
          <input ref={fileInput} type="file" accept={RESUME_ACCEPT} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          <button type="button" className={secondaryButton} disabled={uploading !== null} onClick={() => fileInput.current?.click()}>
            <Upload size={13} /> {uploading !== null ? `Uploading ${uploading}%` : 'Upload resume'}
          </button>
        </div>
        <p className="mb-2 text-[10px] text-slate-400">PDF, DOC or DOCX up to 10 MB. Stored privately; links expire after a minute.</p>
        {candidate.resumes.length === 0 && <p className="text-xs text-slate-500">No resume uploaded.</p>}
        <ul className="space-y-1.5">
          {candidate.resumes.map((r) => (
            <li key={r.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs">
              <FileText size={15} className="text-sky-600" />
              <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{r.fileName}</span>
              <span className="text-slate-400">{formatFileSize(r.fileSize ?? 0)} · {formatDate(r.createdAt, 'dd MMM yyyy')}</span>
              <button type="button" className={secondaryButton} onClick={() => download(r)} aria-label={`Open ${r.fileName}`}><Download size={13} /></button>
              <button type="button" className={`${secondaryButton} text-rose-600`} onClick={() => removeResume(r)} aria-label={`Delete ${r.fileName}`}><Trash2 size={13} /></button>
            </li>
          ))}
        </ul>
      </section>

      {modal === 'edit' && <CandidateFormModal candidate={candidate} onClose={() => setModal(null)} onSaved={() => refresh('Candidate updated.')} />}
      {modal === 'schedule' && <ScheduleInterviewModal candidate={candidate} onClose={() => setModal(null)} onSaved={() => refresh('Interview scheduled.')} />}
      {modal === 'convert' && (
        <ConvertModal candidate={candidate} onClose={() => setModal(null)}
          onDone={() => refresh(`${candidate.fullName} was invited and added to the employee directory.`)} />
      )}
      {modal && typeof modal === 'object' && (
        <InterviewOutcomeModal interview={{ ...modal, candidateName: candidate.fullName, roleApplied: candidate.appliedFor }}
          onClose={() => setModal(null)} onSaved={() => refresh('Interview updated.')} />
      )}
    </div>
  )
}

export default function CandidatePage({ params }) {
  const { candidateId } = use(params)
  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <Link href="/recruitment" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary">
        <ArrowLeft size={14} /> Recruitment
      </Link>
      <RoleGate roles={['admin', 'hr']}>
        <CandidateDetail candidateId={candidateId} />
      </RoleGate>
    </div>
  )
}
