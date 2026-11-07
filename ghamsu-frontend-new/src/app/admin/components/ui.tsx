import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Badge } from '../../components/ui/badge'

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null
  return status === 'published' ? (
    <Badge className="bg-green-600 text-white hover:bg-green-600">Published</Badge>
  ) : (
    <Badge variant="secondary">Draft</Badge>
  )
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground" role="status">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{children}</div>
}
