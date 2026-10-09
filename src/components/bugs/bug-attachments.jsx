'use client'

import { useState, useRef } from 'react'
import { Paperclip, Upload, Loader2, Trash2, Download, FileText, Image as ImageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { bugsApi } from '@/lib/api/bugs.api'
import { useConfirm } from '@/components/shared/confirm-dialog'
import { useAuthStore } from '@/store/auth.store'
import { MAX_FILE_SIZE } from '@/constants'
import { formatFileSize, formatRelativeTime, cn } from '@/utils'

// Extensions the backend's multer allow-list accepts. Checking here too means
// an obviously-wrong file is refused before it is uploaded and rejected.
const ACCEPTED = '.png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx,.zip'
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg']

/**
 * Attachments panel (§14).
 *
 * Uploads go through the bug attachments endpoint, which reuses the same
 * Supabase storage pipeline and 10MB/type policy as the Documents module —
 * no second file-storage architecture.
 */
export function BugAttachments({ bugId, attachments = [], onChanged }) {
  const confirm = useConfirm()
  const { user } = useAuthStore()
  const canModerate = ['admin', 'qc'].includes(user?.role)

  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    // Reset the input so re-picking the same file still fires a change event.
    event.target.value = ''
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError(`"${file.name}" is ${formatFileSize(file.size)} — the limit is 10MB.`)
      return
    }

    setIsUploading(true)
    setError(null)
    setProgress(0)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await bugsApi.uploadAttachment(bugId, formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      await onChanged?.()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Upload failed. Check the file type and size, then try again.'
      )
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  async function handleDelete(attachment) {
    const ok = await confirm({
      title: 'Delete this attachment?',
      message: 'The file is removed from the bug and from Documents. This cannot be undone.',
      subject: attachment.fileName,
    })
    if (!ok) return
    setDeletingId(attachment.id)
    setError(null)
    try {
      await bugsApi.deleteAttachment(bugId, attachment.id)
      await onChanged?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the attachment.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5" id="attachments">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground inline-flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-slate-400" />
          Attachments
          <span className="text-xs bg-slate-100 text-muted-foreground px-1.5 py-0.5 rounded-full">
            {attachments.length}
          </span>
        </h3>

        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{progress || 0}%</>
            ) : (
              <><Upload className="w-3.5 h-3.5 mr-1.5" />Upload</>
            )}
          </Button>
        </>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-violet-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {attachments.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">
          No attachments. Screenshots and logs help a developer reproduce the defect.
        </p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((a) => {
            const isImage = IMAGE_EXTENSIONS.includes(String(a.fileType || '').toLowerCase())
            const Icon = isImage ? ImageIcon : FileText
            const canDelete = canModerate || a.uploadedBy?.id === user?.id

            return (
              <li
                key={a.id}
                className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-background transition-colors"
              >
                {/* Image thumbnails make a screenshot recognisable without opening it.
                    A plain <img> rather than next/image: these are arbitrary
                    Supabase storage URLs, and next/image would need that host
                    allow-listed in next.config — a 40px thumbnail is not worth
                    coupling the module to deployment configuration. */}
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.url}
                    alt={a.fileName}
                    className="w-10 h-10 rounded object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <span className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-400" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">{a.fileName}</p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(a.fileSize)}
                    {a.uploadedBy?.name ? ` · ${a.uploadedBy.name}` : ''}
                    {` · ${formatRelativeTime(a.createdAt)}`}
                  </p>
                </div>

                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-foreground p-1.5 rounded hover:bg-slate-100"
                  aria-label={`Open ${a.fileName}`}
                  title="Preview / download"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(a)}
                    disabled={deletingId === a.id}
                    className={cn(
                      'text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50',
                      deletingId === a.id && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label={`Delete ${a.fileName}`}
                  >
                    {deletingId === a.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
