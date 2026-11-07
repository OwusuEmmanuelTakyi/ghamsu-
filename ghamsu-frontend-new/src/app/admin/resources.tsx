import type { ComponentType } from 'react'
import { supabase } from '../../lib/supabase'
import { DIGITS_RULE, SLUG_RULE, formatDate } from './lib/forms'
import type { FieldDef, Values } from './components/fields'
import { BoardMembers } from './components/BoardMembers'
import { ActivityQuestions } from './components/ActivityQuestions'
import { ActivityShareActions } from './components/ActivityShareActions'

export interface ResourceContext {
  isAdmin: boolean
}

export interface ResourceConfig {
  key: string
  table: string
  /** Plural, for menus and headings. */
  label: string
  singular: string
  path: string
  idColumn?: string
  titleColumn: string
  subtitle?: (row: Values, extra: Values) => string
  badge?: (row: Values, extra: Values) => string | null
  imagePath?: (row: Values) => string | null | undefined
  searchColumns: string[]
  order: { column: string; ascending: boolean }
  /** Rows have a sort_order column the list can reorder. */
  sortable?: boolean
  hasStatus?: boolean
  canCreate?: boolean
  canDelete?: boolean
  adminOnly?: boolean
  /** Shown under Site settings instead of the main menu. */
  settings?: boolean
  fields: FieldDef[]
  defaults?: Values
  publicPath?: (row: Values) => string | null
  /** Extra checks before publishing that span several fields. */
  publishCheck?: (values: Values) => string | null
  /** Data the list needs for subtitles or badges, loaded once. */
  listExtra?: () => Promise<Values>
  loadExtra?: (row: Values) => Promise<Values>
  afterSave?: (row: Values, values: Values, ctx: ResourceContext) => Promise<void>
  extraSection?: ComponentType<{ row: Values }>
  /** Use the dedicated form instead of the generic one. */
  customForm?: boolean
  help?: string
  /** New items fill this slug field from the title until it is edited by hand. */
  slugField?: { name: string; from: string }
  /** A boolean column the list can switch with one click. */
  listToggle?: { column: string; onLabel: string; offLabel: string; onMessage: string; offMessage: string }
  /** Extra links on each list row. */
  rowLinks?: { label: string; to: (row: Values) => string }[]
  /** Extra buttons on each list row (replaces the plain "view on site" icon). */
  rowActions?: ComponentType<{ row: Values }>
}

// ─── Shared options ────────────────────────────────────────────────────────────

const iconOptions = (names: string[]) => names.map((name) => ({ value: name, label: name }))

const BOARD_ICONS = iconOptions(['Heart', 'BookOpen', 'FileText', 'TrendingUp', 'Shield', 'Users', 'Wrench', 'Globe', 'GraduationCap', 'Music', 'Activity'])
const SOCIAL_ICONS = iconOptions(['Facebook', 'Instagram', 'Twitter', 'Youtube', 'Linkedin', 'MessageCircle', 'Music2'])
const STAT_ICONS = iconOptions(['Users', 'Globe', 'Calendar', 'Award'])

const statusOrDate = (row: Values, column: string) => (row[column] ? formatDate(row[column]) : 'No date')

// ─── Coordinator link for executives ───────────────────────────────────────────
// The coordinator lives in the "coordinator" site setting. Marking an executive
// as coordinator copies their details into it and records executive_id.

async function readCoordinator(): Promise<Values | null> {
  if (!supabase) return null
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'coordinator').maybeSingle()
  return (data?.value as Values) ?? null
}

async function syncCoordinator(row: Values, values: Values, ctx: ResourceContext) {
  if (!ctx.isAdmin || !supabase) return
  const current = (await readCoordinator()) ?? {}
  let next: Values | null = null

  if (values.is_coordinator) {
    const bio = typeof row.bio === 'string' && row.bio.trim()
      ? row.bio.split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean)
      : current.bio_paragraphs ?? []
    next = {
      ...current,
      executive_id: row.id,
      name: row.name,
      title: row.position,
      image_path: row.image_path,
      image_alt: row.image_alt,
      // The coordinator panel is public, so honour the person's privacy choices.
      email: row.show_email === false ? null : row.email,
      phone: row.show_phone === false ? null : row.phone,
      whatsapp: row.show_phone === false ? null : row.whatsapp,
      bio_paragraphs: bio,
    }
  } else if (current.executive_id === row.id) {
    // Unticking only removes the link; the coordinator details stay as they are.
    next = { ...current, executive_id: null }
  }

  if (next) {
    const { error } = await supabase.from('site_settings').update({ value: next }).eq('key', 'coordinator')
    if (error) throw error
  }
}

// ─── Content ───────────────────────────────────────────────────────────────────

export const posts: ResourceConfig = {
  key: 'posts',
  table: 'posts',
  label: 'Posts',
  singular: 'Post',
  path: '/admin/posts',
  titleColumn: 'title',
  subtitle: (row) =>
    `${row.post_type === 'news' ? 'News' : 'Article'}${row.category ? ` · ${String(row.category).replace('-', ' ')}` : ''} · ${row.like_count} likes · ${row.view_count} views`,
  imagePath: (row) => row.cover_image_path,
  searchColumns: ['title', 'slug', 'author_name', 'category'],
  order: { column: 'updated_at', ascending: false },
  fields: [],
  customForm: true,
  publicPath: (row) => `/blogs/${row.slug}`,
}

export const events: ResourceConfig = {
  key: 'events',
  table: 'events',
  label: 'Events',
  singular: 'Event',
  path: '/admin/events',
  titleColumn: 'title',
  subtitle: (row) => `${statusOrDate(row, 'event_date')}${row.venue ? ` · ${row.venue}` : ''}`,
  imagePath: (row) => row.flyer_path,
  searchColumns: ['title', 'venue', 'description'],
  order: { column: 'event_date', ascending: false },
  publicPath: () => '/events',
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'event_date', label: 'Date and time', type: 'datetime', publishRequired: true },
    { name: 'venue', label: 'Venue', type: 'text', publishRequired: true },
    { name: 'flyer', label: 'Flyer or poster', type: 'image', publishRequired: true, withCaption: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    {
      name: 'event_type', label: 'Event type', type: 'select',
      options: ['conference', 'worship', 'outreach', 'fellowship', 'training', 'other'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
    },
    { name: 'registration_url', label: 'Registration link', type: 'url', placeholder: 'https://…' },
  ],
}

export const sermons: ResourceConfig = {
  key: 'sermons',
  table: 'sermons',
  label: 'Sermons',
  singular: 'Sermon',
  path: '/admin/sermons',
  titleColumn: 'title',
  subtitle: (row) => `${row.preacher ?? 'No preacher'} · ${statusOrDate(row, 'sermon_date')}`,
  imagePath: (row) => row.thumbnail_path,
  searchColumns: ['title', 'preacher', 'series', 'scripture_reference'],
  order: { column: 'sermon_date', ascending: false },
  publicPath: () => '/sermons',
  defaults: { media_type: 'video' },
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'preacher', label: 'Preacher', type: 'text', publishRequired: true },
    { name: 'sermon_date', label: 'Date', type: 'datetime', publishRequired: true },
    {
      name: 'media_type', label: 'Media type', type: 'select', publishRequired: true,
      options: [{ value: 'video', label: 'Video (YouTube / Vimeo)' }, { value: 'audio', label: 'Audio (SoundCloud / Spotify / MP3)' }],
    },
    {
      name: 'video_url', label: 'Video link', type: 'url', publishRequired: true, placeholder: 'https://youtu.be/…',
      showIf: (v) => v.media_type === 'video',
    },
    {
      name: 'audio_url', label: 'Audio link', type: 'url', publishRequired: true, placeholder: 'https://…',
      showIf: (v) => v.media_type === 'audio',
    },
    { name: 'thumbnail', label: 'Thumbnail', type: 'image', withCaption: true },
    { name: 'scripture_reference', label: 'Scripture reference', type: 'text', placeholder: 'John 3:16' },
    { name: 'series', label: 'Series', type: 'text' },
    { name: 'duration', label: 'Duration', type: 'text', placeholder: '45:30', help: 'Minutes and seconds, for example 45:30.' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
}

export const galleries: ResourceConfig = {
  key: 'galleries',
  table: 'galleries',
  label: 'Gallery',
  singular: 'Album',
  path: '/admin/gallery',
  titleColumn: 'title',
  subtitle: (row) => `${row.category ?? 'No category'} · ${row.photo_count ?? 0} photos · ${statusOrDate(row, 'album_date')}`,
  imagePath: (row) => row.cover_image_path,
  searchColumns: ['title', 'description', 'category'],
  order: { column: 'album_date', ascending: false },
  publicPath: () => '/gallery',
  help: 'Albums link to the full photo collection on Google Photos or similar.',
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text', publishRequired: true },
    { name: 'cover_image', label: 'Cover image', type: 'image', publishRequired: true, withCaption: true },
    { name: 'photo_count', label: 'Number of photos', type: 'number', integer: true, min: 1, publishRequired: true },
    { name: 'album_date', label: 'Date', type: 'datetime', publishRequired: true },
    { name: 'album_url', label: 'Album link', type: 'url', publishRequired: true, placeholder: 'https://photos.app.goo.gl/…' },
    {
      name: 'category', label: 'Category', type: 'select', publishRequired: true,
      options: ['Conference', 'Worship', 'Outreach', 'Music', 'Study', 'Events', 'Training', 'Recreation'].map((v) => ({ value: v, label: v })),
    },
  ],
}

export const executives: ResourceConfig = {
  key: 'executives',
  table: 'executives',
  label: 'Executives',
  singular: 'Executive',
  path: '/admin/executives',
  defaults: { show_phone: true, show_email: true },
  titleColumn: 'name',
  subtitle: (row) => `${row.position ?? 'No position'} · ${({ connexional: 'Connexional Executive', 'Connexional Boards': 'Connexional Boards', Diocese: 'Diocese', local: 'Local' } as Values)[row.category] ?? 'No category'}`,
  badge: (row, extra) => (extra.coordinatorId && extra.coordinatorId === row.id ? 'Coordinator' : null),
  imagePath: (row) => row.image_path,
  searchColumns: ['name', 'position', 'email', 'category'],
  order: { column: 'sort_order', ascending: true },
  sortable: true,
  publicPath: () => '/contact',
  help: 'The Contact page lists Connexional, Connexional Boards and Diocese executives. Local executives are not shown there.',
  listExtra: async () => ({ coordinatorId: (await readCoordinator())?.executive_id ?? null }),
  loadExtra: async (row) => ({ is_coordinator: Boolean(row.id) && (await readCoordinator())?.executive_id === row.id }),
  afterSave: syncCoordinator,
  fields: [
    { name: 'name', label: 'Full name', type: 'text', required: true },
    { name: 'position', label: 'Position', type: 'text', publishRequired: true },
    { name: 'image', label: 'Profile photo', type: 'image', publishRequired: true, withCaption: true },
    {
      name: 'category', label: 'Category', type: 'select', publishRequired: true,
      options: [
        { value: 'connexional', label: 'Connexional Executive' },
        { value: 'Connexional Boards', label: 'Connexional Boards' },
        { value: 'Diocese', label: 'Diocese' },
        { value: 'local', label: 'Local' },
      ],
    },
    { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+233 24 123 4567' },
    { name: 'email', label: 'Email', type: 'email' },
    {
      name: 'whatsapp', label: 'WhatsApp number', type: 'text', pattern: DIGITS_RULE, placeholder: '233241234567',
      patternMessage: 'Digits only, with the country code (for example 233241234567).',
      help: 'Digits only, with the country code. No spaces, dashes or + sign.',
    },
    { name: 'bio', label: 'Short bio', type: 'textarea', help: 'Leave a blank line between paragraphs.' },
    { name: 'show_phone', label: 'Show phone and WhatsApp publicly', type: 'switch', help: 'When off, visitors cannot see them, even through the database. Staff still can.' },
    { name: 'show_email', label: 'Show email publicly', type: 'switch' },
    {
      name: 'is_coordinator', label: 'Is coordinator', type: 'switch', virtual: true, adminOnly: true,
      help: "Shows this person in the Contact page's Connexional Coordinator panel. Saving copies their name, position, photo, contact details and bio there. Headings and stats stay as they are.",
    },
  ],
}

export const testimonials: ResourceConfig = {
  key: 'testimonials',
  table: 'testimonials',
  label: 'Testimonials',
  singular: 'Testimonial',
  path: '/admin/testimonials',
  titleColumn: 'name',
  subtitle: (row) => `${row.role ?? ''}${row.local ? ` · ${row.local}` : ''} · ${'★'.repeat(row.rating ?? 0)}`,
  imagePath: (row) => row.photo_path,
  searchColumns: ['name', 'role', 'local', 'testimony'],
  order: { column: 'updated_at', ascending: false },
  defaults: { rating: '5' },
  help: 'Testimonials are stored here but no public page shows them at the moment.',
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'testimony', label: 'Testimony', type: 'textarea', rows: 6, publishRequired: true },
    { name: 'role', label: 'Role / year and course', type: 'text', placeholder: '4th Year Medical Student, UG' },
    { name: 'local', label: 'Local', type: 'text' },
    { name: 'photo', label: 'Photo', type: 'image', withCaption: true },
    { name: 'rating', label: 'Rating (1 to 5)', type: 'number', integer: true, min: 1, max: 5, required: true },
    { name: 'featured', label: 'Featured', type: 'switch' },
    { name: 'testimonial_date', label: 'Date', type: 'datetime' },
  ],
}

export const boards: ResourceConfig = {
  key: 'boards',
  table: 'boards',
  label: 'Boards',
  singular: 'Board',
  path: '/admin/boards',
  titleColumn: 'title',
  subtitle: (row) => `/boards/${row.slug}${row.member_count !== null && row.member_count !== undefined ? ` · ${row.member_count} members` : ''}`,
  searchColumns: ['title', 'slug', 'description'],
  order: { column: 'sort_order', ascending: true },
  sortable: true,
  publicPath: (row) => `/boards/${row.slug}`,
  extraSection: BoardMembers,
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    {
      name: 'slug', label: 'Web address', type: 'text', required: true, pattern: SLUG_RULE, maxLength: 96,
      patternMessage: 'Use lowercase letters, numbers and single dashes only (for example prayer-board).',
      help: 'The last part of the page address, for example prayer-board.',
    },
    { name: 'summary', label: 'Home page summary', type: 'textarea', rows: 2 },
    { name: 'description', label: 'Boards page description', type: 'textarea', rows: 3 },
    { name: 'detail_description', label: 'Board page description', type: 'textarea', rows: 3, help: 'Shown at the top of the board page. If empty, the boards page description is used.' },
    { name: 'icon', label: 'Icon', type: 'select', options: BOARD_ICONS },
    { name: 'home_icon', label: 'Home page icon', type: 'select', options: BOARD_ICONS },
    {
      name: 'color', label: 'Colour', type: 'select',
      options: ['red', 'blue', 'green', 'purple', 'yellow', 'pink'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
    },
    { name: 'member_count', label: 'Number of members', type: 'number', integer: true, min: 0, help: 'Leave empty to hide the count.' },
    { name: 'vision', label: 'Vision', type: 'textarea' },
    { name: 'responsibilities', label: 'Key responsibilities', type: 'list' },
    { name: 'activities', label: 'Activities and schedule', type: 'list' },
  ],
}

export const majorActivities: ResourceConfig = {
  key: 'major_activities',
  table: 'major_activities',
  label: 'Major activities',
  singular: 'Activity',
  path: '/admin/activities',
  titleColumn: 'title',
  subtitle: (row) => [
    row.starts_at ? formatDate(row.starts_at) : row.date_text,
    row.location,
    row.registration_open ? 'Registration open' : 'Registration closed',
  ].filter(Boolean).join(' · '),
  imagePath: (row) => row.image_path ?? row.image_url,
  searchColumns: ['title', 'slug', 'location', 'description'],
  order: { column: 'sort_order', ascending: true },
  sortable: true,
  publicPath: (row) => `/activities/${row.slug}`,
  help: 'Shown in the "Major Activities" section of the Events page, each with its own registration page.',
  slugField: { name: 'slug', from: 'title' },
  listToggle: {
    column: 'registration_open',
    onLabel: 'Close registration',
    offLabel: 'Open registration',
    onMessage: 'Registration is now open.',
    offMessage: 'Registration is now closed.',
  },
  rowLinks: [{ label: 'Registrations', to: (row) => `/admin/activities/${row.id}/registrations` }],
  rowActions: ActivityShareActions,
  extraSection: ActivityQuestions,
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    {
      name: 'slug', label: 'Web address', type: 'text', required: true, pattern: SLUG_RULE, maxLength: 96,
      patternMessage: 'Use lowercase letters, numbers and single dashes only (for example connexional-conference-2026).',
      help: 'The page will be /activities/ followed by this. Changing it breaks links people have already shared.',
    },
    { name: 'image', label: 'Banner image', type: 'image', urlColumn: 'image_url' },
    { name: 'starts_at', label: 'Starts', type: 'datetime' },
    {
      name: 'ends_at', label: 'Ends', type: 'datetime',
      validate: (value, values) =>
        value && values.starts_at && new Date(value as string) < new Date(values.starts_at) ? 'The end must be after the start.' : null,
    },
    { name: 'date_text', label: 'Date text', type: 'text', placeholder: 'To be communicated', help: 'Shown instead of a date when no start date is set.' },
    { name: 'location', label: 'Venue', type: 'text' },
    { name: 'description', label: 'Short summary', type: 'textarea', rows: 3, help: 'Shown on the Events page card.' },
    { name: 'body', label: 'Full description', type: 'richtext', help: 'Shown on the activity page.' },
    { name: 'fee_text', label: 'Fee', type: 'text', placeholder: 'GH₵ 50', help: 'Leave empty to show "Free".' },
    { name: 'audience', label: 'Who it is for', type: 'text', placeholder: 'All GHAMSU members' },
    { name: 'contact_name', label: 'Contact person', type: 'text' },
    { name: 'contact_phone', label: 'Contact phone', type: 'tel', placeholder: '024 123 4567' },
    { name: 'registration_open', label: 'Registration open', type: 'switch', help: 'People can only register while this is on and the activity is published.' },
    { name: 'registration_deadline', label: 'Registration deadline', type: 'datetime', help: 'Registration closes automatically after this. Leave empty for no deadline.' },
    { name: 'capacity', label: 'Maximum number of people', type: 'number', integer: true, min: 1, help: 'Leave empty for no limit.' },
  ],
}

export const heroSlides: ResourceConfig = {
  key: 'hero_slides',
  table: 'hero_slides',
  label: 'Hero slides',
  singular: 'Slide',
  path: '/admin/hero-slides',
  titleColumn: 'heading',
  subtitle: (row) => row.eyebrow ?? '',
  imagePath: (row) => row.image_path,
  searchColumns: ['heading', 'eyebrow', 'subheading'],
  order: { column: 'sort_order', ascending: true },
  sortable: true,
  publicPath: () => '/',
  help: 'The large slideshow at the top of the home page.',
  fields: [
    { name: 'eyebrow', label: 'Small text above the heading', type: 'text' },
    { name: 'heading', label: 'Heading', type: 'textarea', rows: 2, required: true, help: 'Press Enter to start a new line.' },
    { name: 'subheading', label: 'Text under the heading', type: 'textarea', rows: 3 },
    { name: 'image', label: 'Image', type: 'image', publishRequired: true },
  ],
}

// ─── Site settings tables (admins) ─────────────────────────────────────────────

export const socialLinks: ResourceConfig = {
  key: 'social_links',
  table: 'social_links',
  label: 'Social links',
  singular: 'Social link',
  path: '/admin/settings/social-links',
  titleColumn: 'label',
  subtitle: (row) => row.url,
  searchColumns: ['label', 'platform', 'url'],
  order: { column: 'sort_order', ascending: true },
  sortable: true,
  adminOnly: true,
  settings: true,
  help: 'The icons in the footer.',
  fields: [
    { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Facebook' },
    {
      name: 'platform', label: 'Platform key', type: 'text', required: true, pattern: /^[a-z0-9-]+$/,
      patternMessage: 'Lowercase letters only, for example facebook.', help: 'Lowercase, one word, for example facebook. Sets the hover colour.',
    },
    { name: 'url', label: 'Link', type: 'url', required: true },
    { name: 'icon', label: 'Icon', type: 'select', options: SOCIAL_ICONS },
  ],
}

export const stats: ResourceConfig = {
  key: 'stats',
  table: 'stats',
  label: 'Statistics',
  singular: 'Statistic',
  path: '/admin/settings/stats',
  titleColumn: 'label',
  subtitle: (row) => `${row.section === 'home' ? 'Home page counters' : 'Home page "Our Story" boxes'} · ${row.numeric_value ?? row.display_value ?? 'no value yet'}`,
  searchColumns: ['label', 'stat_key', 'display_value'],
  order: { column: 'section', ascending: true },
  adminOnly: true,
  settings: true,
  help: 'Statistics with no value stay hidden on the site until they are filled in and published.',
  publishCheck: (v) =>
    String(v.numeric_value ?? '').trim() === '' && String(v.display_value ?? '').trim() === ''
      ? 'Add a number or a display value before publishing.'
      : null,
  fields: [
    {
      name: 'section', label: 'Where it appears', type: 'select', required: true,
      options: [{ value: 'home', label: 'Home page counters' }, { value: 'home_about', label: 'Home page "Our Story" boxes' }],
    },
    { name: 'label', label: 'Label', type: 'text', required: true },
    {
      name: 'stat_key', label: 'Key', type: 'text', required: true, pattern: /^[a-z0-9_]+$/,
      patternMessage: 'Lowercase letters, numbers and underscores only.', help: 'A short internal name, for example members.',
    },
    { name: 'numeric_value', label: 'Number (animated counter)', type: 'number', integer: true, min: 0 },
    { name: 'display_value', label: 'Or text to show', type: 'text', placeholder: '60+ or Many', help: 'Used when there is no number.' },
    { name: 'icon', label: 'Icon (home counters)', type: 'select', options: STAT_ICONS },
    { name: 'sort_order', label: 'Order', type: 'number', integer: true, min: 0 },
  ],
}

export const pageHeroes: ResourceConfig = {
  key: 'page_heroes',
  table: 'page_heroes',
  label: 'Page banners',
  singular: 'Page banner',
  path: '/admin/settings/page-banners',
  idColumn: 'page',
  titleColumn: 'title',
  subtitle: (row) => `/${row.page}`,
  imagePath: (row) => row.image_path ?? row.image_url,
  searchColumns: ['page', 'title', 'subtitle'],
  order: { column: 'page', ascending: true },
  canCreate: false,
  canDelete: false,
  adminOnly: true,
  settings: true,
  help: 'The banner image and title at the top of each inner page.',
  publicPath: (row) => `/${row.page}`,
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'subtitle', label: 'Subtitle', type: 'textarea', rows: 2 },
    { name: 'image', label: 'Banner image', type: 'image', urlColumn: 'image_url' },
  ],
}

export const CONTENT_RESOURCES = [posts, events, sermons, galleries, executives, testimonials, boards, majorActivities, heroSlides]
export const SETTINGS_RESOURCES = [socialLinks, stats, pageHeroes]
export const ALL_RESOURCES = [...CONTENT_RESOURCES, ...SETTINGS_RESOURCES]
