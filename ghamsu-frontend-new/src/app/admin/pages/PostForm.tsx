import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { JSONContent } from '@tiptap/react'
import { ArrowLeft, CheckCircle2, ExternalLink, Eye, Heart, Loader2, Trash2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { clearPublicDataCache } from '../../../lib/hooks'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FieldInput, selectClass, toFormValues, toPayload, validate, type Errors, type FieldDef, type Values } from '../components/fields'
import { RichTextEditor } from '../components/RichTextEditor'
import { EmptyState, Loading, PageHeader, StatusBadge } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { cleanText, formatDateTime, SLUG_RULE, slugify } from '../lib/forms'

const CATEGORIES: Record<string, { value: string; label: string }[]> = {
  news: [
    { value: 'announcement', label: 'Announcement' },
    { value: 'event-coverage', label: 'Event coverage' },
    { value: 'campus-news', label: 'Campus news' },
    { value: 'union-update', label: 'Union update' },
  ],
  article: [
    { value: 'faith', label: 'Faith' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'campus-life', label: 'Campus life' },
    { value: 'devotionals', label: 'Devotionals' },
  ],
}

// Only the columns editors may write (see the column grants in 0002_rls.sql).
// view_count and like_count are never sent.
function buildFields(postType: string, authors: { value: string; label: string }[]): FieldDef[] {
  return [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 3, publishRequired: true, help: 'A short summary shown on cards and at the top of the post.' },
    { name: 'cover_image', label: 'Featured image', type: 'image', publishRequired: true, withCaption: true },
    { name: 'author_name', label: postType === 'news' ? 'Reporter' : 'Author', type: 'text', help: 'Needed before publishing, unless an author profile is chosen below.' },
    { name: 'author_detail', label: postType === 'news' ? 'Reporter position or local' : 'Author position or local', type: 'text', placeholder: 'UG Local' },
    ...(authors.length ? [{ name: 'author_id', label: 'Author profile (optional)', type: 'select' as const, options: authors, placeholder: 'None' }] : []),
    { name: 'category', label: 'Category', type: 'select', options: CATEGORIES[postType] ?? [] },
    ...(postType === 'article' ? [{ name: 'read_time_minutes', label: 'Read time (minutes)', type: 'number' as const, integer: true, min: 0 }] : []),
    { name: 'featured', label: 'Featured', type: 'switch' },
    { name: 'published_at', label: 'Publish date', type: 'datetime', help: 'Filled in automatically the first time the post is published.' },
    ...(postType === 'news'
      ? [{
        name: 'media', label: 'Media attachments', type: 'objects' as const, virtual: true,
        help: 'Video or audio players shown below the post (YouTube, Vimeo, SoundCloud, Spotify or a direct file link).',
        fields: [
          { name: 'media_type', label: 'Type', type: 'select' as const, options: [{ value: 'video', label: 'Video' }, { value: 'audio', label: 'Audio' }] },
          { name: 'label', label: 'Label', type: 'text' as const, placeholder: 'Watch the service' },
          { name: 'url', label: 'Link', type: 'url' as const, placeholder: 'https://…' },
          { name: 'description', label: 'Description', type: 'text' as const },
        ],
      }]
      : []),
  ]
}

const contentIsEmpty = (content: JSONContent | null) => !content || !content.content?.length

export function PostForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const creating = id === 'new'

  const [row, setRow] = useState<Values | null>(null)
  const [values, setValues] = useState<Values>({ post_type: 'news', featured: false, media: [] })
  const [content, setContent] = useState<JSONContent | null>(null)
  const [slugEdited, setSlugEdited] = useState(false)
  const [slugTaken, setSlugTaken] = useState<boolean | null>(null)
  const [authors, setAuthors] = useState<{ value: string; label: string }[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editorKey, setEditorKey] = useState(0)

  const postType = values.post_type === 'article' ? 'article' : 'news'
  const fields = useMemo(() => buildFields(postType, authors), [postType, authors])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase) return
      const { data: authorRows } = await supabase.from('authors').select('id, name').order('name')
      if (cancelled) return
      setAuthors((authorRows ?? []).map((a) => ({ value: a.id, label: a.name })))

      if (creating) {
        setRow(null)
        setValues({ post_type: 'news', featured: false, media: [] })
        setContent(null)
        setSlugEdited(false)
        setLoading(false)
        setEditorKey((k) => k + 1)
        return
      }
      const { data, error } = await supabase
        .from('posts')
        .select('*, post_media_attachments(media_type, label, url, description, sort_order)')
        .eq('id', id!)
        .maybeSingle()
      if (cancelled) return
      if (error) toast.error(friendlyError(error))
      if (!data) {
        setMissing(true)
        setLoading(false)
        return
      }
      const media = [...(data.post_media_attachments ?? [])].sort((a, b) => a.sort_order - b.sort_order)
      const all = buildFields(data.post_type, [])
      setRow(data)
      setValues({ ...toFormValues(all, data), slug: data.slug, media: toFormValues(buildFields('news', []), { media }).media, author_id: data.author_id ?? '' })
      setContent(data.content ?? null)
      setSlugEdited(true)
      setSlugTaken(false)
      setEditorKey((k) => k + 1)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id, creating])

  // Check the slug is free, shortly after typing stops.
  useEffect(() => {
    const slug = values.slug
    if (!supabase || !slug || !SLUG_RULE.test(slug) || slug === row?.slug) {
      setSlugTaken(slug && slug === row?.slug ? false : null)
      return
    }
    setSlugTaken(null)
    const timer = setTimeout(async () => {
      const { data } = await supabase!.from('posts').select('id').eq('slug', slug).limit(1)
      setSlugTaken(Boolean(data?.length && data[0].id !== row?.id))
    }, 400)
    return () => clearTimeout(timer)
  }, [values.slug, row?.slug, row?.id])

  const change = (changes: Values) => {
    setValues((prev) => {
      const next = { ...prev, ...changes }
      if ('title' in changes && !slugEdited) next.slug = slugify(changes.title ?? '')
      if ('post_type' in changes) {
        const allowed = (CATEGORIES[next.post_type] ?? []).map((c) => c.value)
        if (!allowed.includes(next.category)) next.category = ''
      }
      return next
    })
    setErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(changes)) {
        delete next[key]
        delete next[key.replace(/_(path|alt|caption|focus)$/, '')]
      }
      if ('title' in changes) delete next.slug
      return next
    })
  }

  const save = async (status?: 'published' | 'draft') => {
    if (!supabase) return
    const target = status ?? row?.status ?? 'draft'
    const publishing = target === 'published'
    const found = validate(fields, values, { publishing })

    const slug = String(values.slug ?? '').trim()
    if (!slug) found.slug = 'This field is required.'
    else if (!SLUG_RULE.test(slug) || slug.length > 96) found.slug = 'Use lowercase letters, numbers and single dashes only (at most 96 characters).'
    else if (slugTaken) found.slug = 'That slug is already used. Choose a different one.'

    if (publishing) {
      if (contentIsEmpty(content)) found.content = 'Write the post before publishing.'
      if (!cleanText(values.author_name) && !values.author_id) found.author_name = 'Add an author before publishing.'
    }
    if (postType === 'news') {
      const incomplete = (values.media ?? []).some((m: Values) =>
        [m.media_type, m.label, m.url].some((v) => cleanText(v)) && ![m.media_type, m.label, m.url].every((v) => cleanText(v)))
      if (incomplete) found.media = 'Each media attachment needs a type, a label and a link.'
    }

    setErrors(found)
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.')
      document.querySelector('[aria-invalid="true"], .text-destructive')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSaving(true)
    try {
      const payload: Values = {
        ...toPayload(fields, values),
        post_type: postType,
        slug,
        status: target,
        content: contentIsEmpty(content) ? null : content,
        author_id: values.author_id || null,
        category: values.category || null,
      }
      if (postType !== 'article') payload.read_time_minutes = null

      const query = creating
        ? supabase.from('posts').insert(payload).select().single()
        : supabase.from('posts').update(payload).eq('id', row!.id).select().single()
      const { data, error } = await query
      if (error) throw error

      // Attachments have no ID of their own, so they are replaced as a set.
      const { error: deleteError } = await supabase.from('post_media_attachments').delete().eq('post_id', data.id)
      if (deleteError) throw deleteError
      const media = postType === 'news'
        ? (values.media ?? [])
          .filter((m: Values) => cleanText(m.url))
          .map((m: Values, index: number) => ({
            post_id: data.id, media_type: m.media_type, label: cleanText(m.label), url: cleanText(m.url),
            description: cleanText(m.description), sort_order: index,
          }))
        : []
      if (media.length) {
        const { error: insertError } = await supabase.from('post_media_attachments').insert(media)
        if (insertError) throw insertError
      }

      clearPublicDataCache()
      toast.success(
        publishing && row?.status !== 'published' ? 'Post published.'
          : status === 'draft' && row?.status === 'published' ? 'Post unpublished and saved as a draft.'
            : 'Post saved.',
      )
      if (creating) navigate(`/admin/posts/${data.id}`, { replace: true })
      else {
        setRow(data)
        setValues((prev) => ({ ...prev, published_at: toFormValues(fields, data).published_at }))
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
    const { error } = await supabase.from('posts').delete().eq('id', row.id)
    setSaving(false)
    if (error) return toast.error(friendlyError(error))
    clearPublicDataCache()
    toast.success('Post deleted.')
    navigate('/admin/posts')
  }

  if (loading) return <Loading />
  if (missing) {
    return <EmptyState>This post doesn't exist. It may have been deleted. <Link to="/admin/posts" className="text-primary underline">Back to posts</Link></EmptyState>
  }

  const isPublished = row?.status === 'published'
  const field = (name: string) => fields.find((f) => f.name === name)
  const renderField = (name: string) => {
    const def = field(name)
    return def ? <FieldInput key={name} field={def} values={values} onChange={change} error={errors[name]} /> : null
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); save() }} className="pb-28">
      <Link to="/admin/posts" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Posts
      </Link>
      <PageHeader
        title={creating ? 'New post' : row?.title ?? 'Post'}
        description={!creating && (
          <span className="flex flex-wrap items-center gap-3">
            <StatusBadge status={row?.status} />
            {row?.updated_at && <span>Last edited {formatDateTime(row.updated_at)}</span>}
            <span className="inline-flex items-center gap-1" title="Likes (read-only)"><Heart className="h-3.5 w-3.5" /> {row?.like_count ?? 0}</span>
            <span className="inline-flex items-center gap-1" title="Views (read-only)"><Eye className="h-3.5 w-3.5" /> {row?.view_count ?? 0}</span>
            {isPublished && (
              <a href={`/blogs/${row?.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                View on site <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </span>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="space-y-1.5">
            <Label htmlFor="post-type">Type</Label>
            <select id="post-type" className={selectClass} value={postType} onChange={(event) => change({ post_type: event.target.value })}>
              <option value="news">News</option>
              <option value="article">Article</option>
            </select>
          </div>
          {renderField('title')}
          <div className="space-y-1.5">
            <Label htmlFor="post-slug">Web address <span className="text-destructive">*</span></Label>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">/blogs/</span>
              <Input
                id="post-slug" value={values.slug ?? ''} aria-invalid={Boolean(errors.slug) || undefined}
                onChange={(event) => { setSlugEdited(true); change({ slug: event.target.value.toLowerCase() }) }}
              />
              {slugTaken === false && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" aria-label="Available" />}
              {slugTaken === true && <XCircle className="h-5 w-5 flex-shrink-0 text-destructive" aria-label="Already used" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Made from the title. Lowercase letters, numbers and dashes only.
              {slugEdited && (
                <button type="button" className="ml-2 text-primary underline" onClick={() => { setSlugEdited(false); change({ slug: slugify(values.title ?? '') }) }}>
                  Make from title
                </button>
              )}
            </p>
            {(errors.slug || slugTaken) && <p className="text-sm text-destructive">{errors.slug ?? 'That slug is already used. Choose a different one.'}</p>}
          </div>
          {renderField('excerpt')}
          <div className="space-y-1.5">
            <Label>Content</Label>
            <RichTextEditor key={editorKey} content={content} invalid={Boolean(errors.content)}
              onChange={(next) => { setContent(next); setErrors((prev) => { const n = { ...prev }; delete n.content; return n }) }} />
            {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
          </div>
          {renderField('media')}
        </div>

        <div className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6 lg:self-start">
          {renderField('cover_image')}
          {renderField('author_name')}
          {renderField('author_detail')}
          {renderField('author_id')}
          {renderField('category')}
          {renderField('read_time_minutes')}
          {renderField('featured')}
          {renderField('published_at')}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {isPublished ? 'Save' : 'Save draft'}
          </Button>
          {!isPublished && <Button type="button" variant="secondary" disabled={saving} onClick={() => save('published')}>Save and publish</Button>}
          {isPublished && <Button type="button" variant="outline" disabled={saving} onClick={() => save('draft')}>Unpublish</Button>}
          {!creating && (
            <Button type="button" variant="ghost" className="ml-auto text-destructive" disabled={saving} onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this post?"
        description={`"${row?.title ?? ''}" will be permanently deleted, including its likes and views. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </form>
  )
}
