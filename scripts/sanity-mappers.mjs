// Turns Sanity documents into Supabase rows, following section 2 of
// MIGRATION_PLAN.md. Pure: no network and no database.
import { portableTextToTiptap, verifyConversion, tiptapStats } from './portable-text-to-tiptap.mjs'

export const SANITY_PROJECT_ID = 'rgbuxwes'
export const SANITY_DATASET = 'production'
export const IMAGE_PARAMS = 'w=2000&fit=max&fm=webp&q=80'

// Write order, so that references point at rows that already exist.
export const TABLE_ORDER = [
  'authors', 'executives', 'events', 'sermons', 'galleries', 'testimonials',
  'departments', 'scripture_quotes', 'ghamsu_today', 'subscribers', 'posts',
]

export const SANITY_TYPES = [
  'author', 'executive', 'event', 'sermon', 'gallery', 'testimonial', 'department',
  'scriptureQuote', 'ghamsuToday', 'subscriber', 'news', 'article', 'blog',
]

const parseAssetRef = (ref) => {
  const match = String(ref).match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-([a-z0-9]+)$/)
  if (!match) throw new Error(`Unrecognised image reference "${ref}"`)
  return { id: match[1], dimensions: match[2], extension: match[3] }
}

/** Stable, so re-running overwrites the same file instead of adding another. */
export const imagePathFor = (ref) => `sanity/${parseAssetRef(ref).id}.webp`

export const imageDownloadUrl = (ref) => {
  const { id, dimensions, extension } = parseAssetRef(ref)
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${extension}?${IMAGE_PARAMS}`
}

// Crop and hotspot are fractions of the image, and fit=max keeps the aspect
// ratio, so they stay correct on the resized copy.
const imageColumns = (prefix, image, usedAssets) => {
  const ref = image?.asset?._ref
  if (ref) usedAssets.add(ref)
  return {
    [`${prefix}_path`]: ref ? imagePathFor(ref) : null,
    [`${prefix}_alt`]: image?.alt ?? null,
    [`${prefix}_caption`]: image?.caption ?? null,
    [`${prefix}_focus`]: image?.hotspot || image?.crop
      ? { hotspot: image.hotspot ?? null, crop: image.crop ?? null }
      : null,
  }
}

const timestamps = (doc) => ({ created_at: doc._createdAt, updated_at: doc._updatedAt })
const clean = (value) => (typeof value === 'string' ? value.trim() : value ?? null)

// Every field the mappers read. Anything else in a document produces a warning,
// so a field the schema does not cover cannot disappear unnoticed.
const KNOWN_FIELDS = {
  author: ['name', 'photo', 'bio', 'position'],
  executive: ['name', 'position', 'image', 'phone', 'email', 'whatsapp', 'order', 'category', 'bio'],
  event: ['title', 'date', 'venue', 'flyer', 'description', 'eventType', 'registrationLink', 'published'],
  sermon: ['title', 'preacher', 'date', 'mediaType', 'videoUrl', 'audioUrl', 'thumbnail', 'scriptureReference', 'description', 'series', 'duration'],
  gallery: ['title', 'description', 'coverImage', 'photoCount', 'date', 'link', 'category'],
  testimonial: ['name', 'photo', 'role', 'local', 'testimony', 'rating', 'featured', 'date'],
  department: ['name', 'image', 'description', 'leader', 'activities', 'color'],
  scriptureQuote: ['quoteText', 'reference', 'active', 'displayOrder'],
  ghamsuToday: ['themeTitle', 'themeDescription', 'scriptureReference', 'happeningNow', 'laterToday', 'date', 'active'],
  subscriber: ['email', 'subscribedAt'],
  news: ['title', 'slug', 'featuredImage', 'excerpt', 'content', 'reporter', 'reporterPosition', 'mediaAttachments', 'newsCategory', 'publishedDate', 'featured', 'likes', 'views'],
  article: ['title', 'slug', 'featuredImage', 'excerpt', 'content', 'authorName', 'authorLocal', 'articleCategory', 'publishedDate', 'readTime', 'featured', 'likes', 'views'],
  blog: ['title', 'slug', 'featuredImage', 'excerpt', 'content', 'authorName', 'authorLocal', 'author', 'category', 'publishedDate', 'readTime', 'featured', 'likes', 'views'],
}

// Mirrors the *_publish_requirements constraints in 0001_schema.sql, so a dry
// run reports a problem before the database would reject the row.
const PUBLISH_REQUIREMENTS = {
  posts: ['published_at', 'excerpt', 'content', 'cover_image_path'],
  events: ['event_date', 'venue', 'flyer_path'],
  sermons: ['preacher', 'sermon_date', 'media_type'],
  galleries: ['description', 'cover_image_path', 'photo_count', 'album_date', 'album_url', 'category'],
  executives: ['position', 'image_path', 'sort_order', 'category'],
  testimonials: ['testimony'],
  departments: ['description'],
}

function mapPost(doc, context) {
  const isBlog = doc._type === 'blog'
  const label = `${doc._type} "${doc.slug?.current ?? doc._id}"`

  let content = null
  if (Array.isArray(doc.content)) {
    content = portableTextToTiptap(doc.content, {
      resolveImage: (ref) => {
        context.usedAssets.add(ref)
        return imagePathFor(ref)
      },
      onWarning: (message) => context.warnings.push(`${label}: ${message}`),
    })
    for (const problem of verifyConversion(doc.content, content)) {
      context.errors.push(`${label}: rich text check failed. ${problem}`)
    }
    context.richText.push({ label, ...tiptapStats(content), text: undefined, characters: tiptapStats(content).text.length })
  }

  const authorName = clean(doc.reporter ?? doc.authorName)
  if (isBlog && !authorName && !doc.author?._ref) {
    context.warnings.push(`${label}: has no author. Add a name before publishing it.`)
  }

  return {
    table: 'posts',
    legacyId: doc._id,
    label,
    refs: doc.author?._ref ? { author_id: doc.author._ref } : {},
    row: {
      legacy_sanity_id: doc._id,
      legacy_sanity_type: doc._type,
      post_type: doc._type === 'news' ? 'news' : 'article',
      status: isBlog ? 'draft' : 'published',
      title: doc.title,
      slug: doc.slug?.current ?? null,
      excerpt: doc.excerpt ?? null,
      content,
      author_id: null,
      author_name: authorName,
      author_detail: clean(doc.reporterPosition ?? doc.authorLocal),
      category: doc.newsCategory ?? doc.articleCategory ?? doc.category ?? null,
      ...imageColumns('cover_image', doc.featuredImage, context.usedAssets),
      read_time_minutes: doc.readTime ?? null,
      featured: doc.featured ?? false,
      view_count: doc.views ?? 0,
      like_count: doc.likes ?? 0,
      published_at: doc.publishedDate ?? null,
      ...timestamps(doc),
    },
    // No Sanity ID on these rows, so they are replaced as a set on each run.
    children: doc._type === 'news' ? [{
      table: 'post_media_attachments',
      parentColumn: 'post_id',
      rows: (doc.mediaAttachments ?? []).map((item, index) => ({
        media_type: item.mediaType,
        label: item.label,
        url: clean(item.url),
        description: item.description ?? null,
        sort_order: index,
      })),
    }] : [],
  }
}

const MAPPERS = {
  author: (doc, context) => ({
    table: 'authors',
    label: `author ${doc._id}`,
    row: {
      name: doc.name,
      ...imageColumns('photo', doc.photo, context.usedAssets),
      bio: doc.bio ?? null,
      position: doc.position ?? null,
      status: 'published',
    },
  }),

  executive: (doc, context) => ({
    table: 'executives',
    label: `executive ${doc._id}`,
    row: {
      status: 'published',
      name: doc.name,
      position: doc.position ?? null,
      ...imageColumns('image', doc.image, context.usedAssets),
      phone: doc.phone ?? null,
      email: clean(doc.email),
      whatsapp: clean(doc.whatsapp),
      sort_order: doc.order ?? null,
      category: doc.category ?? null,
      bio: doc.bio ?? null,
    },
  }),

  event: (doc, context) => ({
    table: 'events',
    label: `event "${doc.title}"`,
    row: {
      status: doc.published ? 'published' : 'draft',
      title: doc.title,
      event_date: doc.date ?? null,
      venue: doc.venue ?? null,
      ...imageColumns('flyer', doc.flyer, context.usedAssets),
      description: doc.description ?? null,
      event_type: doc.eventType ?? null,
      registration_url: clean(doc.registrationLink),
    },
  }),

  sermon: (doc, context) => ({
    table: 'sermons',
    label: `sermon "${doc.title}"`,
    row: {
      status: 'published',
      title: doc.title,
      preacher: doc.preacher ?? null,
      sermon_date: doc.date ?? null,
      media_type: doc.mediaType ?? null,
      video_url: clean(doc.videoUrl),
      audio_url: clean(doc.audioUrl),
      ...imageColumns('thumbnail', doc.thumbnail, context.usedAssets),
      scripture_reference: doc.scriptureReference ?? null,
      description: doc.description ?? null,
      series: doc.series ?? null,
      duration: doc.duration ?? null,
    },
  }),

  gallery: (doc, context) => ({
    table: 'galleries',
    label: `gallery "${doc.title}"`,
    row: {
      status: 'published',
      title: doc.title,
      description: doc.description ?? null,
      ...imageColumns('cover_image', doc.coverImage, context.usedAssets),
      photo_count: doc.photoCount ?? null,
      album_date: doc.date ?? null,
      album_url: clean(doc.link),
      category: doc.category ?? null,
    },
  }),

  testimonial: (doc, context) => ({
    table: 'testimonials',
    label: `testimonial ${doc._id}`,
    row: {
      status: 'published',
      name: doc.name,
      ...imageColumns('photo', doc.photo, context.usedAssets),
      role: doc.role ?? null,
      local: doc.local ?? null,
      testimony: doc.testimony ?? null,
      rating: doc.rating ?? 5,
      featured: doc.featured ?? false,
      testimonial_date: doc.date ?? null,
    },
  }),

  department: (doc, context) => ({
    table: 'departments',
    label: `department ${doc._id}`,
    refs: doc.leader?._ref ? { leader_id: doc.leader._ref } : {},
    row: {
      status: 'published',
      name: doc.name,
      ...imageColumns('image', doc.image, context.usedAssets),
      description: doc.description ?? null,
      leader_id: null,
      activities: doc.activities ?? [],
      color: doc.color ?? null,
    },
  }),

  scriptureQuote: (doc) => ({
    table: 'scripture_quotes',
    label: `scripture quote ${doc._id}`,
    row: {
      status: doc.active === false ? 'draft' : 'published',
      quote_text: doc.quoteText,
      reference: doc.reference,
      sort_order: doc.displayOrder ?? null,
    },
  }),

  ghamsuToday: (doc) => ({
    table: 'ghamsu_today',
    label: `GHAMSU Today ${doc._id}`,
    row: {
      status: doc.active ? 'published' : 'draft',
      theme_title: doc.themeTitle ?? null,
      theme_description: doc.themeDescription ?? null,
      scripture_reference: doc.scriptureReference ?? null,
      entry_date: doc.date ?? null,
    },
    children: [{
      table: 'ghamsu_today_items',
      parentColumn: 'ghamsu_today_id',
      rows: [
        ...(doc.happeningNow ?? []).map((item, index) => ({
          slot: 'happening_now', title: item.title ?? null, time_text: null, location: item.location ?? null, sort_order: index,
        })),
        ...(doc.laterToday ?? []).map((item, index) => ({
          slot: 'later_today', title: item.title ?? null, time_text: item.time ?? null, location: item.location ?? null, sort_order: index,
        })),
      ],
    }],
  }),

  subscriber: (doc) => ({
    table: 'subscribers',
    label: `subscriber ${doc._id}`,
    row: {
      email: clean(doc.email)?.toLowerCase(),
      subscribed_at: doc.subscribedAt ?? doc._createdAt,
    },
  }),

  news: mapPost,
  article: mapPost,
  blog: mapPost,
}

function checkEntry(entry, context) {
  const { row, table, label } = entry
  if (row.status === 'published' && PUBLISH_REQUIREMENTS[table]) {
    const missing = PUBLISH_REQUIREMENTS[table].filter((column) => row[column] === null || row[column] === undefined)
    if (missing.length) context.errors.push(`${label}: cannot be published, missing ${missing.join(', ')}`)
  }
  if (table === 'posts') {
    if (row.status === 'published' && !row.author_name && !entry.refs.author_id) {
      context.errors.push(`${label}: cannot be published, no author`)
    }
    if (!row.slug || row.slug !== row.slug.toLowerCase() || /\s/.test(row.slug) || row.slug.length > 96) {
      context.errors.push(`${label}: slug does not meet the database rule`)
    }
  }
  if (table === 'sermons' && row.status === 'published') {
    const url = row.media_type === 'video' ? row.video_url : row.audio_url
    if (!url) context.errors.push(`${label}: published ${row.media_type} sermon has no URL`)
  }
}

/**
 * Builds everything to be written, in write order.
 * @param {Array} documents Sanity documents.
 * @returns {{ entries, usedAssets: Set<string>, warnings: string[], errors: string[], richText: Array, counts: object }}
 */
export function buildMigration(documents) {
  const context = { usedAssets: new Set(), warnings: [], errors: [], richText: [] }
  const entries = []
  const ids = new Set(documents.map((doc) => doc._id))

  for (const doc of documents) {
    const mapper = MAPPERS[doc._type]
    if (!mapper) {
      context.warnings.push(`Skipped unknown document type "${doc._type}" (${doc._id})`)
      continue
    }

    const unknown = Object.keys(doc).filter((key) => !key.startsWith('_') && !KNOWN_FIELDS[doc._type].includes(key))
    if (unknown.length) {
      context.warnings.push(`${doc._type} ${doc._id}: fields with no destination, not migrated: ${unknown.join(', ')}`)
    }

    try {
      const entry = mapper(doc, context)
      entry.legacyId = doc._id
      entry.sanityType = doc._type
      entry.refs ??= {}
      entry.children ??= []
      entry.row = { legacy_sanity_id: doc._id, ...timestamps(doc), ...entry.row }

      for (const [column, ref] of Object.entries(entry.refs)) {
        if (!ids.has(ref)) {
          context.warnings.push(`${entry.label}: ${column} points at a document that was not found, so it is left empty`)
          delete entry.refs[column]
        }
      }
      checkEntry(entry, context)
      entries.push(entry)
    } catch (error) {
      context.errors.push(`${doc._type} ${doc._id}: ${error.message}`)
    }
  }

  const slugOwners = new Map()
  for (const { row, label } of entries) {
    if (!row.slug) continue
    if (slugOwners.has(row.slug)) context.errors.push(`${label}: slug "${row.slug}" is also used by ${slugOwners.get(row.slug)}`)
    slugOwners.set(row.slug, label)
  }

  entries.sort((a, b) => TABLE_ORDER.indexOf(a.table) - TABLE_ORDER.indexOf(b.table))
  return { entries, ...context }
}
