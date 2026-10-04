'use client'

import { CreateModal } from '@/components/shared/create-modal'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { projectsApi } from '@/lib/api/projects.api'
import { useUsers, activeUsers, groupUsersForManagerPicker } from '@/hooks/use-users'
import { getInitials, getAvatarColor, cn } from '@/utils'

export function CreateProjectModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    // '' means "assign me as manager" — the backend already falls back to the
    // creator when managerId is absent.
    managerId: '',
    memberIds: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Manager picker and member checkboxes both read from this one fetch; the
  // old separate projectsApi.getMembers() effect duplicated the same /users
  // request and its result was no longer rendered anywhere.
  const { users, isLoading: usersLoading, error: usersError, reload: reloadUsers } = useUsers()
  const { privileged, employees } = groupUsersForManagerPicker(users)
  const selectableMembers = activeUsers(users)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  function toggleMember(userId) {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId],
    }))
  }

  function validate() {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required.'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.'
    }
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    try {
      // '' -> null so the backend's `managerId || req.user.id` fallback
      // (assign the creator) reads clearly rather than relying on '' being falsy.
      await projectsApi.create({
        ...formData,
        managerId: formData.managerId || null,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setErrors({
        general:
          err.response?.data?.message ||
          'Failed to create project. Try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CreateModal title="Create New Project" onClose={onClose} onSubmit={handleSubmit} isSubmitting={isLoading} submitLabel="Create Project">
          {/* General Error */}
          {errors.general && (
            <div className="col-span-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {errors.general}
            </div>
          )}

          {/* Project Name */}
          <div className="col-span-6 space-y-1.5">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Varadhi Tracker Backend"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="col-span-6 space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Brief description of the project..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none placeholder:text-slate-400"
            />
          </div>

{/* Dates + Project Manager */}
<div className="col-span-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

  {/* Start Date */}
  <div className="space-y-1.5">
    <Label htmlFor="startDate">Start Date *</Label>
    <Input
      id="startDate"
      name="startDate"
      type="date"
      value={formData.startDate}
      onChange={handleChange}
      disabled={isLoading}
    />
    {errors.startDate && (
      <p className="text-red-500 text-xs">{errors.startDate}</p>
    )}
  </div>

  {/* End Date */}
  <div className="space-y-1.5">
    <Label htmlFor="endDate">End Date</Label>
    <Input
      id="endDate"
      name="endDate"
      type="date"
      value={formData.endDate}
      onChange={handleChange}
      disabled={isLoading}
    />
  </div>

  {/* Project Manager */}
  <div className="space-y-1.5">
    <Label htmlFor="managerId">Project Manager</Label>

    <select
      id="managerId"
      name="managerId"
      value={formData.managerId}
      onChange={handleChange}
      disabled={isLoading || usersLoading}
      className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
    >
      <option value="">
        {usersLoading ? 'Loading users...' : 'Assign me as manager'}
      </option>

      {privileged.length > 0 && (
        <optgroup label="Managers & Admins">
          {privileged.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </optgroup>
      )}

      {employees.length > 0 && (
        <optgroup label="Employees">
          {employees.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  </div>

</div>

<p className="col-span-6 -mt-2 text-xs text-slate-400">
  The manager receives overdue alerts, escalations and milestone updates.
</p>

          {/* Team members — each person selected is notified they were added. */}
          <div className="col-span-6 space-y-1.5">
            <Label>Team Members</Label>
            {usersLoading ? (
              <p className="text-xs text-slate-400">Loading users...</p>
            ) : usersError ? (
              <p className="text-amber-600 text-xs">
                Couldn&apos;t load users.{' '}
                <button type="button" onClick={reloadUsers} className="underline font-medium">
                  Retry
                </button>
              </p>
            ) : selectableMembers.length === 0 ? (
              <p className="text-xs text-slate-400">No other active users yet.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {selectableMembers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.memberIds.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                      disabled={isLoading}
                      className="rounded border-slate-300"
                    />
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0',
                        getAvatarColor(u.name || '?')
                      )}
                    >
                      {getInitials(u.name || '?')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-slate-700 truncate">{u.name}</span>
                      <span className="block text-xs text-slate-400 truncate capitalize">{u.role}</span>
                    </span>
                  </label>
                ))}
                </div>
              </div>
            )}
            <p className="text-xs text-slate-400">
              Members are notified they were added, and can be @mentioned in comments.
            </p>
          </div>

    </CreateModal>
  )
}
