'use client'

import { useEffect, useState } from 'react'

import { peopleApi } from '@/lib/api/people.api'
import { EmployeeProfilePanel } from './employee-profile-panel'
import { Banner, Field, errorMessage, inputClass, primaryButton } from './ui'

/**
 * Your own HR record. Everyone may view it and edit their two addresses —
 * nothing else (plan §3.2); HR maintains the rest.
 */
export function MyProfile() {
  const [profile, setProfile] = useState(undefined) // undefined = loading, null = none
  const [form, setForm] = useState({ temporaryAddress: '', permanentAddress: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    peopleApi.getMe()
      .then((p) => {
        if (!active) return
        setProfile(p)
        if (p) setForm({ temporaryAddress: p.temporaryAddress ?? '', permanentAddress: p.permanentAddress ?? '' })
      })
      .catch((err) => { if (active) { setProfile(null); setError(errorMessage(err, 'Could not load your profile.')) } })
    return () => { active = false }
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      setProfile(await peopleApi.updateMyAddresses(form))
      setNotice('Addresses saved.')
    } catch (err) {
      setError(errorMessage(err, 'Could not save your addresses.'))
    } finally {
      setSaving(false)
    }
  }

  if (profile === undefined) return <p className="text-xs text-slate-400">Loading…</p>
  if (profile === null) {
    return (
      <div className="space-y-2">
        <Banner error={error} />
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          HR has not created your employee profile yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={save} className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/40 p-4">
        <h2 className="text-sm font-semibold text-slate-800">Update my addresses</h2>
        <Banner error={error} success={notice} />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Temporary address">
            <textarea className={inputClass} rows={2} maxLength={1000} value={form.temporaryAddress}
              onChange={(e) => setForm({ ...form, temporaryAddress: e.target.value })} />
          </Field>
          <Field label="Permanent address">
            <textarea className={inputClass} rows={2} maxLength={1000} value={form.permanentAddress}
              onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} />
          </Field>
        </div>
        <button type="submit" className={primaryButton} disabled={saving}>{saving ? 'Saving…' : 'Save addresses'}</button>
        <p className="text-[10px] text-slate-500">Other details are maintained by HR — contact them for corrections.</p>
      </form>
      <EmployeeProfilePanel employee={profile} />
    </div>
  )
}
