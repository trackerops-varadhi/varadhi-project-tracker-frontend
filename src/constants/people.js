// Display metadata for the People & Workforce module (Module 9). Keys match the
// values the backend validates (src/modules/people, src/modules/workforce) —
// the backend remains the authority and 400s anything off-list.
//
// Tailwind classes are complete literals on purpose: dynamically built class
// names get purged and render unstyled.

export const EMPLOYEE_STATUS_LABELS = {
  active: 'Active',
  notice_period: 'Notice Period',
  exited: 'Exited',
}

export const EMPLOYEE_STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700',
  notice_period: 'bg-rose-50 text-rose-700',
  exited: 'bg-slate-100 text-slate-600',
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

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'undisclosed', label: 'Prefer not to say' },
]

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'other', label: 'Other' },
  { value: 'undisclosed', label: 'Prefer not to say' },
]

// ── Recruitment ─────────────────────────────────────────────────────────────

export const INTERVIEW_OUTCOME_LABELS = {
  selected: 'Selected',
  hold: 'Hold',
  rejected: 'Not Selected',
  next_round: 'Next Round',
}

export const INTERVIEW_OUTCOME_COLORS = {
  selected: 'bg-emerald-100 text-emerald-800',
  hold: 'bg-amber-100 text-amber-800',
  rejected: 'bg-rose-100 text-rose-800',
  next_round: 'bg-sky-100 text-sky-800',
}

// The three outcomes of the quick "interview record" form on the HR hub.
export const QUICK_INTERVIEW_OUTCOMES = ['selected', 'hold', 'rejected']

export const INTERVIEW_TYPE_LABELS = {
  telephonic: 'Telephonic',
  technical: 'Technical',
  hr: 'HR',
  managerial: 'Managerial',
  final: 'Final',
}

export const INTERVIEW_STATUS_LABELS = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  no_show: 'No Show',
  cancelled: 'Cancelled',
}

export const CANDIDATE_SOURCE_LABELS = {
  referral: 'Referral',
  naukri: 'Naukri',
  linkedin: 'LinkedIn',
  walk_in: 'Walk-in',
  campus: 'Campus',
  other: 'Other',
}

// Pipeline order and colours — the recruitment board's columns.
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

export const CANDIDATE_STATUS_LABELS = Object.fromEntries(CANDIDATE_STAGES.map((s) => [s.key, s.label]))

// ── Workforce ───────────────────────────────────────────────────────────────

export const LEAVE_TYPE_LABELS = {
  casual: 'Casual',
  sick: 'Sick',
  earned: 'Earned',
  annual: 'Annual',
  unpaid: 'Unpaid',
}

export const LEAVE_PLANNING_TYPES = [
  { value: 'planned', label: 'Planned', hint: 'Applied in advance' },
  { value: 'unplanned', label: 'Unplanned', hint: 'Sudden / same-day' },
]

export const ATTENDANCE_STATUS_META = {
  present: { label: 'Present', short: 'P', className: 'bg-emerald-100 text-emerald-800' },
  wfh: { label: 'Work from home', short: 'WFH', className: 'bg-sky-100 text-sky-800' },
  half_day: { label: 'Half day', short: '½', className: 'bg-amber-100 text-amber-800' },
  on_leave: { label: 'On leave', short: 'L', className: 'bg-violet-100 text-violet-800' },
  absent: { label: 'Absent', short: 'A', className: 'bg-rose-100 text-rose-800' },
  weekend: { label: 'Weekend', short: '–', className: 'bg-slate-50 text-slate-300' },
}

/** "2 Years 3 Months" from a month count; null when unknown. */
export function formatTenure(months) {
  if (months === null || months === undefined) return null
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m} Month${m === 1 ? '' : 's'}`
  return `${y} Year${y === 1 ? '' : 's'}${m ? ` ${m} Month${m === 1 ? '' : 's'}` : ''}`
}
