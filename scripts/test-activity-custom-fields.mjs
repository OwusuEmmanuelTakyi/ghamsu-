// Live check of extra registration questions (migration 0006) and the link
// preview function (ghamsu-frontend-new/api/activity-preview.js).
//
//   cd ghamsu-frontend-new && npm run build && cd ..
//   node --env-file=.env.migration scripts/test-activity-custom-fields.mjs
//
// The service role key (.env.migration) only creates and deletes one clearly
// labelled test activity and its questions, as an admin would in the
// dashboard. Every registration and every read a visitor could attempt uses
// the public anon key from ghamsu-frontend-new/.env. The link preview check
// runs the real function against a local copy of the built index.html.
// Before 0006 is applied, only the link preview part runs.
// The test activity (with its questions and registrations) is always deleted.

import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FRONTEND = join(ROOT, 'ghamsu-frontend-new')
if (existsSync(join(FRONTEND, '.env'))) process.loadEnvFile(join(FRONTEND, '.env'))

const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()
if (!url || !serviceKey || !anonKey) {
  console.error('Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (.env.migration) and VITE_SUPABASE_ANON_KEY (ghamsu-frontend-new/.env).')
  process.exit(1)
}
const builtIndex = join(FRONTEND, 'dist/index.html')
if (!existsSync(builtIndex)) {
  console.error('Build the site first (cd ghamsu-frontend-new && npm run build): the preview check needs dist/index.html.')
  process.exit(1)
}

const redact = (text) => String(text).split(serviceKey).join('[REDACTED]').split(anonKey).join('[ANON]')
const headers = (key) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' })
async function rest(key, method, path, body, prefer) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method, headers: { ...headers(key), ...(prefer ? { Prefer: prefer } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* not JSON */ }
  return { status: response.status, json, text: redact(text).slice(0, 300) }
}

let pass = 0, fail = 0, skipped = 0
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`  PASS  ${name}`) } else { fail++; console.log(`  FAIL  ${name} ${detail}`) }
}

const slug = `test-custom-fields-${Date.now()}`
let activityId = null

/** Formats an answer the way the admin list and CSV do (formatAnswer in src/lib/activities.ts). */
const formatAnswer = (v) => (v === undefined || v === null ? '' : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : Array.isArray(v) ? v.join('; ') : String(v))

async function customFields() {
  console.log('\nExtra registration questions (0006)')
  const probe = await rest(serviceKey, 'GET', 'activity_form_fields?select=id&limit=1')
  if (probe.status !== 200) {
    skipped++
    console.log('  SKIP  migration 0006 is not applied yet (activity_form_fields does not exist).')
    console.log('        Run supabase/migrations/0006_activity_custom_fields.sql in the SQL editor, then run this again.')
    return
  }

  const add = (label, field_type, options, required, sort_order) =>
    rest(serviceKey, 'POST', 'activity_form_fields?select=id', { activity_id: activityId, label, field_type, options, required, sort_order }, 'return=representation')
  const size = (await add('T-shirt size', 'dropdown', ['S', 'M', 'L'], true, 1)).json?.[0]?.id
  const diet = (await add('Dietary needs', 'short_text', [], false, 2)).json?.[0]?.id
  const car = (await add('Coming by car?', 'yes_no', [], false, 3)).json?.[0]?.id
  check('three questions created (required dropdown, optional text, yes/no)', size && diet && car)
  if (!size || !diet || !car) return

  const visible = await rest(anonKey, 'GET', `activity_form_fields?select=id,label,field_type,options,required&activity_id=eq.${activityId}&order=sort_order`)
  check('visitor can read the questions, in order', visible.json?.map((f) => f.label).join('|') === 'T-shirt size|Dietary needs|Coming by car?', visible.text)

  const register = (phone, answers) => rest(anonKey, 'POST', 'activity_registrations', {
    activity_id: activityId, full_name: 'Test Visitor (automated check)', phone, email: 'test-visitor@example.invalid',
    gender: 'female', local: 'Test Local', diocese: 'Test Diocese', level: 'Level 100', role: 'guest', custom_answers: answers,
  }, 'return=minimal')

  const ok1 = await register('024 000 0101', { [size]: 'M', [diet]: '  Vegetarian ', [car]: true })
  check('valid registration with all answers accepted', ok1.status === 201, `HTTP ${ok1.status} ${ok1.text}`)
  const ok2 = await register('024 000 0102', { [size]: 'L' })
  check('valid registration with only the required answer accepted', ok2.status === 201, `HTTP ${ok2.status} ${ok2.text}`)
  const ok3 = await register('024 000 0103', { [size]: 'S', [diet]: '', [car]: false })
  check('empty optional text and "no" accepted', ok3.status === 201, `HTTP ${ok3.status} ${ok3.text}`)

  const rejected = [
    ['required dropdown missing', { [diet]: 'None' }, 'custom_required'],
    ['dropdown value not among the options', { [size]: 'XXL' }, 'custom_option'],
    ['yes/no answered with text', { [size]: 'S', [car]: 'yes' }, 'custom_invalid'],
    ['answer to a question that does not exist', { [size]: 'S', '00000000-0000-4000-8000-000000000001': 'x' }, 'custom_unknown_field'],
  ]
  for (const [name, answers, hint] of rejected) {
    const r = await register('024 000 0199', answers)
    check(`database rejects: ${name}`, r.status >= 400 && r.json?.hint === hint, `HTTP ${r.status} ${r.text}`)
    if (r.status >= 400) console.log(`          "${r.json?.message}"`)
  }

  const stored = await rest(serviceKey, 'GET', `activity_registrations?select=phone,custom_answers&activity_id=eq.${activityId}&order=phone`)
  const byPhone = Object.fromEntries((stored.json ?? []).map((r) => [r.phone, r.custom_answers]))
  check('only the 3 valid registrations were saved', stored.json?.length === 3, stored.text)
  check('answers stored by question id, text trimmed', byPhone['+233240000101']?.[size] === 'M' && byPhone['+233240000101']?.[diet] === 'Vegetarian' && byPhone['+233240000101']?.[car] === true, JSON.stringify(byPhone))
  check('empty optional answer not stored', !(diet in (byPhone['+233240000103'] ?? {})) && byPhone['+233240000103']?.[car] === false)

  // The registrations list and CSV: one column per question, in display order.
  const questions = [[size, 'T-shirt size'], [diet, 'Dietary needs'], [car, 'Coming by car?']]
  console.log('\n  As in the admin list and CSV:')
  console.log(`    ${['Phone', ...questions.map(([, l]) => l)].join(' | ')}`)
  for (const r of stored.json ?? []) console.log(`    ${[r.phone, ...questions.map(([id]) => formatAnswer(r.custom_answers[id]) || '—')].join(' | ')}`)

  // Removing a question that already has answers keeps them.
  await rest(serviceKey, 'PATCH', `activity_form_fields?id=eq.${diet}`, { deleted_at: new Date().toISOString() })
  const afterRemove = await rest(anonKey, 'GET', `activity_form_fields?select=id&activity_id=eq.${activityId}`)
  check('removed question no longer on the public form', afterRemove.json?.length === 2)
  const late = await register('024 000 0104', { [size]: 'S', [diet]: 'x' })
  check('answers to a removed question are refused', late.status >= 400 && late.json?.hint === 'custom_unknown_field', `HTTP ${late.status}`)
  const kept = await rest(serviceKey, 'GET', `activity_registrations?select=custom_answers&phone=eq.%2B233240000101&activity_id=eq.${activityId}`)
  check('old answers to the removed question are kept', kept.json?.[0]?.custom_answers?.[diet] === 'Vegetarian')

  // Visitors can't change the questions.
  const anonInsert = await rest(anonKey, 'POST', 'activity_form_fields', { activity_id: activityId, label: 'x', field_type: 'short_text' })
  check('visitor cannot add questions', anonInsert.status >= 400, `HTTP ${anonInsert.status}`)
  const anonPatch = await rest(anonKey, 'PATCH', `activity_form_fields?id=eq.${size}`, { label: 'hacked' }, 'return=representation')
  check('visitor cannot change questions', anonPatch.status >= 400 || (anonPatch.json ?? []).length === 0, `HTTP ${anonPatch.status}`)
  const anonRead = await rest(anonKey, 'GET', `activity_registrations?select=custom_answers&activity_id=eq.${activityId}`)
  check('visitor cannot read answers', anonRead.status >= 400 || (anonRead.json ?? []).length === 0, `HTTP ${anonRead.status}`)
}

async function linkPreview() {
  console.log('\nLink preview function')
  const { default: handler } = await import(pathToFileURL(join(FRONTEND, 'api/activity-preview.js')).href)
  // Stands in for the deployment's static index.html.
  const template = readFileSync(builtIndex, 'utf8')
  const server = createServer((req, res) => {
    if (req.url === '/index.html') { res.setHeader('Content-Type', 'text/html'); return res.end(template) }
    res.statusCode = 404; res.end()
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const host = `127.0.0.1:${server.address().port}`
  const call = async (testSlug) => {
    const res = { statusCode: 200, headers: {}, body: '', setHeader(k, v) { this.headers[k.toLowerCase()] = v }, end(b = '') { this.body = b } }
    await handler({ url: `/api/activity-preview?slug=${testSlug}`, query: { slug: testSlug }, headers: { host, 'x-forwarded-proto': 'http' } }, res)
    return res
  }
  const tagsOf = (html) => [...html.matchAll(/<meta (?:property|name)="((?:og|twitter):[^"]+|description)" content="([^"]*)"/g)].map((m) => [m[1], m[2]])
  try {
    const res = await call(slug)
    const tags = Object.fromEntries(tagsOf(res.body))
    console.log('\n  Generated tags for /activities/' + slug + ':')
    console.log(`    <title>${res.body.match(/<title>([^<]*)<\/title>/)?.[1]}</title>`)
    for (const [name, content] of tagsOf(res.body)) console.log(`    ${name.padEnd(20)} ${content}`)
    console.log(`    canonical            ${res.body.match(/<link rel="canonical" href="([^"]*)"/)?.[1]}`)
    console.log(`    Cache-Control        ${res.headers['cache-control']}\n`)
    check('returns 200 HTML', res.statusCode === 200 && /text\/html/.test(res.headers['content-type']))
    check('og:title is the activity title', tags['og:title'] === 'TEST Connexional Conference (automated check)')
    check('description has the date, venue and summary',
      tags['og:description'] === 'Sat, 5 Dec 2026 – Mon, 7 Dec 2026 · University of Cape Coast. Three days of fellowship &amp; training.', tags['og:description'])
    check('og:image is the banner as a full https URL', tags['og:image'] === `${url}/storage/v1/object/public/media/activities/2026/12/test-banner.webp`, tags['og:image'])
    check('og:url and canonical are the activity page', tags['og:url'] === `http://${host}/activities/${slug}` && res.body.includes(`<link rel="canonical" href="http://${host}/activities/${slug}" />`))
    check('twitter tags match', tags['twitter:title'] === tags['og:title'] && tags['twitter:image'] === tags['og:image'] && tags['twitter:card'] === 'summary_large_image')
    check('the page still loads the full app', res.body.includes('<div id="root"></div>') && /<script type="module"[^>]+src="\/assets\//.test(res.body))
    check('cached 5 minutes on the CDN', /s-maxage=300/.test(res.headers['cache-control'] ?? ''))

    const unknown = await call('no-such-activity-xyz')
    const defaults = Object.fromEntries(tagsOf(template))
    check('unknown activity: 404 with the default site tags', unknown.statusCode === 404 && Object.fromEntries(tagsOf(unknown.body))['og:title'] === defaults['og:title'] && unknown.body.includes('<div id="root"></div>'))
    const bad = await call('../../etc')
    check('malformed slug: 404, no database query needed', bad.statusCode === 404)
  } finally {
    server.close()
  }
}

async function main() {
  console.log(`Live test on ${new URL(url).host}`)
  const created = await rest(serviceKey, 'POST', 'major_activities?select=id', {
    title: 'TEST Connexional Conference (automated check)', slug, status: 'published', registration_open: true, sort_order: 9999,
    starts_at: '2026-12-05T09:00:00Z', ends_at: '2026-12-07T16:00:00Z', location: 'University of Cape Coast',
    description: 'Three days of fellowship & training.', image_path: 'activities/2026/12/test-banner.webp', image_alt: 'Conference banner',
  }, 'return=representation')
  activityId = created.json?.[0]?.id
  check('test activity created', created.status === 201 && activityId, created.text)
  if (!activityId) return
  await linkPreview()
  await customFields()
}

async function cleanup() {
  if (!activityId) return
  const deleted = await rest(serviceKey, 'DELETE', `major_activities?id=eq.${activityId}`, undefined, 'return=representation')
  const regs = await rest(serviceKey, 'GET', `activity_registrations?select=id&activity_id=eq.${activityId}`)
  const fields = await rest(serviceKey, 'GET', `activity_form_fields?select=id&activity_id=eq.${activityId}`)
  check('test activity, questions and registrations deleted',
    deleted.status === 200 && deleted.json?.length === 1 && regs.json?.length === 0 && (fields.status !== 200 || fields.json?.length === 0))
}

try {
  await main()
} catch (error) {
  fail++
  console.error(`\nERROR: ${redact(error.stack ?? error.message)}`)
} finally {
  await cleanup()
  console.log(`\nRESULT: ${pass} passed, ${fail} failed${skipped ? `, ${skipped} part skipped (0006 not applied)` : ''}`)
  process.exitCode = fail ? 1 : 0
}
