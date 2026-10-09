'use client'

import { useEffect, useState } from 'react'

import { peopleApi } from '@/lib/api/people.api'
import { EXIT_TYPE_LABELS, REASON_CATEGORY_LABELS } from '@/constants/people'
import { Banner, Field, Modal, errorMessage, inputClass, primaryButton, secondaryButton } from './ui'

/**
 * Record (or correct) an exit. On create the employee is picked from the
 * active directory; role and product are snapshotted from their profile by the
 * server, so they are shown read-only here.
 */
export function RecordExitModal({ exit = null, onClose, onSaved }) {
  const isEdit = Boolean(exit)
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({
    userId: exit?.userId ?? '',
    exitType: exit?.exitType ?? 'resignation',
    resignationDate: exit?.resignationDate ?? '',
    lastWorkingDate: exit?.lastWorkingDate ?? '',
    reasonCategory: exit?.reasonCategory ?? '',
    reasonDetail: exit?.reasonDetail ?? '',
    exitFeedback: exit?.exitFeedback ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) return undefined
    let active = true
    peopleApi.getEmployees({ status: 'active', limit: 100, sort: 'designation', order: 'asc' })
      .then((d) => { if (active) setEmployees(d.items) })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load employees.')) })
    return () => { active = false }
  }, [isEdit])

  const selected = isEdit ? exit : employees.find((e) => e.userId === form.userId)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.lastWorkingDate && form.resignationDate && form.lastWorkingDate < form.resignationDate) {
      setError('Last working day cannot be before the resignation date.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { userId, ...rest } = form
      const saved = isEdit
        ? await peopleApi.updateExit(exit.id, rest)
        : await peopleApi.createExit({ userId, ...rest })
      onSaved(saved)
    } catch (err) {
      setError(errorMessage(err, 'Could not save the exit record.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={isEdit ? `Edit exit — ${exit.name ?? ''}` : 'Record attrition / resignation'}
      subtitle="Exit reasons, notice period and exit-interview feedback"
      onClose={onClose}
      busy={saving}
      footer={(
        <>
          <button type="button" className={secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="exit-form" className={primaryButton} disabled={saving}>
            {saving ? 'Saving…' : 'Save exit record'}
          </button>
        </>
      )}
    >
      <form id="exit-form" onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-3"><Banner error={error} /></div>
        {isEdit ? (
          <Field label="Employee" className="md:col-span-3">
            <input className={inputClass} disabled value={exit.name ?? ''} />
          </Field>
        ) : (
          <Field label="Employee" required className="md:col-span-3" hint="Only active employees in the directory are listed.">
            <select className={inputClass} required value={form.userId} onChange={set('userId')}>
              <option value="">{employees.length ? 'Select employee' : 'No active employees in the directory'}</option>
              {employees.map((e) => <option key={e.userId} value={e.userId}>{e.name ?? e.email}</option>)}
            </select>
          </Field>
        )}
        <Field label="Role (from profile)">
          <input className={inputClass} disabled value={selected?.designation ?? ''} />
        </Field>
        <Field label="Product (from profile)">
          <input className={inputClass} disabled value={selected?.product ?? ''} />
        </Field>
        <Field label="Exit type">
          <select className={inputClass} value={form.exitType} onChange={set('exitType')}>
            {Object.entries(EXIT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Resignation date" required>
          <input type="date" className={inputClass} required value={form.resignationDate} onChange={set('resignationDate')} />
        </Field>
        <Field label="Last working day" required>
          <input type="date" className={inputClass} required min={form.resignationDate || undefined}
            value={form.lastWorkingDate} onChange={set('lastWorkingDate')} />
        </Field>
        <Field label="Reason category" required>
          <select className={inputClass} required value={form.reasonCategory} onChange={set('reasonCategory')}>
            <option value="">Select</option>
            {Object.entries(REASON_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Reason for resigning" required className="md:col-span-3">
          <textarea className={inputClass} rows={2} required maxLength={2000} value={form.reasonDetail} onChange={set('reasonDetail')} />
        </Field>
        <Field label="Exit interview feedback" className="md:col-span-3">
          <textarea className={inputClass} rows={2} maxLength={2000} value={form.exitFeedback} onChange={set('exitFeedback')} />
        </Field>
      </form>
    </Modal>
  )
}
