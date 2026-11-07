import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Download, ExternalLink, Mail, Phone, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuth } from '../auth'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState, Loading, PageHeader } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { formatDateTime } from '../lib/forms'

interface Registration {
  id: string
  full_name: string
  phone: string
  email: string
  gender: string
  local: string
  diocese: string
  level: string
  role: string
  how_did_you_hear: string | null
  notes: string | null
  created_at: string
}

const COLUMNS: [keyof Registration, string][] = [
  ['created_at', 'Registered at'],
  ['full_name', 'Full name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['gender', 'Gender'],
  ['local', 'Local / campus / institution'],
  ['diocese', 'Diocese'],
  ['level', 'Level / year'],
  ['role', 'Role'],
  ['how_did_you_hear', 'How they heard'],
  ['notes', 'Notes'],
]

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * One CSV cell. Text starting with = + - @ is prefixed with ' so spreadsheet
 * apps don't run it as a formula (people type these answers themselves).
 * Phone numbers are always "+233" and digits, checked by the database, so
 * they are left as they are.
 */
function csvCell(value: unknown, column: keyof Registration): string {
  let text = value === null || value === undefined ? '' : String(value)
  if (column === 'created_at' && text) text = new Date(text).toLocaleString('en-GB')
  const isPhone = column === 'phone' && /^\+\d+$/.test(text)
  if (!isPhone && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

function downloadCsv(rows: Registration[], slug: string) {
  const lines = [
    COLUMNS.map(([, label]) => `"${label}"`).join(','),
    ...rows.map((row) => COLUMNS.map(([key]) => csvCell(row[key], key)).join(',')),
  ]
  // The byte-order mark makes Excel read names with accents correctly.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `registrations-${slug}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function Registrations() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const [activity, setActivity] = useState<{ id: string; title: string; slug: string; status: string; registration_open: boolean; capacity: number | null } | null>(null)
  const [rows, setRows] = useState<Registration[] | null>(null)
  const [missing, setMissing] = useState(false)
  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState<Registration | null>(null)

  const load = useCallback(async () => {
    if (!supabase || !id) return
    const [{ data: act, error: actError }, { data, error }] = await Promise.all([
      supabase.from('major_activities').select('id, title, slug, status, registration_open, capacity').eq('id', id).maybeSingle(),
      supabase.from('activity_registrations').select('*').eq('activity_id', id).order('created_at', { ascending: false }),
    ])
    if (actError || error) toast.error(friendlyError(actError ?? error))
    if (!act) setMissing(true)
    setActivity(act)
    setRows((data as Registration[]) ?? [])
  }, [id])

  useEffect(() => { load() }, [load])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows ?? []
    return (rows ?? []).filter((r) =>
      [r.full_name, r.phone, r.email, r.local, r.diocese, r.level, r.role].some((v) => v?.toLowerCase().includes(term)))
  }, [rows, search])

  const remove = async () => {
    const target = toDelete
    setToDelete(null)
    if (!target || !supabase) return
    const { error } = await supabase.from('activity_registrations').delete().eq('id', target.id)
    if (error) return toast.error(friendlyError(error))
    toast.success(`${target.full_name}'s registration was deleted.`)
    load()
  }

  if (missing) {
    return <EmptyState>This activity doesn't exist. <Link to="/admin/activities" className="text-primary underline">Back to major activities</Link></EmptyState>
  }
  if (!activity || rows === null) return <Loading />

  return (
    <div>
      <Link to="/admin/activities" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Major activities
      </Link>
      <PageHeader
        title="Registrations"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{activity.title}</span>
            <Badge variant={activity.registration_open ? 'default' : 'secondary'}>
              {activity.registration_open ? 'Registration open' : 'Registration closed'}
            </Badge>
            {activity.status === 'published' && (
              <a href={`/activities/${activity.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                View page <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </span>
        }
        actions={
          <Button onClick={() => downloadCsv(rows, activity.slug)} disabled={rows.length === 0}>
            <Download /> Download CSV
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total registered</p>
          <p className="mt-1 text-3xl font-semibold">{rows.length}</p>
        </div>
        {activity.capacity !== null && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Places left</p>
            <p className="mt-1 text-3xl font-semibold">{Math.max(activity.capacity - rows.length, 0)}</p>
            <p className="text-xs text-muted-foreground">of {activity.capacity}</p>
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, phone, email, local or diocese…" value={search}
          onChange={(event) => setSearch(event.target.value)} aria-label="Search registrations" />
      </div>
      {search && <p className="mb-3 text-sm text-muted-foreground">{visible.length} of {rows.length} shown</p>}

      {rows.length === 0 ? (
        <EmptyState>No one has registered yet.</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState>Nothing matches your search.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {visible.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.full_name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Phone className="h-3.5 w-3.5" />{r.phone}</a>
                    <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 break-all text-primary hover:underline"><Mail className="h-3.5 w-3.5" />{r.email}</a>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {capitalise(r.role)} · {capitalise(r.gender)} · {r.local} · {r.diocese} diocese · {r.level}
                  </p>
                  {(r.how_did_you_hear || r.notes) && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {r.how_did_you_hear && <>Heard via {r.how_did_you_hear}. </>}
                      {r.notes && <>Note: “{r.notes}”</>}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">Registered {formatDateTime(r.created_at)}</p>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="icon" aria-label={`Delete ${r.full_name}'s registration`} onClick={() => setToDelete(r)}>
                    <Trash2 className="text-destructive" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this registration?"
        description={`${toDelete?.full_name ?? 'This person'}'s registration will be permanently deleted. They can register again while registration is open.`}
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </div>
  )
}
