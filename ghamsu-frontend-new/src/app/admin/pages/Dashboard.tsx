import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../auth'
import { CONTENT_RESOURCES, type ResourceConfig } from '../resources'
import { Loading, PageHeader, StatusBadge } from '../components/ui'
import { formatDateTime } from '../lib/forms'

interface Counts { published: number; draft: number }
interface Recent { config: ResourceConfig; id: string; title: string; status: string; updated_at: string }

export function Dashboard() {
  const { profile } = useAuth()
  const [counts, setCounts] = useState<Record<string, Counts> | null>(null)
  const [recent, setRecent] = useState<Recent[] | null>(null)

  useEffect(() => {
    if (!supabase) return
    const db = supabase
    const count = async (config: ResourceConfig, status: string) => {
      const { count: n } = await db.from(config.table).select('*', { count: 'exact', head: true }).eq('status', status)
      return n ?? 0
    }
    Promise.all(CONTENT_RESOURCES.map(async (config) => [config.key, { published: await count(config, 'published'), draft: await count(config, 'draft') }] as const))
      .then((entries) => setCounts(Object.fromEntries(entries)))

    Promise.all(CONTENT_RESOURCES.map(async (config) => {
      const { data } = await db.from(config.table)
        .select(`id, ${config.titleColumn}, status, updated_at`)
        .order('updated_at', { ascending: false }).limit(5)
      return (data ?? []).map((row: Record<string, any>) => ({
        config, id: row.id, title: String(row[config.titleColumn] ?? 'Untitled').replace(/\n/g, ' '), status: row.status, updated_at: row.updated_at,
      }))
    })).then((lists) => setRecent(lists.flat().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5)))
  }, [])

  return (
    <div>
      <PageHeader
        title={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ''}`}
        description="An overview of the website's content."
      />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Content</h2>
        {!counts ? <Loading /> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CONTENT_RESOURCES.map((config) => (
              <Link key={config.key} to={config.path} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent">
                <p className="text-sm font-medium">{config.label}</p>
                <p className="mt-2 text-2xl font-semibold">{counts[config.key]?.published ?? 0}</p>
                <p className="text-xs text-muted-foreground">published · {counts[config.key]?.draft ?? 0} draft{counts[config.key]?.draft === 1 ? '' : 's'}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recently edited</h2>
        {!recent ? <Loading /> : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing has been edited yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {recent.map((item) => (
              <li key={`${item.config.key}-${item.id}`}>
                <Link to={`${item.config.path}/${item.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.config.singular} · edited {formatDateTime(item.updated_at)}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
