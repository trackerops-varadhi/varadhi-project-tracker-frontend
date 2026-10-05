// --- Bugs Finder (Module 8) ----------------------------------------------------
// Vocabularies + badge colours for the Bugs Finder module. These mirror the
// database CHECK constraints in backend/src/config/migrate-bugs.js and the
// labels in backend/src/utils/bug-workflow.js — keep the two in sync when
// adding a status, severity or environment.
//
// Colour classes follow the same Tailwind palette the task/project badges in
// constants/index.js already use, so Bugs Finder reads as part of the same app
// rather than a bolt-on with its own visual language.

// --- Bug Status ----------------------------------------------------------------
export const BUG_STATUS_LABELS = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  fixed: 'Fixed',
  qa_verification: 'QA Verification',
  closed: 'Closed',
  reopened: 'Reopened',
  duplicate: 'Duplicate',
  rejected: 'Rejected',
  wont_fix: "Won't Fix",
  deferred: 'Deferred',
}

export const BUG_STATUS_COLORS = {
  open: 'bg-slate-100 text-foreground',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700',
  fixed: 'bg-teal-100 text-teal-700',
  qa_verification: 'bg-blue-100 text-blue-700',
  closed: 'bg-green-100 text-green-700',
  reopened: 'bg-red-100 text-red-700',
  duplicate: 'bg-slate-100 text-muted-foreground',
  rejected: 'bg-slate-100 text-muted-foreground',
  wont_fix: 'bg-slate-100 text-muted-foreground',
  deferred: 'bg-violet-100 text-violet-700',
}

// The order the workflow runs in, used by the status dropdown so the options
// read as a pipeline rather than an alphabetical list.
export const BUG_STATUS_ORDER = [
  'open',
  'assigned',
  'in_progress',
  'fixed',
  'qa_verification',
  'closed',
  'reopened',
  'duplicate',
  'rejected',
  'wont_fix',
  'deferred',
]

// Mirrors TRANSITIONS in backend/src/utils/bug-workflow.js. Used only to build
// a sensible dropdown — the backend remains the authority and rejects anything
// illegal with a 400, so a drift here degrades to a rejected request rather
// than an invalid write.
const SIDE_EXITS = ['duplicate', 'rejected', 'wont_fix', 'deferred']

export const BUG_TRANSITIONS = {
  open: ['assigned', 'in_progress', ...SIDE_EXITS],
  assigned: ['in_progress', 'fixed', 'open', ...SIDE_EXITS],
  in_progress: ['fixed', 'assigned', ...SIDE_EXITS],
  fixed: ['qa_verification', 'closed', 'in_progress', ...SIDE_EXITS],
  qa_verification: ['closed', 'reopened', 'in_progress', ...SIDE_EXITS],
  reopened: ['assigned', 'in_progress', ...SIDE_EXITS],
  closed: ['reopened'],
  duplicate: ['reopened', 'open'],
  rejected: ['reopened', 'open'],
  wont_fix: ['reopened', 'open'],
  deferred: ['open', 'assigned', 'in_progress', ...SIDE_EXITS],
}

// Statuses an employee/developer may set on a bug assigned to them. Mirrors
// EMPLOYEE_ALLOWED_STATUSES on the backend — used to hide options they would
// only be refused for.
export const BUG_EMPLOYEE_STATUSES = ['in_progress', 'fixed', 'qa_verification']

// --- Severity ------------------------------------------------------------------
export const BUG_SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const BUG_SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-muted-foreground',
}

export const BUG_SEVERITIES = ['critical', 'high', 'medium', 'low']

// --- Priority ------------------------------------------------------------------
// Deliberately a separate axis from severity: severity is how bad the defect
// is, priority is how soon we intend to act on it.
export const BUG_PRIORITY_LABELS = {
  p0: 'P0 - Critical',
  p1: 'P1 - High',
  p2: 'P2 - Medium',
  p3: 'P3 - Low',
}

export const BUG_PRIORITY_SHORT = { p0: 'P0', p1: 'P1', p2: 'P2', p3: 'P3' }

export const BUG_PRIORITY_COLORS = {
  p0: 'bg-red-100 text-red-700',
  p1: 'bg-orange-100 text-orange-700',
  p2: 'bg-blue-100 text-blue-700',
  p3: 'bg-slate-100 text-muted-foreground',
}

export const BUG_PRIORITIES = ['p0', 'p1', 'p2', 'p3']

// --- Environment ---------------------------------------------------------------
export const BUG_ENVIRONMENT_LABELS = {
  production: 'Production',
  staging: 'Staging',
  qa: 'QA',
  development: 'Development',
  local: 'Local',
}

export const BUG_ENVIRONMENTS = ['production', 'staging', 'qa', 'development', 'local']

// --- SLA status ----------------------------------------------------------------
// Values come straight from the API (utils/bug-sla.js SLA_STATUS).
export const SLA_STATUS_LABELS = {
  within_sla: 'Within SLA',
  at_risk: 'SLA At Risk',
  breached: 'SLA Breached',
  resolved_within_sla: 'Resolved Within SLA',
  resolved_after_sla: 'Resolved After SLA',
  not_applicable: 'No SLA',
}

export const SLA_STATUS_COLORS = {
  within_sla: 'bg-green-100 text-green-700',
  at_risk: 'bg-amber-100 text-amber-700',
  breached: 'bg-red-100 text-red-700',
  resolved_within_sla: 'bg-green-100 text-green-700',
  resolved_after_sla: 'bg-orange-100 text-orange-700',
  not_applicable: 'bg-slate-100 text-muted-foreground',
}

export const SLA_STATUSES = [
  'within_sla',
  'at_risk',
  'breached',
  'resolved_within_sla',
  'resolved_after_sla',
]

// --- Activity timeline ---------------------------------------------------------
// Mirrors BUG_ACTIONS in backend/src/utils/bug-workflow.js. An unmapped action
// falls back to its raw name rather than rendering blank.
export const BUG_ACTION_LABELS = {
  BUG_CREATED: 'reported this bug',
  BUG_ASSIGNED: 'assigned the bug',
  BUG_REASSIGNED: 'reassigned the bug',
  BUG_UNASSIGNED: 'unassigned the bug',
  BUG_STATUS_CHANGED: 'changed the status',
  BUG_PRIORITY_CHANGED: 'changed the priority',
  BUG_SEVERITY_CHANGED: 'changed the severity',
  BUG_COMMENT_ADDED: 'added a comment',
  BUG_COMMENT_EDITED: 'edited a comment',
  BUG_COMMENT_DELETED: 'deleted a comment',
  BUG_ATTACHMENT_ADDED: 'uploaded an attachment',
  BUG_ATTACHMENT_DELETED: 'removed an attachment',
  BUG_SLA_BREACHED: 'SLA breached',
  BUG_SLA_AT_RISK: 'SLA at risk',
  BUG_REOPENED: 'reopened the bug',
  BUG_CLOSED: 'closed the bug',
  BUG_RESOLVED: 'marked the bug fixed',
  BUG_UPDATED: 'updated the bug',
  BUG_TASK_LINKED: 'linked a task',
  BUG_TASK_CREATED: 'created a development task',
  BUG_TASK_UNLINKED: 'unlinked the task',
}

// Rows per page in the bug list. Server-side pagination — the browser never
// holds more than this many bugs at once (§24).
export const BUGS_PER_PAGE = 20
