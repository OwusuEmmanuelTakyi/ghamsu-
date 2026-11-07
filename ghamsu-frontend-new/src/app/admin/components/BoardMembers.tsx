import { useEffect, useState } from 'react'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { clearPublicDataCache } from '../../../lib/hooks'
import { Button } from '../../components/ui/button'
import { FieldInput, toFormValues, toPayload, validate, type Errors, type FieldDef, type Values } from './fields'
import { ConfirmDialog } from './ConfirmDialog'
import { friendlyError } from '../lib/errors'

const MEMBER_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'position', label: 'Position', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'image', label: 'Photo', type: 'image', withCaption: true },
]

interface Member { key: string; id: string | null; values: Values; errors: Errors; saving: boolean }

let counter = 0

/** Members of one board. Each member saves on its own. */
export function BoardMembers({ row }: { row: Values }) {
  const [members, setMembers] = useState<Member[] | null>(null)
  const [toDelete, setToDelete] = useState<Member | null>(null)

  useEffect(() => {
    if (!supabase || !row.id) return
    supabase.from('board_members').select('*').eq('board_id', row.id).order('sort_order').then(({ data, error }) => {
      if (error) toast.error(friendlyError(error))
      setMembers((data ?? []).map((m) => ({ key: `m${++counter}`, id: m.id, values: toFormValues(MEMBER_FIELDS, m), errors: {}, saving: false })))
    })
  }, [row.id])

  if (!row.id) return null

  const patch = (key: string, changes: Partial<Member>) =>
    setMembers((list) => list?.map((m) => (m.key === key ? { ...m, ...changes } : m)) ?? null)

  const save = async (member: Member, index: number) => {
    const errors = validate(MEMBER_FIELDS, member.values)
    patch(member.key, { errors })
    if (Object.keys(errors).length || !supabase) return
    patch(member.key, { saving: true })
    const payload = { ...toPayload(MEMBER_FIELDS, member.values), board_id: row.id, sort_order: index }
    const query = member.id
      ? supabase.from('board_members').update(payload).eq('id', member.id).select('id').single()
      : supabase.from('board_members').insert(payload).select('id').single()
    const { data, error } = await query
    patch(member.key, { saving: false, id: data?.id ?? member.id })
    if (error) toast.error(friendlyError(error))
    else {
      clearPublicDataCache()
      toast.success(`${member.values.name} saved.`)
    }
  }

  const remove = async (member: Member) => {
    setToDelete(null)
    if (member.id && supabase) {
      const { error } = await supabase.from('board_members').delete().eq('id', member.id)
      if (error) return toast.error(friendlyError(error))
      clearPublicDataCache()
    }
    setMembers((list) => list?.filter((m) => m.key !== member.key) ?? null)
    toast.success('Member removed.')
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">Board members</h2>
        <p className="text-sm text-muted-foreground">Shown on the board page once at least one member is added.</p>
      </div>
      {members === null ? (
        <p className="text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading members…</p>
      ) : (
        <>
          {members.map((member, index) => (
            <div key={member.key} className="space-y-3 rounded-lg border border-border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {MEMBER_FIELDS.filter((f) => f.type !== 'image').map((field) => (
                  <FieldInput key={field.name} field={field} values={member.values} idPrefix={member.key}
                    error={member.errors[field.name]}
                    onChange={(changes) => patch(member.key, { values: { ...member.values, ...changes } })} />
                ))}
              </div>
              <FieldInput field={MEMBER_FIELDS[4]} values={member.values} idPrefix={member.key} error={member.errors.image}
                onChange={(changes) => patch(member.key, { values: { ...member.values, ...changes } })} />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => save(member, index)} disabled={member.saving}>
                  {member.saving ? <Loader2 className="animate-spin" /> : <Save />} Save member
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setToDelete(member)}>
                  <Trash2 /> Remove
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() =>
            setMembers((list) => [...(list ?? []), { key: `m${++counter}`, id: null, values: toFormValues(MEMBER_FIELDS, {}), errors: {}, saving: false }])}>
            <Plus /> Add member
          </Button>
        </>
      )}
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Remove this member?"
        description={`${toDelete?.values.name || 'This member'} will be removed from the board page.`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => toDelete && remove(toDelete)}
      />
    </section>
  )
}
