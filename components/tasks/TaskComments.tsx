'use client'

import { useState, useTransition } from 'react'
import { TaskComment } from '@/types/database'
import { createTaskComment, deleteTaskComment } from '@/app/dashboard/tasks/comment-actions'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Send, Trash2, Loader2 } from 'lucide-react'

type CommentWithProfile = TaskComment & {
  profiles: { full_name: string; avatar_url: string | null } | null
}

interface TaskCommentsProps {
  taskId: string
  comments: CommentWithProfile[]
  currentUserId?: string
}

export function TaskComments({ taskId, comments: initial, currentUserId }: TaskCommentsProps) {
  const [comments, setComments] = useState(initial)
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setBody('')

    startTransition(async () => {
      await createTaskComment(taskId, text)
      // Re-fetch is handled by revalidatePath; for instant feedback we add optimistically
      const optimistic: CommentWithProfile = {
        id: `temp-${Date.now()}`,
        task_id: taskId,
        user_id: currentUserId ?? null,
        body: text,
        created_at: new Date().toISOString(),
        profiles: null,
      }
      setComments((prev) => [...prev, optimistic])
    })
  }

  function handleDelete(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id))
    startTransition(async () => {
      await deleteTaskComment(id)
    })
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.round(diffMs / 60000)
    if (diffMins < 1) return 'agora mesmo'
    if (diffMins < 60) return `${diffMins}min atrás`
    const diffHours = Math.round(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Thread */}
      <div className="flex flex-col gap-3">
        {comments.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">
            Nenhum comentário ainda.
          </p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3 group">
            <Avatar
              name={comment.profiles?.full_name ?? 'U'}
              size="sm"
              variant="default"
              className="shrink-0 mt-0.5"
            />
            <div className="flex-1 bg-surface-muted rounded-lg px-3 py-2 space-y-0.5">
              <div className="flex items-baseline gap-2">
                <p className="text-xs font-semibold text-text-primary">
                  {comment.profiles?.full_name ?? 'Usuário'}
                </p>
                <p className="text-[10px] text-text-muted">{formatDate(comment.created_at)}</p>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{comment.body}</p>
            </div>
            {currentUserId && comment.user_id === currentUserId && (
              <button
                onClick={() => handleDelete(comment.id)}
                className={cn(
                  'opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-text-muted hover:text-status-danger',
                )}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          placeholder="Adicionar comentário…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as unknown as React.FormEvent)
            }
          }}
          rows={2}
          className={cn(
            'flex-1 resize-none text-sm rounded-lg border border-border bg-surface px-3 py-2',
            'text-text-primary placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary',
            'transition-colors duration-150',
          )}
        />
        <button
          type="submit"
          disabled={!body.trim() || pending}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary text-white shrink-0',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'hover:bg-brand-primary-hover transition-colors duration-150',
          )}
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  )
}
