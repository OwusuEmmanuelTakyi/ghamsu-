import { useCallback, useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { Badge } from '../../components/ui/badge'
import { useAuth, type Profile } from '../auth'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { selectClass } from '../components/fields'
import { EmptyState, Loading, PageHeader } from '../components/ui'
import { friendlyError } from '../lib/errors'

const ROLE_LABELS: Record<string, string> = { admin: 'Admin', editor: 'Editor', none: 'No access' }

export function Users() {
  const { profile: me, refreshProfile } = useAuth()
  const [users, setUsers] = useState<Profile[] | null>(null)
  const [pending, setPending] = useState<{ user: Profile; role: string } | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('profiles').select('id, email, full_name, role, is_active').order('email')
    if (error) toast.error(friendlyError(error))
    setUsers((data as Profile[]) ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const apply = async () => {
    const next = pending
    setPending(null)
    if (!next || !supabase) return
    setSaving(next.user.id)
    const role = next.role === 'none' ? null : next.role
    const { error } = await supabase.from('profiles').update({ role }).eq('id', next.user.id)
    setSaving(null)
    if (error) return toast.error(friendlyError(error))
    toast.success(`${next.user.email} is now: ${ROLE_LABELS[next.role]}.`)
    if (next.user.id === me?.id) await refreshProfile()
    load()
  }

  return (
    <div>
      <PageHeader title="Users" description="Choose what each person can do. Editors manage content; admins can also manage settings and users." />

      <div className="mb-6 flex gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-sm">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="font-medium">Adding someone new</p>
          <p className="text-muted-foreground">
            Invite them from the Supabase dashboard: <strong>Authentication → Users → Add user → Send invitation</strong>.
            Once they accept, they appear here with no access. Choose Editor or Admin for them below.
            If the invitation link doesn't let them set a password, they can use "Forgot your password?" on the sign-in page.
          </p>
        </div>
      </div>

      {users === null ? <Loading /> : users.length === 0 ? <EmptyState>No users yet.</EmptyState> : (
        <ul className="space-y-2">
          {users.map((user) => {
            const current = user.role ?? 'none'
            return (
              <li key={user.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{user.full_name || user.email}</p>
                  {user.full_name && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {user.id === me?.id && <Badge variant="outline">You</Badge>}
                    {!user.is_active && <Badge variant="destructive">Deactivated</Badge>}
                  </div>
                </div>
                <select
                  className={`${selectClass} sm:w-40`}
                  value={current}
                  disabled={saving === user.id}
                  aria-label={`Role for ${user.email}`}
                  onChange={(event) => setPending({ user, role: event.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="none">No access</option>
                </select>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Change role?"
        description={pending ? (
          pending.user.id === me?.id && pending.role !== 'admin'
            ? `You are about to remove your own admin access. You will no longer be able to manage settings or users.`
            : `${pending.user.email} will become: ${ROLE_LABELS[pending.role]}.`
        ) : ''}
        confirmLabel="Change role"
        destructive={pending?.user.id === me?.id && pending?.role !== 'admin'}
        onConfirm={apply}
      />
    </div>
  )
}
