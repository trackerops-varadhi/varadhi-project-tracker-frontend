'use client'

import { useEffect, useState } from 'react'

import { peopleApi } from '@/lib/api/people.api'
import { usersApi } from '@/lib/api/users.api'
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from '@/constants/people'
import { Banner, Field, Modal, TabBar, errorMessage, inputClass, primaryButton, secondaryButton } from './ui'

const SECTIONS = [
  { key: 'employment', label: 'Employment' },
  { key: 'personal', label: 'Personal' },
  { key: 'education', label: 'Education & Experience' },
  { key: 'identity', label: 'Identity' },
]

const fromEmployee = (e) => ({
  userId: e?.userId ?? '',
  employeeCode: e?.employeeCode ?? '',
  designation: e?.designation ?? '',
  product: e?.product ?? '',
  shift: e?.shift ?? '',
  coreSkills: e?.coreSkills?.join(', ') ?? '',
  dateOfJoining: e?.dateOfJoining ?? '',
  reportingManagerId: e?.reportingManager?.id ?? '',
  gender: e?.gender ?? '',
  dateOfBirth: e?.dateOfBirth ?? '',
  maritalStatus: e?.maritalStatus ?? '',
  guardianName: e?.guardianName ?? '',
  temporaryAddress: e?.temporaryAddress ?? '',
  permanentAddress: e?.permanentAddress ?? '',
  educationQualification: e?.educationQualification ?? '',
  collegeName: e?.collegeName ?? '',
  yearOfCompletion: e?.yearOfCompletion ?? '',
  previousCompany: e?.previousCompany ?? '',
  experienceYears: e?.totalExperienceMonths != null ? Math.floor(e.totalExperienceMonths / 12) : '',
  experienceMonths: e?.totalExperienceMonths != null ? e.totalExperienceMonths % 12 : '',
  aadhaar: '',
})

// Hand-rolled validation (the house style — react-hook-form is installed but unused).
const validate = (f, isEdit) => {
  const errors = {}
  if (!isEdit && !f.userId) errors.userId = 'Select a user.'
  if (!f.designation.trim()) errors.designation = 'Role is required.'
  if (f.aadhaar && !/^\d{12}$/.test(f.aadhaar.replace(/[\s-]/g, ''))) errors.aadhaar = 'Aadhaar must be 12 digits.'
  if (f.yearOfCompletion && !/^\d{4}$/.test(String(f.yearOfCompletion))) errors.yearOfCompletion = 'Use a 4-digit year.'
  return errors
}

/**
 * Create or edit an employee profile (admin/hr). The person is picked from
 * existing tracker accounts — name and email come from their account, never
 * typed here. Aadhaar is write-only: the field starts empty, and leaving it
 * empty keeps whatever is stored.
 */
export function EmployeeFormModal({ employee = null, onClose, onSaved }) {
  const isEdit = Boolean(employee)
  const [form, setForm] = useState(() => fromEmployee(employee))
  const [section, setSection] = useState('employment')
  const [eligible, setEligible] = useState([])
  const [managers, setManagers] = useState([])
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      isEdit ? Promise.resolve([]) : peopleApi.getEligibleUsers(),
      usersApi.getAll({ status: 'active' }),
    ])
      .then(([e, users]) => {
        if (!active) return
        setEligible(e)
        setManagers(users.filter((u) => u.id !== (employee?.userId ?? form.userId)))
      })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load users.')) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const v = validate(form, isEdit)
    setErrors(v)
    if (Object.keys(v).length) {
      setError('Please fix the highlighted fields.')
      return
    }
    setSaving(true)
    setError('')
    const years = Number(form.experienceYears || 0)
    const months = Number(form.experienceMonths || 0)
    const hasExperience = form.experienceYears !== '' || form.experienceMonths !== ''
    const payload = {
      employeeCode: form.employeeCode,
      designation: form.designation,
      product: form.product,
      shift: form.shift,
      coreSkills: form.coreSkills,
      dateOfJoining: form.dateOfJoining || null,
      reportingManagerId: form.reportingManagerId || null,
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth || null,
      maritalStatus: form.maritalStatus || null,
      guardianName: form.guardianName,
      temporaryAddress: form.temporaryAddress,
      permanentAddress: form.permanentAddress,
      educationQualification: form.educationQualification,
      collegeName: form.collegeName,
      yearOfCompletion: form.yearOfCompletion || null,
      previousCompany: form.previousCompany,
      totalExperienceMonths: hasExperience ? years * 12 + months : null,
      // Empty = leave the stored number alone.
      ...(form.aadhaar.trim() ? { aadhaar: form.aadhaar } : {}),
    }
    try {
      const saved = isEdit
        ? await peopleApi.updateEmployee(employee.userId, payload)
        : await peopleApi.createEmployee({ ...payload, userId: form.userId })
      onSaved(saved)
    } catch (err) {
      setError(errorMessage(err, 'Could not save the employee.'))
    } finally {
      setSaving(false)
    }
  }

  const err = (k) => errors[k] && <span className="mt-0.5 block text-[10px] text-rose-600">{errors[k]}</span>

  return (
    <Modal
      title={isEdit ? `Edit ${employee.name ?? 'employee'}` : 'Add employee'}
      subtitle="Employee details · HR access"
      onClose={onClose}
      busy={saving}
      footer={(
        <>
          <button type="button" className={secondaryButton} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" form="employee-form" className={primaryButton} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add employee'}
          </button>
        </>
      )}
    >
      <form id="employee-form" onSubmit={submit} className="space-y-4" noValidate>
        <TabBar tabs={SECTIONS} active={section} onSelect={setSection} label="Employee form sections" />
        <Banner error={error} />

        <div className={section === 'employment' ? 'grid grid-cols-1 gap-3 md:grid-cols-3' : 'hidden'}>
          {isEdit ? (
            <Field label="Employee" className="md:col-span-3">
              <input className={inputClass} disabled value={`${employee.name ?? ''} · ${employee.email ?? ''}`} />
            </Field>
          ) : (
            <Field label="Tracker user" required className="md:col-span-3" hint="Name and email come from their account.">
              <select className={inputClass} value={form.userId} onChange={set('userId')}>
                <option value="">{eligible.length ? 'Select user' : 'Every active user already has a profile'}</option>
                {eligible.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              {err('userId')}
            </Field>
          )}
          <Field label="Role / designation" required>
            <input className={inputClass} maxLength={120} value={form.designation} onChange={set('designation')} placeholder="e.g. Software Engineer" />
            {err('designation')}
          </Field>
          <Field label="Employee code">
            <input className={inputClass} maxLength={30} value={form.employeeCode} onChange={set('employeeCode')} />
          </Field>
          <Field label="Date of joining">
            <input type="date" className={inputClass} value={form.dateOfJoining} onChange={set('dateOfJoining')} />
          </Field>
          <Field label="Product">
            <input className={inputClass} maxLength={120} value={form.product} onChange={set('product')} />
          </Field>
          <Field label="Shift / timings">
            <input className={inputClass} maxLength={60} value={form.shift} onChange={set('shift')} placeholder="9:30 AM - 6:30 PM" />
          </Field>
          <Field label="Reporting manager / TL">
            <select className={inputClass} value={form.reportingManagerId} onChange={set('reportingManagerId')}>
              <option value="">None</option>
              {managers.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Core skills / technical knowledge" className="md:col-span-3" hint="Comma separated">
            <input className={inputClass} value={form.coreSkills} onChange={set('coreSkills')} />
          </Field>
        </div>

        <div className={section === 'personal' ? 'grid grid-cols-1 gap-3 md:grid-cols-3' : 'hidden'}>
          <Field label="Gender">
            <select className={inputClass} value={form.gender} onChange={set('gender')}>
              <option value="">—</option>
              {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Date of birth" hint="Age is calculated from this">
            <input type="date" className={inputClass} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
          </Field>
          <Field label="Marital status">
            <select className={inputClass} value={form.maritalStatus} onChange={set('maritalStatus')}>
              <option value="">—</option>
              {MARITAL_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Husband / father name" className="md:col-span-3">
            <input className={inputClass} maxLength={160} value={form.guardianName} onChange={set('guardianName')} />
          </Field>
          <Field label="Temporary address" className="md:col-span-3">
            <textarea className={inputClass} rows={2} maxLength={1000} value={form.temporaryAddress} onChange={set('temporaryAddress')} />
          </Field>
          <Field label="Permanent address" className="md:col-span-3">
            <textarea className={inputClass} rows={2} maxLength={1000} value={form.permanentAddress} onChange={set('permanentAddress')} />
          </Field>
        </div>

        <div className={section === 'education' ? 'grid grid-cols-1 gap-3 md:grid-cols-3' : 'hidden'}>
          <Field label="Education qualification">
            <input className={inputClass} maxLength={160} value={form.educationQualification} onChange={set('educationQualification')} />
          </Field>
          <Field label="College name">
            <input className={inputClass} maxLength={200} value={form.collegeName} onChange={set('collegeName')} />
          </Field>
          <Field label="Year of completion">
            <input className={inputClass} inputMode="numeric" maxLength={4} value={form.yearOfCompletion} onChange={set('yearOfCompletion')} />
            {err('yearOfCompletion')}
          </Field>
          <Field label="Previous company">
            <input className={inputClass} maxLength={200} value={form.previousCompany} onChange={set('previousCompany')} />
          </Field>
          <Field label="Experience before joining — years">
            <input type="number" min="0" max="60" className={inputClass} value={form.experienceYears} onChange={set('experienceYears')} />
          </Field>
          <Field label="— months">
            <input type="number" min="0" max="11" className={inputClass} value={form.experienceMonths} onChange={set('experienceMonths')} />
          </Field>
        </div>

        <div className={section === 'identity' ? 'grid grid-cols-1 gap-3 md:grid-cols-2' : 'hidden'}>
          <Field
            label="Aadhaar number"
            hint={employee?.hasAadhaar
              ? `On file: ${employee.aadhaarMasked}. Leave empty to keep it; type a new number to replace it.`
              : 'Stored encrypted. Only the last four digits are ever shown.'}
          >
            <input className={inputClass} inputMode="numeric" autoComplete="off" maxLength={14}
              value={form.aadhaar} onChange={set('aadhaar')} placeholder="XXXX XXXX XXXX" />
            {err('aadhaar')}
          </Field>
        </div>
      </form>
    </Modal>
  )
}
