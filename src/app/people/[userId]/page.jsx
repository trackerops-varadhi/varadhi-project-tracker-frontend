'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { peopleApi } from '@/lib/api/people.api'
import { useAuthStore } from '@/store/auth.store'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { EmployeeProfilePanel } from '@/components/people/employee-profile-panel'
import { EmployeeFormModal } from '@/components/people/employee-form-modal'
import { Banner, errorMessage } from '@/components/people/ui'

/**
 * One employee's record. admin/hr see anyone; anyone may open their own. The
 * backend decides — a 403 here is shown, not hidden.
 */
export default function EmployeePage({ params }) {
  const { userId } = use(params)
  const mounted = useHasMounted()
  const role = useAuthStore((s) => s.user?.role)
  const isHr = ['admin', 'hr'].includes(role)
  const [employee, setEmployee] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    peopleApi.getEmployee(userId)
      .then((e) => { if (active) { setEmployee(e); setError('') } })
      .catch((err) => { if (active) setError(errorMessage(err, 'Could not load this employee.')) })
    return () => { active = false }
  }, [userId])

  if (!mounted) return null

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <Link href={isHr ? '/people' : '/directory'} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary">
        <ArrowLeft size={14} /> Back
      </Link>
      <Banner error={error} success={notice} />
      {!employee && !error && <p className="text-xs text-slate-400">Loading…</p>}
      {employee && (
        <EmployeeProfilePanel
          employee={employee}
          canReveal={isHr}
          canEdit={isHr}
          onEdit={() => setEditing(true)}
        />
      )}
      {editing && (
        <EmployeeFormModal
          employee={employee}
          onClose={() => setEditing(false)}
          onSaved={(saved) => {
            setEmployee(saved)
            setEditing(false)
            setNotice('Profile updated.')
          }}
        />
      )}
    </div>
  )
}
