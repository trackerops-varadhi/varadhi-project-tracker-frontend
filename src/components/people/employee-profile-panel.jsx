'use client'

import { useState } from 'react'
import { Eye, EyeOff, Pencil } from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import {
  EMPLOYEE_STATUS_COLORS, EMPLOYEE_STATUS_LABELS, EXIT_TYPE_LABELS, GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS, formatTenure,
} from '@/constants/people'
import { formatDate } from '@/utils'
import { errorMessage, secondaryButton } from './ui'

const show = (d) => (d ? formatDate(d, 'dd MMM yyyy') : null)
const optionLabel = (options, value) => options.find((o) => o.value === value)?.label ?? null

/**
 * One employee's full record. Aadhaar is always masked; admin/hr get a Reveal
 * button that calls the dedicated, logged endpoint (plan §7.1). The full
 * number is held only in this component's state, never cached elsewhere.
 */
export function EmployeeProfilePanel({ employee, canReveal = false, canEdit = false, onEdit }) {
  const [revealed, setRevealed] = useState(null)
  const [revealError, setRevealError] = useState('')
  const [revealing, setRevealing] = useState(false)

  const reveal = async () => {
    if (revealed) { setRevealed(null); return }
    setRevealing(true)
    setRevealError('')
    try {
      const r = await peopleApi.revealAadhaar(employee.userId)
      setRevealed(r.aadhaar)
    } catch (err) {
      setRevealError(errorMessage(err, 'Could not reveal Aadhaar.'))
    } finally {
      setRevealing(false)
    }
  }

  const status = employee.status === 'active' && employee.onLeaveToday ? 'On Leave' : EMPLOYEE_STATUS_LABELS[employee.status]
  const initials = (employee.name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('')
  const experience = employee.totalExperienceMonths != null ? formatTenure(employee.totalExperienceMonths) : null

  const sections = [
    ['Employment', [
      ['Employee code', employee.employeeCode],
      ['Role', employee.designation],
      ['Product', employee.product],
      ['Shift / timings', employee.shift],
      ['Reporting manager / TL', employee.reportingManager?.name],
      ['Date of joining', show(employee.dateOfJoining)],
      ['Years / months in Varadhi', formatTenure(employee.tenureMonths)],
      ['Core skills', employee.coreSkills?.join(', ')],
    ]],
    ['Personal', [
      ['Email', employee.email],
      ['Gender', optionLabel(GENDER_OPTIONS, employee.gender)],
      ['Date of birth', show(employee.dateOfBirth)],
      ['Age', employee.age != null ? `${employee.age}` : null],
      ['Marital status', optionLabel(MARITAL_STATUS_OPTIONS, employee.maritalStatus)],
      ['Husband / father name', employee.guardianName],
      ['Temporary address', employee.temporaryAddress],
      ['Permanent address', employee.permanentAddress],
    ]],
    ['Education & experience', [
      ['Education qualification', employee.educationQualification],
      ['College', employee.collegeName],
      ['Year of completion', employee.yearOfCompletion],
      ['Previous company', employee.previousCompany],
      ['Experience before joining', experience],
    ]],
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-sm font-semibold text-primary">{initials}</div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-slate-900">{employee.name ?? 'Unknown user'}</h1>
          <p className="text-xs text-slate-500">{employee.designation}{employee.product ? ` · ${employee.product}` : ''}</p>
        </div>
        <span className={`rounded px-2 py-1 text-xs font-semibold ${EMPLOYEE_STATUS_COLORS[employee.status]}`}>{status}</span>
        {canEdit && (
          <button type="button" className={secondaryButton} onClick={onEdit}><Pencil size={13} /> Edit</button>
        )}
      </div>

      {employee.exit && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800">
          {EXIT_TYPE_LABELS[employee.exit.exitType] ?? 'Exit'} recorded — resigned {show(employee.exit.resignationDate)},
          last working day {show(employee.exit.lastWorkingDate)}.
        </div>
      )}

      {sections.map(([title, fields]) => (
        <section key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">{title}</h2>
          <dl className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0 border-b border-slate-100 py-2">
                <dt className="text-[10px] font-medium text-slate-500">{label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap break-words text-xs font-semibold text-slate-800">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Identity</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-500">Aadhaar</span>
          <span className="font-mono font-semibold text-slate-800">
            {revealed ?? employee.aadhaarMasked ?? 'Not on file'}
          </span>
          {canReveal && employee.hasAadhaar && (
            <button type="button" className={secondaryButton} onClick={reveal} disabled={revealing}>
              {revealed ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> {revealing ? 'Revealing…' : 'Reveal'}</>}
            </button>
          )}
        </div>
        {canReveal && employee.hasAadhaar && !revealed && (
          <p className="mt-1 text-[10px] text-slate-400">Revealing the full number is logged.</p>
        )}
        {revealError && <p role="alert" className="mt-1 text-xs text-rose-600">{revealError}</p>}
      </section>
    </div>
  )
}
