// One-off: creates the missing thumbnails for images already in the media bucket.
//
//   node --env-file=.env.migration scripts/create-thumbnails.mjs [--dry-run] [--force]
//
// Every image at <path> gets a copy at thumbs/<path>, at most 800 px wide, in
// the same format as the original (the site derives the thumbnail address from
// the image path). Images uploaded through /admin already have one.
//
//   --dry-run   lists, downloads and resizes everything, and uploads nothing.
//               It reads the bucket, so it needs the credentials too.
//   --force     also recreates thumbnails that already exist.
//
// Uses the service role key from the git-ignored .env.migration. Never put that
// key in the frontend.

import sharp from 'sharp'

const BUCKET = 'media'
const THUMB_WIDTH = 800
const QUALITY = 80
const IMAGE = /\.(webp|jpe?g|png)$/i

const FLAGS = new Set(['--dry-run', '--force'])
const args = process.argv.slice(2)
for (const arg of args) {
  if (!FLAGS.has(arg)) {
    console.error(`Unknown option "${arg}". Valid options: --dry-run, --force`)
    process.exit(2)
  }
}
const DRY_RUN = args.includes('--dry-run')
const FORCE = args.includes('--force')

// ── Credentials (same checks as migrate-from-sanity.mjs) ────────────────────

const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '')
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Run with --env-file=.env.migration')
  process.exit(1)
}
const parsed = new URL(url)
if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
  console.error('SUPABASE_URL must use https, so the service role key is not sent in the clear.')
  process.exit(1)
}
if (key.startsWith('sb_publishable_')) {
  console.error('SUPABASE_SERVICE_ROLE_KEY holds a publishable key. Use the secret key.')
  process.exit(1)
}
if (key.startsWith('eyJ')) {
  let role
  try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role } catch { /* reported below */ }
  if (role !== 'service_role') {
    console.error(`SUPABASE_SERVICE_ROLE_KEY has role "${role ?? 'unknown'}". Use the service role key.`)
    process.exit(1)
  }
}

const redact = (text) => String(text).split(key).join('[REDACTED]')
const headers = { apikey: key, Authorization: `Bearer ${key}` }
const mb = (bytes) => `${(bytes / 1048576).toFixed(2)} MB`
const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/')

async function request(input, options = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(input, { ...options, signal: AbortSignal.timeout(120_000) })
      if (response.status >= 500 && attempt < 3) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (error) {
      if (attempt >= 3) throw new Error(redact(error.message))
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    }
  }
}

/** Every file in the bucket, walking folders. */
async function listAll(prefix = '') {
  const files = []
  for (let offset = 0; ; offset += 1000) {
    const response = await request(`${url}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    })
    if (!response.ok) throw new Error(`Listing "${prefix}" failed: HTTP ${response.status}: ${redact(await response.text()).slice(0, 200)}`)
    const items = await response.json()
    for (const item of items) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      // Folders come back without an id.
      if (item.id === null) files.push(...(await listAll(path)))
      else files.push({ path, size: item.metadata?.size ?? 0 })
    }
    if (items.length < 1000) return files
  }
}

function encode(image, extension) {
  if (/webp/i.test(extension)) return image.webp({ quality: QUALITY })
  if (/png/i.test(extension)) return image.png({ compressionLevel: 9 })
  return image.jpeg({ quality: QUALITY, mozjpeg: true })
}

async function main() {
  console.log(DRY_RUN ? 'DRY RUN. Nothing will be uploaded.' : `LIVE RUN, writing to ${parsed.host}.`)

  const all = await listAll()
  const existingThumbs = new Set(all.filter((f) => f.path.startsWith('thumbs/')).map((f) => f.path))
  const images = all.filter((f) => !f.path.startsWith('thumbs/') && IMAGE.test(f.path))
  const others = all.filter((f) => !f.path.startsWith('thumbs/') && !IMAGE.test(f.path))

  const todo = images.filter((f) => FORCE || !existingThumbs.has(`thumbs/${f.path}`))
  console.log(`Bucket: ${images.length} images, ${existingThumbs.size} thumbnails already present, ${todo.length} to create.`)

  const results = []
  const errors = []
  for (const [index, file] of todo.entries()) {
    const thumbPath = `thumbs/${file.path}`
    try {
      const download = await request(`${url}/storage/v1/object/${BUCKET}/${encodePath(file.path)}`, { headers })
      if (!download.ok) throw new Error(`download failed: HTTP ${download.status}`)
      const original = Buffer.from(await download.arrayBuffer())
      const extension = file.path.split('.').pop()

      const { data, info } = await encode(
        sharp(original).rotate().resize({ width: THUMB_WIDTH, withoutEnlargement: true }),
        extension,
      ).toBuffer({ resolveWithObject: true })

      if (!DRY_RUN) {
        const upload = await request(`${url}/storage/v1/object/${BUCKET}/${encodePath(thumbPath)}`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': `image/${info.format === 'jpeg' ? 'jpeg' : info.format}`,
            'Cache-Control': 'max-age=31536000',
            'x-upsert': FORCE ? 'true' : 'false',
          },
          body: data,
        })
        if (!upload.ok) throw new Error(`upload failed: HTTP ${upload.status}: ${redact(await upload.text()).slice(0, 200)}`)
      }
      results.push({ path: file.path, before: original.length, after: data.length, width: info.width, height: info.height })
      console.log(`  ${String(index + 1).padStart(3)}/${todo.length}  ${file.path.padEnd(58)} ${mb(original.length).padStart(9)} -> ${mb(data.length).padStart(8)}  ${info.width}x${info.height}`)
    } catch (error) {
      errors.push(`${file.path}: ${redact(error.message)}`)
    }
  }

  const before = results.reduce((sum, r) => sum + r.before, 0)
  const after = results.reduce((sum, r) => sum + r.after, 0)
  console.log(`\n${DRY_RUN ? 'Would create' : 'Created'} ${results.length} thumbnails: ${mb(before)} of full images -> ${mb(after)} of thumbnails.`)
  if (others.length) console.log(`Skipped ${others.length} non-image files: ${others.map((f) => f.path).join(', ')}`)
  if (errors.length) {
    console.log(`\nErrors (${errors.length}):`)
    errors.forEach((e) => console.log(`  - ${e}`))
  }
  console.log(errors.length ? '\nFinished WITH ERRORS.' : DRY_RUN ? '\nDry run finished with no errors. Nothing was uploaded.' : '\nFinished with no errors.')
  process.exitCode = errors.length ? 1 : 0
}

main().catch((error) => {
  console.error(`\nFATAL: ${redact(error.message)}`)
  process.exitCode = 1
})
