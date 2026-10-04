"use client";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'

const PROFILE_FIELDS = [
  ['Employee Name', 'name'], ['Date of Joining', 'joinedDate'],
  ['Role', 'role'], ['Shift / Timings', 'shift'],
  ['Email Address', 'email'], ['Product', 'product'],
  ['Gender', 'gender'], ['Age', 'age'],
  ['Marital Status', 'maritalStatus'], ['Husband / Father Name', 'familyName'],
  ['Temporary Address', 'temporaryAddress'], ['Permanent Address', 'permanentAddress'],
  ['Aadhaar Card', 'maskedAadhaar'], ['Education Qualification', 'education'],
  ['College Name', 'college'], ['Year of Completion', 'completionYear'],
  ['Core Skill / Technical Knowledge', 'skills'], ['Previous Company', 'previousCompany'],
  ['Total Experience', 'totalExperience'], ['Date of Resignation', 'resignationDate'],
  ['Years / Months Worked in Varadhi', 'companyExperience'],
]

export function EmployeeProfile({ employee }) {
  const initials = employee.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('')
  const summary = [
    ['Joined Date', employee.joinedDate],
    ['Varadhi Experience', employee.companyExperience],
    ['Current Status', employee.status],
  ]

  return (
    <DialogContent
      showCloseButton={false}
      className="w-[88vw] min-w-0 max-w-[1400px] max-h-[90vh] gap-0 overflow-y-auto rounded-2xl bg-card p-0 text-left text-foreground shadow-xl sm:max-w-[1400px]"
    >
      <DialogHeader className="sticky top-0 z-10 flex-row items-center gap-3 rounded-t-2xl border-b border-border bg-card px-5 py-3 sm:px-6">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-semibold text-primary"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <DialogTitle className="break-words text-base font-semibold">{employee.name}</DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-500">{employee.role} · {employee.product}</DialogDescription>
        </div>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close employee profile"
            className="ml-auto shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-background hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </DialogClose>
      </DialogHeader>

      <div className="space-y-3 px-5 py-4 sm:px-6">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {summary.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-primary">{label}</dt>
              <dd className="mt-1 break-words text-xs font-semibold text-slate-800">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>

        <dl className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {PROFILE_FIELDS.map(([label, key]) => (
            <div key={key} className="min-w-0 border-b border-slate-100 py-2">
              <dt className="text-[10px] font-medium leading-4 text-slate-500">{label}</dt>
              <dd className="mt-0.5 break-words text-xs font-semibold leading-5 text-slate-800">{employee[key] ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </DialogContent>
  )
}
