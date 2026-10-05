'use client'

import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { EmployeeProfile } from './employee-profile'
import { EMPLOYEE_STATUS_LABELS, formatTenure } from '@/constants/people'
import { formatDate } from '@/utils'

// Shapes a /api/people/employees record into the fields EmployeeProfile
// renders. Fields the HR module does not capture yet (addresses, Aadhaar,
// education…) are simply absent and render as "—".
function toProfile(employee) {
  const status = employee.status === 'active' && employee.onLeaveToday
    ? 'On Leave'
    : EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status

  return {
    id: employee.id,
    name: employee.name ?? 'Unknown user',
    role: employee.designation,
    product: employee.product ?? '—',
    status,
    email: employee.email,
    shift: employee.shift,
    skills: employee.coreSkills?.length ? employee.coreSkills.join(', ') : null,
    joinedDate: employee.dateOfJoining ? formatDate(employee.dateOfJoining, 'dd MMM yyyy') : null,
    companyExperience: formatTenure(employee.tenureMonths),
    resignationDate: employee.exit ? formatDate(employee.exit.resignationDate, 'dd MMM yyyy') : null,
  }
}

function EmployeeStatus({ status }) {
  const color = status === 'Active'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'On Leave'
      ? 'bg-amber-50 text-amber-700'
      : status === 'Notice Period'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-slate-100 text-slate-600'

  return <Badge variant="outline" className={`h-auto border-0 px-1.5 py-0.5 text-[10px] font-semibold ${color}`}>{status}</Badge>
}

// `employees` is the /api/people/employees list, loaded by HrDashboard.
export function EmployeeOverview({ employees = [], loading = false }) {
  const rows = employees.map(toProfile)

  return (
    <Card asChild layout="custom">
    <section aria-labelledby="employee-overview-title" className="h-full min-w-0 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <h2 id="employee-overview-title" className="text-xs font-semibold text-slate-900">Employee Overview</h2>
      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">Employee records and quick profile access</p>

      <div role="region" aria-label="Employee directory" tabIndex={0} className="mt-2 max-w-full overflow-x-auto focus-visible:outline-primary">
        <Table scrollable={false} className="w-full min-w-[520px] text-left text-xs">
          <thead className="border-b border-slate-200 text-[10px] text-slate-500">
            <tr>
              {['Employee', 'Role', 'Product', 'Status'].map((heading) => (
                <th key={heading} scope="col" className="px-2 py-1 font-medium first:pl-0">{heading}</th>
              ))}
              <th scope="col" className="py-1"><span className="sr-only">Profile</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((employee) => (
              <tr key={employee.id} className="text-slate-500">
                <th scope="row" className="py-1 pr-2 font-medium text-slate-800">{employee.name}</th>
                <td className="px-2 py-1">{employee.role}</td>
                <td className="px-2 py-1">{employee.product}</td>
                <td className="px-2 py-1"><EmployeeStatus status={employee.status} /></td>
                <td className="py-1 pl-2 text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" aria-label={`View ${employee.name}'s profile`} className="rounded text-xs font-semibold text-primary hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">View</button>
                    </DialogTrigger>
                    <EmployeeProfile employee={employee} />
                  </Dialog>
                </td>
              </tr>
            ))}
            {loading && (
              <tr><td colSpan={5} className="py-6 text-center text-slate-500">Loading employees…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  No employees yet. Add them from HR Workspaces → Employee Details.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </section>
    </Card>
  )
}
