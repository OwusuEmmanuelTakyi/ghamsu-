import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpDown, ExternalLink, Eye, EyeOff, ListChecks, Loader2, Lock, LockOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { clearPublicDataCache } from '../../../lib/hooks'
import { thumbUrl, fallbackToFull, mediaUrl } from '../../../lib/media'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { SortableList } from '../components/SortableList'
import { selectClass, type Values } from '../components/fields'
import { EmptyState, Loading, PageHeader, StatusBadge } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { formatDateTime } from '../lib/forms'
import type { ResourceConfig } from '../resources'

type Filter = 'all' | 'published' | 'draft'
type Pending = { action: 'publish' | 'unpublish' | 'delete' | 'toggle'; row: Values } | null

/** Saves a new order. Two passes, so unique sort_order columns never clash. */
export async function saveOrder(config: ResourceConfig, rows: Values[]) {
  if (!supabase) return
  const id = config.idColumn ?? 'id'
  for (const pass of [10000, 0]) {
    for (const [index, row] of rows.entries()) {
      const { error } = await supabase.from(config.table).update({ sort_order: pass + index + 1 }).eq(id, row[id])
      if (error) throw error
    }
  }
}

export function ResourceList({ config }: { config: ResourceConfig }) {
  const idColumn = config.idColumn ?? 'id'
  const hasStatus = config.hasStatus !== false
  const [rows, setRows] = useState<Values[] | null>(null)
  const [extra, setExtra] = useState<Values>({})
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [reordering, setReordering] = useState<Values[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Pending>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    const [{ data, error }, extraValues] = await Promise.all([
      supabase.from(config.table).select('*').order(config.order.column, { ascending: config.order.ascending }),
      config.listExtra?.() ?? Promise.resolve({}),
    ])
    if (error) {
      toast.error(friendlyError(error))
      setRows([])
      return
    }
    setExtra(extraValues)
    setRows(data ?? [])
  }, [config])

  useEffect(() => {
    setRows(null)
    setSearch('')
    setFilter('all')
    setReordering(null)
    load()
  }, [load])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (rows ?? []).filter((row) => {
      if (filter !== 'all' && row.status !== filter) return false
      if (!term) return true
      return config.searchColumns.some((column) => String(row[column] ?? '').toLowerCase().includes(term))
    })
  }, [rows, search, filter, config.searchColumns])

  const run = async (next: Pending) => {
    setPending(null)
    if (!next || !supabase) return
    const { action, row } = next
    const toggle = config.listToggle
    setBusy(true)
    const query = action === 'delete'
      ? supabase.from(config.table).delete().eq(idColumn, row[idColumn])
      : action === 'toggle' && toggle
        ? supabase.from(config.table).update({ [toggle.column]: !row[toggle.column] }).eq(idColumn, row[idColumn])
        : supabase.from(config.table).update({ status: action === 'publish' ? 'published' : 'draft' }).eq(idColumn, row[idColumn])
    const { error } = await query
    setBusy(false)
    if (error) return toast.error(friendlyError(error))
    clearPublicDataCache()
    const name = row[config.titleColumn] || config.singular
    toast.success(
      action === 'delete' ? `"${name}" deleted.`
        : action === 'toggle' && toggle ? (row[toggle.column] ? toggle.offMessage : toggle.onMessage)
          : action === 'publish' ? `"${name}" is now live.` : `"${name}" is now a draft.`,
    )
    load()
  }

  const saveReorder = async () => {
    if (!reordering) return
    setBusy(true)
    try {
      await saveOrder(config, reordering)
      clearPublicDataCache()
      toast.success('New order saved.')
      setReordering(null)
      load()
    } catch (error) {
      toast.error(friendlyError(error))
    } finally {
      setBusy(false)
    }
  }

  const renderRow = (row: Values, compact = false) => {
    const image = config.imagePath?.(row)
    const badge = config.badge?.(row, extra)
    return (
      <div className="flex min-w-0 items-center gap-3">
        {config.imagePath && (
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
            {image && (
              <img src={thumbUrl(image)} onError={fallbackToFull(mediaUrl(image))} alt="" loading="lazy" className="h-full w-full object-cover" />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{String(row[config.titleColumn] ?? '').replace(/\n/g, ' ') || 'Untitled'}</p>
          {config.subtitle && <p className="truncate text-xs text-muted-foreground">{config.subtitle(row, extra)}</p>}
          {!compact && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {hasStatus && <StatusBadge status={row.status} />}
              {badge && <Badge variant="outline">{badge}</Badge>}
              {row.updated_at && <span className="text-xs text-muted-foreground">Edited {formatDateTime(row.updated_at)}</span>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={config.label}
        description={config.help}
        actions={
          <>
            {config.sortable && rows && rows.length > 1 && !reordering && (
              <Button variant="outline" onClick={() => setReordering(rows)}>
                <ArrowUpDown /> Reorder
              </Button>
            )}
            {config.canCreate !== false && !reordering && (
              <Button asChild>
                <Link to={`${config.path}/new`}><Plus /> New {config.singular.toLowerCase()}</Link>
              </Button>
            )}
          </>
        }
      />

      {reordering ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Drag the handles, or use the arrows, then save. This is the order used on the site.</p>
          <SortableList items={reordering} getKey={(row) => String(row[idColumn])} onChange={setReordering} render={(row) => renderRow(row, true)} />
          <div className="flex gap-2">
            <Button onClick={saveReorder} disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save order</Button>
            <Button variant="ghost" onClick={() => setReordering(null)} disabled={busy}>Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={`Search ${config.label.toLowerCase()}…`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label={`Search ${config.label.toLowerCase()}`}
              />
            </div>
            {hasStatus && (
              <select className={`${selectClass} sm:w-44`} value={filter} onChange={(event) => setFilter(event.target.value as Filter)} aria-label="Filter by status">
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            )}
          </div>

          {rows === null ? (
            <Loading />
          ) : visible.length === 0 ? (
            <EmptyState>{rows.length === 0 ? `No ${config.label.toLowerCase()} yet.` : 'Nothing matches your search.'}</EmptyState>
          ) : (
            <ul className="space-y-2">
              {visible.map((row) => {
                const publicPath = row.status === 'published' ? config.publicPath?.(row) : null
                return (
                  <li key={String(row[idColumn])} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
                    <Link to={`${config.path}/${encodeURIComponent(row[idColumn])}`} className="min-w-0 flex-1 hover:opacity-80">
                      {renderRow(row)}
                    </Link>
                    <div className="flex flex-wrap gap-1.5 sm:max-w-md sm:justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`${config.path}/${encodeURIComponent(row[idColumn])}`}><Pencil /> Edit</Link>
                      </Button>
                      {hasStatus && (
                        row.status === 'published' ? (
                          <Button variant="outline" size="sm" disabled={busy} onClick={() => setPending({ action: 'unpublish', row })}>
                            <EyeOff /> Unpublish
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled={busy} onClick={() => setPending({ action: 'publish', row })}>
                            <Eye /> Publish
                          </Button>
                        )
                      )}
                      {config.listToggle && (
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => setPending({ action: 'toggle', row })}>
                          {row[config.listToggle.column] ? <Lock /> : <LockOpen />}
                          {row[config.listToggle.column] ? config.listToggle.onLabel : config.listToggle.offLabel}
                        </Button>
                      )}
                      {config.rowLinks?.map((link) => (
                        <Button key={link.label} variant="outline" size="sm" asChild>
                          <Link to={link.to(row)}><ListChecks /> {link.label}</Link>
                        </Button>
                      ))}
                      {publicPath && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={publicPath} target="_blank" rel="noopener noreferrer" aria-label="View on site"><ExternalLink /></a>
                        </Button>
                      )}
                      {config.canDelete !== false && (
                        <Button variant="ghost" size="sm" disabled={busy} onClick={() => setPending({ action: 'delete', row })} aria-label="Delete">
                          <Trash2 className="text-destructive" />
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.action === 'delete' ? `Delete this ${config.singular.toLowerCase()}?`
            : pending?.action === 'toggle' && config.listToggle
              ? `${pending.row[config.listToggle.column] ? config.listToggle.onLabel : config.listToggle.offLabel}?`
              : pending?.action === 'publish' ? `Publish this ${config.singular.toLowerCase()}?`
                : `Unpublish this ${config.singular.toLowerCase()}?`
        }
        description={
          pending?.action === 'delete'
            ? `"${pending.row[config.titleColumn] ?? ''}" will be permanently deleted${config.key === 'major_activities' ? ', together with all its registrations' : ''}. This cannot be undone.`
            : pending?.action === 'toggle'
              ? `This applies to "${pending.row[config.titleColumn] ?? ''}" straight away.`
              : pending?.action === 'publish'
                ? `"${pending?.row[config.titleColumn] ?? ''}" will be visible to everyone on the website.`
                : `"${pending?.row[config.titleColumn] ?? ''}" will be hidden from the website and kept as a draft.`
        }
        confirmLabel={
          pending?.action === 'delete' ? 'Delete'
            : pending?.action === 'toggle' && config.listToggle
              ? (pending.row[config.listToggle.column] ? config.listToggle.onLabel : config.listToggle.offLabel)
              : pending?.action === 'publish' ? 'Publish' : 'Unpublish'
        }
        destructive={pending?.action === 'delete'}
        onConfirm={() => run(pending)}
      />
    </div>
  )
}
