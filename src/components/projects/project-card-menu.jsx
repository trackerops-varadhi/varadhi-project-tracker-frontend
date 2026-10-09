'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal, Pencil,
  Archive, Trash2, Eye
} from 'lucide-react'
import { projectsApi } from '@/lib/api/projects.api'
import { useConfirm } from '@/components/shared/confirm-dialog'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/utils'

export function ProjectCardMenu({ project, onUpdated }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const confirm = useConfirm()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isAdmin   = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const canEdit   = isAdmin || isManager
  const canDelete = isAdmin

  async function handleArchive() {
    // Archiving is reversible, so it is a warning rather than a danger.
    const ok = await confirm({
      title: 'Archive this project?',
      message: 'It moves out of the active lists. Its tasks and documents stay, and you can set it back to active later.',
      subject: project.name,
      tone: 'warning',
      confirmLabel: 'Archive',
      busyLabel: 'Archiving…',
    })
    if (!ok) return
    setIsLoading(true)
    setOpen(false)
    try {
      await projectsApi.archive(project.id)
      onUpdated?.()
    } catch (err) {
      alert('Failed to archive project.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Permanently delete this project?',
      message: 'Its tasks, members, comments and documents are deleted with it. This cannot be undone — archive it instead if you only want it out of the way.',
      subject: project.name,
    })
    if (!ok) return
    setIsLoading(true)
    setOpen(false)
    try {
      await projectsApi.delete(project.id)
      onUpdated?.()
    } catch (err) {
      alert('Failed to delete project.')
    } finally {
      setIsLoading(false)
    }
  }

  // Nothing to show if no permissions
  if (!canEdit && !canDelete) return null

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); setOpen(!open) }}
        disabled={isLoading}
        className="p-1 text-slate-400 hover:text-muted-foreground rounded-lg hover:bg-background disabled:opacity-50"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-7 w-44 bg-card border border-border rounded-xl shadow-lg z-20 py-1">

            {/* View */}
            <button
              onClick={(e) => {
                e.preventDefault()
                setOpen(false)
                router.push(`/projects/${project.id}`)
              }}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background flex items-center gap-2"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              View Details
            </button>

            {/* Edit */}
            {canEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  router.push(`/projects/${project.id}?edit=true`)
                }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-400" />
                Edit Project
              </button>
            )}

            {/* Archive */}
            {canEdit && project.status !== 'archived' && (
              <button
                onClick={(e) => { e.preventDefault(); handleArchive() }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background flex items-center gap-2"
              >
                <Archive className="w-3.5 h-3.5 text-slate-400" />
                Archive
              </button>
            )}

            {/* Delete */}
            {canDelete && (
              <>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={(e) => { e.preventDefault(); handleDelete() }}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}