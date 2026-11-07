// Public comments on posts (migration 0007). Visitors read the
// post_comments_public view, which has no email column, and add comments
// only through the add_post_comment() database function.
import { supabase } from './supabase'

export interface PublicComment {
  id: string
  post_id: string
  parent_id: string | null
  author_name: string
  body: string
  is_staff_reply: boolean
  created_at: string
}

export interface CommentThread extends PublicComment {
  replies: PublicComment[]
}

/**
 * Same idea as link_pattern in add_post_comment(): web addresses, common
 * short links, or a word directly followed by a common domain ending.
 */
export const LINK_PATTERN =
  /(https?:\/\/|www\.|(wa|t)\.me\/|bit\.ly\/|[a-z0-9-]+\.(com|net|org|info|biz|io|xyz|ru|online|site|website|top|shop|store|click|tk|ml|ga|cf|gq|edu|gov|gh|uk)(\b|\/))/i

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface CommentInput { name: string; email: string; body: string }

/** Same rules as the database; returns a message per invalid field. */
export function validateComment(input: CommentInput): Partial<Record<keyof CommentInput, string>> {
  const errors: Partial<Record<keyof CommentInput, string>> = {}
  const name = input.name.trim().replace(/\s+/g, ' ')
  const email = input.email.trim()
  const body = input.body.trim()
  if (name.length < 2 || name.length > 60) errors.name = 'Please enter a name between 2 and 60 characters.'
  else if (LINK_PATTERN.test(name)) errors.name = "Links aren't allowed here."
  if (!EMAIL.test(email) || email.length > 254) errors.email = 'Please enter a valid email address.'
  if (body.length < 2) errors.body = 'Please write a comment.'
  else if (body.length > 1500) errors.body = 'Please keep your comment under 1,500 characters.'
  else if (LINK_PATTERN.test(body)) errors.body = "Links aren't allowed in comments. Please remove any web addresses."
  return errors
}

/** Top-level comments newest first, each with its replies oldest first. */
export function toThreads(comments: PublicComment[]): CommentThread[] {
  const replies = new Map<string, PublicComment[]>()
  for (const c of comments) {
    if (c.parent_id) replies.set(c.parent_id, [...(replies.get(c.parent_id) ?? []), c])
  }
  return comments
    .filter((c) => !c.parent_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((c) => ({ ...c, replies: (replies.get(c.id) ?? []).sort((a, b) => a.created_at.localeCompare(b.created_at)) }))
}

export interface CommentState {
  /** False when comments can't be loaded (for example before migration 0007). */
  available: boolean
  open: boolean
  requireApproval: boolean
  comments: PublicComment[]
}

export async function fetchCommentState(postId: string): Promise<CommentState> {
  const none: CommentState = { available: false, open: false, requireApproval: false, comments: [] }
  if (!supabase) return none
  const [post, list, setting] = await Promise.all([
    supabase.from('posts').select('comments_open').eq('id', postId).maybeSingle(),
    supabase.from('post_comments_public').select('id, post_id, parent_id, author_name, body, is_staff_reply, created_at')
      .eq('post_id', postId).order('created_at', { ascending: false }).limit(500),
    supabase.from('site_settings').select('value').eq('key', 'comments').maybeSingle(),
  ])
  if (post.error || list.error || !post.data) return none
  return {
    available: true,
    open: post.data.comments_open !== false,
    requireApproval: Boolean((setting.data?.value as { require_approval?: boolean } | null)?.require_approval),
    comments: (list.data ?? []) as PublicComment[],
  }
}

/** Visible comment counts per post id, for the cards on /blogs. Empty if unavailable. */
export async function fetchCommentCounts(): Promise<Record<string, number>> {
  if (!supabase) return {}
  const { data, error } = await supabase.from('post_comment_counts').select('post_id, comment_count')
  if (error) return {}
  return Object.fromEntries((data ?? []).map((row) => [row.post_id, row.comment_count]))
}

export type AddCommentResult =
  | { ok: true; status: 'visible' | 'pending' }
  | { ok: false; message: string; field?: keyof CommentInput; closed?: boolean }

export async function addComment(postId: string, input: CommentInput, parentId: string | null): Promise<AddCommentResult> {
  if (!supabase) return { ok: false, message: 'Comments are unavailable right now. Please try again later.' }
  const { data, error } = await supabase.rpc('add_post_comment', {
    p_post_id: postId,
    p_name: input.name.trim(),
    p_email: input.email.trim(),
    p_body: input.body.trim(),
    p_parent_id: parentId,
  })
  if (!error) {
    const row = Array.isArray(data) ? data[0] : data
    return { ok: true, status: row?.comment_status === 'pending' ? 'pending' : 'visible' }
  }
  const hint = error.hint ?? ''
  if (hint === 'comments_closed' || hint === 'comments_unavailable') return { ok: false, closed: true, message: error.message }
  if (hint === 'invalid_name') return { ok: false, field: 'name', message: error.message }
  if (hint === 'invalid_email') return { ok: false, field: 'email', message: error.message }
  if (hint === 'invalid_body' || hint === 'comment_link') return { ok: false, field: 'body', message: error.message }
  if (hint === 'rate_limited' || hint === 'invalid_parent') return { ok: false, message: error.message }
  if (/Failed to fetch|NetworkError|Load failed/i.test(error.message)) {
    return { ok: false, message: "We couldn't reach the server. Check your internet connection and try again." }
  }
  console.error('[comments]', error)
  return { ok: false, message: 'Something went wrong and your comment was not posted. Please try again.' }
}
