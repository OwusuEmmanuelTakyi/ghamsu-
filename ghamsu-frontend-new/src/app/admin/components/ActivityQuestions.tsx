import { useCallback, useEffect, useState } from 'react'
import { Eye, Loader2, Pencil, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { FIELD_TYPES, hasOptions, type CustomField, type CustomFieldType } from '../../../lib/activities'
import { ActivityRegistrationForm } from '../../components/ActivityRegistrationForm'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Textarea } from '../../components/ui/textarea'
import { ConfirmDialog } from './ConfirmDialog'
import { selectClass, type Values } from './fields'
import { SortableList } from './SortableList'
import { friendlyError } from '../lib/errors'

// Extra registration questions for one activity (the activity_form_fields
// table). Shown under the activity's own fields in the admin.

interface Draft {
  id: string | null
  label: string
  field_type: CustomFieldType
  optionsText: string
  required: boolean
  help_text: string
}

const NEW_DRAFT: Draft = { id: null, label: '', field_type: 'short_text', optionsText: '', required: false, help_text: '' }
const typeLabel = (type: string) => FIELD_TYPES.find((t) => t.value === type)?.label ?? type

/** One option per line; blank lines and repeats are dropped. */
const parseOptions = (text: string) => [...new Set(text.split('\n').map((line) => line.trim()).filter(Boolean))]

export function ActivityQuestions({ row }: { row: Values }) {
  const activityId = row.id as string
  const [fields, setFields] = useState<CustomField[] | null>(null)
  const [removed, setRemoved] = useState<CustomField[]>([])
  const [registrations, setRegistrations] = useState(0)
  const [orderChanged, setOrderChanged] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [draftError, setDraftError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [toRemove, setToRemove] = useState<CustomField | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  const load = useCallback(async () => {
    if (!supabase || !activityId) return
    const [{ data, error }, { count }] = await Promise.all([
      supabase.from('activity_form_fields').select('*').eq('activity_id', activityId).order('sort_order').order('created_at'),
      supabase.from('activity_registrations').select('id', { count: 'exact', head: true }).eq('activity_id', activityId),
    ])
    if (error) {
      // Before migration 0006 the table doesn't exist.
      setUnavailable(/activity_form_fields|does not exist|schema cache/i.test(error.message))
      if (!/activity_form_fields|does not exist|schema cache/i.test(error.message)) toast.error(friendlyError(error))
      setFields([])
      return
    }
    const all = (data ?? []) as CustomField[]
    setFields(all.filter((f) => !f.deleted_at))
    setRemoved(all.filter((f) => f.deleted_at))
    setRegistrations(count ?? 0)
    setOrderChanged(false)
  }, [activityId])

  useEffect(() => { load() }, [load])

  if (!activityId) return null

  const openEditor = (field?: CustomField) => {
    setDraftError(null)
    setDraft(field
      ? { id: field.id, label: field.label, field_type: field.field_type, optionsText: field.options.join('\n'), required: field.required, help_text: field.help_text ?? '' }
      : NEW_DRAFT)
  }

  const saveDraft = async () => {
    if (!supabase || !draft) return
    const options = hasOptions(draft.field_type) ? parseOptions(draft.optionsText) : []
    if (!draft.label.trim()) return setDraftError('Please write the question.')
    if (draft.label.trim().length > 200) return setDraftError('Please keep the question under 200 characters.')
    if (hasOptions(draft.field_type) && options.length === 0) return setDraftError('Add at least one option, one per line.')
    if (options.length > 50) return setDraftError('Please use at most 50 options.')
    if (options.some((o) => o.length > 200)) return setDraftError('Each option must be under 200 characters.')
    if (draft.help_text.trim().length > 300) return setDraftError('Please keep the help text under 300 characters.')

    setBusy(true)
    const payload = {
      label: draft.label.trim(),
      field_type: draft.field_type,
      options,
      required: draft.required,
      help_text: draft.help_text.trim() || null,
    }
    const { error } = draft.id
      ? await supabase.from('activity_form_fields').update(payload).eq('id', draft.id)
      : await supabase.from('activity_form_fields').insert({
        ...payload,
        activity_id: activityId,
        sort_order: Math.max(0, ...(fields ?? []).map((f) => f.sort_order)) + 1,
      })
    setBusy(false)
    if (error) return setDraftError(friendlyError(error))
    toast.success(draft.id ? 'Question saved.' : 'Question added to the form.')
    setDraft(null)
    load()
  }

  const saveOrder = async () => {
    if (!supabase || !fields) return
    setBusy(true)
    const results = await Promise.all(fields.map((f, index) =>
      supabase!.from('activity_form_fields').update({ sort_order: index + 1 }).eq('id', f.id)))
    setBusy(false)
    const failed = results.find((r) => r.error)
    if (failed?.error) return toast.error(friendlyError(failed.error))
    toast.success('New order saved.')
    load()
  }

  // With registrations, the question is only marked removed so the answers
  // people already gave keep their label in the list and the CSV.
  const remove = async () => {
    const field = toRemove
    setToRemove(null)
    if (!supabase || !field) return
    const { error } = registrations > 0
      ? await supabase.from('activity_form_fields').update({ deleted_at: new Date().toISOString() }).eq('id', field.id)
      : await supabase.from('activity_form_fields').delete().eq('id', field.id)
    if (error) return toast.error(friendlyError(error))
    toast.success('Question removed from the form.')
    load()
  }

  const restore = async (field: CustomField) => {
    if (!supabase) return
    const { error } = await supabase.from('activity_form_fields')
      .update({ deleted_at: null, sort_order: Math.max(0, ...(fields ?? []).map((f) => f.sort_order)) + 1 }).eq('id', field.id)
    if (error) return toast.error(friendlyError(error))
    toast.success('Question added back to the form.')
    load()
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6" aria-labelledby="questions-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="questions-heading" className="text-lg font-semibold">Registration questions</h2>
          <p className="text-sm text-muted-foreground">
            Asked after the standard questions (name, phone, email, gender, local, diocese, level, role).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)} disabled={unavailable}><Eye /> Preview form</Button>
          <Button type="button" onClick={() => openEditor()} disabled={unavailable}><Plus /> Add question</Button>
        </div>
      </div>

      {unavailable ? (
        <p className="rounded-md bg-secondary p-3 text-sm">Extra questions need database migration 0006. Ask the site admin to run it.</p>
      ) : fields === null ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No extra questions. The form uses only the standard questions.
        </p>
      ) : (
        <>
          <SortableList
            items={fields}
            getKey={(f) => f.id}
            onChange={(next) => { setFields(next); setOrderChanged(true) }}
            render={(f) => (
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{f.label}{f.required && <span className="text-destructive"> *</span>}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {typeLabel(f.field_type)}{f.options.length ? `: ${f.options.join(', ')}` : ''}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label={`Edit "${f.label}"`} onClick={() => openEditor(f)}><Pencil /></Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove "${f.label}"`} onClick={() => setToRemove(f)}><Trash2 className="text-destructive" /></Button>
              </div>
            )}
          />
          {orderChanged && (
            <div className="flex items-center gap-2">
              <Button type="button" onClick={saveOrder} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Save />} Save order</Button>
              <Button type="button" variant="ghost" onClick={load} disabled={busy}>Undo</Button>
            </div>
          )}
        </>
      )}

      {removed.length > 0 && (
        <details className="rounded-md border border-border p-3 text-sm">
          <summary className="cursor-pointer text-muted-foreground">Removed questions ({removed.length}), kept for answers already given</summary>
          <ul className="mt-3 space-y-2">
            {removed.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">{f.label} <Badge variant="secondary">{typeLabel(f.field_type)}</Badge></span>
                <Button type="button" size="sm" variant="outline" onClick={() => restore(f)}><RotateCcw /> Add back</Button>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Add or edit a question */}
      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Edit question' : 'Add a question'}</DialogTitle>
            <DialogDescription>
              {registrations > 0
                ? `${registrations} ${registrations === 1 ? 'person has' : 'people have'} already registered. Answers they gave stay as they are.`
                : 'It appears on the form after the standard questions.'}
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="q-label">Question <span className="text-destructive">*</span></Label>
                <Input id="q-label" value={draft.label} maxLength={200} placeholder="T-shirt size" onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-type">Answer type</Label>
                <select id="q-type" className={selectClass} value={draft.field_type}
                  onChange={(e) => setDraft({ ...draft, field_type: e.target.value as CustomFieldType })}>
                  {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {hasOptions(draft.field_type) && (
                <div className="space-y-1.5">
                  <Label htmlFor="q-options">Options <span className="text-destructive">*</span></Label>
                  <Textarea id="q-options" rows={5} value={draft.optionsText} placeholder={'Small\nMedium\nLarge'}
                    onChange={(e) => setDraft({ ...draft, optionsText: e.target.value })} />
                  <p className="text-xs text-muted-foreground">One option per line.</p>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="q-help">Help text</Label>
                <Input id="q-help" value={draft.help_text} maxLength={300} placeholder="Optional. Shown under the question."
                  onChange={(e) => setDraft({ ...draft, help_text: e.target.value })} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                <Label htmlFor="q-required">Required</Label>
                <Switch id="q-required" checked={draft.required} onCheckedChange={(required) => setDraft({ ...draft, required })} />
              </div>
              {draftError && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{draftError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button type="button" onClick={saveDraft} disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* The visitor's form, with this activity's questions. Nothing is sent. */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Form preview</DialogTitle>
            <DialogDescription>This is the form visitors see. Try it out: nothing is sent.</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <div className="bg-[#003D82] px-6 py-5 text-white">
              <p className="text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Register</p>
            </div>
            <div className="p-6">
              {previewOpen && <ActivityRegistrationForm activityId={activityId} fields={fields ?? []} preview onSuccess={() => undefined} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(open) => !open && setToRemove(null)}
        title="Remove this question?"
        description={registrations > 0
          ? `${registrations} ${registrations === 1 ? 'person has' : 'people have'} already registered. Their answers to "${toRemove?.label}" will be kept and shown as a removed question in the registrations list and CSV. New registrants won't see it.`
          : `"${toRemove?.label}" will be deleted from the form. No one has registered yet, so no answers are lost.`}
        confirmLabel="Remove question"
        destructive
        onConfirm={remove}
      />
    </section>
  )
}
