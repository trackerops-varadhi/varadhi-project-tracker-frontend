'use client'

import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { EmployeeProfile } from './employee-profile'

// Demo profiles only. Replace these records with employee data when needed.
const MOCK_EMPLOYEES = [
  {
    id: '1', name: 'Ananya Rao', role: 'Project Manager', product: 'Varadhi', status: 'Active',
    joinedDate: '12 Jan 2024', companyExperience: '2 Years 8 Months',
    email: 'ananya@example.com', gender: 'Female', age: 29, maritalStatus: 'Married',
    familyName: 'Rao Kumar', shift: '9:30 AM - 6:30 PM',
    temporaryAddress: 'Chennai, Tamil Nadu', permanentAddress: 'Hyderabad, Telangana',
    maskedAadhaar: 'XXXX XXXX 4521', education: 'B.E Computer Science',
    college: 'Anna University', completionYear: 2019,
    skills: 'Project Management, React', previousCompany: 'ABC Technologies',
    totalExperience: '6 Years', resignationDate: null,
  },
  {
    id: '2', name: 'Rahul Kumar', role: 'Software Engineer', product: 'DeepFace', status: 'Active',
    joinedDate: '18 Mar 2025', companyExperience: '1 Year 6 Months',
    email: 'rahul@example.com', gender: 'Male', age: 26, maritalStatus: 'Single',
    familyName: 'Suresh Kumar', shift: '9:30 AM - 6:30 PM',
    temporaryAddress: 'Bengaluru, Karnataka', permanentAddress: 'Coimbatore, Tamil Nadu',
    maskedAadhaar: 'XXXX XXXX 7832', education: 'B.Tech Information Technology',
    college: 'Demo Institute of Technology', completionYear: 2021,
    skills: 'Python, React, Machine Learning', previousCompany: 'Demo Software Labs',
    totalExperience: '4 Years', resignationDate: null,
  },
  {
    id: '3', name: 'Priya Sharma', role: 'HR Executive', product: 'HR', status: 'On Leave',
    joinedDate: '08 Jul 2024', companyExperience: '2 Years 2 Months',
    email: 'priya@example.com', gender: 'Female', age: 28, maritalStatus: 'Single',
    familyName: 'Rajesh Sharma', shift: '9:00 AM - 6:00 PM',
    temporaryAddress: 'Chennai, Tamil Nadu', permanentAddress: 'Pune, Maharashtra',
    maskedAadhaar: 'XXXX XXXX 6194', education: 'MBA Human Resources',
    college: 'Demo School of Management', completionYear: 2020,
    skills: 'Recruitment, Employee Relations, Payroll', previousCompany: 'Demo People Services',
    totalExperience: '5 Years', resignationDate: null,
  },
  {
    id: '4', name: 'Arjun Reddy', role: 'UI/UX Designer', product: 'Varadhi', status: 'Active',
    joinedDate: '10 Nov 2025', companyExperience: '10 Months',
    email: 'arjun@example.com', gender: 'Male', age: 25, maritalStatus: 'Single',
    familyName: 'Venkat Reddy', shift: '10:00 AM - 7:00 PM',
    temporaryAddress: 'Hyderabad, Telangana', permanentAddress: 'Vijayawada, Andhra Pradesh',
    maskedAadhaar: 'XXXX XXXX 2058', education: 'Bachelor of Design',
    college: 'Demo Institute of Design', completionYear: 2022,
    skills: 'Figma, User Research, Prototyping', previousCompany: 'Demo Design Studio',
    totalExperience: '3 Years', resignationDate: null,
  },
]

function EmployeeStatus({ status }) {
  const color = status === 'Active'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'On Leave'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-slate-100 text-slate-600'

  return <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${color}`}>{status}</span>
}

// Pass employee records here when backend data is available.
export function EmployeeOverview({ employees = MOCK_EMPLOYEES }) {
  return (
    <section aria-labelledby="employee-overview-title" className="h-full min-w-0 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <h2 id="employee-overview-title" className="text-xs font-semibold text-slate-900">Employee Overview</h2>
      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">Employee records and quick profile access</p>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="border-b border-slate-200 text-[10px] text-slate-500">
            <tr>
              {['Employee', 'Role', 'Product', 'Status'].map((heading) => (
                <th key={heading} scope="col" className="px-2 py-1 font-medium first:pl-0">{heading}</th>
              ))}
              <th scope="col" className="py-1"><span className="sr-only">Profile</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => (
              <tr key={employee.id} className="text-slate-500">
                <th scope="row" className="py-1 pr-2 font-medium text-slate-800">{employee.name}</th>
                <td className="px-2 py-1">{employee.role}</td>
                <td className="px-2 py-1">{employee.product}</td>
                <td className="px-2 py-1"><EmployeeStatus status={employee.status} /></td>
                <td className="py-1 pl-2 text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" aria-label={`View ${employee.name}'s profile`} className="rounded text-xs font-semibold text-violet-600 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600">View</button>
                    </DialogTrigger>
                    <EmployeeProfile employee={employee} />
                  </Dialog>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-slate-500">No employees to display.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
