// Vercel serverless function: link previews for /activities/:slug.
//
// The site renders in the browser, so WhatsApp, Facebook and X (which don't
// run JavaScript) would only ever see the default tags in index.html. vercel.json
// rewrites /activities/:slug here; this returns the same index.html with the
// activity's Open Graph and Twitter tags filled in. The page then loads the
// app as usual, so visitors notice nothing.
//
// It reads the activity with the public anon key (published rows only, as any
// visitor could). If anything goes wrong it still returns the app.

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const TEMPLATE_TTL_MS = 5 * 60 * 1000
const TIMEOUT_MS = 4000

let cachedTemplate = null // { html, at }

const escapeHtml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const truncate = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`)

const dateFormat = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Accra' }

/** Same wording as activityDate() in the app: "Sat, 14 Mar 2026" or a range. */
export function formatActivityDate(activity) {
  if (!activity.starts_at) return activity.date_text || null
  const start = new Date(activity.starts_at)
  const first = start.toLocaleDateString('en-GB', dateFormat)
  if (!activity.ends_at) return first
  const end = new Date(activity.ends_at)
  const last = end.toLocaleDateString('en-GB', dateFormat)
  return first === last ? first : `${first} – ${last}`
}

/** A full https URL for the banner, or null to keep the site's default image. */
export function bannerUrl(activity, supabaseUrl) {
  if (activity.image_path) {
    const path = activity.image_path.split('/').map(encodeURIComponent).join('/')
    return `${supabaseUrl}/storage/v1/object/public/media/${path}`
  }
  if (activity.image_url && /^https:\/\//i.test(activity.image_url)) return activity.image_url
  return null
}

/** The tags for one activity. Exported for the tests. */
export function previewTags(activity, { origin, supabaseUrl }) {
  const url = `${origin}/activities/${activity.slug}`
  const date = formatActivityDate(activity)
  const when = [date, activity.location].filter(Boolean).join(' · ')
  const summary = (activity.description || '').replace(/\s+/g, ' ').trim()
  const description = truncate(
    [when, summary || `Register for ${activity.title}, organised by the Ghana Methodist Students' Union.`].filter(Boolean).join('. '),
    200,
  )
  return {
    title: `${activity.title} · GHAMSU`,
    ogTitle: activity.title,
    description,
    url,
    image: bannerUrl(activity, supabaseUrl),
    imageAlt: activity.image_alt || activity.title,
  }
}

/** Sets a <meta> tag's content, adding the tag if index.html doesn't have it. */
function setMeta(html, attr, name, content) {
  const tag = `<meta ${attr}="${name}" content="${escapeHtml(content)}" />`
  const pattern = new RegExp(`<meta\\s+${attr}=["']${name.replace(/[.:]/g, '\\$&')}["'][^>]*>`, 'i')
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

export function injectTags(html, tags) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(tags.title)}</title>`)
  out = setMeta(out, 'name', 'description', tags.description)
  out = setMeta(out, 'property', 'og:type', 'website')
  out = setMeta(out, 'property', 'og:url', tags.url)
  out = setMeta(out, 'property', 'og:title', tags.ogTitle)
  out = setMeta(out, 'property', 'og:description', tags.description)
  out = setMeta(out, 'name', 'twitter:url', tags.url)
  out = setMeta(out, 'name', 'twitter:title', tags.ogTitle)
  out = setMeta(out, 'name', 'twitter:description', tags.description)
  if (tags.image) {
    out = setMeta(out, 'property', 'og:image', tags.image)
    out = setMeta(out, 'property', 'og:image:alt', tags.imageAlt)
    out = setMeta(out, 'name', 'twitter:image', tags.image)
    out = setMeta(out, 'name', 'twitter:image:alt', tags.imageAlt)
  }
  out = out.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeHtml(tags.url)}" />`)
  return out
}

/** The built index.html, fetched from this same deployment and kept for a few minutes. */
async function loadTemplate(origin) {
  if (cachedTemplate && Date.now() - cachedTemplate.at < TEMPLATE_TTL_MS) return cachedTemplate.html
  const response = await fetch(`${origin}/index.html`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!response.ok) throw new Error(`index.html: HTTP ${response.status}`)
  const html = await response.text()
  if (!html.includes('<div id="root">')) throw new Error('index.html did not look like the app')
  cachedTemplate = { html, at: Date.now() }
  return html
}

async function loadActivity(slug, supabaseUrl, anonKey) {
  const select = 'title,slug,description,starts_at,ends_at,date_text,location,image_path,image_url,image_alt'
  const response = await fetch(
    `${supabaseUrl}/rest/v1/major_activities?select=${select}&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
    { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }, signal: AbortSignal.timeout(TIMEOUT_MS) },
  )
  if (!response.ok) throw new Error(`Supabase: HTTP ${response.status}`)
  const rows = await response.json()
  return rows[0] ?? null
}

function requestOrigin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || (/^(localhost|127\.)/.test(host) ? 'http' : 'https')
  return `${String(proto).split(',')[0]}://${host}`
}

export default async function handler(req, res) {
  const origin = requestOrigin(req)
  const slug = String(req.query?.slug ?? new URL(req.url, origin).searchParams.get('slug') ?? '').toLowerCase()
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim()

  let template
  try {
    template = await loadTemplate(origin)
  } catch (error) {
    // Without index.html this can't serve the app, so send the visitor to the
    // plain app route (vercel.json skips this function when ?spa is present).
    console.error('[activity-preview]', error.message)
    res.setHeader('Cache-Control', 'no-store')
    res.statusCode = 307
    res.setHeader('Location', `/activities/${encodeURIComponent(slug)}?spa=1`)
    return res.end()
  }

  let html = template
  let status = 200
  if (SLUG.test(slug) && slug.length <= 96 && supabaseUrl && anonKey) {
    try {
      const activity = await loadActivity(slug, supabaseUrl, anonKey)
      if (activity) html = injectTags(template, previewTags(activity, { origin, supabaseUrl }))
      else status = 404 // The app shows "Activity not found"; the default tags stay.
    } catch (error) {
      console.error('[activity-preview]', error.message) // Default tags, but still the app.
    }
  } else {
    status = 404
  }

  res.statusCode = status
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // Shared caches (Vercel's CDN) keep it for 5 minutes; browsers always revalidate.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=60')
  res.end(html)
}
