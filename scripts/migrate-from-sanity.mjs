// One-off copy of Sanity content and images into Supabase. Run locally only.
//
//   node --env-file=.env.migration scripts/migrate-from-sanity.mjs [--dry-run] [--stats-only]
//
//   (no flags)     copies images and documents. Safe to repeat: it upserts on the
//                  Sanity ID. A repeat also overwrites later edits to those rows,
//                  so do not run it in full once people are editing in /admin.
//   --stats-only   re-copies only likes and views, right before the final switch.
//   --dry-run      reads, downloads and converts everything, and writes nothing.
//                  It never contacts Supabase, so it needs no credentials.
//
// .env.migration holds SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and is
// git-ignored. The service role key bypasses all security rules: keep it out of
// any VITE_ variable, and out of the frontend entirely.

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  SANITY_DATASET,
  SANITY_PROJECT_ID,
  SANITY_TYPES,
  TABLE_ORDER,
  buildMigration,
  imageDownloadUrl,
  imagePathFor,
} from './sanity-mappers.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SANITY_API = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?perspective=published`
const BUCKET = 'media'
const BUCKET_LIMIT_BYTES = 26214400

// Resized like the Sanity images: at most 2000 px wide, WebP, quality 80.
const MAX_WIDTH = 2000
const WEBP_QUALITY = 80

// 0003_seed_hardcoded.sql seeded the original names (seededPath). They are
// uploaded as WebP (path), and the seeded references are then repointed.
const SITE_IMAGES = ['3.jpg', '5.jpg', '7.jpg', '12.jpg', '13.jpg', 'rev.png'].map((file) => ({
  file,
  seededPath: `site/${file}`,
  path: `site/${file.replace(/\.[a-z]+$/, '')}.webp`,
}))

// ── Arguments and credentials ───────────────────────────────────────────────

const FLAGS = new Set(['--dry-run', '--stats-only'])
const args = process.argv.slice(2)
for (const arg of args) {
  if (!FLAGS.has(arg)) {
    console.error(`Unknown option "${arg}". Valid options: --dry-run, --stats-only`)
    process.exit(2)
  }
}
const DRY_RUN = args.includes('--dry-run')
const STATS_ONLY = args.includes('--stats-only')

function loadCredentials() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Run with --env-file=.env.migration')
  }

  const parsed = new URL(url)
  const isLocal = ['localhost', '127.0.0.1'].includes(parsed.hostname)
  if (parsed.protocol !== 'https:' && !isLocal) {
    throw new Error('SUPABASE_URL must use https, so the service role key is not sent in the clear')
  }

  // Catch the common mistake of pasting the public anon key.
  if (key.startsWith('sb_publishable_')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY holds a publishable key. Use the secret key.')
  }
  if (key.startsWith('eyJ')) {
    let role
    try {
      role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role
    } catch {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not a valid key')
    }
    if (role !== 'service_role') {
      throw new Error(`SUPABASE_SERVICE_ROLE_KEY has role "${role}". Use the service role key.`)
    }
  }
  return { url, key, host: parsed.host }
}

// ── HTTP ────────────────────────────────────────────────────────────────────

let credentials = null

// Error text is shown on screen, so the key is removed from it first.
const redact = (text) => (credentials ? String(text).split(credentials.key).join('[REDACTED]') : String(text))

async function request(url, options = {}, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(120_000) })
      if (response.status >= 500 && attempt < attempts) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (error) {
      if (attempt >= attempts) throw new Error(`Request failed: ${redact(error.message)}`)
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
    }
  }
}

async function sanityQuery(query) {
  const response = await request(SANITY_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!response.ok) throw new Error(`Sanity query failed: HTTP ${response.status}`)
  return (await response.json()).result
}

const authHeaders = () => ({
  apikey: credentials.key,
  Authorization: `Bearer ${credentials.key}`,
})

async function supabaseRest(method, path, { body, prefer } = {}) {
  const response = await request(`${credentials.url}/rest/v1/${path}`, {
    method,
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${redact(text).slice(0, 400)}`)
  return text ? JSON.parse(text) : null
}

async function uploadFile(path, bytes, contentType) {
  const encoded = path.split('/').map(encodeURIComponent).join('/')
  const response = await request(`${credentials.url}/storage/v1/object/${BUCKET}/${encoded}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': contentType,
      'x-upsert': 'true',
      'Cache-Control': 'max-age=86400',
    },
    body: bytes,
  })
  if (!response.ok) {
    throw new Error(`Upload of ${path} failed: HTTP ${response.status}: ${redact(await response.text()).slice(0, 300)}`)
  }
}

// ── Output helpers ──────────────────────────────────────────────────────────

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`
const heading = (text) => console.log(`\n── ${text} ${'─'.repeat(Math.max(0, 66 - text.length))}`)

function printList(title, items) {
  heading(`${title} (${items.length})`)
  if (!items.length) console.log('  None')
  for (const item of items) console.log(`  - ${item}`)
}

// ── --stats-only ────────────────────────────────────────────────────────────

async function runStatsOnly() {
  const docs = await sanityQuery(
    `*[_type in ["news", "article", "blog"] && (defined(likes) || defined(views))]{ _id, _type, "slug": slug.current, likes, views }`,
  )

  heading(DRY_RUN ? 'Likes and views that would be copied' : 'Copying likes and views')
  const errors = []
  for (const doc of docs) {
    const counts = { view_count: doc.views ?? 0, like_count: doc.likes ?? 0 }
    console.log(`  ${doc.slug}: ${counts.view_count} views, ${counts.like_count} likes`)
    if (DRY_RUN) continue

    try {
      const updated = await supabaseRest('PATCH', `posts?legacy_sanity_id=eq.${encodeURIComponent(doc._id)}`, {
        body: counts,
        prefer: 'return=representation',
      })
      if (!updated?.length) errors.push(`${doc.slug}: no matching post in Supabase. Run the full migration first.`)
    } catch (error) {
      errors.push(`${doc.slug}: ${error.message}`)
    }
  }
  console.log(`\n  ${docs.length} posts ${DRY_RUN ? 'read, nothing written' : 'processed'}`)
  printList('Errors', errors)
  return errors.length === 0
}

// ── Full migration ──────────────────────────────────────────────────────────

async function processImages(usedAssets, errors) {
  const results = []
  const refs = [...usedAssets].sort()

  for (const [index, ref] of refs.entries()) {
    const path = imagePathFor(ref)
    if (process.stdout.isTTY) process.stdout.write(`\r  Sanity images: ${index + 1}/${refs.length}`)
    try {
      const response = await request(imageDownloadUrl(ref))
      if (!response.ok) throw new Error(`download failed: HTTP ${response.status}`)
      const contentType = response.headers.get('content-type')
      if (contentType !== 'image/webp') throw new Error(`expected image/webp, got ${contentType}`)

      const bytes = Buffer.from(await response.arrayBuffer())
      if (!bytes.length) throw new Error('downloaded an empty file')
      if (bytes.length > BUCKET_LIMIT_BYTES) throw new Error(`${mb(bytes.length)} is over the bucket limit`)

      if (!DRY_RUN) await uploadFile(path, bytes, 'image/webp')
      results.push({ ref, path, bytes: bytes.length })
    } catch (error) {
      errors.push(`Image ${ref}: ${error.message}`)
    }
  }
  if (process.stdout.isTTY && refs.length) process.stdout.write('\n')
  console.log(`  Sanity images: ${results.length}/${refs.length}`)

  const siteResults = []
  for (const image of SITE_IMAGES) {
    try {
      const original = await readFile(join(ROOT, 'ghamsu-frontend-new/src/images', image.file))
      // rotate() applies the camera's orientation before EXIF data is stripped.
      const { data: bytes, info } = await sharp(original)
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer({ resolveWithObject: true })

      if (info.format !== 'webp' || info.width > MAX_WIDTH) throw new Error('resize produced an unexpected result')
      if (bytes.length > BUCKET_LIMIT_BYTES) throw new Error(`${mb(bytes.length)} is over the bucket limit`)

      if (!DRY_RUN) await uploadFile(image.path, bytes, 'image/webp')
      siteResults.push({ ...image, originalBytes: original.length, bytes: bytes.length, width: info.width, height: info.height })
    } catch (error) {
      errors.push(`Site image ${image.file}: ${error.message}`)
    }
  }
  console.log(`  Site images: ${siteResults.length}/${SITE_IMAGES.length}`)
  return { results, siteResults }
}

// The seed points at the original filenames. Repoint only references that
// still hold the seeded value, so an image already changed in /admin is kept.
async function repointSiteImages(errors) {
  let updated = 0
  for (const { seededPath, path } of SITE_IMAGES) {
    for (const table of ['hero_slides', 'content_sections']) {
      try {
        const rows = await supabaseRest('PATCH', `${table}?image_path=eq.${encodeURIComponent(seededPath)}`, {
          body: { image_path: path },
          prefer: 'return=representation',
        })
        updated += rows.length
      } catch (error) {
        errors.push(`Repointing ${table} from ${seededPath}: ${error.message}`)
      }
    }
  }

  // The coordinator photo lives inside a JSON setting.
  try {
    const [setting] = await supabaseRest('GET', 'site_settings?key=eq.coordinator&select=value')
    const match = SITE_IMAGES.find((image) => image.seededPath === setting?.value?.image_path)
    if (match) {
      await supabaseRest('PATCH', 'site_settings?key=eq.coordinator', {
        body: { value: { ...setting.value, image_path: match.path } },
      })
      updated++
    }
  } catch (error) {
    errors.push(`Repointing the coordinator photo: ${error.message}`)
  }
  return updated
}

async function writeRows(entries, errors) {
  const idsBySanityId = new Map()
  let written = 0

  for (const entry of entries) {
    const row = { ...entry.row }
    for (const [column, ref] of Object.entries(entry.refs)) {
      row[column] = idsBySanityId.get(ref) ?? null
      if (!row[column]) errors.push(`${entry.label}: ${column} could not be linked`)
    }

    try {
      const [saved] = await supabaseRest('POST', `${entry.table}?on_conflict=legacy_sanity_id&select=id`, {
        body: row,
        prefer: 'resolution=merge-duplicates,return=representation',
      })
      idsBySanityId.set(entry.legacyId, saved.id)
      written++

      for (const child of entry.children) {
        await supabaseRest('DELETE', `${child.table}?${child.parentColumn}=eq.${saved.id}`)
        if (child.rows.length) {
          await supabaseRest('POST', child.table, {
            body: child.rows.map((childRow) => ({ ...childRow, [child.parentColumn]: saved.id })),
          })
        }
      }
    } catch (error) {
      errors.push(`${entry.label}: ${error.message}`)
    }
  }
  return written
}

function printSummary({ migration, documents, assets, images }) {
  const { entries, usedAssets, richText } = migration

  heading('Documents read from Sanity')
  const bySanityType = {}
  for (const doc of documents) bySanityType[doc._type] = (bySanityType[doc._type] ?? 0) + 1
  for (const type of SANITY_TYPES) console.log(`  ${type.padEnd(16)} ${bySanityType[type] ?? 0}`)
  console.log(`  ${'total'.padEnd(16)} ${documents.length}`)

  heading('Rows by Supabase table')
  console.log(`  ${'table'.padEnd(26)}${'published'.padStart(10)}${'draft'.padStart(7)}${'total'.padStart(7)}`)
  for (const table of TABLE_ORDER) {
    const rows = entries.filter((entry) => entry.table === table)
    const published = rows.filter((entry) => entry.row.status === 'published').length
    const draft = rows.filter((entry) => entry.row.status === 'draft').length
    console.log(`  ${table.padEnd(26)}${String(published).padStart(10)}${String(draft).padStart(7)}${String(rows.length).padStart(7)}`)
  }
  const childRows = entries.flatMap((entry) => entry.children.flatMap((child) => child.rows))
  console.log(`  Child rows (media attachments, GHAMSU Today items): ${childRows.length}`)

  heading('Posts')
  for (const { row, refs } of entries.filter((entry) => entry.table === 'posts')) {
    const author = row.author_name ?? (refs.author_id ? 'linked author record' : 'NONE')
    console.log(`  ${row.status.padEnd(10)}${row.legacy_sanity_type.padEnd(9)}${row.slug}`)
    console.log(`  ${''.padEnd(19)}author: ${author}, ${row.view_count} views, ${row.like_count} likes`)
  }

  heading('Rich text conversion')
  console.log(`  ${'post'.padEnd(60)}${'chars'.padStart(7)}${'head'.padStart(6)}${'list'.padStart(6)}${'img'.padStart(5)}${'link'.padStart(6)}`)
  for (const item of richText) {
    console.log(`  ${item.label.slice(0, 58).padEnd(60)}${String(item.characters).padStart(7)}${String(item.headings).padStart(6)}${String(item.listItems).padStart(6)}${String(item.images).padStart(5)}${String(item.links).padStart(6)}`)
  }
  const marks = {}
  for (const item of richText) {
    for (const [name, count] of Object.entries(item.markedChars)) marks[name] = (marks[name] ?? 0) + count
  }
  console.log(`  Characters with marks: ${JSON.stringify(marks)}`)
  console.log(`  Each post was compared with its source: text, headings, list items, images and marks.`)

  heading('Images')
  const resized = images.results.reduce((sum, item) => sum + item.bytes, 0)
  const original = assets.filter((asset) => usedAssets.has(asset._id)).reduce((sum, asset) => sum + (asset.size ?? 0), 0)
  const largest = Math.max(0, ...images.results.map((item) => item.bytes))
  console.log(`  Referenced Sanity images: ${usedAssets.size} of ${assets.length} in the dataset`)
  console.log(`  ${DRY_RUN ? 'Downloaded and checked' : 'Uploaded'}: ${images.results.length}`)
  console.log(`  Size: ${mb(original)} originals became ${mb(resized)} (largest copy ${mb(largest)})`)
  const siteOriginal = images.siteResults.reduce((sum, item) => sum + item.originalBytes, 0)
  const siteResized = images.siteResults.reduce((sum, item) => sum + item.bytes, 0)
  console.log(`  Site images: ${images.siteResults.length}: ${mb(siteOriginal)} originals became ${mb(siteResized)}`)
  for (const item of images.siteResults) {
    console.log(`    ${item.seededPath.padEnd(15)} -> ${item.path.padEnd(15)} ${mb(item.originalBytes).padStart(7)} -> ${mb(item.bytes).padStart(6)}  ${item.width}x${item.height}`)
  }
  console.log(`  Total uploaded: ${mb(resized + siteResized)}`)
  if (DRY_RUN) {
    console.log('  A live run also repoints the seeded references (hero slides, page sections, coordinator) to the .webp names.')
  }
  const focused = entries.filter((entry) => Object.entries(entry.row).some(([key, value]) => key.endsWith('_focus') && value))
  console.log(`  Rows keeping hotspot or crop data: ${focused.length}`)
}

async function runFullMigration() {
  console.log('Reading Sanity...')
  const types = SANITY_TYPES.map((type) => `"${type}"`).join(', ')
  const documents = await sanityQuery(`*[_type in [${types}]] | order(_id asc)`)
  const assets = await sanityQuery(`*[_type == "sanity.imageAsset"]{ _id, size }`)
  const migration = buildMigration(documents)
  const { entries, usedAssets, warnings, errors } = migration

  warnings.push(
    'Drafts are not copied. The public Sanity API cannot see them, so any unpublished Sanity edits or documents stay behind.',
  )
  const unreferenced = assets.filter((asset) => !usedAssets.has(asset._id))
  if (unreferenced.length) {
    warnings.push(`${unreferenced.length} Sanity images are not used by any published document and are not copied. A Sanity draft could still be using them.`)
  }

  heading('Images')
  const images = await processImages(usedAssets, errors)

  // Rows are only written when every image they refer to is safely in place.
  let written = 0
  if (!DRY_RUN) {
    if (errors.length) {
      errors.push('Stopped before writing any rows, because of the errors above. Fix them and run again.')
    } else {
      heading('Writing rows')
      written = await writeRows(entries, errors)
      console.log(`  ${written} of ${entries.length} documents written`)
      const repointed = await repointSiteImages(errors)
      console.log(`  ${repointed} seeded site image references repointed to WebP`)
    }
  }

  printSummary({ migration, documents, assets, images })
  printList('Warnings', warnings)
  printList('Errors', errors)
  return errors.length === 0
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!DRY_RUN) credentials = loadCredentials()

  const mode = STATS_ONLY ? 'likes and views only' : 'full migration'
  console.log(DRY_RUN
    ? `DRY RUN (${mode}). Supabase is not contacted and nothing is written.`
    : `LIVE RUN (${mode}), writing to ${credentials.host}.`)
  if (!DRY_RUN && !STATS_ONLY) {
    console.log('A full run overwrites these rows. Use --stats-only once people are editing in /admin.')
  }

  const succeeded = STATS_ONLY ? await runStatsOnly() : await runFullMigration()

  heading('Result')
  console.log(succeeded
    ? `  ${DRY_RUN ? 'Dry run finished with no errors. Nothing was written.' : 'Finished with no errors.'}`
    : '  Finished WITH ERRORS. See the list above.')
  process.exitCode = succeeded ? 0 : 1
}

main().catch((error) => {
  console.error(`\nFATAL: ${redact(error.message)}`)
  process.exitCode = 1
})
