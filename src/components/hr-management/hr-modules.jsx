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

export function HrModules() {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isAttritionModalOpen, setIsAttritionModalOpen] = useState(false)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)

  // =========================================================
  // EMPLOYEE STATE
  // =========================================================

  const [employees, setEmployees] = useState([
    {
      employeeName: 'Ananya Rao',
      dateOfJoining: '2023-06-15',
      role: 'Project Manager',
      shiftTimings: '10:00 AM - 7:00 PM',
      emailAddress: 'ananya.rao@varadhi.com',
      product: 'Varadhi',
      gender: 'Female',
      age: 28,
      maritalStatus: 'Single',
      husbandFatherName: 'Rao Venkata',
      permanentAddress: 'H.No 12-4, Jubilee Hills, Hyderabad',
      temporaryAddress: 'H.No 12-4, Jubilee Hills, Hyderabad',
      adhaarCard: '1234 5678 9012',
      educationQualification: 'B.Tech (CSE)',
      collegeName: 'JNTU Hyderabad',
      yearOfCompletion: 2021,
      coreSkill: 'React, Node.js, Project Management',
      previousCompany: 'TCS',
      totalExperience: '3 Years',
      dateOfResignation: '-',
      noOfYearsWorked: '2 Years 3 Months',
    },
    {
      employeeName: 'Rahul Kumar',
      dateOfJoining: '2022-11-01',
      role: 'Software Engineer',
      shiftTimings: '9:00 AM - 6:00 PM',
      emailAddress: 'rahul.kumar@varadhi.com',
      product: 'DeepFace',
      gender: 'Male',
      age: 26,
      maritalStatus: 'Single',
      husbandFatherName: 'Satish Kumar',
      permanentAddress: 'Flat 202, MG Road, Bangalore',
      temporaryAddress: 'Flat 202, MG Road, Bangalore',
      adhaarCard: '9876 5432 1098',
      educationQualification: 'B.E (ECE)',
      collegeName: 'BMSCE Bangalore',
      yearOfCompletion: 2022,
      coreSkill: 'Python, AI/ML, PyTorch',
      previousCompany: 'Infosys',
      totalExperience: '2 Years',
      dateOfResignation: '-',
      noOfYearsWorked: '3 Years 10 Months',
    },
  ])

  const [newEmp, setNewEmp] = useState({
    employeeName: '',
    dateOfJoining: '',
    role: '',
    shiftTimings: '',
    emailAddress: '',
    product: '',
    gender: '',
    age: '',
    maritalStatus: '',
    husbandFatherName: '',
    permanentAddress: '',
    temporaryAddress: '',
    adhaarCard: '',
    educationQualification: '',
    collegeName: '',
    yearOfCompletion: '',
    coreSkill: '',
    previousCompany: '',
    totalExperience: '',
    dateOfResignation: '-',
    noOfYearsWorked: '',
  })

  // =========================================================
  // ATTRITION STATE
  // =========================================================

  const [attritions, setAttritions] = useState([
    {
      employeeName: 'Siddharth Verma',
      role: 'Senior Backend Developer',
      product: 'Varadhi',
      dateOfResignation: '2026-05-10',
      lastWorkingDay: '2026-06-10',
      reasonCategory: 'Better Compensation',
      reasonDetails:
        'Accepted an offer with a higher compensation package matching market standards.',
      exitFeedback:
        'Loved the team culture and product exposure, but needed to prioritize financial goals.',
    },
    {
      employeeName: 'Priya Sharma',
      role: 'UI/UX Designer',
      product: 'DeepFace',
      dateOfResignation: '2026-04-15',
      lastWorkingDay: '2026-05-15',
      reasonCategory: 'Higher Studies / Relocation',
      reasonDetails:
        "Relocating abroad for a Master's degree program.",
      exitFeedback:
        'Great learning experience working on cutting-edge AI design systems.',
    },
  ])

  const [newAttr, setNewAttr] = useState({
    employeeName: '',
    role: '',
    product: '',
    dateOfResignation: '',
    lastWorkingDay: '',
    reasonCategory: '',
    reasonDetails: '',
    exitFeedback: '',
  })

  // =========================================================
  // INTERVIEW STATE
  // =========================================================

  const [interviews, setInterviews] = useState([
    {
      candidateName: 'Kiran Patel',
      roleApplied: 'Full Stack Developer',
      interviewDate: '2026-09-15',
      status: 'Selected',
      notSelectedReason: '-',
      forFutureReference: 'Yes - strong system design skills',
      expectations:
        'Requested flexible shift timing and competitive market pay.',
    },
    {
      candidateName: 'Neha Singh',
      roleApplied: 'Data Scientist',
      interviewDate: '2026-09-12',
      status: 'Hold',
      notSelectedReason: '-',
      forFutureReference: 'Yes - review in next hiring cycle',
      expectations: 'Interested in hybrid work model.',
    },
  ])

  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    roleApplied: '',
    interviewDate: '',
    status: 'Selected',
    notSelectedReason: '',
    forFutureReference: '',
    expectations: '',
  })

  // =========================================================
  // HR MODULE GROUPS
  // =========================================================

  const moduleGroups = [
    {
      title: 'People',
      description: 'Employee records and reporting relationships',
      modules: [
        {
          title: 'Employee Details',
          subtitle: 'Admin / HR',
          icon: Users,
          action: () => setIsEmployeeModalOpen(true),
        },
        {
          title: 'Team Directory',
          subtitle: 'All roles - work information only',
          icon: UsersRound,
        },
        {
          title: 'Attrition Management',
          subtitle: 'Admin / HR - exit records',
          icon: UserX,
          action: () => setIsAttritionModalOpen(true),
        },
      ],
    },
    {
      title: 'Recruitment',
      description: 'Candidates, interview rounds and resumes',
      modules: [
        {
          title: 'Interview Management',
          subtitle: 'Admin / HR - assigned feedback',
          icon: Briefcase,
          action: () => setIsInterviewModalOpen(true),
        },
        {
          title: 'Resume Folder',
          subtitle: 'Admin / HR - candidate resumes',
          icon: FolderDown,
        },
      ],
    },
    {
      title: 'Workforce',
      description: 'Daily attendance, leave and work updates',
      modules: [
        {
          title: 'Attendance',
          subtitle: 'Attendance and absence visibility',
          icon: CalendarCheck,
        },
        {
          title: 'Leave Management',
          subtitle: 'Planned / unplanned - manager approval',
          icon: UserCheck,
        },
        {
          title: 'Daily Work Status',
          subtitle: "Summary, blockers and tomorrow's plan",
          icon: ClipboardList,
        },
      ],
    },
  ]

  // =========================================================
  // HANDLERS
  // =========================================================

  const handleAddEmployee = (e) => {
    e.preventDefault()

    setEmployees([...employees, newEmp])

    setNewEmp({
      employeeName: '',
      dateOfJoining: '',
      role: '',
      shiftTimings: '',
      emailAddress: '',
      product: '',
      gender: '',
      age: '',
      maritalStatus: '',
      husbandFatherName: '',
      permanentAddress: '',
      temporaryAddress: '',
      adhaarCard: '',
      educationQualification: '',
      collegeName: '',
      yearOfCompletion: '',
      coreSkill: '',
      previousCompany: '',
      totalExperience: '',
      dateOfResignation: '-',
      noOfYearsWorked: '',
    })
  }

  const handleAddAttrition = (e) => {
    e.preventDefault()

    setAttritions([...attritions, newAttr])

    setNewAttr({
      employeeName: '',
      role: '',
      product: '',
      dateOfResignation: '',
      lastWorkingDay: '',
      reasonCategory: '',
      reasonDetails: '',
      exitFeedback: '',
    })
  }

  const handleAddInterview = (e) => {
    e.preventDefault()

    setInterviews([...interviews, newInterview])

    setNewInterview({
      candidateName: '',
      roleApplied: '',
      interviewDate: '',
      status: 'Selected',
      notSelectedReason: '',
      forFutureReference: '',
      expectations: '',
    })
  }

  return (
    <>
      {/* =====================================================
          HR WORKSPACES
      ====================================================== */}

      <section
        aria-labelledby="hr-modules-title"
        className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
      >
        <div className="mb-2">
          <h2
            id="hr-modules-title"
            className="text-xs font-semibold text-slate-900"
          >
            HR Workspaces
          </h2>

          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
            People, Recruitment and Workforce / access labels reflect the
            planned roles
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {moduleGroups.map((group) => (
            <div key={group.title} className="min-w-0">
              <h3 className="text-xs font-semibold text-primary">
                {group.title}
              </h3>

              <p className="mt-1 min-h-0 text-[11px] leading-4 text-slate-500">
                {group.description}
              </p>

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
                        <Icon
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-slate-800">
                          {mod.title}
                        </span>

                        <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
                          {mod.subtitle}
                        </span>
                      </span>

                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-violet-500"
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          1. EMPLOYEE DETAILS MODAL
      ====================================================== */}

      {isEmployeeModalOpen && (
        <KeyboardModal
          title="Employee Directory"
          onClose={() => setIsEmployeeModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Employee Directory (HR Access)
                </h2>

                <p className="text-xs text-gray-500">
                  Manage organization team members and records.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close employee directory"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Employee Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {employees.map((emp, i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-violet-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {emp.employeeName}
                        </h4>

                        <span className="mt-1 inline-block rounded bg-violet-50 px-2 py-0.5 text-xs font-semibold text-primary">
                          {emp.role}
                        </span>
                      </div>

                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {emp.product}
                      </span>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-200 pt-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail
                          size={14}
                          className="text-gray-400"
                          aria-hidden="true"
                        />
                        <span>{emp.emailAddress}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock
                          size={14}
                          className="text-gray-400"
                          aria-hidden="true"
                        />
                        <span>{emp.shiftTimings}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness
                          size={14}
                          className="text-gray-400"
                          aria-hidden="true"
                        />
                        <span>Skills: {emp.coreSkill}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar
                          size={14}
                          className="text-gray-400"
                          aria-hidden="true"
                        />
                        <span>Joined: {emp.dateOfJoining}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users
                          size={14}
                          className="text-gray-400"
                          aria-hidden="true"
                        />
                        <span>
                          Experience: {emp.totalExperience}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Employee */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="mb-3 text-sm font-bold text-slate-800">
                  Add New Employee
                </h4>

                <form
                  onSubmit={handleAddEmployee}
                  className="grid grid-cols-1 gap-3 md:grid-cols-3"
                >
                  <input
                    type="text"
                    placeholder="Employee Name"
                    value={newEmp.employeeName}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        employeeName: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <input
                    type="date"
                    value={newEmp.dateOfJoining}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        dateOfJoining: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Role"
                    value={newEmp.role}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        role: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newEmp.emailAddress}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        emailAddress: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Product"
                    value={newEmp.product}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        product: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Shift Timings"
                    value={newEmp.shiftTimings}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        shiftTimings: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Gender"
                    value={newEmp.gender}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        gender: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="number"
                    placeholder="Age"
                    value={newEmp.age}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        age: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Marital Status"
                    value={newEmp.maritalStatus}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        maritalStatus: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Father / Husband Name"
                    value={newEmp.husbandFatherName}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        husbandFatherName: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Permanent Address"
                    value={newEmp.permanentAddress}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        permanentAddress: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs md:col-span-2"
                  />

                  <input
                    type="text"
                    placeholder="Temporary Address"
                    value={newEmp.temporaryAddress}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        temporaryAddress: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs md:col-span-2"
                  />

                  <input
                    type="text"
                    placeholder="Aadhaar Card"
                    value={newEmp.adhaarCard}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        adhaarCard: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Education Qualification"
                    value={newEmp.educationQualification}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        educationQualification: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="College Name"
                    value={newEmp.collegeName}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        collegeName: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="number"
                    placeholder="Year of Completion"
                    value={newEmp.yearOfCompletion}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        yearOfCompletion: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Core Skills"
                    value={newEmp.coreSkill}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        coreSkill: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Previous Company"
                    value={newEmp.previousCompany}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        previousCompany: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Total Experience"
                    value={newEmp.totalExperience}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        totalExperience: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Years Worked"
                    value={newEmp.noOfYearsWorked}
                    onChange={(e) =>
                      setNewEmp({
                        ...newEmp,
                        noOfYearsWorked: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 rounded-lg bg-primary py-2.5 text-xs font-semibold text-white hover:bg-primary-hover md:col-span-3"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Save & Add Employee Card
                  </button>
                </form>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="rounded-lg bg-gray-800 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-900"
              >
                Close View
              </button>
            </div>
          </div>
        </KeyboardModal>
      )}

      {/* =====================================================
          2. ATTRITION MANAGEMENT MODAL
      ====================================================== */}

      {isAttritionModalOpen && (
        <KeyboardModal
          title="Attrition Management"
          onClose={() => setIsAttritionModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-rose-50/50 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Attrition & Resignation Tracker (HR Access)
                </h2>

                <p className="text-xs text-gray-500">
                  Track exit reasons, notice periods, and exit interview
                  feedback.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close attrition management"
                onClick={() => setIsAttritionModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {attritions.map((item, i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-xl border border-rose-100 bg-white p-5 shadow-sm transition-all hover:border-rose-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {item.employeeName}
                        </h4>

                        <span className="mt-1 inline-block rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                          {item.role}
                        </span>
                      </div>

                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {item.product}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-slate-200 pt-2 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Calendar
                            size={14}
                            className="text-rose-500"
                            aria-hidden="true"
                          />
                          Resigned:
                        </span>

                        <span className="font-medium text-gray-800">
                          {item.dateOfResignation}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Clock
                            size={14}
                            className="text-rose-500"
                            aria-hidden="true"
                          />
                          Last Working Day:
                        </span>

                        <span className="font-medium text-gray-800">
                          {item.lastWorkingDay}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 rounded-lg border border-rose-100 bg-rose-50/60 p-2.5">
                        <p className="flex items-center gap-1 font-bold text-rose-900">
                          <AlertCircle size={13} aria-hidden="true" />
                          Reason: {item.reasonCategory}
                        </p>

                        <p className="leading-relaxed text-rose-800/80">
                          {item.reasonDetails}
                        </p>
                      </div>

                      <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                        <p className="font-semibold text-slate-700">
                          Exit Feedback:
                        </p>

                        <p className="text-slate-600 italic">
                          &quot;{item.exitFeedback}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5">
                <h4 className="mb-3 text-sm font-bold text-rose-900">
                  Record New Attrition / Resignation
                </h4>

                <form
                  onSubmit={handleAddAttrition}
                  className="grid grid-cols-1 gap-3 md:grid-cols-3"
                >
                  <input
                    type="text"
                    placeholder="Employee Name"
                    value={newAttr.employeeName}
                    onChange={(e) =>
                      setNewAttr({
                        ...newAttr,
                        employeeName: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Role"
                    value={newAttr.role}
                    onChange={(e) =>
                      setNewAttr({
                        ...newAttr,
                        role: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Product"
                    value={newAttr.product}
                    onChange={(e) =>
                      setNewAttr({
                        ...newAttr,
                        product: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500">
                      Resignation Date
                    </label>

                    <input
                      type="date"
                      value={newAttr.dateOfResignation}
                      onChange={(e) =>
                        setNewAttr({
                          ...newAttr,
                          dateOfResignation: e.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500">
                      Last Working Day
                    </label>

                    <input
                      type="date"
                      value={newAttr.lastWorkingDay}
                      onChange={(e) =>
                        setNewAttr({
                          ...newAttr,
                          lastWorkingDay: e.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs"
                      required
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Reason Category"
                    value={newAttr.reasonCategory}
                    onChange={(e) =>
                      setNewAttr({
                        ...newAttr,
                        reasonCategory: e.target.value,
                      })
                    }
                    className="self-end rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Detailed Reason for Resigning"
                    value={newAttr.reasonDetails}
                    onChange={(e) =>
                      setNewAttr({
                        ...newAttr,
                        reasonDetails: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs md:col-span-3"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Exit Interview Feedback / Comments"
                    value={newAttr.exitFeedback}
                    onChange={(e) =>
                      setNewAttr({
                        ...newAttr,
                        exitFeedback: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs md:col-span-3"
                  />

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 rounded-lg bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 md:col-span-3"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Save Attrition Record
                  </button>
                </form>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                type="button"
                onClick={() => setIsAttritionModalOpen(false)}
                className="rounded-lg bg-gray-800 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-900"
              >
                Close View
              </button>
            </div>
          </div>
        </KeyboardModal>
      )}

      {/* =====================================================
          3. INTERVIEW MANAGEMENT MODAL
      ====================================================== */}

      {isInterviewModalOpen && (
        <KeyboardModal
          title="Interview Management"
          onClose={() => setIsInterviewModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-violet-50/50 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Candidates who attended interview (HR Access)
                </h2>

                <p className="text-xs text-gray-500">
                  Track candidate interview status, evaluations, and
                  organizational improvement feedback.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close interview management"
                onClick={() => setIsInterviewModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors hover:bg-gray-300"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {interviews.map((item, i) => (
                  <div
                    key={i}
                    className="space-y-3 rounded-xl border border-violet-100 bg-white p-5 shadow-sm transition-all hover:border-violet-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {item.candidateName}
                        </h4>

                        <span className="mt-1 inline-block rounded bg-violet-50 px-2 py-0.5 text-xs font-semibold text-primary">
                          {item.roleApplied}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.status === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Hold'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-slate-200 pt-2 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Calendar
                            size={14}
                            className="text-violet-500"
                            aria-hidden="true"
                          />
                          Interview / Call Date:
                        </span>

                        <span className="font-medium text-gray-800">
                          {item.interviewDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                          Not Selected Reason:
                        </span>

                        <span className="font-medium text-gray-800">
                          {item.notSelectedReason}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">
                          For Future Reference:
                        </span>

                        <span className="font-medium text-gray-800">
                          {item.forFutureReference}
                        </span>
                      </div>

                      <div className="mt-1 space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                        <p className="font-semibold text-slate-700">
                          Candidate Expectations (Pay / Shift etc):
                        </p>

                        <p className="text-slate-600 italic">
                          &quot;{item.expectations}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Interview */}
              <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-5">
                <h4 className="mb-3 text-sm font-bold text-violet-900">
                  Add Candidate Interview Record
                </h4>

                <form
                  onSubmit={handleAddInterview}
                  className="grid grid-cols-1 gap-3 md:grid-cols-3"
                >
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={newInterview.candidateName}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        candidateName: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Role Applied For"
                    value={newInterview.roleApplied}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        roleApplied: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                    required
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-gray-500">
                      Interview / Call Date
                    </label>

                    <input
                      type="date"
                      value={newInterview.interviewDate}
                      onChange={(e) =>
                        setNewInterview({
                          ...newInterview,
                          interviewDate: e.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs"
                      required
                    />
                  </div>

                  <select
                    value={newInterview.status}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        status: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  >
                    <option value="Selected">Selected</option>
                    <option value="Hold">Hold</option>
                    <option value="Not Selected">
                      Not Selected
                    </option>
                  </select>

                  <input
                    type="text"
                    placeholder="Not Selected Reason"
                    value={newInterview.notSelectedReason}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        notSelectedReason: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="For Future Reference"
                    value={newInterview.forFutureReference}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        forFutureReference: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                  />

                  <input
                    type="text"
                    placeholder="Candidate Expectations"
                    value={newInterview.expectations}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        expectations: e.target.value,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs md:col-span-3"
                  />

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 rounded-lg bg-primary py-2.5 text-xs font-semibold text-white hover:bg-primary-hover md:col-span-3"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Save Interview Record
                  </button>
                </form>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
              <button
                type="button"
                onClick={() => setIsInterviewModalOpen(false)}
                className="rounded-lg bg-gray-800 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-900"
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