// ─── Task Status ───────────────────────────────────────────────────────────────
export const TASK_STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
}

export const TASK_STATUS_COLORS = {
  todo: 'bg-slate-100 text-foreground',
  in_progress: 'bg-amber-100 text-amber-700',
  in_review: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

// ─── Task Priority ─────────────────────────────────────────────────────────────
export const TASK_PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const TASK_PRIORITY_COLORS = {
  low: 'bg-slate-100 text-muted-foreground',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

// ─── Task Type ─────────────────────────────────────────────────────────────────
export const TASK_TYPE_LABELS = {
  feature: 'Feature',
  bug: 'Bug',
  infra: 'Infra',
  research: 'Research',
  design: 'Design',
}

export const TASK_TYPE_COLORS = {
  feature: 'bg-violet-100 text-violet-700',
  bug: 'bg-red-100 text-red-700',
  infra: 'bg-green-100 text-green-700',
  research: 'bg-amber-100 text-amber-700',
  design: 'bg-pink-100 text-pink-700',
}

// ─── Project Status ────────────────────────────────────────────────────────────
export const PROJECT_STATUS_LABELS = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
}

export const PROJECT_STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  on_hold: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-slate-100 text-muted-foreground',
}

// ─── User Roles ────────────────────────────────────────────────────────────────
export const USER_ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  hr: 'HR',
  qc: 'QC',
}

export const USER_ROLE_COLORS = {
  admin: 'bg-violet-100 text-violet-700',
  manager: 'bg-blue-100 text-blue-700',
  employee: 'bg-slate-100 text-foreground',
  hr: 'bg-pink-100 text-pink-700',
  qc: 'bg-teal-100 text-teal-700',
}

// Module 9. Roles that see everyone's leave and time; approving leave stays
// admin/manager. Presentation only — the backend's allow-lists decide.
export const ELEVATED_ROLES = ['admin', 'manager']
export const isElevatedRole = (role) => ELEVATED_ROLES.includes(String(role || '').toLowerCase())

// ─── Navigation ────────────────────────────────────────────────────────────────
// ─── Role workspaces ───────────────────────────────────────────────────────
// Each role signs in to its own workspace: its own landing page and only its
// own modules. Admin sees every workspace. These lists are presentation and
// routing only — the backend's restrictTo / allow-lists are the real boundary.
//
//   admin    → everything
//   hr       → HR Dashboard, HR Management, People, Recruitment, Team
//              Directory, Leave, Time, Settings (no tracker dashboard)
//   manager  → tracker modules, minus Team Directory and Bugs
//   employee → tracker modules, minus Team Directory and Bugs (bugs arrive
//              as tasks in their task list)
//   qc       → QC Dashboard, Bugs, Leave, Time, Settings

export const WORKSPACE_LABELS = {
  admin: 'Admin Workspace',
  hr: 'HR Workspace',
  manager: 'Manager Workspace',
  employee: 'Employee Workspace',
  qc: 'QC Workspace',
}

// Where each role lands after signing in.
export const ROLE_HOME = {
  admin: '/dashboard',
  manager: '/dashboard',
  employee: '/dashboard',
  hr: '/hr-dashboard',
  qc: '/qc-dashboard',
}
export const homeFor = (role) => ROLE_HOME[String(role || '').toLowerCase()] || '/dashboard'

const ALL = ['admin', 'manager', 'employee', 'hr', 'qc']
const TRACKER = ['admin', 'manager', 'employee']

export const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard',    icon: 'LayoutDashboard', roles: TRACKER },
  { label: 'HR Dashboard', href: '/hr-dashboard', icon: 'LayoutDashboard', roles: ['admin', 'hr'] },
  { label: 'QC Dashboard', href: '/qc-dashboard', icon: 'LayoutDashboard', roles: ['admin', 'qc'] },
  // hidden: reachable only via the bell dropdown's "View all notifications" —
  // kept in NAV_ITEMS (not deleted) so Topbar's title lookup still resolves
  // 'Notifications' when this route is open; sidebar filters `hidden` out.
  { label: 'Notifications', href: '/notifications', icon: 'Bell',      roles: ALL, hidden: true },
  { label: 'Projects',   href: '/projects',   icon: 'FolderOpen',      roles: TRACKER },
  { label: 'Tasks',      href: '/tasks',       icon: 'ListChecks',      roles: TRACKER },
  { label: 'Kanban',     href: '/kanban',      icon: 'LayoutKanban',    roles: TRACKER },
  // Module 8: Bugs Finder — QC's workspace. Developers get their bugs as
  // tasks (badged "Bug") in the task list instead.
  { label: 'Bugs',       href: '/bugs',        icon: 'Bug',             roles: ['admin', 'qc'] },
  // Module 4. A calendar connection is personal to a tracker user.
  { label: 'Calendar',   href: '/calendar',    icon: 'CalendarSync',    roles: TRACKER },
  { label: 'Documents',  href: '/documents',   icon: 'Files',           roles: TRACKER },
  // Module 9 (People).
  { label: 'HR Management', href: '/hr-management', icon: 'Users', roles: ['admin', 'manager', 'hr'] },
  { label: 'People',     href: '/people',      icon: 'Contact',         roles: ['admin', 'hr'] },
  { label: 'Recruitment', href: '/recruitment', icon: 'UserSearch',     roles: ['admin', 'hr'] },
  // /directory, not /team: /teams is the Microsoft Teams webhook screen.
  { label: 'Team Directory', href: '/directory', icon: 'Network',       roles: ['admin', 'hr'] },
  // Any role can be an interviewer; reachable from notifications and the hub.
  { label: 'My Interviews', href: '/my-interviews', icon: 'MessagesSquare', roles: ALL, hidden: true },
  { label: 'Leave',      href: '/leave-management', icon: 'CalendarDays', roles: ALL },
  { label: 'Time',       href: '/time-management', icon: 'Clock3', roles: ALL },
  { label: 'Reports',    href: '/reports',     icon: 'BarChart3',       roles: ['admin', 'manager'] },
  // Module 5. A webhook posts a whole project's activity to a channel, so
  // configuring one is an administrative act.
  { label: 'Teams',      href: '/teams',       icon: 'MessageSquare',   roles: ['admin', 'manager'] },
  { label: 'Users',      href: '/users',       icon: 'Users',           roles: ['admin'] },
  { label: 'Settings',   href: '/settings',    icon: 'Settings',        roles: ALL },
]

/**
 * What a role should SEE this entry called.
 *
 * A role's own landing page is just "Dashboard" to them — an HR user has one
 * dashboard and calling it "HR Dashboard" in their own sidebar only invites
 * the question of where the other one is. Admin is the exception: they see
 * every workspace's home at once, so those need telling apart and keep their
 * full names.
 */
export function navLabelFor(role, item) {
  const r = String(role || '').toLowerCase()
  if (r !== 'admin' && item?.href === homeFor(r)) return 'Dashboard'
  return item?.label
}

/**
 * The nav entry that owns a path (longest matching href), or null for a path
 * no workspace claims (auth pages and the like).
 */
export function navItemForPath(pathname) {
  let best = null
  for (const item of NAV_ITEMS) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) best = item
    }
  }
  return best
}

/** May `role` open `pathname`? Unclaimed paths are left to the page itself. */
export function canAccessPath(role, pathname) {
  const item = navItemForPath(pathname)
  return !item || item.roles.includes(String(role || '').toLowerCase())
}

// ─── Kanban Columns ────────────────────────────────────────────────────────────
export const KANBAN_COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-400' },
  { id: 'in_review',   label: 'In Review',   color: 'bg-blue-400'  },
  { id: 'completed',   label: 'Completed',   color: 'bg-green-400' },
]

// ─── File Upload ───────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const ALLOWED_FILE_TYPES = [
  'application/pdf',

  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  'image/png',
  'image/jpeg',

  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
]

// ─── App ───────────────────────────────────────────────────────────────────────
export const APP_NAME = 'Varadhi Tracker'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
