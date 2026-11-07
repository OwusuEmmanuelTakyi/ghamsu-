import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { BadgeCheck, Check, EyeOff, Loader2, Mail, Reply, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { selectClass } from '../components/fields'
import { EmptyState, Loading, PageHeader } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { formatDateTime } from '../lib/forms'

type Status = 'visible' | 'pending' | 'hidden'

interface AdminComment {
  id: string
  post_id: string
  parent_id: string | null
  author_name: string
  author_email: string | null
  body: string
  is_staff_reply: boolean
  status: Status
  created_at: string
  post: { id: string; title: string; slug: string; status: string } | null
}

/** Comments waiting for approval, for the menu badge. 0 if comments aren't set up. */
export async function countPendingComments(): Promise<number> {
  if (!supabase) return 0
  const { count, error } = await supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  return error ? 0 : count ?? 0
}

const STATUS_LABEL: Record<Status, string> = { visible: 'Visible', pending: 'Waiting for approval', hidden: 'Hidden' }

export function Comments() {
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState<AdminComment[] | null>(null)
  const [tab, setTab] = useState<'all' | Status>(() => (params.get('status') as Status) || 'all')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [toDelete, setToDelete] = useState<AdminComment | null>(null)
  const postFilter = params.get('post') ?? ''

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, post_id, parent_id, author_name, author_email, body, is_staff_reply, status, created_at, post:posts(id, title, slug, status)')
      .order('created_at', { ascending: false })
      .limit(1000)
    if (error) {
      toast.error(/post_comments|does not exist|schema cache/.test(error.message) ? 'Comments need database migration 0007.' : friendlyError(error))
      setRows([])
      return
    }
    setRows((data ?? []) as unknown as AdminComment[])
  }, [])

  useEffect(() => { load() }, [load])

  const byId = useMemo(() => new Map((rows ?? []).map((r) => [r.id, r])), [rows])
  const posts = useMemo(() => {
    const seen = new Map<string, string>()
    for (const r of rows ?? []) if (r.post) seen.set(r.post.id, r.post.title)
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [rows])

  const inPost = (rows ?? []).filter((r) => !postFilter || r.post_id === postFilter)
  const counts = { all: inPost.length, visible: 0, pending: 0, hidden: 0 }
  for (const r of inPost) counts[r.status]++
  const term = search.trim().toLowerCase()
  const visible = inPost.filter((r) => (tab === 'all' || r.status === tab)
    && (!term || [r.author_name, r.author_email ?? '', r.body, r.post?.title ?? ''].some((v) => v.toLowerCase().includes(term))))

  const setStatus = async (comment: AdminComment, status: Status) => {
    if (!supabase) return
    setBusy(comment.id)
    const { error } = await supabase.from('post_comments').update({ status }).eq('id', comment.id)
    setBusy(null)
    if (error) return toast.error(friendlyError(error))
    toast.success(status === 'visible' ? 'Comment approved. It is now on the website.' : 'Comment hidden from the website.')
    load()
  }

  const remove = async () => {
    const comment = toDelete
    setToDelete(null)
    if (!supabase || !comment) return
    const { error } = await supabase.from('post_comments').delete().eq('id', comment.id)
    if (error) return toast.error(friendlyError(error))
    toast.success('Comment deleted.')
    load()
  }

  const sendReply = async (comment: AdminComment) => {
    if (!supabase) return
    const text = replyText.trim()
    if (text.length < 2 || text.length > 1500) return toast.error('A reply must be between 2 and 1,500 characters.')
    setBusy(comment.id)
    const { error } = await supabase.rpc('add_staff_reply', { p_comment_id: comment.id, p_body: text })
    setBusy(null)
    if (error) return toast.error(friendlyError(error))
    toast.success('Reply posted with the GHAMSU badge.')
    setReplyTo(null)
    setReplyText('')
    load()
  }

  const changePost = (id: string) => {
    const next = new URLSearchParams(params)
    if (id) next.set('post', id)
    else next.delete('post')
    setParams(next, { replace: true })
  }

  return (
    <div>
      <PageHeader title="Comments" description="Comments on news and articles. Approve, hide, delete or reply as GHAMSU." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search names, emails and comments…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search comments" />
        </div>
        <select className={`${selectClass} sm:max-w-xs`} value={postFilter} onChange={(e) => changePost(e.target.value)} aria-label="Filter by post">
          <option value="">All posts</option>
          {posts.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-4">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="pending">Waiting ({counts.pending})</TabsTrigger>
            <TabsTrigger value="visible">Visible ({counts.visible})</TabsTrigger>
            <TabsTrigger value="hidden">Hidden ({counts.hidden})</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {rows === null ? <Loading /> : visible.length === 0 ? (
        <EmptyState>{rows.length === 0 ? 'No comments yet.' : 'No comments match.'}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {visible.map((c) => {
            const parent = c.parent_id ? byId.get(c.parent_id) : null
            return (
              <li key={c.id} className={`rounded-lg border bg-card p-4 ${c.status === 'pending' ? 'border-accent' : 'border-border'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{c.author_name}</span>
                  {c.is_staff_reply && <Badge className="gap-1 bg-[#003D82] text-white"><BadgeCheck className="h-3 w-3" /> GHAMSU</Badge>}
                  <Badge variant={c.status === 'visible' ? 'outline' : c.status === 'pending' ? 'default' : 'secondary'}>{STATUS_LABEL[c.status]}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</span>
                </div>
                {c.author_email && (
                  <a href={`mailto:${c.author_email}`} className="mt-1 inline-flex items-center gap-1 break-all text-sm text-primary hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {c.author_email}
                  </a>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  On{' '}
                  {c.post ? <Link to={`/admin/posts/${c.post.id}`} className="font-medium text-foreground hover:underline">{c.post.title}</Link> : 'a deleted post'}
                  {parent && <> · reply to {parent.author_name}</>}
                </p>
                <p className="mt-3 whitespace-pre-line break-words text-sm">{c.body}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {c.status !== 'visible' && (
                    <Button size="sm" onClick={() => setStatus(c, 'visible')} disabled={busy === c.id}><Check /> Approve</Button>
                  )}
                  {c.status !== 'hidden' && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(c, 'hidden')} disabled={busy === c.id}><EyeOff /> Hide</Button>
                  )}
                  {c.status === 'visible' && (
                    <Button size="sm" variant="outline" onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyText('') }}>
                      <Reply /> Reply
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setToDelete(c)} aria-label={`Delete the comment by ${c.author_name}`}>
                    <Trash2 className="text-destructive" />
                  </Button>
                  {c.post?.status === 'published' && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={`/blogs/${c.post.slug}#comments-heading`} target="_blank" rel="noopener noreferrer">View post</a>
                    </Button>
                  )}
                </div>

                {replyTo === c.id && (
                  <div className="mt-3 space-y-2 rounded-md bg-secondary/60 p-3">
                    <label htmlFor={`reply-${c.id}`} className="text-sm font-medium">Reply as GHAMSU</label>
                    <Textarea id={`reply-${c.id}`} rows={3} maxLength={1500} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    <p className="text-xs text-muted-foreground">
                      Shown under your name with the GHAMSU badge{parent ? `, in the thread of ${parent.author_name}'s comment` : ''}.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => sendReply(c)} disabled={busy === c.id}>
                        {busy === c.id && <Loader2 className="animate-spin" />} Post reply
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this comment?"
        description={toDelete && !toDelete.parent_id
          ? `${toDelete.author_name}'s comment and any replies to it will be permanently deleted. To keep it but take it off the website, use Hide instead.`
          : 'This reply will be permanently deleted. To keep it but take it off the website, use Hide instead.'}
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </div>
  )
}
