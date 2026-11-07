import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { clearPublicDataCache } from '../../../lib/hooks'
import { Button } from '../../components/ui/button'
import { useAuth } from '../auth'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FieldInput, toFormValues, toPayload, validate, type Errors, type Values } from '../components/fields'
import { EmptyState, Loading, PageHeader, StatusBadge } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { formatDateTime } from '../lib/forms'
import type { ResourceConfig } from '../resources'

export function ResourceForm({ config }: { config: ResourceConfig }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const idColumn = config.idColumn ?? 'id'
  const hasStatus = config.hasStatus !== false
  const creating = id === 'new'
  const fields = config.fields.filter((field) => !field.adminOnly || isAdmin)

  const [row, setRow] = useState<Values | null>(null)
  const [values, setValues] = useState<Values>({})
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(!creating)
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (creating || !supabase) {
        setRow(null)
        setValues(toFormValues(config.fields, config.defaults ?? {}))
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase.from(config.table).select('*').eq(idColumn, decodeURIComponent(id!)).maybeSingle()
      if (cancelled) return
      if (error) toast.error(friendlyError(error))
      if (!data) {
        setMissing(true)
        setLoading(false)
        return
      }
      const extra = (await config.loadExtra?.(data)) ?? {}
      if (cancelled) return
      setRow(data)
      setValues({ ...toFormValues(config.fields, data), ...extra })
      setErrors({})
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [config, id, creating, idColumn])

  const change = (changes: Values) => {
    setValues((prev) => ({ ...prev, ...changes }))
    setErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(changes)) delete next[key.replace(/_(path|alt|caption|focus)$/, '')]
      for (const key of Object.keys(changes)) delete next[key]
      return next
    })
  }

  const save = async (status: 'published' | 'draft' | undefined) => {
    if (!supabase) return
    const target = status ?? row?.status ?? 'draft'
    const publishing = hasStatus && target === 'published'
    const found = validate(fields, values, { publishing })
    const crossCheck = publishing ? config.publishCheck?.(values) : null
    if (crossCheck) found._form = crossCheck
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error(crossCheck ?? 'Please fix the highlighted fields.')
      document.querySelector('[aria-invalid="true"], .text-destructive')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSaving(true)
    try {
      const payload = toPayload(fields, values)
      if (hasStatus) payload.status = target
      if (creating && config.sortable) {
        // New rows go to the end of the list.
        const { data: last } = await supabase.from(config.table).select('sort_order').order('sort_order', { ascending: false }).limit(1)
        payload.sort_order = (last?.[0]?.sort_order ?? 0) + 1
      }
      const query = creating
        ? supabase.from(config.table).insert(payload).select().single()
        : supabase.from(config.table).update(payload).eq(idColumn, row![idColumn]).select().single()
      const { data, error } = await query
      if (error) throw error

      await config.afterSave?.(data, values, { isAdmin })
      clearPublicDataCache()
      toast.success(
        publishing && row?.status !== 'published' ? `${config.singular} published.`
          : status === 'draft' && row?.status === 'published' ? `${config.singular} unpublished and saved as a draft.`
            : `${config.singular} saved.`,
      )
      if (creating) navigate(`${config.path}/${encodeURIComponent(data[idColumn])}`, { replace: true })
      else {
        setRow(data)
        setValues((prev) => ({ ...prev, ...toFormValues(config.fields, data) }))
      }
    } catch (error) {
      toast.error(friendlyError(error))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    setConfirmDelete(false)
    if (!supabase || !row) return
    setSaving(true)
    const { error } = await supabase.from(config.table).delete().eq(idColumn, row[idColumn])
    setSaving(false)
    if (error) return toast.error(friendlyError(error))
    clearPublicDataCache()
    toast.success(`${config.singular} deleted.`)
    navigate(config.path)
  }

  if (loading) return <Loading />
  if (missing) {
    return (
      <EmptyState>
        This {config.singular.toLowerCase()} doesn't exist. It may have been deleted.{' '}
        <Link to={config.path} className="text-primary underline">Back to {config.label.toLowerCase()}</Link>
      </EmptyState>
    )
  }

  const isPublished = row?.status === 'published'
  const publicPath = isPublished ? config.publicPath?.(row!) : null

  return (
    <form onSubmit={(event) => { event.preventDefault(); save(undefined) }} className="pb-28">
      <Link to={config.path} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {config.label}
      </Link>
      <PageHeader
        title={creating ? `New ${config.singular.toLowerCase()}` : String(row?.[config.titleColumn] ?? config.singular).replace(/\n/g, ' ')}
        description={
          !creating && (
            <span className="flex flex-wrap items-center gap-2">
              {hasStatus && <StatusBadge status={row?.status} />}
              {row?.updated_at && <span>Last edited {formatDateTime(row.updated_at)}</span>}
              {publicPath && (
                <a href={publicPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  View on site <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </span>
          )
        }
      />

      <div className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
        {errors._form && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errors._form}</p>}
        {fields.map((field) =>
          field.showIf && !field.showIf(values) ? null : (
            <FieldInput key={field.name} field={field} values={values} onChange={change} error={errors[field.name]} />
          ),
        )}
      </div>

      {config.extraSection && row && (
        <div className="mt-6"><config.extraSection row={row} /></div>
      )}

      {/* Actions stay in reach at the bottom of the screen, also on phones. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 px-4 py-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {hasStatus && !isPublished ? 'Save draft' : 'Save'}
          </Button>
          {hasStatus && !isPublished && (
            <Button type="button" variant="secondary" disabled={saving} onClick={() => save('published')}>Save and publish</Button>
          )}
          {hasStatus && isPublished && (
            <Button type="button" variant="outline" disabled={saving} onClick={() => save('draft')}>Unpublish</Button>
          )}
          {!creating && config.canDelete !== false && (
            <Button type="button" variant="ghost" className="ml-auto text-destructive" disabled={saving} onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </form>
  )
}
