// Live check of executive self-submission against the real Supabase project.
// Run AFTER supabase/migrations/0005_executive_submissions.sql is applied:
//
//   node --env-file=.env.migration scripts/test-executive-submissions.mjs
//
// The service role key (.env.migration) is used only for what an admin would do
// in the dashboard: creating the test link, approving, rejecting, deactivating,
// and the clean-up. Everything a visitor does (reading the link, uploading the
// photo, submitting, and every attempt to read private data) uses the public
// anon key from ghamsu-frontend-new/.env, exactly as a visitor's browser does.
// All test rows and files are deleted at the end, even if a check fails.

import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const frontendEnv = join(ROOT, 'ghamsu-frontend-new/.env')
if (existsSync(frontendEnv)) process.loadEnvFile(frontendEnv)

const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const anonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim()
if (!url || !serviceKey || !anonKey) {
  console.error('Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (.env.migration) and VITE_SUPABASE_ANON_KEY (ghamsu-frontend-new/.env).')
  process.exit(1)
}
if (!url.startsWith('https://')) {
  console.error('SUPABASE_URL must use https.')
  process.exit(1)
}

const redact = (text) => String(text).split(serviceKey).join('[REDACTED]').split(anonKey).join('[ANON]')
const auth = (key) => ({ apikey: key, Authorization: `Bearer ${key}` })

async function call(key, method, path, { body, prefer, raw, contentType } = {}) {
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      ...auth(key),
      ...(raw ? { 'Content-Type': contentType, 'x-upsert': 'false' } : body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  })
  const buffer = Buffer.from(await response.arrayBuffer())
  const text = buffer.toString('utf8')
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* not JSON */ }
  return { status: response.status, json, text: redact(text).slice(0, 300), buffer }
}
const rest = (key, method, path, body, prefer) => call(key, method, `/rest/v1/${path}`, { body, prefer })
const rpc = (key, name, body) => call(key, 'POST', `/rest/v1/rpc/${name}`, { body })
const upload = (key, bucket, path, bytes, type = 'image/webp') =>
  call(key, 'POST', `/storage/v1/object/${bucket}/${path}`, { raw: bytes, contentType: type })

let pass = 0
let fail = 0
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`  PASS  ${name}`) } else { fail++; console.log(`  FAIL  ${name} ${detail}`) }
}

// A valid 1×1 WebP image.
const WEBP = Buffer.from('UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==', 'base64')

const state = { linkId: null, token: null, executiveId: null, privateFiles: [], mediaFiles: [] }

const profile = (phone, photo) => ({
  full_name: 'Test Executive (automated check)', position: 'Test Position', category: 'local', location: 'Test Diocese',
  phone, email: 'test-executive@example.invalid', whatsapp: '0240000001', bio: 'Automated test entry, deleted at the end.',
  photo_path: photo, photo_thumb_path: null, consent: true, show_phone: false, show_email: false,
})

/** Uploads a photo as a visitor would, and returns its path. */
async function visitorPhoto(label) {
  const path = `${state.token}/${randomUUID()}.webp`
  const result = await upload(anonKey, 'executive-submissions', path, WEBP)
  if (result.status === 200) state.privateFiles.push(path)
  check(`visitor can upload a photo into the link's folder (${label})`, result.status === 200, `HTTP ${result.status} ${result.text}`)
  return path
}

async function main() {
  console.log(`Live executive submission test on ${new URL(url).host}\n`)

  // 0. Is 0005 applied?
  const probe = await rest(serviceKey, 'GET', 'executive_invite_links?select=id&limit=1')
  if (probe.status !== 200) {
    console.error('Migration 0005 does not appear to be applied yet (executive_invite_links does not exist).')
    console.error('Run supabase/migrations/0005_executive_submissions.sql in the SQL editor, then try again.')
    process.exitCode = 1
    return
  }

  // 1. An admin creates a link.
  const created = await rest(serviceKey, 'POST', 'executive_invite_links?select=id,token',
    { label: 'TEST link (automated check, will be deleted)', max_submissions: 5 }, 'return=representation')
  state.linkId = created.json?.[0]?.id
  state.token = created.json?.[0]?.token
  check('test link created with a 64-character token', created.status === 201 && /^[a-f0-9]{64}$/.test(state.token ?? ''), created.text)
  if (!state.linkId) return

  // 2. A visitor opens the link.
  const info = await rpc(anonKey, 'executive_invite_info', { p_token: state.token })
  check('visitor sees the link as valid', info.json?.[0]?.is_valid === true, info.text)
  const wrong = await rpc(anonKey, 'executive_invite_info', { p_token: 'f'.repeat(64) })
  check('an unknown token is reported as invalid', wrong.status === 200 && !wrong.json?.[0]?.is_valid, wrong.text)

  // 3. Uploads outside a valid link's folder are refused.
  const stray = await upload(anonKey, 'executive-submissions', `${'f'.repeat(64)}/${randomUUID()}.webp`, WEBP)
  check('upload with an unknown token is refused', stray.status >= 400, `HTTP ${stray.status}`)
  const notImage = await upload(anonKey, 'executive-submissions', `${state.token}/${randomUUID()}.webp`, Buffer.from('hello'), 'text/plain')
  check('non-image upload is refused', notImage.status >= 400, `HTTP ${notImage.status}`)

  // 4. A visitor submits.
  const photo1 = await visitorPhoto('first')
  const submitted = await rpc(anonKey, 'submit_executive_profile', { p_token: state.token, p_submission: profile('024 000 0001', photo1) })
  const submissionId = submitted.json
  check('visitor can submit a profile', submitted.status === 200 && typeof submissionId === 'string', `HTTP ${submitted.status} ${submitted.text}`)

  // 5. The same phone (typed differently) is blocked while pending.
  const photo2 = await visitorPhoto('duplicate')
  const duplicate = await rpc(anonKey, 'submit_executive_profile', { p_token: state.token, p_submission: profile('+233 24 000 0001', photo2) })
  check('duplicate pending submission is blocked', duplicate.status >= 400 && /duplicate_pending/.test(duplicate.text), `HTTP ${duplicate.status} ${duplicate.text}`)

  // 6. Visitors cannot read private data.
  const readSubs = await rest(anonKey, 'GET', `executive_submissions?link_id=eq.${state.linkId}&select=*`)
  check('visitor cannot read submissions', readSubs.status >= 400 || (readSubs.status === 200 && readSubs.json?.length === 0), `HTTP ${readSubs.status} ${readSubs.text}`)
  const readLinks = await rest(anonKey, 'GET', 'executive_invite_links?select=token')
  check('visitor cannot read links or tokens', readLinks.status >= 400 || (readLinks.status === 200 && readLinks.json?.length === 0), `HTTP ${readLinks.status} ${readLinks.text}`)
  const changeSub = await rest(anonKey, 'PATCH', `executive_submissions?id=eq.${submissionId}`, { status: 'approved' }, 'return=representation')
  check('visitor cannot change submissions', changeSub.status >= 400 || (changeSub.json ?? []).length === 0, `HTTP ${changeSub.status}`)
  const list = await call(anonKey, 'POST', '/storage/v1/object/list/executive-submissions', { body: { prefix: state.token, limit: 100 } })
  check('visitor cannot list private photos', list.status >= 400 || (list.json ?? []).length === 0, `HTTP ${list.status} ${list.text}`)
  const download = await call(anonKey, 'GET', `/storage/v1/object/authenticated/executive-submissions/${photo1}`)
  check('visitor cannot download a private photo', download.status >= 400, `HTTP ${download.status}`)
  const publicUrl = await call(anonKey, 'GET', `/storage/v1/object/public/executive-submissions/${photo1}`)
  check('private photos have no public URL', publicUrl.status >= 400, `HTTP ${publicUrl.status}`)
  const overwrite = await call(anonKey, 'PUT', `/storage/v1/object/executive-submissions/${photo1}`, { raw: WEBP, contentType: 'image/webp' })
  check('visitor cannot overwrite an uploaded photo', overwrite.status >= 400, `HTTP ${overwrite.status}`)
  const execPrivate = await rest(anonKey, 'GET', 'executives?select=phone&limit=1')
  check('visitor cannot read the raw executive phone column', execPrivate.status >= 400, `HTTP ${execPrivate.status}`)

  // 7. An admin approves: copy the photo to the public bucket, then the RPC.
  const original = await call(serviceKey, 'GET', `/storage/v1/object/authenticated/executive-submissions/${photo1}`)
  check('staff can read the private photo', original.status === 200 && original.buffer.length === WEBP.length, `HTTP ${original.status}`)
  const mediaPath = `executives/test-${randomUUID()}.webp`
  const copied = await upload(serviceKey, 'media', mediaPath, original.buffer)
  if (copied.status === 200) state.mediaFiles.push(mediaPath)
  check('photo copied to the public media bucket', copied.status === 200, `HTTP ${copied.status} ${copied.text}`)
  const approved = await rpc(serviceKey, 'approve_executive_submission', {
    p_submission_id: submissionId,
    p_executive: {
      name: 'Test Executive (automated check)', position: 'Test Position', category: 'local',
      phone: '+233240000001', email: 'test-executive@example.invalid', whatsapp: '233240000001', bio: null,
      image_path: mediaPath, image_alt: 'Test Executive', image_focus: null, show_phone: false, show_email: false,
    },
  })
  state.executiveId = approved.json
  check('approval creates the executive', approved.status === 200 && typeof state.executiveId === 'string', `HTTP ${approved.status} ${approved.text}`)

  // 8. The executive is public, with the photo, and with contacts hidden.
  const shown = await rest(anonKey, 'GET', `executives?id=eq.${state.executiveId}&select=name,image_path,public_phone,public_email,public_whatsapp`)
  const row = shown.json?.[0]
  check('approved executive is visible to visitors with the photo', row?.image_path === mediaPath, shown.text)
  check('hidden phone, email and WhatsApp are not public', row && row.public_phone === null && row.public_email === null && row.public_whatsapp === null, shown.text)
  const photoPublic = await call(anonKey, 'GET', `/storage/v1/object/public/media/${mediaPath}`)
  check('the copied photo loads publicly', photoPublic.status === 200, `HTTP ${photoPublic.status}`)
  const subAfter = await rest(serviceKey, 'GET', `executive_submissions?id=eq.${submissionId}&select=status,executive_id`)
  check('submission marked approved and linked', subAfter.json?.[0]?.status === 'approved' && subAfter.json?.[0]?.executive_id === state.executiveId, subAfter.text)

  // 9. A second submission is rejected and never published.
  const photo3 = await visitorPhoto('second')
  const second = await rpc(anonKey, 'submit_executive_profile', { p_token: state.token, p_submission: { ...profile('024 000 0002', photo3), full_name: 'Test Rejected (automated check)' } })
  check('second submission accepted', second.status === 200, `HTTP ${second.status} ${second.text}`)
  const rejected = await rpc(serviceKey, 'reject_executive_submission', { p_submission_id: second.json, p_reason: 'Automated test' })
  check('submission rejected', rejected.status === 200 || rejected.status === 204, `HTTP ${rejected.status} ${rejected.text}`)
  const notShown = await rest(anonKey, 'GET', `executives?name=eq.${encodeURIComponent('Test Rejected (automated check)')}&select=id`)
  check('rejected profile does not appear on the website', notShown.status === 200 && notShown.json?.length === 0, notShown.text)

  // 10. Deactivating the link stops the form and uploads.
  await rest(serviceKey, 'PATCH', `executive_invite_links?id=eq.${state.linkId}`, { active: false })
  const infoAfter = await rpc(anonKey, 'executive_invite_info', { p_token: state.token })
  check('deactivated link is reported as inactive', infoAfter.json?.[0]?.is_valid === false, infoAfter.text)
  const lateUpload = await upload(anonKey, 'executive-submissions', `${state.token}/${randomUUID()}.webp`, WEBP)
  check('deactivated link refuses uploads', lateUpload.status >= 400, `HTTP ${lateUpload.status}`)
  const lateSubmit = await rpc(anonKey, 'submit_executive_profile', { p_token: state.token, p_submission: profile('024 000 0003', photo2) })
  check('deactivated link refuses submissions', lateSubmit.status >= 400 && /link_inactive|no longer active/.test(lateSubmit.text), `HTTP ${lateSubmit.status} ${lateSubmit.text}`)
}

async function cleanup() {
  if (!state.linkId) return
  const subs = await rest(serviceKey, 'DELETE', `executive_submissions?link_id=eq.${state.linkId}`, undefined, 'return=representation')
  let execOk = true
  if (state.executiveId) {
    const ex = await rest(serviceKey, 'DELETE', `executives?id=eq.${state.executiveId}`, undefined, 'return=representation')
    execOk = ex.status === 200 && ex.json?.length === 1
  }
  const link = await rest(serviceKey, 'DELETE', `executive_invite_links?id=eq.${state.linkId}`, undefined, 'return=representation')
  // Every file under the test link's folder, including any the checks above didn't record.
  const listed = await call(serviceKey, 'POST', '/storage/v1/object/list/executive-submissions', { body: { prefix: state.token, limit: 1000 } })
  const privateFiles = [...new Set([...state.privateFiles, ...(listed.json ?? []).map((f) => `${state.token}/${f.name}`)])]
  const removePrivate = privateFiles.length
    ? await call(serviceKey, 'DELETE', '/storage/v1/object/executive-submissions', { body: { prefixes: privateFiles } }) : { status: 200 }
  const removeMedia = state.mediaFiles.length
    ? await call(serviceKey, 'DELETE', '/storage/v1/object/media', { body: { prefixes: state.mediaFiles } }) : { status: 200 }
  check('test data deleted (submissions, executive, link, photos in both buckets)',
    subs.status === 200 && execOk && link.status === 200 && link.json?.length === 1 && removePrivate.status === 200 && removeMedia.status === 200,
    `submissions HTTP ${subs.status}, executive ${execOk}, link HTTP ${link.status}, files HTTP ${removePrivate.status}/${removeMedia.status}`)
}

try {
  await main()
} catch (error) {
  fail++
  console.error(`\nERROR: ${redact(error.message)}`)
} finally {
  try { await cleanup() } catch (error) { fail++; console.error(`Clean-up error: ${redact(error.message)}`) }
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
  process.exitCode = fail ? 1 : process.exitCode ?? 0
}
