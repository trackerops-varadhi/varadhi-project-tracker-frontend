'use client'

import { useState } from 'react'

import { peopleApi } from '@/lib/api/people.api'
import { CANDIDATE_SOURCE_LABELS } from '@/constants/people'
import { Banner, Field, Modal, errorMessage, inputClass, primaryButton, secondaryButton } from '@/components/people/ui'

const fromCandidate = (c) => ({
  fullName: c?.fullName ?? '',
  appliedFor: c?.appliedFor ?? '',
  email: c?.email ?? '',
  phone: c?.phone ?? '',
  source: c?.source ?? '',
  product: c?.product ?? '',
  currentCompany: c?.currentCompany ?? '',
  experienceYears: c?.totalExperienceMonths != null ? Math.floor(c.totalExperienceMonths / 12) : '',
  experienceMonths: c?.totalExperienceMonths != null ? c.totalExperienceMonths % 12 : '',
  noticePeriodDays: c?.noticePeriodDays ?? '',
  expectedShift: c?.expectedShift ?? '',
  notes: c?.notes ?? '',
})

/** Add or edit a candidate (admin/hr). Candidates are never tracker users. */
export function CandidateFormModal({ candidate = null, onClose, onSaved }) {
  const isEdit = Boolean(candidate)
  const [form, setForm] = useState(() => fromCandidate(candidate))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.appliedFor.trim()) {
      setError('Name and role applied for are required.')
      return
    }
    setSaving(true)
    setError('')
    const hasExp = form.experienceYears !== '' || form.experienceMonths !== ''
    const { experienceYears, experienceMonths, ...rest } = form
    const payload = {
      ...rest,
      source: form.source || null,
      noticePeriodDays: form.noticePeriodDays === '' ? null : Number(form.noticePeriodDays),
      totalExperienceMonths: hasExp ? Number(experienceYears || 0) * 12 + Number(experienceMonths || 0) : null,
    }
    try {
      const saved = isEdit
        ? await peopleApi.updateCandidate(candidate.id, payload)
        : await peopleApi.createCandidate(payload)
      onSaved(saved)
    } catch (err) {
      setError(errorMessage(err, 'Could not save the candidate.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? `Edit ${candidate.fullName}` : 'Add candidate'}
      subtitle="Candidate details · HR access"
      onClose={onClose}
      busy={saving}
      size="max-w-2xl"
      footer={(
        <>
          <button type="button" className={secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="candidate-form" className={primaryButton} disabled={saving}>{saving ? 'Saving…' : 'Save candidate'}</button>
        </>
      )}
    >
      <form id="candidate-form" onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-3"><Banner error={error} /></div>
        <Field label="Full name" required><input className={inputClass} maxLength={160} value={form.fullName} onChange={set('fullName')} /></Field>
        <Field label="Role applied for" required><input className={inputClass} maxLength={120} value={form.appliedFor} onChange={set('appliedFor')} /></Field>
        <Field label="Product"><input className={inputClass} maxLength={120} value={form.product} onChange={set('product')} /></Field>
        <Field label="Email" hint="Needed to convert them to an employee"><input type="email" className={inputClass} maxLength={255} value={form.email} onChange={set('email')} /></Field>
        <Field label="Phone"><input className={inputClass} maxLength={20} value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Source">
          <select className={inputClass} value={form.source} onChange={set('source')}>
            <option value="">—</option>
            {Object.entries(CANDIDATE_SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Current company"><input className={inputClass} maxLength={200} value={form.currentCompany} onChange={set('currentCompany')} /></Field>
        <Field label="Experience — years"><input type="number" min="0" max="60" className={inputClass} value={form.experienceYears} onChange={set('experienceYears')} /></Field>
        <Field label="— months"><input type="number" min="0" max="11" className={inputClass} value={form.experienceMonths} onChange={set('experienceMonths')} /></Field>
        <Field label="Notice period (days)"><input type="number" min="0" max="365" className={inputClass} value={form.noticePeriodDays} onChange={set('noticePeriodDays')} /></Field>
        <Field label="Expected shift"><input className={inputClass} maxLength={60} value={form.expectedShift} onChange={set('expectedShift')} /></Field>
        <Field label="Notes" className="md:col-span-3"><textarea className={inputClass} rows={2} maxLength={4000} value={form.notes} onChange={set('notes')} /></Field>
      </form>
    </Modal>
  )
}
