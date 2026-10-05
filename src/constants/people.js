// Display metadata for the People (HR) module. Keys match the values the
// backend validates in src/modules/people/service.js — the backend remains the
// authority and 400s anything off-list.

export const EMPLOYEE_STATUS_LABELS = {
  active: 'Active',
  notice_period: 'Notice Period',
  exited: 'Exited',
}

export const EXIT_TYPE_LABELS = {
  resignation: 'Resignation',
  termination: 'Termination',
  absconded: 'Absconded',
  contract_end: 'Contract End',
}

export const REASON_CATEGORY_LABELS = {
  better_opportunity: 'Better Opportunity',
  compensation: 'Compensation',
  relocation: 'Relocation',
  higher_studies: 'Higher Studies',
  personal: 'Personal',
  health: 'Health',
  work_environment: 'Work Environment',
  performance: 'Performance',
  other: 'Other',
}

// The three outcomes the Interview Management form records.
export const INTERVIEW_OUTCOME_LABELS = {
  selected: 'Selected',
  hold: 'Hold',
  rejected: 'Not Selected',
}

export const INTERVIEW_OUTCOME_COLORS = {
  selected: 'bg-emerald-100 text-emerald-800',
  hold: 'bg-amber-100 text-amber-800',
  rejected: 'bg-rose-100 text-rose-800',
}

// Recruitment pipeline order and colours. Complete literal Tailwind classes on
// purpose — dynamically built class names get purged.
export const CANDIDATE_STAGES = [
  { key: 'applied', label: 'Applied', color: 'bg-slate-400' },
  { key: 'screening', label: 'Screening', color: 'bg-sky-500' },
  { key: 'interview_scheduled', label: 'Interview scheduled', color: 'bg-violet-500' },
  { key: 'interviewed', label: 'Interviewed', color: 'bg-indigo-500' },
  { key: 'selected', label: 'Selected', color: 'bg-emerald-500' },
  { key: 'hold', label: 'Hold', color: 'bg-amber-500' },
  { key: 'rejected', label: 'Not Selected', color: 'bg-rose-500' },
  { key: 'offered', label: 'Offered', color: 'bg-teal-500' },
  { key: 'joined', label: 'Joined', color: 'bg-green-500' },
  { key: 'declined', label: 'Declined', color: 'bg-orange-500' },
]

/** "2y 3m" from a month count; null when unknown. */
export function formatTenure(months) {
  if (months === null || months === undefined) return null
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m} Month${m === 1 ? '' : 's'}`
  return `${y} Year${y === 1 ? '' : 's'}${m ? ` ${m} Month${m === 1 ? '' : 's'}` : ''}`
}
