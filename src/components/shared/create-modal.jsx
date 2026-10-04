'use client'

import { X, Loader2 } from 'lucide-react'
import { KeyboardModal } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function CreateModal({ title, onClose, onSubmit, isSubmitting, submitLabel, children }) {
  return (
    <KeyboardModal title={title} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="create-modal-panel flex h-[84dvh] max-h-[min(720px,calc(100dvh-2rem))] w-full max-w-5xl min-w-0 flex-col overflow-hidden rounded-2xl bg-card shadow-xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`} className="rounded-lg p-1 text-slate-400 transition hover:bg-background hover:text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="create-modal-body grid min-h-0 flex-1 grid-cols-6 content-start gap-4 overflow-y-auto overscroll-contain px-5 py-4">
            {children}
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-5 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-hover">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : submitLabel}
            </Button>
          </div>
        </form>
      </div>
      <style>{`
        .create-modal-body { scrollbar-gutter:stable; }
        .create-modal-body > div,.create-modal-body .contents > div { min-width:0; }
        .create-modal-body input:not([type="checkbox"]),.create-modal-body select { width:100%; min-width:0; height:36px; }
        .create-modal-body textarea { display:block; height:96px; min-height:96px; }
        @media(max-width:639px) {
          .create-modal-panel > div:first-child { padding:12px; }
          .create-modal-panel form > div { padding:12px; }
          .create-modal-body { gap:12px; }
          .create-modal-body > div:not(.contents),.create-modal-body .contents > div { grid-column:1/-1; }
        }
      `}</style>
    </KeyboardModal>
  )
}
