import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Copy, Link2, Loader2, MessageCircle, Plus, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { selectClass } from '../components/fields'
import { EmptyState, Loading, PageHeader } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { formatDateTime, fromLocalInput } from '../lib/forms'

interface LinkRow {
  id: string
  label: string
  token: string
  preset_category: string | null
  preset_board_id: string | null
  expires_at: string | null
  max_submissions: number | null
  active: boolean
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  connexional: 'Connexional Executive',
  'Connexional Boards': 'Connexional Boards',
  Diocese: 'Diocese',
  local: 'Local',
}

const linkUrl = (token: string) => `${window.location.origin}/executive-form/${token}`

function linkState(link: LinkRow, total: number): { label: string; live: boolean } {
  if (!link.active) return { label: 'Inactive', live: false }
  if (link.expires_at && new Date(link.expires_at) <= new Date()) return { label: 'Expired', live: false }
  if (link.max_submissions !== null && total >= link.max_submissions) return { label: 'Full', live: false }
  return { label: 'Active', live: true }
}

export function ExecutiveLinks() {
  const [links, setLinks] = useState<LinkRow[] | null>(null)
  const [counts, setCounts] = useState<Record<string, { total: number; pending: number }>>({})
  const [boards, setBoards] = useState<{ id: string; title: string }[]>([])
  const [form, setForm] = useState({ label: '', category: '', board: '', expires: '', max: '' })
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState<LinkRow | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    const [linkResult, subResult, boardResult] = await Promise.all([
      supabase.from('executive_invite_links').select('*').order('created_at', { ascending: false }),
      supabase.from('executive_submissions').select('link_id, status'),
      supabase.from('boards').select('id, title').order('sort_order'),
    ])
    if (linkResult.error) toast.error(friendlyError(linkResult.error))
    const tally: Record<string, { total: number; pending: number }> = {}
    for (const s of subResult.data ?? []) {
      if (!s.link_id) continue
      tally[s.link_id] ??= { total: 0, pending: 0 }
      tally[s.link_id].total++
      if (s.status === 'pending') tally[s.link_id].pending++
    }
    setCounts(tally)
    setBoards(boardResult.data ?? [])
    setLinks((linkResult.data as LinkRow[]) ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    if (form.label.trim().length < 2) return toast.error('Give the link a name, for example "Connexional Executives 2026".')
    const max = form.max.trim() ? Number(form.max) : null
    if (max !== null && (!Number.isInteger(max) || max < 1)) return toast.error('The maximum number of submissions must be a whole number of at least 1.')
    const expires = fromLocalInput(form.expires)
    if (expires && new Date(expires) <= new Date()) return toast.error('The expiry date must be in the future.')
    setCreating(true)
    const { data, error } = await supabase.from('executive_invite_links').insert({
      label: form.label.trim(),
      preset_category: form.category || null,
      preset_board_id: form.board || null,
      expires_at: expires,
      max_submissions: max,
    }).select().single()
    setCreating(false)
    if (error) return toast.error(friendlyError(error))
    setForm({ label: '', category: '', board: '', expires: '', max: '' })
    setShowForm(false)
    await copy(data as LinkRow)
    load()
  }

  const copy = async (link: LinkRow) => {
    try {
      await navigator.clipboard.writeText(linkUrl(link.token))
      toast.success('Link copied. Paste it into a message to share it.')
    } catch {
      toast.error("Couldn't copy automatically. Select the link and copy it by hand.")
    }
  }

  const shareOnWhatsApp = (link: LinkRow) => {
    const message = `Please submit your GHAMSU executive profile (${link.label}) here: ${linkUrl(link.token)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const toggle = async (link: LinkRow) => {
    if (!supabase) return
    const { error } = await supabase.from('executive_invite_links').update({ active: !link.active }).eq('id', link.id)
    if (error) return toast.error(friendlyError(error))
    toast.success(link.active ? 'Link deactivated. The form now refuses new submissions.' : 'Link reactivated.')
    load()
  }

  const remove = async () => {
    const link = toDelete
    setToDelete(null)
    if (!link || !supabase) return
    const { error } = await supabase.from('executive_invite_links').delete().eq('id', link.id)
    if (error) return toast.error(friendlyError(error))
    toast.success('Link deleted. Submissions already received are kept.')
    load()
  }

  return (
    <div>
      <PageHeader
        title="Executive links"
        description="Share a link so executives can submit their own profile. Every submission waits for approval."
        actions={!showForm && <Button onClick={() => setShowForm(true)}><Plus /> New link</Button>}
      />

      {showForm && (
        <form onSubmit={create} className="mb-6 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="space-y-1.5">
            <Label htmlFor="link-label">Name <span className="text-destructive">*</span></Label>
            <Input id="link-label" value={form.label} placeholder="Connexional Executives 2026" onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="link-category">Category</Label>
              <select id="link-category" className={selectClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Let them choose</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <p className="text-xs text-muted-foreground">If set, the form doesn't ask for it.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-board">Board</Label>
              <select id="link-board" className={selectClass} value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })}>
                <option value="">None</option>
                {boards.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
              <p className="text-xs text-muted-foreground">Approved people are also added to this board's members.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-expires">Expires</Label>
              <Input id="link-expires" type="datetime-local" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />
              <p className="text-xs text-muted-foreground">Leave empty to keep it open until you deactivate it.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-max">Maximum submissions</Label>
              <Input id="link-max" type="number" inputMode="numeric" min={1} step={1} value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} />
              <p className="text-xs text-muted-foreground">Leave empty for no limit.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={creating}>{creating && <Loader2 className="animate-spin" />} Create and copy link</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {links === null ? <Loading /> : links.length === 0 ? (
        <EmptyState>No links yet. Create one to start collecting executive profiles.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {links.map((link) => {
            const count = counts[link.id] ?? { total: 0, pending: 0 }
            const state = linkState(link, count.total)
            const board = boards.find((b) => b.id === link.preset_board_id)
            return (
              <li key={link.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{link.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {link.preset_category ? CATEGORY_LABELS[link.preset_category] : 'Any category'}
                      {board && ` · ${board.title}`}
                      {link.expires_at && ` · Expires ${formatDateTime(link.expires_at)}`}
                      {link.max_submissions !== null && ` · Up to ${link.max_submissions}`}
                    </p>
                  </div>
                  <Badge variant={state.live ? 'default' : 'secondary'}>{state.label}</Badge>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs">
                  <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-mono" title={linkUrl(link.token)}>{linkUrl(link.token)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {count.total} submission{count.total === 1 ? '' : 's'}{count.pending ? `, ${count.pending} waiting for approval` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => copy(link)}><Copy /> Copy link</Button>
                  <Button size="sm" variant="outline" onClick={() => shareOnWhatsApp(link)}><MessageCircle /> Share on WhatsApp</Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(link)}><Power /> {link.active ? 'Deactivate' : 'Reactivate'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setToDelete(link)} aria-label={`Delete ${link.label}`}><Trash2 className="text-destructive" /></Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this link?"
        description="Anyone who has it will no longer be able to use it. Submissions already received are kept."
        confirmLabel="Delete link"
        destructive
        onConfirm={remove}
      />
    </div>
  )
}
