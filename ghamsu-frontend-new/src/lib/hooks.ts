import { useEffect, useMemo, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { mediaUrl, thumbUrl } from './media'
import type {
  Article,
  Blog,
  Board,
  Event,
  Executive,
  FetchState,
  GalleryItem,
  HeroSlide,
  MajorActivity,
  MediaImage,
  News,
  PageHero,
  Sermon,
  SocialLink,
  Stat,
} from '../types/types'

// ─── Query cache ───────────────────────────────────────────────────────────────
// Each query runs once per page load and is shared by every component that asks
// for it. The home page, for example, uses news in two places but fetches once.
// Every public query filters status = 'published' itself: row-level security
// lets signed-in staff read drafts, and those must not appear on public pages.

const pending = new Map<string, Promise<unknown>>()
const resolved = new Map<string, unknown>()

/** Forget cached public data, so the next page view refetches. The admin calls
 *  this after every change, so its edits show when moving to the public site. */
export function clearPublicDataCache() {
  pending.clear()
  resolved.clear()
}

function runQuery<T>(key: string, fetcher: (db: SupabaseClient) => Promise<T>): Promise<T> {
  if (!supabase) return Promise.reject(new Error('The site is not connected to its database.'))
  let promise = pending.get(key) as Promise<T> | undefined
  if (!promise) {
    promise = fetcher(supabase).then((value) => {
      resolved.set(key, value)
      return value
    })
    // Forget failures so the next visit can retry.
    promise.catch(() => pending.delete(key))
    pending.set(key, promise)
  }
  return promise
}

function useQuery<T>(key: string | null, fetcher: (db: SupabaseClient) => Promise<T>): FetchState<T> {
  const cached = key !== null && resolved.has(key)
  const [state, setState] = useState<FetchState<T>>({
    data: cached ? (resolved.get(key!) as T) : null,
    loading: key !== null && !cached,
    error: null,
  })

  useEffect(() => {
    if (key === null) {
      setState({ data: null, loading: false, error: null })
      return
    }
    if (resolved.has(key)) {
      setState({ data: resolved.get(key) as T, loading: false, error: null })
      return
    }
    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))
    runQuery(key, fetcher).then(
      (data) => { if (!cancelled) setState({ data, loading: false, error: null }) },
      (error) => {
        console.error(`[data] ${key}:`, error)
        if (!cancelled) setState({ data: null, loading: false, error: error instanceof Error ? error : new Error(String(error)) })
      },
    )
    return () => { cancelled = true }
    // fetcher is defined inline by callers; the key identifies the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}

/** Supabase returns { data, error }. This throws the error so useQuery reports it. */
function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  return data as T
}

/** Applies a filter to an already fetched list, keeping the loading and error state. */
function useFiltered<T>(state: FetchState<T[]>, predicate: ((item: T) => boolean) | null, deps: unknown[]): FetchState<T[]> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => (state.data && predicate ? state.data.filter(predicate) : state.data), [state.data, ...deps])
  return { ...state, data }
}

// ─── Row mapping ───────────────────────────────────────────────────────────────

type Row = Record<string, any>

function toImage(row: Row, prefix: string): MediaImage | null {
  const path = row[`${prefix}_path`]
  if (!path) return null
  return {
    path,
    alt: row[`${prefix}_alt`] ?? null,
    caption: row[`${prefix}_caption`] ?? null,
    focus: row[`${prefix}_focus`] ?? null,
  }
}

const opt = <T,>(value: T | null | undefined): T | undefined => value ?? undefined

function toPost(row: Row): Blog {
  const base = {
    _id: row.id,
    legacyId: row.legacy_sanity_id ?? null,
    title: row.title,
    slug: { current: row.slug },
    featuredImage: toImage(row, 'cover_image'),
    excerpt: row.excerpt ?? '',
    content: row.content ?? null,
    authorName: opt(row.author_name ?? row.author?.name),
    authorLocal: opt(row.author_detail),
    publishedDate: opt(row.published_at),
    featured: Boolean(row.featured),
    likes: row.like_count ?? 0,
    views: row.view_count ?? 0,
    mediaAttachments: [...(row.post_media_attachments ?? [])]
      .sort((a: Row, b: Row) => a.sort_order - b.sort_order)
      .map((m: Row) => ({ mediaType: m.media_type, label: m.label, url: m.url, description: opt(m.description) })),
  }
  if (row.post_type === 'news') {
    return { ...base, _type: 'news', category: 'news', newsCategory: opt(row.category) } as News
  }
  return {
    ...base,
    _type: 'article',
    category: opt(row.category),
    articleCategory: opt(row.category),
    readTime: opt(row.read_time_minutes),
  } as Article
}

// ─── Posts ─────────────────────────────────────────────────────────────────────

const POST_LIST_COLUMNS =
  'id, legacy_sanity_id, post_type, title, slug, excerpt, category, author_name, author_detail, ' +
  'cover_image_path, cover_image_alt, cover_image_caption, cover_image_focus, read_time_minutes, ' +
  'featured, view_count, like_count, published_at, author:authors(name)'

/** All published news and articles, newest first. */
export function useBlogs(): FetchState<Blog[]> {
  return useQuery('posts:list', async (db) =>
    unwrap(
      await db
        .from('posts')
        .select(POST_LIST_COLUMNS)
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false }),
    ).map(toPost),
  )
}

export function useNews(): FetchState<News[]> {
  return useFiltered(useBlogs(), (post) => post._type === 'news', []) as FetchState<News[]>
}

export function useArticles(): FetchState<Article[]> {
  return useFiltered(useBlogs(), (post) => post._type === 'article', []) as FetchState<Article[]>
}

export function useBlogBySlug(slug: string | undefined): FetchState<Blog | null> {
  return useQuery(slug ? `posts:slug:${slug}` : null, async (db) => {
    const row = unwrap<Row | null>(
      await db
        .from('posts')
        .select(`${POST_LIST_COLUMNS}, content, post_media_attachments(media_type, label, url, description, sort_order)`)
        .eq('slug', slug!)
        .eq('status', 'published')
        .maybeSingle(),
    )
    return row ? toPost(row) : null
  })
}

// ─── Events ────────────────────────────────────────────────────────────────────

export function useEvents(): FetchState<Event[]> {
  return useQuery('events', async (db) =>
    unwrap(
      await db
        .from('events')
        .select('id, title, event_date, venue, flyer_path, flyer_alt, flyer_caption, flyer_focus, description, event_type, registration_url')
        .eq('status', 'published')
        .order('event_date', { ascending: true }),
    ).map((row: Row): Event => ({
      _id: row.id,
      _type: 'event',
      title: row.title,
      date: row.event_date,
      venue: row.venue,
      flyer: toImage(row, 'flyer'),
      description: opt(row.description),
      eventType: opt(row.event_type),
      registrationLink: opt(row.registration_url),
    })),
  )
}

// ─── Sermons ───────────────────────────────────────────────────────────────────

export function useSermons(filters?: { mediaType?: string }): FetchState<Sermon[]> {
  const all = useQuery('sermons', async (db) =>
    unwrap(
      await db
        .from('sermons')
        .select('*')
        .eq('status', 'published')
        .order('sermon_date', { ascending: false }),
    ).map((row: Row): Sermon => ({
      _id: row.id,
      _type: 'sermon',
      title: row.title,
      preacher: row.preacher,
      date: row.sermon_date,
      mediaType: row.media_type,
      videoUrl: opt(row.video_url),
      audioUrl: opt(row.audio_url),
      thumbnail: toImage(row, 'thumbnail'),
      scriptureReference: opt(row.scripture_reference),
      description: opt(row.description),
      series: opt(row.series),
      duration: opt(row.duration),
    })),
  )
  const mediaType = filters?.mediaType
  return useFiltered(all, mediaType ? (s) => s.mediaType === mediaType : null, [mediaType])
}

// ─── Gallery ───────────────────────────────────────────────────────────────────

export function useGallery(filters?: { category?: string }): FetchState<GalleryItem[]> {
  const all = useQuery('galleries', async (db) =>
    unwrap(
      await db
        .from('galleries')
        .select('*')
        .eq('status', 'published')
        .order('album_date', { ascending: false }),
    ).map((row: Row): GalleryItem => ({
      _id: row.id,
      title: row.title,
      description: opt(row.description),
      coverImage: toImage(row, 'cover_image'),
      photoCount: row.photo_count,
      date: row.album_date,
      link: row.album_url,
      category: opt(row.category),
    })),
  )
  const category = filters?.category
  return useFiltered(all, category ? (g) => g.category === category : null, [category])
}

// ─── Executives ────────────────────────────────────────────────────────────────

export function useExecutives(filters?: { category?: string }): FetchState<Executive[]> {
  // Visitors can only read the public_* contact columns, which the database
  // leaves empty when the person chose to hide their phone or email.
  const all = useQuery('executives', async (db) =>
    unwrap(
      await db
        .from('executives')
        .select('id, name, position, image_path, image_alt, image_caption, image_focus, sort_order, category, bio, public_phone, public_email, public_whatsapp')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
    ).map((row: Row): Executive => ({
      _id: row.id,
      name: row.name,
      position: row.position,
      image: toImage(row, 'image'),
      phone: opt(row.public_phone),
      email: opt(row.public_email),
      whatsapp: opt(row.public_whatsapp),
      order: opt(row.sort_order),
      category: opt(row.category),
      bio: opt(row.bio),
    })),
  )
  const category = filters?.category
  return useFiltered(all, category ? (e) => e.category === category : null, [category])
}

// ─── Boards ────────────────────────────────────────────────────────────────────

const toBoard = (row: Row): Board => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  summary: row.summary,
  description: row.description,
  detailDescription: row.detail_description,
  icon: row.icon,
  homeIcon: row.home_icon,
  color: row.color,
  memberCount: row.member_count,
  vision: row.vision,
  responsibilities: row.responsibilities ?? [],
  activities: row.activities ?? [],
  members: [...(row.board_members ?? [])]
    .sort((a: Row, b: Row) => a.sort_order - b.sort_order)
    .map((m: Row) => ({
      id: m.id,
      name: m.name,
      position: m.position,
      bio: m.bio,
      phone: m.phone,
      email: m.email,
      image: toImage(m, 'image'),
    })),
})

export function useBoards(): FetchState<Board[]> {
  return useQuery('boards', async (db) =>
    unwrap(
      await db
        .from('boards')
        .select('*, board_members(*)')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
    ).map(toBoard),
  )
}

export function useBoard(slug: string | undefined): FetchState<Board | null> {
  const all = useBoards()
  const data = useMemo(() => (all.data ? all.data.find((b) => b.slug === slug) ?? null : null), [all.data, slug])
  return { ...all, data }
}

export function useMajorActivities(): FetchState<MajorActivity[]> {
  return useQuery('major_activities', async (db) =>
    unwrap(
      await db
        .from('major_activities')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
    ).map((row: Row): MajorActivity => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      dateText: row.date_text,
      startsAt: row.starts_at ?? null,
      endsAt: row.ends_at ?? null,
      location: row.location,
      description: row.description,
      body: row.body ?? null,
      imageUrl: mediaUrl(row.image_path) || mediaUrl(row.image_url),
      thumbnailUrl: thumbUrl(row.image_path) || mediaUrl(row.image_url),
      imageAlt: row.image_alt,
      imageFocus: row.image_focus ?? null,
      feeText: row.fee_text ?? null,
      audience: row.audience ?? null,
      contactName: row.contact_name ?? null,
      contactPhone: row.contact_phone ?? null,
      registrationOpen: Boolean(row.registration_open),
      registrationDeadline: row.registration_deadline ?? null,
      capacity: row.capacity ?? null,
    })),
  )
}

/** One published activity, from the same cached list. */
export function useActivityBySlug(slug: string | undefined): FetchState<MajorActivity | null> {
  const all = useMajorActivities()
  const data = useMemo(() => (all.data ? all.data.find((a) => a.slug === slug) ?? null : null), [all.data, slug])
  return { ...all, data }
}

// ─── Hero images ───────────────────────────────────────────────────────────────

export function useHeroSlides(): FetchState<HeroSlide[]> {
  return useQuery('hero_slides', async (db) =>
    unwrap(
      await db
        .from('hero_slides')
        .select('eyebrow, heading, subheading, image_path, sort_order')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
    )
      .filter((row: Row) => row.image_path && row.heading)
      .map((row: Row): HeroSlide => ({
        image: mediaUrl(row.image_path),
        eyebrow: row.eyebrow ?? '',
        heading: row.heading,
        subheading: row.subheading ?? '',
      })),
  )
}

export function usePageHero(page: string | undefined): FetchState<PageHero | null> {
  return useQuery(page ? `page_hero:${page}` : null, async (db) => {
    const row = unwrap<Row | null>(
      await db
        .from('page_heroes')
        .select('page, title, subtitle, image_path, image_url, image_alt')
        .eq('page', page!)
        .eq('status', 'published')
        .maybeSingle(),
    )
    if (!row) return null
    return {
      page: row.page,
      title: row.title,
      subtitle: row.subtitle,
      imageUrl: mediaUrl(row.image_path) || mediaUrl(row.image_url),
      imageAlt: row.image_alt,
    }
  })
}

// ─── Site settings and small lists ─────────────────────────────────────────────

/** One public setting from site_settings. data is null when it does not exist. */
export function useSiteSetting<T>(key: string): FetchState<T | null> {
  return useQuery(`setting:${key}`, async (db) => {
    const row = unwrap<Row | null>(await db.from('site_settings').select('value').eq('key', key).maybeSingle())
    return (row?.value ?? null) as T | null
  })
}

export function useSocialLinks(): FetchState<SocialLink[]> {
  return useQuery('social_links', async (db) =>
    unwrap(
      await db
        .from('social_links')
        .select('id, platform, label, url, icon')
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
    ),
  )
}

/** Published stats for one section. Unfilled stats are drafts, so they are absent. */
export function useStats(section: 'home' | 'home_about'): FetchState<Stat[]> {
  return useQuery(`stats:${section}`, async (db) =>
    unwrap(
      await db
        .from('stats')
        .select('id, stat_key, label, numeric_value, display_value, icon')
        .eq('section', section)
        .eq('status', 'published')
        .order('sort_order', { ascending: true }),
    )
      .filter((row: Row) => row.numeric_value !== null || row.display_value)
      .map((row: Row): Stat => ({
        id: row.id,
        key: row.stat_key,
        label: row.label,
        numericValue: row.numeric_value,
        displayValue: row.display_value,
        icon: row.icon,
      })),
  )
}
