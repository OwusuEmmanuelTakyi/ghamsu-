import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { BadgeCheck, CheckCircle2, Loader2, MessageCircle, Reply } from 'lucide-react'
import {
  addComment, fetchCommentState, toThreads, validateComment,
  type CommentInput, type CommentState, type PublicComment,
} from '../../lib/comments'

// Comments under a post. Text is always rendered as plain text by React
// (never as HTML); whitespace-pre-line keeps the line breaks people typed.

const REMEMBER_KEY = 'ghamsu-commenter'

function remembered(): { name: string; email: string } {
  try {
    const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY) ?? 'null')
    return { name: String(saved?.name ?? ''), email: String(saved?.email ?? '') }
  } catch {
    return { name: '', email: '' }
  }
}

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })

const inputClass =
  'w-full rounded-lg border bg-secondary px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none'

export function CommentsSection({ postId }: { postId: string }) {
  const [state, setState] = useState<CommentState | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const load = useCallback(async () => setState(await fetchCommentState(postId)), [postId])
  useEffect(() => { load() }, [load])

  if (!state) {
    return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading comments" /></div>
  }
  if (!state.available) return null

  const threads = toThreads(state.comments)
  const count = state.comments.length

  return (
    <section aria-labelledby="comments-heading" className="my-10 sm:my-12">
      <h2 id="comments-heading" className="mb-6 flex items-center gap-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
        <MessageCircle className="h-6 w-6 text-accent" aria-hidden="true" />
        Comments <span className="text-muted-foreground">({count})</span>
      </h2>

      {state.open ? (
        <div className="mb-10 rounded-lg border border-border bg-card p-5 sm:p-6">
          <h3 className="mb-1 font-semibold">Leave a comment</h3>
          {state.requireApproval && <p className="mb-4 text-sm text-muted-foreground">Comments are reviewed before they appear.</p>}
          <CommentForm postId={postId} parentId={null} onPosted={load} requireApproval={state.requireApproval} />
        </div>
      ) : (
        <p className="mb-8 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">Comments are closed on this post.</p>
      )}

      {threads.length === 0 ? (
        <p className="text-muted-foreground">{state.open ? 'No comments yet. Be the first to share your thoughts.' : 'No comments.'}</p>
      ) : (
        <ol className="space-y-6">
          {threads.map((thread) => (
            <li key={thread.id} className="border-b border-border pb-6 last:border-0">
              <CommentItem comment={thread} />
              {state.open && (
                <button type="button" onClick={() => setReplyTo(replyTo === thread.id ? null : thread.id)}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent" aria-expanded={replyTo === thread.id}>
                  <Reply className="h-4 w-4" /> Reply
                </button>
              )}
              {(thread.replies.length > 0 || replyTo === thread.id) && (
                <ol className="ml-4 mt-4 space-y-4 border-l-2 border-border pl-4 sm:ml-8 sm:pl-6">
                  {thread.replies.map((reply) => <li key={reply.id}><CommentItem comment={reply} /></li>)}
                  {replyTo === thread.id && (
                    <li className="rounded-lg border border-border bg-card p-4">
                      <p className="mb-3 text-sm font-medium">Reply to {thread.author_name}</p>
                      <CommentForm postId={postId} parentId={thread.id} requireApproval={state.requireApproval}
                        onPosted={async () => { await load() }} onCancel={() => setReplyTo(null)} />
                    </li>
                  )}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function CommentItem({ comment }: { comment: PublicComment }) {
  return (
    <article>
      <header className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold text-foreground">{comment.author_name}</span>
        {comment.is_staff_reply && (
          <span className="inline-flex items-center gap-1 rounded bg-[#003D82] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" /> GHAMSU
          </span>
        )}
        <time dateTime={comment.created_at} className="text-xs text-muted-foreground">{formatWhen(comment.created_at)}</time>
      </header>
      <p className="whitespace-pre-line break-words leading-relaxed text-foreground">{comment.body}</p>
    </article>
  )
}

function CommentForm({ postId, parentId, requireApproval, onPosted, onCancel }: {
  postId: string
  parentId: string | null
  requireApproval: boolean
  onPosted: () => void | Promise<void>
  onCancel?: () => void
}) {
  const [values, setValues] = useState<CommentInput>(() => ({ ...remembered(), body: '' }))
  const [errors, setErrors] = useState<Partial<Record<keyof CommentInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const honeypot = useRef<HTMLInputElement>(null)
  const prefix = parentId ? `reply-${parentId.slice(0, 8)}` : 'comment'

  const set = (name: keyof CommentInput, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setFormError(null)
    setSuccess(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSuccess(null)
    // Bots fill the hidden field. Pretend it worked, and send nothing.
    if (honeypot.current?.value) {
      setValues((prev) => ({ ...prev, body: '' }))
      return setSuccess(requireApproval ? 'Thank you! Your comment will appear once approved.' : 'Thank you! Your comment has been posted.')
    }
    const found = validateComment(values)
    setErrors(found)
    if (Object.keys(found).length) return setFormError('Please check the highlighted fields.')

    setSending(true)
    const result = await addComment(postId, values, parentId)
    setSending(false)
    if (!result.ok) {
      if (result.field) setErrors((prev) => ({ ...prev, [result.field!]: result.message }))
      setFormError(result.message)
      if (result.closed) await onPosted()
      return
    }
    try { localStorage.setItem(REMEMBER_KEY, JSON.stringify({ name: values.name.trim(), email: values.email.trim() })) } catch { /* private mode */ }
    setValues((prev) => ({ ...prev, body: '' }))
    setSuccess(result.status === 'pending' ? 'Thank you! Your comment will appear once approved.' : 'Thank you! Your comment has been posted.')
    if (result.status === 'visible') await onPosted()
  }

  const field = (name: keyof CommentInput) => ({
    id: `${prefix}-${name}`,
    value: values[name],
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${prefix}-${name}-error` : undefined,
    className: `${inputClass} ${errors[name] ? 'border-destructive' : 'border-border'}`,
  })
  const error = (name: keyof CommentInput) =>
    errors[name] ? <p id={`${prefix}-${name}-error`} className="text-sm text-destructive">{errors[name]}</p> : null

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor={`${prefix}-website`}>Website</label>
        <input ref={honeypot} id={`${prefix}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={`${prefix}-name`} className="block text-sm font-medium">Name <span className="text-destructive">*</span></label>
          <input {...field('name')} autoComplete="name" maxLength={60} onChange={(e) => set('name', e.target.value)} />
          {error('name')}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${prefix}-email`} className="block text-sm font-medium">Email <span className="text-destructive">*</span></label>
          <input {...field('email')} type="email" inputMode="email" autoComplete="email" maxLength={254} onChange={(e) => set('email', e.target.value)} />
          {errors.email ? error('email') : <p className="text-xs text-muted-foreground">Won't be published.</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-body`} className="block text-sm font-medium">{parentId ? 'Reply' : 'Comment'} <span className="text-destructive">*</span></label>
        <textarea {...field('body')} rows={parentId ? 3 : 4} maxLength={1500} onChange={(e) => set('body', e.target.value)} className={`${field('body').className} resize-y`} />
        <div className="flex justify-between gap-2">
          {errors.body ? error('body') : <p className="text-xs text-muted-foreground">Plain text only. Links aren't allowed.</p>}
          <span className="text-xs text-muted-foreground" aria-hidden="true">{values.body.trim().length}/1500</span>
        </div>
      </div>

      {formError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{formError}</p>}
      {success && (
        <p className="flex items-center gap-2 rounded-lg bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-400" role="status">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {success}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={sending}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60">
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {sending ? 'Posting…' : parentId ? 'Post reply' : 'Post comment'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:border-accent">Cancel</button>
        )}
      </div>
    </form>
  )
}
