'use client'

import { useState } from 'react'
import { Loader2, MessageSquare, Pencil, Trash2, X, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { bugsApi } from '@/lib/api/bugs.api'
import { useAuthStore } from '@/store/auth.store'
import { formatRelativeTime, formatExactTime, getInitials, getAvatarColor, cn } from '@/utils'

/**
 * Comment thread for a bug (§13).
 *
 * Comments are persisted server-side and shown oldest-first, using the same
 * avatar helpers as the rest of the app. Editing is limited to the author;
 * deletion also allows a manager/admin to moderate — both rules are enforced
 * again on the backend, this only hides controls that would be refused.
 */
export function BugComments({ bugId, comments = [], onChanged }) {
  const { user } = useAuthStore()
  const canModerate = ['admin', 'qc'].includes(user?.role)

  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handlePost(e) {
    e.preventDefault()
    if (!content.trim()) return

    setIsPosting(true)
    setError(null)
    try {
      await bugsApi.addComment(bugId, content.trim())
      setContent('')
      await onChanged?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post the comment.')
    } finally {
      setIsPosting(false)
    }
  }

  async function handleSaveEdit(commentId) {
    if (!editValue.trim()) return
    setIsSaving(true)
    setError(null)
    try {
      await bugsApi.updateComment(bugId, commentId, editValue.trim())
      setEditingId(null)
      setEditValue('')
      await onChanged?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the comment.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm('Delete this comment?')) return
    setError(null)
    try {
      await bugsApi.deleteComment(bugId, commentId)
      await onChanged?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete the comment.')
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5" id="comments">
      <h3 className="text-sm font-semibold text-foreground mb-4 inline-flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-slate-400" />
        Comments
        <span className="text-xs bg-slate-100 text-muted-foreground px-1.5 py-0.5 rounded-full">
          {comments.length}
        </span>
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {/* Thread — oldest first, so it reads as a conversation */}
      <div className="space-y-4 mb-5">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No comments yet. Add the first one below.
          </p>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.author?.id === user?.id
            const isEditing = editingId === comment.id

            return (
              <div key={comment.id} className="flex gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                  getAvatarColor(comment.author?.name || '?')
                )}>
                  {getInitials(comment.author?.name || '?')}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {comment.author?.name || 'Unknown user'}
                    </span>
                    <span
                      className="text-xs text-slate-400"
                      title={formatExactTime(comment.createdAt)}
                    >
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                    {comment.edited && (
                      <span className="text-xs text-slate-400 italic">edited</span>
                    )}

                    {(isAuthor || canModerate) && !isEditing && (
                      <span className="ml-auto flex items-center gap-1">
                        {isAuthor && (
                          <button
                            type="button"
                            onClick={() => { setEditingId(comment.id); setEditValue(comment.content) }}
                            className="text-slate-400 hover:text-foreground p-1 rounded hover:bg-background"
                            aria-label="Edit comment"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-1.5 space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={3}
                        disabled={isSaving}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={isSaving || !editValue.trim()}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          {isSaving
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <><Check className="w-3 h-3 mr-1" />Save</>}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingId(null); setEditValue('') }}
                          disabled={isSaving}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap mt-0.5 break-words">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handlePost} className="border-t border-border pt-4 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Add a comment..."
          disabled={isPosting}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none placeholder:text-slate-400"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPosting || !content.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isPosting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Posting...</>
              : 'Add Comment'}
          </Button>
        </div>
      </form>
    </div>
  )
}
