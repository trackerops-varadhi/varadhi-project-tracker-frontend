'use client'

import { KeyboardModal } from '@/components/ui/dialog'

import { useState } from 'react'
import {
  Users,
  CalendarCheck,
  UserCheck,
  FolderDown,
  Briefcase,
  UsersRound,
  UserX,
  X,
  Plus,
  Mail,
  Clock,
  BriefcaseBusiness,
  AlertCircle,
  Calendar,
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import {
  EMPLOYEE_STATUS_LABELS,
  EXIT_TYPE_LABELS,
  REASON_CATEGORY_LABELS,
  INTERVIEW_OUTCOME_LABELS,
  INTERVIEW_OUTCOME_COLORS,
  formatTenure,
} from '@/constants/people'
import { formatDate } from '@/utils'

const INPUT = 'p-2.5 bg-white border border-slate-200 rounded-lg text-xs'
const DATE_INPUT = 'p-2 bg-white border border-slate-200 rounded-lg text-xs'

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback
const showDate = (value) => formatDate(value, 'dd MMM yyyy')

const EMPTY_EMPLOYEE = {
  userId: '', designation: '', product: '', shift: '', coreSkills: '', dateOfJoining: '',
}
const EMPTY_EXIT = {
  userId: '', exitType: 'resignation', resignationDate: '', lastWorkingDate: '',
  reasonCategory: '', reasonDetail: '', exitFeedback: '',
}
const EMPTY_INTERVIEW = {
  candidateName: '', roleApplied: '', interviewDate: '', outcome: 'selected',
  notSelectedReason: '', feedback: '', candidateExpectations: '',
}

function FormMessage({ error }) {
  if (!error) return null
  return (
    <p role="alert" className="md:col-span-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
      {error}
    </p>
  )
}

function ListState({ loading, error, empty, emptyText }) {
  if (loading) return <p className="py-6 text-center text-xs text-slate-500">Loading…</p>
  if (error) return <p role="alert" className="py-6 text-center text-xs text-rose-600">{error}</p>
  if (empty) return <p className="py-6 text-center text-xs text-slate-500">{emptyText}</p>
  return null
}

/**
 * HR Workspaces. Employee Details, Attrition Management and Interview
 * Management read and write /api/people; the remaining tiles are later phases
 * and stay disabled.
 *
 * `employees` is the directory HrDashboard already loaded; `onChanged` makes it
 * reload the directory and the dashboard figures after a save.
 */
export function HrModules({ employees = [], onChanged = () => {} }) {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isAttritionModalOpen, setIsAttritionModalOpen] = useState(false)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)

  // Employee directory
  const [eligibleUsers, setEligibleUsers] = useState([])
  const [eligibleLoading, setEligibleLoading] = useState(false)
  const [newEmp, setNewEmp] = useState(EMPTY_EMPLOYEE)
  const [empSaving, setEmpSaving] = useState(false)
  const [empError, setEmpError] = useState('')

  // Attrition
  const [exits, setExits] = useState([])
  const [exitsLoading, setExitsLoading] = useState(false)
  const [exitsError, setExitsError] = useState('')
  const [newAttr, setNewAttr] = useState(EMPTY_EXIT)
  const [attrSaving, setAttrSaving] = useState(false)
  const [attrError, setAttrError] = useState('')

  // Interviews
  const [interviews, setInterviews] = useState([])
  const [interviewsLoading, setInterviewsLoading] = useState(false)
  const [interviewsError, setInterviewsError] = useState('')
  const [newInterview, setNewInterview] = useState(EMPTY_INTERVIEW)
  const [intSaving, setIntSaving] = useState(false)
  const [intError, setIntError] = useState('')

  // Only people still employed can be given an exit record.
  const exitCandidates = employees.filter((e) => e.status === 'active')
  const selectedLeaver = employees.find((e) => e.userId === newAttr.userId)

  const loadEligibleUsers = async () => {
    setEligibleLoading(true)
    try {
      setEligibleUsers(await peopleApi.getEligibleUsers())
    } catch (err) {
      setEmpError(errorMessage(err, 'Failed to load users.'))
    } finally {
      setEligibleLoading(false)
    }
  }

  const loadExits = async () => {
    setExitsLoading(true)
    setExitsError('')
    try {
      setExits(await peopleApi.getExits())
    } catch (err) {
      setExitsError(errorMessage(err, 'Failed to load attrition records.'))
    } finally {
      setExitsLoading(false)
    }
  }

  const loadInterviews = async () => {
    setInterviewsLoading(true)
    setInterviewsError('')
    try {
      setInterviews(await peopleApi.getInterviews())
    } catch (err) {
      setInterviewsError(errorMessage(err, 'Failed to load interview records.'))
    } finally {
      setInterviewsLoading(false)
    }
  }

  const openEmployees = () => {
    setEmpError('')
    setIsEmployeeModalOpen(true)
    loadEligibleUsers()
  }
  const openAttrition = () => {
    setAttrError('')
    setIsAttritionModalOpen(true)
    loadExits()
  }
  const openInterviews = () => {
    setIntError('')
    setIsInterviewModalOpen(true)
    loadInterviews()
  }

  // Access labels describe the target policy; the backend enforces it.
  const moduleGroups = [
    {
      title: 'People',
      description: 'Employee records and reporting relationships',
      modules: [
        { title: 'Employee Details', subtitle: 'Admin / Manager', icon: Users, action: openEmployees },
        { title: 'Team Directory', subtitle: 'All roles · work information only', icon: UsersRound },
        { title: 'Attrition Management', subtitle: 'Admin / Manager · exit records', icon: UserX, action: openAttrition },
      ],
    },
    {
      title: 'Recruitment',
      description: 'Candidates, interview rounds and resumes',
      modules: [
        { title: 'Interview Management', subtitle: 'Admin / Manager · interview outcomes', icon: Briefcase, action: openInterviews },
        { title: 'Resume Folder', subtitle: 'Admin / HR · candidate resumes', icon: FolderDown },
      ],
    },
    {
      title: 'Workforce',
      description: 'Daily attendance, leave and work updates',
      modules: [
        { title: 'Attendance', subtitle: 'Attendance and absence visibility', icon: CalendarCheck },
        { title: 'Leave Management', subtitle: 'Planned / unplanned · manager approval', icon: UserCheck },
        { title: 'Daily Work Status', subtitle: 'Summary, blockers and tomorrow’s plan', icon: ClipboardList },
      ],
    },
  ]

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    setEmpSaving(true)
    setEmpError('')
    try {
      await peopleApi.createEmployee({
        ...newEmp,
        dateOfJoining: newEmp.dateOfJoining || null,
      })
      setNewEmp(EMPTY_EMPLOYEE)
      await Promise.all([onChanged(), loadEligibleUsers()])
    } catch (err) {
      setEmpError(errorMessage(err, 'Failed to add employee.'))
    } finally {
      setEmpSaving(false)
    }
  }

  const handleAddAttrition = async (e) => {
    e.preventDefault()
    setAttrSaving(true)
    setAttrError('')
    try {
      const saved = await peopleApi.createExit(newAttr)
      setExits((prev) => [saved, ...prev])
      setNewAttr(EMPTY_EXIT)
      await onChanged()
    } catch (err) {
      setAttrError(errorMessage(err, 'Failed to save attrition record.'))
    } finally {
      setAttrSaving(false)
    }
  }

  const handleAddInterview = async (e) => {
    e.preventDefault()
    setIntSaving(true)
    setIntError('')
    try {
      const saved = await peopleApi.createInterview(newInterview)
      setInterviews((prev) => [saved, ...prev])
      setNewInterview(EMPTY_INTERVIEW)
      await onChanged()
    } catch (err) {
      setIntError(errorMessage(err, 'Failed to save interview record.'))
    } finally {
      setIntSaving(false)
    }
  }

  return (
    <>
      <section aria-labelledby="hr-modules-title" className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
        <div className="mb-2">
          <h2 id="hr-modules-title" className="text-xs font-semibold text-slate-900">HR Workspaces</h2>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">People, Recruitment and Workforce / access labels reflect the planned roles</p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {moduleGroups.map((group) => (
            <div key={group.title} className="min-w-0">
              <h3 className="text-xs font-semibold text-primary-hover">{group.title}</h3>
              <p className="mt-1 min-h-0 text-[11px] leading-4 text-slate-500">{group.description}</p>
              <div className="mt-1.5 space-y-1.5">
                {group.modules.map((mod) => {
                  const Icon = mod.icon

                  return (
                    <button
                      key={mod.title}
                      type="button"
                      onClick={mod.action}
                      disabled={!mod.action}
                      aria-label={`Open ${mod.title}`}
                      className="group flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2 text-left transition-colors enabled:hover:border-violet-200 enabled:hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
                    >
                      <span className="rounded-lg bg-white p-1.5 text-primary ring-1 ring-slate-100">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-slate-800">{mod.title}</span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
                          {mod.action ? mod.subtitle : `${mod.subtitle} · coming soon`}
                        </span>
                      </span>
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 1. Employee Details Card Grid Modal */}
      {isEmployeeModalOpen && (
        <KeyboardModal title={"Employee Directory"} onClose={() => setIsEmployeeModalOpen(false)} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Employee Directory (HR Access)</h2>
                <p className="text-xs text-gray-500">Manage organization team members and records.</p>
              </div>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                aria-label="Close employee directory"
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <ListState
                empty={employees.length === 0}
                emptyText="No employees yet. Add the first one below."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map((emp) => (
                  <div key={emp.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-violet-200 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{emp.name ?? 'Unknown user'}</h4>
                        <span className="inline-block px-2 py-0.5 bg-violet-50 text-primary-hover text-xs font-semibold rounded mt-1">
                          {emp.designation}
                        </span>
                        {emp.status !== 'active' && (
                          <span className="ml-1.5 inline-block px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded mt-1">
                            {EMPLOYEE_STATUS_LABELS[emp.status]}
                          </span>
                        )}
                      </div>
                      {emp.product && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                          {emp.product}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span>{emp.email ?? '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span>{emp.shift || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={14} className="text-gray-400" />
                        <span>Skills: {emp.coreSkills?.length ? emp.coreSkills.join(', ') : '—'}</span>
                      </div>
                      {emp.dateOfJoining && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>
                            Joined {showDate(emp.dateOfJoining)}
                            {emp.tenureMonths !== null && ` · ${formatTenure(emp.tenureMonths)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-1">Add New Employee</h4>
                <p className="mb-3 text-[11px] text-slate-500">
                  Pick an existing tracker user — name and email come from their account.
                </p>
                <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    aria-label="User"
                    value={newEmp.userId}
                    onChange={(e) => setNewEmp({ ...newEmp, userId: e.target.value })}
                    className={INPUT}
                    required
                    disabled={eligibleLoading}
                  >
                    <option value="">
                      {eligibleLoading
                        ? 'Loading users…'
                        : eligibleUsers.length ? 'Select user' : 'All active users are already added'}
                    </option>
                    {eligibleUsers.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <input
                    type="text" placeholder="Role (e.g. Developer)" value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    className={INPUT} required maxLength={120}
                  />
                  <input
                    type="text" placeholder="Product" value={newEmp.product}
                    onChange={(e) => setNewEmp({ ...newEmp, product: e.target.value })}
                    className={INPUT} maxLength={120}
                  />
                  <input
                    type="text" placeholder="Shift Timings" value={newEmp.shift}
                    onChange={(e) => setNewEmp({ ...newEmp, shift: e.target.value })}
                    className={INPUT} maxLength={60}
                  />
                  <input
                    type="text" placeholder="Core Skills (comma separated)" value={newEmp.coreSkills}
                    onChange={(e) => setNewEmp({ ...newEmp, coreSkills: e.target.value })}
                    className={INPUT}
                  />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="hr-doj" className="text-[10px] text-gray-500 font-semibold">Date of Joining</label>
                    <input
                      id="hr-doj" type="date" value={newEmp.dateOfJoining}
                      onChange={(e) => setNewEmp({ ...newEmp, dateOfJoining: e.target.value })}
                      className={DATE_INPUT}
                    />
                  </div>
                  <FormMessage error={empError} />
                  <button
                    type="submit"
                    disabled={empSaving}
                    className="md:col-span-3 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white rounded-lg text-xs font-semibold py-2.5 flex items-center justify-center gap-1"
                  >
                    <Plus size={16} /> {empSaving ? 'Saving…' : 'Save & Add Employee Card'}
                  </button>
                </form>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </KeyboardModal>
      )}

      {/* 2. Attrition Management Card Grid Modal */}
      {isAttritionModalOpen && (
        <KeyboardModal title="Attrition Management" onClose={() => setIsAttritionModalOpen(false)} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Attrition & Resignation Tracker (HR Access)</h2>
                <p className="text-xs text-gray-500">Track exit reasons, notice periods, and exit interview feedback.</p>
              </div>
              <button
                onClick={() => setIsAttritionModalOpen(false)}
                aria-label="Close attrition tracker"
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <ListState
                loading={exitsLoading}
                error={exitsError}
                empty={exits.length === 0}
                emptyText="No attrition records yet."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exits.map((item) => (
                  <div key={item.id} className="bg-white border border-rose-100 rounded-xl p-5 shadow-sm hover:border-rose-300 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{item.name ?? 'Unknown user'}</h4>
                        <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded mt-1">
                          {item.designation}
                        </span>
                        <span className="ml-1.5 inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded mt-1">
                          {EXIT_TYPE_LABELS[item.exitType] ?? item.exitType}
                        </span>
                      </div>
                      {item.product && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                          {item.product}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={14} className="text-rose-500" /> Resigned:
                        </span>
                        <span className="font-medium text-gray-800">{showDate(item.resignationDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Clock size={14} className="text-rose-500" /> Last Working Day:
                        </span>
                        <span className="font-medium text-gray-800">{showDate(item.lastWorkingDate)}</span>
                      </div>
                      {item.tenureMonths !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Worked in Varadhi:</span>
                          <span className="font-medium text-gray-800">{formatTenure(item.tenureMonths)}</span>
                        </div>
                      )}
                      <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 space-y-1 mt-2">
                        <p className="font-bold text-rose-900 flex items-center gap-1">
                          <AlertCircle size={13} /> Reason: {REASON_CATEGORY_LABELS[item.reasonCategory] ?? item.reasonCategory}
                        </p>
                        <p className="text-rose-800/80 leading-relaxed">{item.reasonDetail}</p>
                      </div>
                      {item.exitFeedback && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                          <p className="font-semibold text-slate-700">Exit Feedback:</p>
                          <p className="text-slate-600 italic">&quot;{item.exitFeedback}&quot;</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-rose-50/40 p-5 rounded-xl border border-rose-100">
                <h4 className="text-sm font-bold text-rose-900 mb-1">Record New Attrition / Resignation</h4>
                <p className="mb-3 text-[11px] text-slate-500">
                  Only employees in the Employee Directory can be selected. Role and product are taken from their profile.
                </p>
                <form onSubmit={handleAddAttrition} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    aria-label="Employee"
                    value={newAttr.userId}
                    onChange={(e) => setNewAttr({ ...newAttr, userId: e.target.value })}
                    className={INPUT}
                    required
                  >
                    <option value="">{exitCandidates.length ? 'Select employee' : 'No active employees in the directory'}</option>
                    {exitCandidates.map((emp) => (
                      <option key={emp.userId} value={emp.userId}>{emp.name ?? emp.email}</option>
                    ))}
                  </select>
                  <input
                    type="text" placeholder="Role" value={selectedLeaver?.designation ?? ''}
                    className={`${INPUT} bg-slate-50 text-slate-500`} readOnly aria-label="Role (from profile)"
                  />
                  <input
                    type="text" placeholder="Product" value={selectedLeaver?.product ?? ''}
                    className={`${INPUT} bg-slate-50 text-slate-500`} readOnly aria-label="Product (from profile)"
                  />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="hr-exit-type" className="text-[10px] text-gray-500 font-semibold">Exit Type</label>
                    <select
                      id="hr-exit-type"
                      value={newAttr.exitType}
                      onChange={(e) => setNewAttr({ ...newAttr, exitType: e.target.value })}
                      className={DATE_INPUT}
                    >
                      {Object.entries(EXIT_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="hr-resignation-date" className="text-[10px] text-gray-500 font-semibold">Resignation Date</label>
                    <input
                      id="hr-resignation-date" type="date" value={newAttr.resignationDate}
                      onChange={(e) => setNewAttr({ ...newAttr, resignationDate: e.target.value })}
                      className={DATE_INPUT} required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="hr-last-day" className="text-[10px] text-gray-500 font-semibold">Last Working Day</label>
                    <input
                      id="hr-last-day" type="date" value={newAttr.lastWorkingDate}
                      min={newAttr.resignationDate || undefined}
                      onChange={(e) => setNewAttr({ ...newAttr, lastWorkingDate: e.target.value })}
                      className={DATE_INPUT} required
                    />
                  </div>
                  <select
                    aria-label="Reason category"
                    value={newAttr.reasonCategory}
                    onChange={(e) => setNewAttr({ ...newAttr, reasonCategory: e.target.value })}
                    className={INPUT}
                    required
                  >
                    <option value="">Reason Category</option>
                    {Object.entries(REASON_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="text" placeholder="Detailed Reason for Resigning" value={newAttr.reasonDetail}
                    onChange={(e) => setNewAttr({ ...newAttr, reasonDetail: e.target.value })}
                    className={`md:col-span-2 ${INPUT}`} required maxLength={2000}
                  />
                  <input
                    type="text" placeholder="Exit Interview Feedback / Comments" value={newAttr.exitFeedback}
                    onChange={(e) => setNewAttr({ ...newAttr, exitFeedback: e.target.value })}
                    className={`md:col-span-3 ${INPUT}`} maxLength={2000}
                  />
                  <FormMessage error={attrError} />
                  <button
                    type="submit"
                    disabled={attrSaving}
                    className="md:col-span-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold py-2.5 flex items-center justify-center gap-1"
                  >
                    <Plus size={16} /> {attrSaving ? 'Saving…' : 'Save Attrition Record'}
                  </button>
                </form>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsAttritionModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </KeyboardModal>
      )}

      {/* 3. Interview Management Card Grid Modal */}
      {isInterviewModalOpen && (
        <KeyboardModal title="Interview Management" onClose={() => setIsInterviewModalOpen(false)} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-violet-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Candidates who attended interview (HR Access)</h2>
                <p className="text-xs text-gray-500">Track candidate interview status, evaluations, and organizational improvement feedback.</p>
              </div>
              <button
                onClick={() => setIsInterviewModalOpen(false)}
                aria-label="Close interview records"
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <ListState
                loading={interviewsLoading}
                error={interviewsError}
                empty={interviews.length === 0}
                emptyText="No interview records yet."
              />
              {/* Interview Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map((item) => (
                  <div key={item.id} className="bg-white border border-violet-100 rounded-xl p-5 shadow-sm hover:border-violet-300 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{item.candidateName}</h4>
                        <span className="inline-block px-2 py-0.5 bg-violet-50 text-primary-hover text-xs font-semibold rounded mt-1">
                          {item.roleApplied}
                        </span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${INTERVIEW_OUTCOME_COLORS[item.outcome] ?? 'bg-slate-100 text-slate-700'}`}>
                        {INTERVIEW_OUTCOME_LABELS[item.outcome] ?? item.outcome}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={14} className="text-violet-500" /> Interview / Call Date:
                        </span>
                        <span className="font-medium text-gray-800">{showDate(item.interviewDate)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="shrink-0 text-gray-500">Not Selected Reason:</span>
                        <span className="text-right font-medium text-gray-800">{item.notSelectedReason || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="shrink-0 text-gray-500">For Future Reference:</span>
                        <span className="text-right font-medium text-gray-800">{item.feedback || '-'}</span>
                      </div>
                      {item.candidateExpectations && (
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 mt-1">
                          <p className="font-semibold text-slate-700">Candidate Expectations (Pay / Shift etc):</p>
                          <p className="text-slate-600 italic">&quot;{item.candidateExpectations}&quot;</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Candidate Interview Form Section */}
              <div className="bg-violet-50/40 p-5 rounded-xl border border-violet-100">
                <h4 className="text-sm font-bold text-violet-900 mb-3">Add Candidate Interview Record</h4>
                <form onSubmit={handleAddInterview} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text" placeholder="Candidate Name" value={newInterview.candidateName}
                    onChange={(e) => setNewInterview({ ...newInterview, candidateName: e.target.value })}
                    className={INPUT} required maxLength={160}
                  />
                  <input
                    type="text" placeholder="Role Applied For" value={newInterview.roleApplied}
                    onChange={(e) => setNewInterview({ ...newInterview, roleApplied: e.target.value })}
                    className={INPUT} required maxLength={120}
                  />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="hr-interview-date" className="text-[10px] text-gray-500 font-semibold">Interview / Call Date</label>
                    <input
                      id="hr-interview-date" type="date" value={newInterview.interviewDate}
                      onChange={(e) => setNewInterview({ ...newInterview, interviewDate: e.target.value })}
                      className={DATE_INPUT} required
                    />
                  </div>
                  <select
                    aria-label="Interview status"
                    value={newInterview.outcome}
                    onChange={(e) => setNewInterview({ ...newInterview, outcome: e.target.value })}
                    className={INPUT}
                  >
                    {Object.entries(INTERVIEW_OUTCOME_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={newInterview.outcome === 'rejected' ? 'Not Selected Reason' : 'Not Selected Reason (only for Not Selected)'}
                    value={newInterview.notSelectedReason}
                    onChange={(e) => setNewInterview({ ...newInterview, notSelectedReason: e.target.value })}
                    className={INPUT}
                    disabled={newInterview.outcome !== 'rejected'}
                    maxLength={2000}
                  />
                  <input
                    type="text" placeholder="For Future Reference (Yes/No & notes)" value={newInterview.feedback}
                    onChange={(e) => setNewInterview({ ...newInterview, feedback: e.target.value })}
                    className={INPUT} maxLength={2000}
                  />
                  <input
                    type="text" placeholder="Candidate Expectations to improve organization (e.g. Pay / Shift)" value={newInterview.candidateExpectations}
                    onChange={(e) => setNewInterview({ ...newInterview, candidateExpectations: e.target.value })}
                    className={`md:col-span-3 ${INPUT}`} maxLength={2000}
                  />
                  <FormMessage error={intError} />
                  <button
                    type="submit"
                    disabled={intSaving}
                    className="md:col-span-3 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white rounded-lg text-xs font-semibold py-2.5 flex items-center justify-center gap-1"
                  >
                    <Plus size={16} /> {intSaving ? 'Saving…' : 'Save Interview Record'}
                  </button>
                </form>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsInterviewModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </KeyboardModal>
      )}
    </>
  )
}
