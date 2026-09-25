
"use client";

import React, { useState } from "react";

import { 

  Users, 

  CalendarCheck, 

  UserCheck, 

  FileText, 

  FolderDown, 

  UserPlus, 

  Briefcase, 

  UsersRound, 

  UserX, 

  FolderKanban, 

  BarChart3, 

  User,

  X,

  Plus,

  Mail,

  Clock,

  BriefcaseBusiness,

  AlertCircle,

  Calendar,

  CheckCircle2

} from "lucide-react";

import { HRStats } from '@/components/hr-management/hr-stats';

import { EmployeeOverview } from '@/components/hr-management/employee-overview';

import { HRQuickActions } from '@/components/hr-management/hr-quick-actions';

// 1. Attendance Snapshot Component

function AttendanceSnapshot() {

  const days = [

    { day: "Mon", height: "h-24" },

    { day: "Tue", height: "h-28" },

    { day: "Wed", height: "h-32" },

    { day: "Thu", height: "h-36" },

    { day: "Fri", height: "h-32" },

    { day: "Sat", height: "h-40" },

    { day: "Sun", height: "h-36" },

  ];

  return (

    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">

      <div>

        <div className="flex justify-between items-center mb-1">

          <h3 className="text-lg font-bold text-gray-900">Attendance Snapshot</h3>

        </div>

        <p className="text-xs text-gray-400 mb-6">Today</p>

      </div>

      <div className="flex items-end justify-between gap-3 h-48 px-2 pt-4 pb-2">

        {days.map((item, index) => (

          <div key={index} className="flex flex-col items-center gap-2 flex-1">

            <div className="w-full bg-gray-50 rounded-t-lg flex items-end justify-center h-full">

              <div

                className={\`w-full max-w-[36px] bg-indigo-500 rounded-t-md transition-all duration-300 hover:bg-indigo-600 ${item.height}\`}

              ></div>

            </div>

            <span className="text-xs text-gray-500 font-medium">{item.day}</span>

          </div>

        ))}

      </div>

    </div>

  );

}

// 2. Leave Overview Component

function LeaveOverview() {

  return (

    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">

      <div>

        <div className="flex justify-between items-center mb-1">

          <h3 className="text-lg font-bold text-gray-900">Leave Overview</h3>

        </div>

        <p className="text-xs text-gray-400 mb-6">Planned vs unplanned</p>

      </div>

      <div className="space-y-5 my-auto">

        <div className="flex items-center justify-between">

          <span className="text-sm text-gray-600 w-24">Planned</span>

          <div className="flex-1 mx-4 bg-gray-100 rounded-full h-3 overflow-hidden">

            <div className="bg-indigo-600 h-full rounded-full w-[85%]"></div>

          </div>

          <span className="text-sm font-semibold text-gray-800 w-6 text-right">12</span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-sm text-gray-600 w-24">Unplanned</span>

          <div className="flex-1 mx-4 bg-gray-100 rounded-full h-3 overflow-hidden">

            <div className="bg-amber-500 h-full rounded-full w-[45%]"></div>

          </div>

          <span className="text-sm font-semibold text-gray-800 w-6 text-right">6</span>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-sm text-gray-600 w-24">Pending</span>

          <div className="flex-1 mx-4 bg-gray-100 rounded-full h-3 overflow-hidden">

            <div className="bg-cyan-400 h-full rounded-full w-[25%]"></div>

          </div>

          <span className="text-sm font-semibold text-gray-800 w-6 text-right">3</span>

        </div>

      </div>

    </div>

  );

}

// 3. Recruitment Pipeline Component

function RecruitmentPipeline() {

  const stages = [

    { label: "Resumes", count: 36 },

    { label: "Interview", count: 12 },

    { label: "Hold", count: 5 },

    { label: "Selected", count: 4 },

  ];

  return (

    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">

      <div>

        <div className="flex justify-between items-center mb-1">

          <h3 className="text-lg font-bold text-gray-900">Recruitment Pipeline</h3>

        </div>

        <p className="text-xs text-gray-400 mb-6">Candidates by current stage</p>

      </div>

      <div className="space-y-4 my-auto">

        {stages.map((stage, index) => (

          <div key={index} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-none">

            <span className="text-sm text-gray-600 font-medium">{stage.label}</span>

            <span className="text-sm font-bold text-gray-900">{stage.count}</span>

          </div>

        ))}

      </div>

    </div>

  );

}

// 4. HR Modules Component with Card Grid Modals for Employee Details, Attrition, and Interview Management

function HrModules() {

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const [isAttritionModalOpen, setIsAttritionModalOpen] = useState(false);

  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  // Employee State

  const [employees, setEmployees] = useState([

    {

      employeeName: "Ananya Rao",

      role: "Project Manager",

      shiftTimings: "10:00 AM - 7:00 PM",

      emailAddress: "ananya.rao@varadhi.com",

      product: "Varadhi",

      coreSkill: "React, Node.js, Project Management",

    },

    {

      employeeName: "Rahul Kumar",

      role: "Software Engineer",

      shiftTimings: "9:00 AM - 6:00 PM",

      emailAddress: "rahul.kumar@varadhi.com",

      product: "DeepFace",

      coreSkill: "Python, AI/ML, PyTorch",

    }

  ]);

  const [newEmp, setNewEmp] = useState({

    employeeName: "",

    role: "",

    shiftTimings: "",

    emailAddress: "",

    product: "",

    coreSkill: ""

  });

  // Attrition State

  const [attritions, setAttritions] = useState([

    {

      employeeName: "Siddharth Verma",

      role: "Senior Backend Developer",

      product: "Varadhi",

      dateOfResignation: "2026-05-10",

      lastWorkingDay: "2026-06-10",

      reasonCategory: "Better Compensation",

      reasonDetails: "Accepted an offer with a higher compensation package matching market standards.",

      exitFeedback: "Loved the team culture and product exposure, but needed to prioritize financial goals."

    },

    {

      employeeName: "Priya Sharma",

      role: "UI/UX Designer",

      product: "DeepFace",

      dateOfResignation: "2026-04-15",

      lastWorkingDay: "2026-05-15",

      reasonCategory: "Higher Studies / Relocation",

      reasonDetails: "Relocating abroad for a Master's degree program.",

      exitFeedback: "Great learning experience working on cutting-edge AI design systems."

    }

  ]);

  const [newAttr, setNewAttr] = useState({

    employeeName: "",

    role: "",

    product: "",

    dateOfResignation: "",

    lastWorkingDay: "",

    reasonCategory: "",

    reasonDetails: "",

    exitFeedback: ""

  });

  // Interview Management State (matching your screenshot details)

  const [interviews, setInterviews] = useState([

    {

      candidateName: "Kiran Patel",

      roleApplied: "Full Stack Developer",

      interviewDate: "2026-09-15",

      status: "Selected",

      notSelectedReason: "-",

      forFutureReference: "Yes - strong system design skills",

      expectations: "Requested flexible shift timing and competitive market pay."

    },

    {

      candidateName: "Neha Singh",

      roleApplied: "Data Scientist",

      interviewDate: "2026-09-12",

      status: "Hold",

      notSelectedReason: "-",

      forFutureReference: "Yes - review in next hiring cycle",

      expectations: "Interested in hybrid work model."

    }

  ]);

  const [newInterview, setNewInterview] = useState({

    candidateName: "",

    roleApplied: "",

    interviewDate: "",

    status: "Selected",

    notSelectedReason: "",

    forFutureReference: "",

    expectations: ""

  });

  const modules = [

    { title: "Employee Details", subtitle: "HR Access", icon: Users, action: () => setIsEmployeeModalOpen(true) },

    { title: "Attendance", subtitle: "Team Access", icon: CalendarCheck },

    { title: "Leave Management", subtitle: "Team Access", icon: UserCheck },

    { title: "Resume Folder", subtitle: "HR Access", icon: FolderDown },

    { title: "Interview Management", subtitle: "HR Access", icon: Briefcase, action: () => setIsInterviewModalOpen(true) },

    { title: "Team List", subtitle: "Access to ALL", icon: UsersRound },

    { title: "Attrition Management", subtitle: "HR Access", icon: UserX, action: () => setIsAttritionModalOpen(true) },

  ];

  const handleAddEmployee = (e) => {

    e.preventDefault();

    setEmployees([...employees, newEmp]);

    setNewEmp({ employeeName: "", role: "", shiftTimings: "", emailAddress: "", product: "", coreSkill: "" });

  };

  const handleAddAttrition = (e) => {

    e.preventDefault();

    setAttritions([...attritions, newAttr]);

    setNewAttr({

      employeeName: "",

      role: "",

      product: "",

      dateOfResignation: "",

      lastWorkingDay: "",

      reasonCategory: "",

      reasonDetails: "",

      exitFeedback: ""

    });

  };

  const handleAddInterview = (e) => {

    e.preventDefault();

    setInterviews([...interviews, newInterview]);

    setNewInterview({

      candidateName: "",

      roleApplied: "",

      interviewDate: "",

      status: "Selected",

      notSelectedReason: "",

      forFutureReference: "",

      expectations: ""

    });

  };

  return (

    <>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

        <div className="mb-6">

          <h3 className="text-lg font-bold text-gray-900">HR Modules</h3>

          <p className="text-xs text-gray-400">Open a detailed HR workspace</p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {modules.map((mod, index) => {

            const IconComponent = mod.icon;

            return (

              <div

                key={index}

                onClick={mod.action}

                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"

              >

                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">

                  <IconComponent size={20} />

                </div>

                <div>

                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">

                    {mod.title}

                  </h4>

                  <p className="text-xs text-gray-400 mt-0.5">{mod.subtitle}</p>

                </div>

              </div>

            );

          })}

        </div>

      </div>

      {/* 1. Employee Details Card Grid Modal */}

      {isEmployeeModalOpen && (

        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">

              <div>

                <h2 className="text-lg font-bold text-gray-900">Employee Directory (HR Access)</h2>

                <p className="text-xs text-gray-500">Manage organization team members and records.</p>

              </div>

              <button 

                onClick={() => setIsEmployeeModalOpen(false)}

                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"

              >

                <X size={18} />

              </button>

            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {employees.map((emp, i) => (

                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-all space-y-3">

                    <div className="flex justify-between items-start">

                      <div>

                        <h4 className="font-bold text-gray-900 text-base">{emp.employeeName}</h4>

                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded mt-1">

                          {emp.role}

                        </span>

                      </div>

                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">

                        {emp.product}

                      </span>

                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">

                      <div className="flex items-center gap-2">

                        <Mail size={14} className="text-gray-400" />

                        <span>{emp.emailAddress}</span>

                      </div>

                      <div className="flex items-center gap-2">

                        <Clock size={14} className="text-gray-400" />

                        <span>{emp.shiftTimings}</span>

                      </div>

                      <div className="flex items-center gap-2">

                        <BriefcaseBusiness size={14} className="text-gray-400" />

                        <span>Skills: {emp.coreSkill}</span>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">

                <h4 className="text-sm font-bold text-slate-800 mb-3">Add New Employee</h4>

                <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  <input 

                    type="text" placeholder="Employee Name" value={newEmp.employeeName} 

                    onChange={(e)=>setNewEmp({...newEmp, employeeName: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" required 

                  />

                  <input 

                    type="text" placeholder="Role (e.g. Developer)" value={newEmp.role} 

                    onChange={(e)=>setNewEmp({...newEmp, role: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" required 

                  />

                  <input 

                    type="email" placeholder="Email Address" value={newEmp.emailAddress} 

                    onChange={(e)=>setNewEmp({...newEmp, emailAddress: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" required 

                  />

                  <input 

                    type="text" placeholder="Product" value={newEmp.product} 

                    onChange={(e)=>setNewEmp({...newEmp, product: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" 

                  />

                  <input 

                    type="text" placeholder="Shift Timings" value={newEmp.shiftTimings} 

                    onChange={(e)=>setNewEmp({...newEmp, shiftTimings: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" 

                  />

                  <input 

                    type="text" placeholder="Core Skills" value={newEmp.coreSkill} 

                    onChange={(e)=>setNewEmp({...newEmp, coreSkill: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" 

                  />

                  <button type="submit" className="md:col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold py-2.5 flex items-center justify-center gap-1">

                    <Plus size={16} /> Save & Add Employee Card

                  </button>

                </form>

              </div>

            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-slate-50 flex justify-end">

              <button 

                onClick={() => setIsEmployeeModalOpen(false)}

                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"

              >

                Close View

              </button>

            </div>

          </div>

        </div>

      )}

      {/* 2. Attrition Management Card Grid Modal */}

      {isAttritionModalOpen && (

        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-rose-50/50">

              <div>

                <h2 className="text-lg font-bold text-gray-900">Attrition & Resignation Tracker (HR Access)</h2>

                <p className="text-xs text-gray-500">Track exit reasons, notice periods, and exit interview feedback.</p>

              </div>

              <button 

                onClick={() => setIsAttritionModalOpen(false)}

                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"

              >

                <X size={18} />

              </button>

            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {attritions.map((item, i) => (

                  <div key={i} className="bg-white border border-rose-100 rounded-xl p-5 shadow-sm hover:border-rose-300 transition-all space-y-3">

                    <div className="flex justify-between items-start">

                      <div>

                        <h4 className="font-bold text-gray-900 text-base">{item.employeeName}</h4>

                        <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded mt-1">

                          {item.role}

                        </span>

                      </div>

                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">

                        {item.product}

                      </span>

                    </div>

                    <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">

                      <div className="flex items-center justify-between">

                        <span className="flex items-center gap-1.5 text-gray-500">

                          <Calendar size={14} className="text-rose-500" /> Resigned:

                        </span>

                        <span className="font-medium text-gray-800">{item.dateOfResignation}</span>

                      </div>

                      <div className="flex items-center justify-between">

                        <span className="flex items-center gap-1.5 text-gray-500">

                          <Clock size={14} className="text-rose-500" /> Last Working Day:

                        </span>

                        <span className="font-medium text-gray-800">{item.lastWorkingDay}</span>

                      </div>

                      <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 space-y-1 mt-2">

                        <p className="font-bold text-rose-900 flex items-center gap-1">

                          <AlertCircle size={13} /> Reason: {item.reasonCategory}

                        </p>

                        <p className="text-rose-800/80 leading-relaxed">{item.reasonDetails}</p>

                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">

                        <p className="font-semibold text-slate-700">Exit Feedback:</p>

                        <p className="text-slate-600 italic">"{item.exitFeedback}"</p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

              <div className="bg-rose-50/40 p-5 rounded-xl border border-rose-100">

                <h4 className="text-sm font-bold text-rose-900 mb-3">Record New Attrition / Resignation</h4>

                <form onSubmit={handleAddAttrition} className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  <input 

                    type="text" placeholder="Employee Name" value={newAttr.employeeName} 

                    onChange={(e)=>setNewAttr({...newAttr, employeeName: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" required 

                  />

                  <input 

                    type="text" placeholder="Role (e.g. Developer)" value={newAttr.role} 

                    onChange={(e)=>setNewAttr({...newAttr, role: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" required 

                  />

                  <input 

                    type="text" placeholder="Product" value={newAttr.product} 

                    onChange={(e)=>setNewAttr({...newAttr, product: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" 

                  />

                  <div className="flex flex-col gap-1">

                    <label className="text-[10px] text-gray-500 font-semibold">Resignation Date</label>

                    <input 

                      type="date" value={newAttr.dateOfResignation} 

                      onChange={(e)=>setNewAttr({...newAttr, dateOfResignation: e.target.value})}

                      className="p-2 bg-white border border-slate-200 rounded-lg text-xs" required 

                    />

                  </div>

                  <div className="flex flex-col gap-1">

                    <label className="text-[10px] text-gray-500 font-semibold">Last Working Day</label>

                    <input 

                      type="date" value={newAttr.lastWorkingDay} 

                      onChange={(e)=>setNewAttr({...newAttr, lastWorkingDay: e.target.value})}

                      className="p-2 bg-white border border-slate-200 rounded-lg text-xs" required 

                    />

                  </div>

                  <input 

                    type="text" placeholder="Reason Category (e.g. Compensation)" value={newAttr.reasonCategory} 

                    onChange={(e)=>setNewAttr({...newAttr, reasonCategory: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs self-end" required 

                  />

                  <input 

                    type="text" placeholder="Detailed Reason for Resigning" value={newAttr.reasonDetails} 

                    onChange={(e)=>setNewAttr({...newAttr, reasonDetails: e.target.value})}

                    className="md:col-span-3 p-2.5 bg-white border border-slate-200 rounded-lg text-xs" required 

                  />

                  <input 

                    type="text" placeholder="Exit Interview Feedback / Comments" value={newAttr.exitFeedback} 

                    onChange={(e)=>setNewAttr({...newAttr, exitFeedback: e.target.value})}

                    className="md:col-span-3 p-2.5 bg-white border border-slate-200 rounded-lg text-xs" 

                  />

                  <button type="submit" className="md:col-span-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold py-2.5 flex items-center justify-center gap-1">

                    <Plus size={16} /> Save Attrition Record

                  </button>

                </form>

              </div>

            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-slate-50 flex justify-end">

              <button 

                onClick={() => setIsAttritionModalOpen(false)}

                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"

              >

                Close View

              </button>

            </div>

          </div>

        </div>

      )}

      {/* 3. Interview Management Card Grid Modal */}

      {isInterviewModalOpen && (

        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-indigo-50/50">

              <div>

                <h2 className="text-lg font-bold text-gray-900">Candidates who attended interview (HR Access)</h2>

                <p className="text-xs text-gray-500">Track candidate interview status, evaluations, and organizational improvement feedback.</p>

              </div>

              <button 

                onClick={() => setIsInterviewModalOpen(false)}

                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"

              >

                <X size={18} />

              </button>

            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* Interview Cards Grid */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {interviews.map((item, i) => (

                  <div key={i} className="bg-white border border-indigo-100 rounded-xl p-5 shadow-sm hover:border-indigo-300 transition-all space-y-3">

                    <div className="flex justify-between items-start">

                      <div>

                        <h4 className="font-bold text-gray-900 text-base">{item.candidateName}</h4>

                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded mt-1">

                          {item.roleApplied}

                        </span>

                      </div>

                      <span className={\`text-xs px-2.5 py-1 rounded-full font-medium ${

                        item.status === 'Selected' ? 'bg-emerald-100 text-emerald-800' : 

                        item.status === 'Hold' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'

                      }\`}>

                        {item.status}

                      </span>

                    </div>

                    <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">

                      <div className="flex items-center justify-between">

                        <span className="flex items-center gap-1.5 text-gray-500">

                          <Calendar size={14} className="text-indigo-500" /> Interview / Call Date:

                        </span>

                        <span className="font-medium text-gray-800">{item.interviewDate}</span>

                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-gray-500">Not Selected Reason:</span>

                        <span className="font-medium text-gray-800">{item.notSelectedReason}</span>

                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-gray-500">For Future Reference:</span>

                        <span className="font-medium text-gray-800">{item.forFutureReference}</span>

                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 mt-1">

                        <p className="font-semibold text-slate-700">Candidate Expectations (Pay / Shift etc):</p>

                        <p className="text-slate-600 italic">"{item.expectations}"</p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

              {/* Add Candidate Interview Form Section */}

              <div className="bg-indigo-50/40 p-5 rounded-xl border border-indigo-100">

                <h4 className="text-sm font-bold text-indigo-900 mb-3">Add Candidate Interview Record</h4>

                <form onSubmit={handleAddInterview} className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  <input 

                    type="text" placeholder="Candidate Name" value={newInterview\.candidateName} 

                    onChange={(e)=>setNewInterview({...newInterview, candidateName: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" required 

                  />

                  <input 

                    type="text" placeholder="Role Applied For" value={newInterview\.roleApplied} 

                    onChange={(e)=>setNewInterview({...newInterview, roleApplied: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" required 

                  />

                  <div className="flex flex-col gap-1">

                    <label className="text-[10px] text-gray-500 font-semibold">Interview / Call Date</label>

                    <input 

                      type="date" value={newInterview\.interviewDate} 

                      onChange={(e)=>setNewInterview({...newInterview, interviewDate: e.target.value})}

                      className="p-2 bg-white border border-slate-200 rounded-lg text-xs" required 

                    />

                  </div>

                  <select 

                    value={newInterview\.status} 

                    onChange={(e)=>setNewInterview({...newInterview, status: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs"

                  >

                    <option value="Selected">Selected</option>

                    <option value="Hold">Hold</option>

                    <option value="Not Selected">Not Selected</option>

                  </select>

                  <input 

                    type="text" placeholder="Not Selected Reason (if applicable)" value={newInterview\.notSelectedReason} 

                    onChange={(e)=>setNewInterview({...newInterview, notSelectedReason: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" 

                  />

                  <input 

                    type="text" placeholder="For Future Reference (Yes/No & notes)" value={newInterview\.forFutureReference} 

                    onChange={(e)=>setNewInterview({...newInterview, forFutureReference: e.target.value})}

                    className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs" 

                  />

                  <input 

                    type="text" placeholder="Candidate Expectations to improve organization (e.g. Pay / Shift)" value={newInterview\.expectations} 

                    onChange={(e)=>setNewInterview({...newInterview, expectations: e.target.value})}

                    className="md:col-span-3 p-2.5 bg-white border border-slate-200 rounded-lg text-xs" 

                  />

                  <button type="submit" className="md:col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold py-2.5 flex items-center justify-center gap-1">

                    <Plus size={16} /> Save Interview Record

                  </button>

                </form>

              </div>

            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-slate-50 flex justify-end">

              <button 

                onClick={() => setIsInterviewModalOpen(false)}

                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors"

              >

                Close View

              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

}

// Main Page Component

export default function HRManagementPage() {

  return (


    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-3 bg-slate-50 sm:space-y-4">

      {/* Top Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-xl font-bold text-slate-900">

            HR Management

          </h1>

          <p className="mt-1 text-xs text-slate-500">

            People, attendance, leave, recruitment and employee insights

          </p>

        </div>


        {/* Search Bar & Profile */}

        <div className="flex items-center gap-3">

          <div className="relative w-full md:w-72">

            <input

              type="text"

              placeholder="Search employee, candidate..."

              className="w-full bg-white border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"

            />

          </div>

          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 shadow-sm">

            SV

          </div>

        </div>

      </div>

      {/* Stats Overview */}

      <div>

        <HRStats />

      </div>


      {/* Row 1: Employee Overview & HR Quick Actions */}

<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        <div className="lg:col-span-7">

          <EmployeeOverview />

        </div>

        <div className="lg:col-span-5">

          <HRQuickActions />

        </div>

      </div>

      {/* Row 2: Attendance Snapshot, Leave Overview, Recruitment Pipeline */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">

        <div className="lg:col-span-5">

          <AttendanceSnapshot />

        </div>

        <div className="lg:col-span-4">

          <LeaveOverview />

        </div>

        <div className="lg:col-span-3">

          <RecruitmentPipeline />

        </div>

      </div>

      {/* Row 3: HR Modules Grid */}

      <div>

        <HrModules />

      </div>

    </div>

  );

}
