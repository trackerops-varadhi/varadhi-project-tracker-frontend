'use client'

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

const MOCK_EMPLOYEES = [
  { id: '1', name: 'Ananya Rao', role: 'Project Manager', product: 'Varadhi', status: 'Active' },
  { id: '2', name: 'Rahul Kumar', role: 'Software Engineer', product: 'DeepFace', status: 'Active' },
  { id: '3', name: 'Priya Sharma', role: 'HR Executive', product: 'HR', status: 'On Leave' },
  { id: '4', name: 'Arjun Reddy', role: 'UI/UX Designer', product: 'Varadhi', status: 'Active' },
]

function EmployeeStatus({ status }) {
  const color = status === 'Active'
    ? 'bg-emerald-50 text-emerald-700'
    : status === 'On Leave'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-slate-100 text-slate-600'

  return <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${color}`}>{status}</span>
}

// Pass employee records here when backend data is available.
export function EmployeeOverview({ employees = MOCK_EMPLOYEES }) {
  return (
    <section aria-labelledby="employee-overview-title" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 id="employee-overview-title" className="text-sm font-semibold text-slate-900">Employee Overview</h2>
      <p className="mt-1 text-xs text-slate-500">Active employees and quick profile access</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="border-b border-slate-200 text-[10px] text-slate-500">
            <tr>
              {['Employee', 'Role', 'Product', 'Status'].map((heading) => (
                <th key={heading} scope="col" className="px-2 py-2 font-medium first:pl-0">{heading}</th>
              ))}
              <th scope="col" className="py-2"><span className="sr-only">Profile</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => (
              <tr key={employee.id} className="text-slate-500">
                <th scope="row" className="py-3 pr-2 font-medium text-slate-800">{employee.name}</th>
                <td className="px-2 py-3">{employee.role}</td>
                <td className="px-2 py-3">{employee.product}</td>
                <td className="px-2 py-3"><EmployeeStatus status={employee.status} /></td>
                <td className="py-3 pl-2 text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" aria-label={`View ${employee.name}'s profile`} className="rounded text-xs font-semibold text-violet-600 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600">View</button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{employee.name}</DialogTitle>
                        <DialogDescription>Employee profile overview</DialogDescription>
                      </DialogHeader>
                      <dl className="space-y-3 text-sm">
                        <div><dt className="text-xs text-slate-500">Role</dt><dd className="mt-1">{employee.role}</dd></div>
                        <div><dt className="text-xs text-slate-500">Product</dt><dd className="mt-1">{employee.product}</dd></div>
                        <div><dt className="mb-1 text-xs text-slate-500">Status</dt><dd><EmployeeStatus status={employee.status} /></dd></div>
                      </dl>
                    </DialogContent>
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
