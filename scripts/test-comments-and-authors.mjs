// Live check of comments and required author names (migration 0007).
// Run AFTER supabase/migrations/0007_comments_and_authors.sql is applied:
//
//   node --env-file=.env.migration scripts/test-comments-and-authors.mjs
//
// The service role key (.env.migration) is only used for what an admin would
// do in the dashboard: creating the test post, approving, hiding, closing
// comments and switching approval on and off. Every comment and every read a
// visitor could attempt uses the public anon key from ghamsu-frontend-new/.env.
// The test post (and with it, its comments) is always deleted, and the
// "require approval" setting is put back as it was.

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

const redact = (text) => String(text).split(serviceKey).join('[REDACTED]').split(anonKey).join('[ANON]')
async function rest(key, method, path, body, prefer) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* not JSON */ }
  return { status: response.status, json, raw: text, text: redact(text).slice(0, 300) }
}

let pass = 0, fail = 0
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log(`  PASS  ${name}`) } else { fail++; console.log(`  FAIL  ${name} ${detail}`) }
}

const stamp = Date.now()
const EMAIL = `test-commenter-${stamp}@example.invalid`
const DOC = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Automated test post.' }] }] }
let postId = null
let originalSetting = null

const comment = (body, { email = EMAIL, name = 'Test Visitor', parent = null } = {}) =>
  rest(anonKey, 'POST', 'rpc/add_post_comment', { p_post_id: postId, p_name: name, p_email: email, p_body: body, p_parent_id: parent })
const publicComments = () => rest(anonKey, 'GET', `post_comments_public?post_id=eq.${postId}&select=*&order=created_at`)
const setApproval = (on) => rest(serviceKey, 'PATCH', 'site_settings?key=eq.comments', { value: { ...(originalSetting ?? {}), require_approval: on } })

async function main() {
  console.log(`Live comments and authors test on ${new URL(url).host}\n`)
  const probe = await rest(serviceKey, 'GET', 'post_comments?select=id&limit=1')
  if (probe.status !== 200) {
    console.error('Migration 0007 does not appear to be applied yet (post_comments does not exist).')
    console.error('Run supabase/migrations/0007_comments_and_authors.sql in the SQL editor, then try again.')
    process.exitCode = 1
    return
  }
  originalSetting = (await rest(serviceKey, 'GET', 'site_settings?key=eq.comments&select=value')).json?.[0]?.value ?? { require_approval: false }
  await setApproval(false)

  console.log('Author names')
  const show = (r) => console.log(`          "${r.json?.message}"`)
  const base = {
    post_type: 'news', title: 'TEST post (automated check, will be deleted)', excerpt: 'Test', content: DOC,
    cover_image_path: 'posts/test.webp', published_at: new Date().toISOString(),
  }
  const noAuthor = await rest(serviceKey, 'POST', 'posts', { ...base, slug: `test-no-author-${stamp}`, status: 'published' })
  check('publishing a post with no author name is blocked', noAuthor.status === 400 && /posts_publish_requirements|posts_published_author_name/.test(noAuthor.json?.message ?? ""), `HTTP ${noAuthor.status} ${noAuthor.json?.message}`)
  show(noAuthor)
  const blankAuthor = await rest(serviceKey, 'POST', 'posts', { ...base, slug: `test-blank-author-${stamp}`, status: 'published', author_name: '   ' })
  check('publishing with a blank author name is blocked', blankAuthor.status === 400 && /posts_published_author_name/.test(blankAuthor.json?.message ?? ""), `HTTP ${blankAuthor.status} ${blankAuthor.json?.message}`)
  show(blankAuthor)
  const created = await rest(serviceKey, 'POST', 'posts?select=id', { ...base, slug: `test-comments-${stamp}`, status: 'published', author_name: 'Test Reporter', author_detail: 'Test Local' }, 'return=representation')
  postId = created.json?.[0]?.id
  check('publishing with an author name works', created.status === 201 && postId, created.text)
  if (!postId) return

  console.log('\nComments and replies')
  const first = await comment('Great report!\n\nThank you.')
  const firstId = first.json?.[0]?.comment_id
  check('visitor can comment (visible straight away)', first.status === 200 && first.json?.[0]?.comment_status === 'visible', `HTTP ${first.status} ${first.text}`)
  const ipRow = await rest(serviceKey, 'GET', `post_comments?id=eq.${firstId}&select=ip_hash`)
  check("visitor's IP reaches the database (hashed), so the per-connection limit applies", /^[0-9a-f]{64}$/.test(ipRow.json?.[0]?.ip_hash ?? ''), ipRow.text)
  const reply = await comment('I agree.', { email: `reply-${stamp}@example.invalid`, name: 'Test Replier', parent: firstId })
  const replyId = reply.json?.[0]?.comment_id
  check('visitor can reply', reply.status === 200, `HTTP ${reply.status} ${reply.text}`)
  let shown = await publicComments()
  check('comment and reply are public', shown.json?.length === 2 && shown.json.find((c) => c.id === replyId)?.parent_id === firstId, shown.text)
  check('line breaks kept', shown.json?.find((c) => c.id === firstId)?.body === 'Great report!\n\nThank you.')
  const counts = await rest(anonKey, 'GET', `post_comment_counts?post_id=eq.${postId}&select=comment_count`)
  check('public comment count is 2', counts.json?.[0]?.comment_count === 2, counts.text)

  console.log('\nEmail privacy (as a logged-out visitor)')
  check('the public view has no email column', shown.json?.every((c) => !('author_email' in c)) && !shown.raw.includes(EMAIL))
  const asked = await rest(anonKey, 'GET', `post_comments_public?post_id=eq.${postId}&select=author_email`)
  check('asking the view for author_email fails', asked.status >= 400 && !asked.raw.includes(EMAIL), `HTTP ${asked.status} ${asked.text}`)
  const direct = await rest(anonKey, 'GET', `post_comments?post_id=eq.${postId}&select=author_email`)
  check('asking the table for author_email: permission denied', direct.status >= 400 && !direct.raw.includes(EMAIL), `HTTP ${direct.status} ${direct.text}`)
  const star = await rest(anonKey, 'GET', `post_comments?post_id=eq.${postId}&select=*`)
  check('select=* on the table: permission denied', star.status >= 400 && !star.raw.includes(EMAIL), `HTTP ${star.status} ${star.text}`)
  const filter = await rest(anonKey, 'GET', `post_comments?select=id&author_email=eq.${encodeURIComponent(EMAIL)}`)
  check('filtering by email is refused too (no guessing)', filter.status >= 400, `HTTP ${filter.status} ${filter.text}`)
  const embed = await rest(anonKey, 'GET', `posts?id=eq.${postId}&select=id,post_comments(author_email)`)
  check('embedding comments in a post query does not reveal email', !embed.raw.includes(EMAIL), `HTTP ${embed.status} ${embed.text}`)
  const insert = await rest(anonKey, 'POST', 'post_comments', { post_id: postId, author_name: 'Fake', author_email: 'x@x.co', body: 'Direct', is_staff_reply: true })
  check('visitor cannot insert directly (or fake a staff reply)', insert.status >= 400, `HTTP ${insert.status}`)
  const patch = await rest(anonKey, 'PATCH', `post_comments?id=eq.${firstId}`, { status: 'hidden' }, 'return=representation')
  check('visitor cannot hide comments', patch.status >= 400 || (patch.json ?? []).length === 0, `HTTP ${patch.status}`)

  console.log('\nLinks')
  for (const body of ['Visit https://spam.example now', 'see www.example.org', 'cheap at spammy-shop.com', 'chat wa.me/233241234567']) {
    const r = await comment(body, { email: `link-${stamp}@example.invalid` })
    check(`rejected: "${body}"`, r.status >= 400 && r.json?.hint === 'comment_link', `HTTP ${r.status} ${r.text}`)
  }
  console.log(`          "${(await comment('see www.example.org', { email: `link-${stamp}@example.invalid` })).json?.message}"`)

  console.log('\nRate limit (same email, same post, 10 minutes)')
  check('2nd comment accepted', (await comment('Second comment')).status === 200)
  check('3rd comment accepted', (await comment('Third comment')).status === 200)
  const fourth = await comment('Fourth comment')
  check('4th comment refused', fourth.status >= 400 && fourth.json?.hint === 'rate_limited', `HTTP ${fourth.status} ${fourth.text}`)
  console.log(`          "${fourth.json?.message}"`)

  console.log('\nApproval')
  await setApproval(true)
  const pending = await comment('Please approve me', { email: `pending-${stamp}@example.invalid` })
  const pendingId = pending.json?.[0]?.comment_id
  check('with approval on, a new comment is pending', pending.json?.[0]?.comment_status === 'pending', pending.text)
  shown = await publicComments()
  check('…and is not public', !shown.json?.some((c) => c.id === pendingId))
  await rest(serviceKey, 'PATCH', `post_comments?id=eq.${pendingId}`, { status: 'visible' })
  shown = await publicComments()
  check('after approval it is public', shown.json?.some((c) => c.id === pendingId))
  await setApproval(false)

  console.log('\nHiding')
  await rest(serviceKey, 'PATCH', `post_comments?id=eq.${firstId}`, { status: 'hidden' })
  shown = await publicComments()
  check('hidden comment disappears', !shown.json?.some((c) => c.id === firstId))
  check('…and so do its replies', !shown.json?.some((c) => c.id === replyId))

  console.log('\nClosing comments')
  await rest(serviceKey, 'PATCH', `posts?id=eq.${postId}`, { comments_open: false })
  const closed = await comment('Is this still open?', { email: `closed-${stamp}@example.invalid` })
  check('comments closed: the form is refused', closed.status >= 400 && closed.json?.hint === 'comments_closed', `HTTP ${closed.status} ${closed.text}`)
  console.log(`          "${closed.json?.message}"`)
}

async function cleanup() {
  if (originalSetting) await setApproval(Boolean(originalSetting.require_approval))
  if (!postId) return
  const deleted = await rest(serviceKey, 'DELETE', `posts?id=eq.${postId}`, undefined, 'return=representation')
  const left = await rest(serviceKey, 'GET', `post_comments?post_id=eq.${postId}&select=id`)
  const setting = await rest(serviceKey, 'GET', 'site_settings?key=eq.comments&select=value')
  check('test post and all its comments deleted, approval setting restored',
    deleted.status === 200 && deleted.json?.length === 1 && left.json?.length === 0
      && setting.json?.[0]?.value?.require_approval === Boolean(originalSetting?.require_approval),
    `HTTP ${deleted.status}, ${left.json?.length} comments left`)
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
