// Live check of activity registration against the real Supabase project.
// Run AFTER supabase/migrations/0004_activities_registration.sql is applied:
//
//   node --env-file=.env.migration scripts/test-activity-registration.mjs
//
// The service role key (.env.migration) is used only to create and delete one
// clearly labelled test activity. Every registration and read attempt uses the
// public anon key from ghamsu-frontend-new/.env, exactly as a visitor's browser
// does. The test activity and its registrations are always deleted at the end.

import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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
const headers = (key) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' })

async function rest(key, method, path, body, prefer) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { ...headers(key), ...(prefer ? { Prefer: prefer } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* not JSON */ }
  return { status: response.status, json, text: redact(text) }
}

let pass = 0
let fail = 0
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`  PASS  ${name}`) } else { fail++; console.log(`  FAIL  ${name} ${detail}`) }
}

const person = (phone) => ({
  full_name: 'Test Visitor (automated check)', phone, email: 'test-visitor@example.invalid', gender: 'female',
  local: 'Test Local', diocese: 'Test Diocese', level: 'Level 100', role: 'guest', notes: 'Automated test entry, deleted at the end',
})

let activityId = null
const slug = `test-registration-check-${Date.now()}`

async function main() {
  console.log(`Live registration test on ${new URL(url).host}\n`)

  // 0. Is 0004 applied?
  const probe = await rest(serviceKey, 'GET', 'major_activities?select=slug,registration_open&limit=1')
  if (probe.status !== 200) {
    console.error('Migration 0004 does not appear to be applied yet (major_activities has no slug column).')
    console.error('Run supabase/migrations/0004_activities_registration.sql in the SQL editor, then try again.')
    process.exitCode = 1
    return
  }

  // 1. A test activity, published and open (service role).
  const created = await rest(serviceKey, 'POST', 'major_activities?select=id', {
    title: 'TEST activity (automated check, will be deleted)', slug, status: 'published',
    registration_open: true, capacity: 3, sort_order: 9999,
  }, 'return=representation')
  activityId = created.json?.[0]?.id
  check('test activity created', created.status === 201 && activityId, created.text)
  if (!activityId) return

  const register = (phone) => rest(anonKey, 'POST', 'activity_registrations', { activity_id: activityId, ...person(phone) }, 'return=minimal')
  const setActivity = (changes) => rest(serviceKey, 'PATCH', `major_activities?id=eq.${activityId}`, changes)

  // 2. A visitor registers.
  const first = await register('024 000 0001')
  check('visitor can register while open', first.status === 201, `HTTP ${first.status} ${first.text}`)

  // 3. Same phone, typed differently, is blocked.
  const duplicate = await register('+233 24 000 0001')
  check('duplicate (same phone, other format) is blocked', duplicate.status === 409 && /one_per_phone/.test(duplicate.text), `HTTP ${duplicate.status} ${duplicate.text}`)

  // 4. Visitors cannot read, count, change or delete registrations.
  const read = await rest(anonKey, 'GET', `activity_registrations?activity_id=eq.${activityId}&select=*`)
  check('visitor cannot read registrations', read.status === 401 || read.status === 403 || (read.status === 200 && read.json?.length === 0), `HTTP ${read.status} ${read.text.slice(0, 120)}`)
  const update = await rest(anonKey, 'PATCH', `activity_registrations?activity_id=eq.${activityId}`, { notes: 'changed' }, 'return=representation')
  check('visitor cannot change registrations', update.status >= 400 || (update.json ?? []).length === 0, `HTTP ${update.status}`)
  const remove = await rest(anonKey, 'DELETE', `activity_registrations?activity_id=eq.${activityId}`, undefined, 'return=representation')
  check('visitor cannot delete registrations', remove.status >= 400 || (remove.json ?? []).length === 0, `HTTP ${remove.status}`)
  const stillThere = await rest(serviceKey, 'GET', `activity_registrations?activity_id=eq.${activityId}&select=id,notes`)
  check('the registration is untouched', stillThere.json?.length === 1 && stillThere.json[0].notes !== 'changed')

  // 5. Public status function.
  const status = await rest(anonKey, 'POST', 'rpc/activity_registration_status', { p_activity_id: activityId })
  check('status shows open with 2 places left', status.json?.[0]?.is_open === true && status.json?.[0]?.spots_left === 2, status.text)

  // 6. Closing registration stops new entries.
  await setActivity({ registration_open: false })
  const afterClose = await register('024 000 0002')
  check('closed registration refuses new entries', afterClose.status >= 400 && /closed/i.test(afterClose.text), `HTTP ${afterClose.status} ${afterClose.text}`)

  // 7. A passed deadline also closes it.
  await setActivity({ registration_open: true, registration_deadline: new Date(Date.now() - 60_000).toISOString() })
  const afterDeadline = await register('024 000 0003')
  check('passed deadline refuses new entries', afterDeadline.status >= 400 && /deadline/i.test(afterDeadline.text), `HTTP ${afterDeadline.status} ${afterDeadline.text}`)

  // 8. A full activity refuses new entries.
  await setActivity({ registration_deadline: null, capacity: 1 })
  const afterFull = await register('024 000 0004')
  check('full activity refuses new entries', afterFull.status >= 400 && /full/i.test(afterFull.text), `HTTP ${afterFull.status} ${afterFull.text}`)

  // 9. An unpublished activity refuses new entries.
  await setActivity({ capacity: null, status: 'draft' })
  const afterDraft = await register('024 000 0005')
  check('unpublished activity refuses new entries', afterDraft.status >= 400 && /not open/i.test(afterDraft.text), `HTTP ${afterDraft.status} ${afterDraft.text}`)

  // 10. Invalid phone numbers are refused.
  await setActivity({ status: 'published' })
  const badPhone = await register('12345')
  check('invalid phone refused', badPhone.status >= 400 && /Ghana phone/.test(badPhone.text), `HTTP ${badPhone.status} ${badPhone.text}`)
}

async function cleanup() {
  if (!activityId) return
  const deleted = await rest(serviceKey, 'DELETE', `major_activities?id=eq.${activityId}`, undefined, 'return=representation')
  const left = await rest(serviceKey, 'GET', `activity_registrations?activity_id=eq.${activityId}&select=id`)
  check('test activity and its registrations deleted', deleted.status === 200 && deleted.json?.length === 1 && left.json?.length === 0,
    `HTTP ${deleted.status}, ${left.json?.length} registrations left`)
}

try {
  await main()
} catch (error) {
  fail++
  console.error(`\nERROR: ${redact(error.message)}`)
} finally {
  await cleanup()
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
  process.exitCode = fail ? 1 : process.exitCode ?? 0
}
