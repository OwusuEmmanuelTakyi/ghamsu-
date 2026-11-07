import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Check, Crosshair, ExternalLink, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { clearPublicDataCache } from '../../../lib/hooks'
import { thumbPath } from '../../../lib/media'
import { normalizeGhanaPhone } from '../../../lib/activities'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog'
import { FieldInput, validate, type Errors, type FieldDef, type Values } from '../components/fields'
import { EmptyState, Loading, PageHeader } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { DIGITS_RULE, formatDateTime } from '../lib/forms'
import { newImagePath, uploadCopies } from '../lib/images'
import type { ImageFocus } from '../../../types/types'

const BUCKET = 'executive-submissions'
type Status = 'pending' | 'approved' | 'rejected'

interface Submission {
  id: string
  link_id: string | null
  full_name: string
  position: string
  category: string
  board_id: string | null
  location: string
  phone: string
  email: string
  whatsapp: string | null
  bio: string | null
  photo_path: string
  photo_thumb_path: string | null
  show_phone: boolean
  show_email: boolean
  status: Status
  rejection_reason: string | null
  reviewed_at: string | null
  executive_id: string | null
  created_at: string
  link?: { label: string } | null
}

const CATEGORY_LABELS: Record<string, string> = {
  connexional: 'Connexional Executive',
  'Connexional Boards': 'Connexional Boards',
  Diocese: 'Diocese',
  local: 'Local',
}

/** Signed, short-lived URLs for photos in the private bucket. */
async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  if (!supabase || !paths.length) return {}
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600)
  const urls: Record<string, string> = {}
  for (const d of data ?? []) if (d.path && d.signedUrl) urls[d.path] = d.signedUrl
  return urls
}

/** Pending submissions, for the menu badge. */
export async function countPendingSubmissions(): Promise<number> {
  if (!supabase) return 0
  const { count } = await supabase.from('executive_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending')
  return count ?? 0
}

// ─── List ──────────────────────────────────────────────────────────────────────

export function ExecutiveSubmissions() {
  const [tab, setTab] = useState<Status>('pending')
  const [rows, setRows] = useState<Submission[] | null>(null)
  const [photos, setPhotos] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!supabase) return
    supabase.from('executive_submissions')
      .select('*, link:executive_invite_links(label)')
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        if (error) toast.error(friendlyError(error))
        const list = (data as Submission[]) ?? []
        setRows(list)
        setPhotos(await signedUrls(list.map((s) => s.photo_thumb_path ?? s.photo_path)))
      })
  }, [])

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 }
    for (const r of rows ?? []) c[r.status]++
    return c
  }, [rows])
  const visible = (rows ?? []).filter((r) => r.status === tab)

  return (
    <div>
      <PageHeader title="Executive submissions" description="Profiles sent through executive links. Nothing is shown on the website until you approve it." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Status)} className="mb-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>
      {rows === null ? <Loading /> : visible.length === 0 ? (
        <EmptyState>{tab === 'pending' ? 'Nothing waiting for approval.' : `No ${tab} submissions.`}</EmptyState>
      ) : (
        <ul className="space-y-2">
          {visible.map((s) => (
            <li key={s.id}>
              <Link to={`/admin/executive-submissions/${s.id}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-accent">
                <div className="h-16 w-14 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                  {photos[s.photo_thumb_path ?? s.photo_path] && (
                    <img src={photos[s.photo_thumb_path ?? s.photo_path]} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.full_name}</p>
                  <p className="truncate text-sm text-muted-foreground">{s.position} · {CATEGORY_LABELS[s.category] ?? s.category}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.location} · sent {formatDateTime(s.created_at)}{s.link?.label ? ` via ${s.link.label}` : ''}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Review ────────────────────────────────────────────────────────────────────

const REVIEW_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Full name', type: 'text', required: true },
  { name: 'position', label: 'Position', type: 'text', required: true },
  {
    name: 'category', label: 'Category', type: 'select', required: true,
    options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
  },
  {
    name: 'phone', label: 'Phone', type: 'tel',
    validate: (v) => (v && !normalizeGhanaPhone(String(v)) ? 'Enter a Ghana number, for example 024 123 4567.' : null),
  },
  { name: 'email', label: 'Email', type: 'email' },
  {
    name: 'whatsapp', label: 'WhatsApp number', type: 'text', pattern: DIGITS_RULE,
    patternMessage: 'Digits only, with the country code (for example 233241234567).',
  },
  { name: 'bio', label: 'Short bio', type: 'textarea' },
  { name: 'image_alt', label: 'Photo description (alt text)', type: 'text', required: true },
  { name: 'show_phone', label: 'Show phone and WhatsApp publicly', type: 'switch' },
  { name: 'show_email', label: 'Show email publicly', type: 'switch' },
]

export function ExecutiveSubmissionReview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [sub, setSub] = useState<Submission | null | undefined>(undefined)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [values, setValues] = useState<Values>({})
  const [focus, setFocus] = useState<ImageFocus | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    if (!supabase || !id) return
    const { data, error } = await supabase.from('executive_submissions').select('*, link:executive_invite_links(label)').eq('id', id).maybeSingle()
    if (error) toast.error(friendlyError(error))
    const s = data as Submission | null
    setSub(s)
    if (!s) return
    setPhotoUrl((await signedUrls([s.photo_path]))[s.photo_path] ?? null)
    setValues({
      name: s.full_name, position: s.position, category: s.category, phone: s.phone, email: s.email,
      whatsapp: s.whatsapp ?? '', bio: s.bio ?? '', image_alt: s.full_name, show_phone: s.show_phone, show_email: s.show_email,
    })
  }, [id])

  useEffect(() => { load() }, [load])

  const pickFocus = (event: MouseEvent<HTMLImageElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const round = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 1000) / 1000
    setFocus({ hotspot: { x: round((event.clientX - box.left) / box.width), y: round((event.clientY - box.top) / box.height), width: 1, height: 1 } })
  }

  const approve = async () => {
    if (!supabase || !sub) return
    const found = validate(REVIEW_FIELDS, values)
    setErrors(found)
    if (Object.keys(found).length) return toast.error('Please fix the highlighted fields.')
    setBusy('approve')
    let mediaPath: string | null = null
    try {
      // 1. Copy the photo (and thumbnail) from the private bucket to the public one.
      const source = supabase.storage.from(BUCKET)
      const full = await source.download(sub.photo_path)
      if (full.error || !full.data) throw full.error ?? new Error('The photo could not be downloaded.')
      const thumb = sub.photo_thumb_path ? await source.download(sub.photo_thumb_path) : null
      const extension = sub.photo_path.endsWith('.jpg') ? 'jpg' : 'webp'
      mediaPath = newImagePath('executives', extension)
      await uploadCopies(full.data, thumb?.data ?? full.data, extension === 'jpg' ? 'image/jpeg' : 'image/webp', mediaPath)

      // 2. Create the executive and mark the submission approved, in one step.
      const { data, error } = await supabase.rpc('approve_executive_submission', {
        p_submission_id: sub.id,
        p_executive: {
          name: String(values.name).trim(),
          position: String(values.position).trim(),
          category: values.category,
          phone: values.phone ? normalizeGhanaPhone(String(values.phone)) : null,
          email: String(values.email ?? '').trim().toLowerCase() || null,
          whatsapp: String(values.whatsapp ?? '').trim() || null,
          bio: String(values.bio ?? '').trim() || null,
          image_path: mediaPath,
          image_alt: String(values.image_alt).trim(),
          image_focus: focus,
          show_phone: Boolean(values.show_phone),
          show_email: Boolean(values.show_email),
        },
      })
      if (error) throw error
      clearPublicDataCache()
      toast.success(`${values.name} is now on the website.`)
      navigate(`/admin/executives/${data}`)
    } catch (error) {
      // Don't leave a copied photo behind if approval failed.
      if (mediaPath) await supabase.storage.from('media').remove([mediaPath, thumbPath(mediaPath)])
      toast.error(friendlyError(error))
    } finally {
      setBusy(null)
    }
  }

  const reject = async () => {
    if (!supabase || !sub) return
    setRejectOpen(false)
    setBusy('reject')
    const { error } = await supabase.rpc('reject_executive_submission', { p_submission_id: sub.id, p_reason: reason.trim() || null })
    setBusy(null)
    if (error) return toast.error(friendlyError(error))
    toast.success('Submission rejected. Nothing was published.')
    navigate('/admin/executive-submissions')
  }

  if (sub === undefined) return <Loading />
  if (sub === null) {
    return <EmptyState>This submission doesn't exist. <Link to="/admin/executive-submissions" className="text-primary underline">Back to submissions</Link></EmptyState>
  }

  const pending = sub.status === 'pending'
  const spot = focus?.hotspot

  return (
    <div className="pb-28">
      <Link to="/admin/executive-submissions" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Executive submissions
      </Link>
      <PageHeader
        title={sub.full_name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant={sub.status === 'approved' ? 'default' : 'secondary'} className="capitalize">{sub.status}</Badge>
            <span>Sent {formatDateTime(sub.created_at)}{sub.link?.label ? ` via ${sub.link.label}` : ''}</span>
            {sub.board_id && <span>· Will also be added to a board</span>}
          </span>
        }
      />

      {sub.status === 'approved' && sub.executive_id && (
        <p className="mb-4 rounded-lg bg-green-600/10 p-3 text-sm">
          Approved {formatDateTime(sub.reviewed_at)}.{' '}
          <Link to={`/admin/executives/${sub.executive_id}`} className="inline-flex items-center gap-1 font-medium text-primary underline">
            Edit the executive <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </p>
      )}
      {sub.status === 'rejected' && (
        <p className="mb-4 rounded-lg bg-secondary p-3 text-sm">
          Rejected {formatDateTime(sub.reviewed_at)}.{sub.rejection_reason ? ` Reason: ${sub.rejection_reason}` : ''}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 lg:self-start">
          {photoUrl ? (
            <div className="relative">
              <img src={photoUrl} alt={`Photo sent by ${sub.full_name}`} onClick={pending ? pickFocus : undefined}
                className={`w-full rounded-lg ${pending ? 'cursor-crosshair' : ''}`} />
              {spot && (
                <span aria-hidden="true" className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent/70 shadow"
                  style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }} />
              )}
            </div>
          ) : <p className="py-10 text-center text-sm text-muted-foreground">Photo unavailable.</p>}
          {pending && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Crosshair className="h-3.5 w-3.5" /> Click the photo to choose the point that stays visible when cropped.
            </p>
          )}
          <dl className="space-y-1 text-sm">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Diocese, local or institution</dt>
            <dd>{sub.location}</dd>
          </dl>
        </div>

        <div className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
          {REVIEW_FIELDS.map((field) => (
            <FieldInput key={field.name} field={pending ? field : { ...field, help: undefined }} values={values} error={errors[field.name]}
              onChange={(changes) => pending && setValues((prev) => ({ ...prev, ...changes }))} />
          ))}
        </div>
      </div>

      {pending && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:left-64">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
            <Button onClick={approve} disabled={busy !== null}>
              {busy === 'approve' ? <Loader2 className="animate-spin" /> : <Check />} Approve and publish
            </Button>
            <Button variant="outline" onClick={() => setRejectOpen(true)} disabled={busy !== null}>
              {busy === 'reject' ? <Loader2 className="animate-spin" /> : <X />} Reject
            </Button>
          </div>
        </div>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this submission?</DialogTitle>
            <DialogDescription>Nothing will be published. The reason is only kept for your records.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea id="reject-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={reject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
