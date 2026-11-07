import { Copy, ExternalLink, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { activityDate } from '../../../lib/activities'
import { Button } from '../../components/ui/button'
import { copyText } from '../../components/ShareButtons'
import type { Values } from './fields'

/** "Copy link", "Share on WhatsApp" and "Open page" for one activity in the admin list. */
export function ActivityShareActions({ row }: { row: Values }) {
  if (row.status !== 'published' || !row.slug) {
    return <span className="self-center px-1 text-xs text-muted-foreground">Publish to share</span>
  }
  const url = `${window.location.origin}/activities/${row.slug}`
  const date = activityDate({ startsAt: row.starts_at ?? null, endsAt: row.ends_at ?? null, dateText: row.date_text ?? null } as never)
  const text = [row.title, [date, row.location].filter(Boolean).join(' · '), url].filter(Boolean).join('\n')

  const copy = async () => {
    if (await copyText(url)) toast.success('Link copied.')
    else toast.error("Couldn't copy automatically. Open the page and copy the address.")
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={copy}><Copy /> Copy link</Button>
      <Button variant="outline" size="sm" asChild>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"><MessageCircle /> Share on WhatsApp</a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink /> Open page</a>
      </Button>
    </>
  )
}
