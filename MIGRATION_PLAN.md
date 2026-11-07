# GHAMSU: Sanity to Supabase Migration Plan

Status: Phase 1 applied to the Supabase project. Phase 2 script written and dry-run tested; the owner runs the real migration. No app code has changed.

**Owner decisions (answers to the Phase 1 questions):**

- The tax-deductible and emailed-receipt claim stays off the site.
- The Partner form is removed at cutover. The page keeps only bank and Mobile Money details. `bank_details` is JSON, so MoMo fields can be added from the dashboard without a schema change.
- Images are resized into copies at upload. Supabase Image Transformations are not used.
- Missing values stay NULL for now, and will be filled in from the admin dashboard.
Source of truth for the current site: `SANITY_MIGRATION_AUDIT.md`.

## 1. Phase 1 summary

| File | Contents |
|---|---|
| `supabase/migrations/0001_schema.sql` | 24 tables, enums, indexes, triggers, roles, admin bootstrap, counter functions |
| `supabase/migrations/0002_rls.sql` | Privileges, RLS on every table, `media` bucket and its policies. Fails if any table lacks RLS or a policy. |
| `supabase/migrations/0003_seed_hardcoded.sql` | Hardcoded site content. Re-running it never overwrites later edits. |

### Who can do what

| Actor | Access |
|---|---|
| Visitor (anon) | Read published rows and `site_settings` rows flagged public. Call `increment_post_view` and `increment_post_like`. |
| Signed in, no role | Same as a visitor. New accounts start here. |
| `editor` | Read and write all content, including drafts. Upload to `media`. |
| `admin` | Editor rights, plus `profiles`, `site_settings`, `social_links` and `subscribers`. |

### Design decisions added beyond the brief

| Decision | Reason |
|---|---|
| Added `increment_post_like(post_slug)` | `/api/blog-stats` also handles likes, so the like button would break without it. |
| New users have `role = NULL`, not `editor` | An auth account existing should grant nothing until an admin assigns a role. |
| A role only works once the email is confirmed and `is_active` is true | Limits the damage if sign-ups are ever enabled by accident, and deactivation applies immediately. This does not help if email confirmation is also turned off, so see the checklist below. |
| No self-update policy on `profiles` | RLS works per row, not per column, so such a policy would let users set their own role. |
| The last active admin cannot be demoted or deactivated | Prevents lockout. SQL or the service role can still recover. |
| Staff cannot write `view_count` or `like_count` | Otherwise an editor could fake counts, or a stale save could overwrite them. |
| Counter updates do not change `updated_at` | A page view should not make a post look edited. |
| Anon has no `SELECT` on `storage.objects` | Public URLs work without it, and it stops visitors listing every file. |
| SVG uploads are not allowed | A publicly served SVG can carry script. |
| `social_links` is admin-only | It is a site setting, and a changed link could redirect visitors. Editors do manage boards, stats and page copy. |
| Sanity `active` flags became `status` | Gives one publish rule across all tables. |

### How this was tested, and what was not

The migrations were run against an in-memory Postgres (PGlite) with **hand-written stand-ins** for Supabase's `auth` and `storage` schemas, not against Supabase. Section 8 has the results. The stand-ins are simplified, so the first real run on a Supabase project could still reveal differences.

### Checklist before applying

1. Create the new Supabase project.
2. Under Authentication, **disable public sign-ups and keep email confirmation on**. The bootstrap trigger trusts this email address, so if both of these were off, anyone could register `ghamsupcb@gmail.com` and become admin.
3. Apply the migrations in order, with `supabase db push` or by pasting each file into the SQL editor.
4. Invite `ghamsupcb@gmail.com` from the Supabase dashboard. Confirm that its `profiles.role` is `admin` after the invite is accepted.
5. Configure custom SMTP. Supabase's built-in mailer is heavily limited, and invites and password resets depend on email. `resend` is already a declared dependency, so it is one option.

---

## 2. Sanity to Supabase field mapping

All tables also have `id`, `created_at` and `updated_at`. Sanity system fields map the same way everywhere:

| Sanity | Supabase |
|---|---|
| `_id` | `legacy_sanity_id` |
| `_createdAt` | `created_at` |
| `_updatedAt` | `updated_at` |
| `_type` | The table, plus `posts.legacy_sanity_type` and `posts.post_type` |
| `_rev` | Dropped |

Image fields map the same way everywhere. For an image stored as `<prefix>`:

| Sanity | Supabase |
|---|---|
| `asset._ref` | `<prefix>_path`, after upload |
| `alt` | `<prefix>_alt` (Sanity only has this inside rich text) |
| `caption` | `<prefix>_caption` (Sanity only has this inside rich text) |
| `hotspot`, `crop` | `<prefix>_focus` as `{"hotspot":{...},"crop":{...}}` |

### `news`, `article`, `blog` to `posts`

| Sanity field | `news` | `article` | `blog` | `posts` column |
|---|---|---|---|---|
| Type | value `news` | value `article` | value `article` | `post_type` |
| Type (original) | `news` | `article` | `blog` | `legacy_sanity_type` |
| Publish state | `published` | `published` | **`draft`** | `status` |
| `title` | yes | yes | yes | `title` |
| `slug.current` | yes | yes | yes | `slug` (unchanged) |
| `excerpt` | yes | yes | yes | `excerpt` |
| `content` | yes | yes | yes | `content` (converted, see section 4) |
| `featuredImage` | yes | yes | yes | `cover_image_path`, `_alt`, `_caption`, `_focus` |
| Author name | `reporter` | `authorName` | none | `author_name` |
| Author detail | `reporterPosition` | `authorLocal` | none | `author_detail` |
| Author reference | none | none | `author` (1 of 3 posts, undeclared in the schema) | `author_id` |
| Category | `newsCategory` | `articleCategory` | `category` | `category` |
| `publishedDate` | yes | yes | yes | `published_at` |
| `readTime` | none | yes | yes | `read_time_minutes` |
| `featured` | yes | yes | yes | `featured` |
| `views` | yes | yes | none, so 0 | `view_count` |
| `likes` | yes | yes | none, so 0 | `like_count` |

### `news.mediaAttachments[]` to `post_media_attachments`

| Sanity | Supabase |
|---|---|
| Parent document | `post_id` |
| Array position | `sort_order` |
| `mediaType` | `media_type` |
| `label` | `label` |
| `url` | `url` |
| `description` | `description` |

### `author` to `authors`

| Sanity | Supabase |
|---|---|
| `name` | `name` |
| `photo` | `photo_path`, `_alt`, `_caption`, `_focus` |
| `bio` | `bio` |
| `position` | `position` |
| (none) | `status`: `published` |

### `event` to `events`

| Sanity | Supabase |
|---|---|
| `title` | `title` |
| `date` | `event_date` |
| `venue` | `venue` |
| `flyer` | `flyer_path`, `_alt`, `_caption`, `_focus` |
| `description` | `description` |
| `eventType` | `event_type` |
| `registrationLink` | `registration_url` |
| `published` | `status`: true is `published`, false is `draft` |

### `sermon` to `sermons`

| Sanity | Supabase |
|---|---|
| `title` | `title` |
| `preacher` | `preacher` |
| `date` | `sermon_date` |
| `mediaType` | `media_type` |
| `videoUrl` | `video_url` |
| `audioUrl` | `audio_url` |
| `thumbnail` | `thumbnail_path`, `_alt`, `_caption`, `_focus` |
| `scriptureReference` | `scripture_reference` |
| `description` | `description` |
| `series` | `series` |
| `duration` | `duration` |
| (none) | `status`: `published` |

### `gallery` to `galleries`

Uses the active schema in `gallery.ts`. The stale copy in `misc.ts` is ignored, and no live documents match it.

| Sanity | Supabase |
|---|---|
| `title` | `title` |
| `description` | `description` |
| `coverImage` | `cover_image_path`, `_alt`, `_caption`, `_focus` |
| `photoCount` | `photo_count` |
| `date` | `album_date` |
| `link` | `album_url` |
| `category` | `category` |
| (none) | `status`: `published` |

### `executive` to `executives`

Uses the active schema in `executive.ts`. The stale copy in `misc.ts` is ignored.

| Sanity | Supabase |
|---|---|
| `name` | `name` |
| `position` | `position` |
| `image` | `image_path`, `_alt`, `_caption`, `_focus` |
| `phone` | `phone` |
| `email` | `email` |
| `whatsapp` | `whatsapp` |
| `order` | `sort_order` |
| `category` | `category` (values kept exactly) |
| `bio` | `bio` |
| (none) | `status`: `published` |

### `testimonial` to `testimonials`

| Sanity | Supabase |
|---|---|
| `name` | `name` |
| `photo` | `photo_path`, `_alt`, `_caption`, `_focus` |
| `role` | `role` |
| `local` | `local` |
| `testimony` | `testimony` |
| `rating` | `rating` |
| `featured` | `featured` |
| `date` | `testimonial_date` |
| `university` (queried, but not in the schema) | Dropped |
| (none) | `status`: `published` |

### `department` to `departments`

No live documents.

| Sanity | Supabase |
|---|---|
| `name` | `name` |
| `image` | `image_path`, `_alt`, `_caption`, `_focus` |
| `description` | `description` |
| `leader` (reference to `executive`) | `leader_id` |
| `activities[]` | `activities` (`text[]`) |
| `color` | `color` |

### `scriptureQuote` to `scripture_quotes`

No live documents.

| Sanity | Supabase |
|---|---|
| `quoteText` | `quote_text` |
| `reference` | `reference` |
| `active` | `status`: true is `published`, false is `draft` |
| `displayOrder` | `sort_order` |

### `ghamsuToday` to `ghamsu_today` and `ghamsu_today_items`

No live documents.

| Sanity | Supabase |
|---|---|
| `themeTitle` | `ghamsu_today.theme_title` |
| `themeDescription` | `ghamsu_today.theme_description` |
| `scriptureReference` | `ghamsu_today.scripture_reference` |
| `date` | `ghamsu_today.entry_date` |
| `active` | `ghamsu_today.status`: true is `published`, false is `draft` |
| `happeningNow[].title`, `.location` | `ghamsu_today_items` with `slot = 'happening_now'`: `title`, `location` |
| `laterToday[].title`, `.time`, `.location` | `ghamsu_today_items` with `slot = 'later_today'`: `title`, `time_text`, `location` |

### `subscriber` to `subscribers`

No live documents.

| Sanity | Supabase |
|---|---|
| `email` | `email` (lowercased) |
| `subscribedAt` | `subscribed_at` |

---

## 3. Hardcoded content: where it now lives

### Moved to the database

| Item | Source | Now in |
|---|---|---|
| Six boards: home summary | `components/BoardsHomeSection.tsx` | `boards.summary`, `home_icon` |
| Six boards: list card | `pages/Boards.tsx` | `boards.description`, `icon`, `member_count` |
| Six boards: detail page | `pages/BoardDetail.tsx` | `boards.detail_description`, `vision`, `responsibilities`, `activities`, `color`, `member_count` |
| Board members | Not in the code (counts only) | `board_members`, empty until names are supplied |
| Major activities (3) | `pages/Boards.tsx` | `major_activities` |
| Coordinator profile | `pages/Contact.tsx` | `site_settings` key `coordinator` |
| Contact address, phones, emails | `pages/Contact.tsx` | `site_settings` key `contact_details` |
| Yearly theme | `components/Footer.tsx` | `site_settings` key `yearly_theme` |
| Footer text | `components/Footer.tsx` | `site_settings` key `footer` |
| Social links (8) | `components/Footer.tsx` | `social_links` |
| Bank and partner details | `pages/Partner.tsx` | `site_settings` key `bank_details` |
| Ways to partner (4) | `pages/Partner.tsx` | `content_sections` (`partner/ways`), `content_items` |
| Home hero slides (3) | `pages/Home.tsx` | `hero_slides` |
| Home hero buttons | `pages/Home.tsx` | `content_sections` (`home/hero_buttons`), `content_items` |
| Inner page banners (8) | Each page's `HeroSection` props | `page_heroes` |
| Home statistics (4) | `components/StatsSection.tsx` | `stats` with `section = 'home'` |
| About statistics (3) | `components/AboutSection.tsx` | `stats` with `section = 'home_about'` |
| Vision section and 4 cards | `components/WhyChooseUs.tsx` | `content_sections` (`home/vision`), `content_items` |
| History section | `components/HistorySection.tsx` | `content_sections` (`home/history`) |
| About section and pillars | `components/AboutSection.tsx` | `content_sections` (`home/about`), `content_items` |
| Boards intro on home page | `components/BoardsHomeSection.tsx` | `content_sections` (`home/boards`) |
| Ways to Engage (4) | `components/DarkSection.tsx` | `content_sections` (`home/engage`), `content_items` |
| About page: history, mission, vision, motto, slogan | `pages/About.tsx` | `content_sections` (`about/*`) |
| About page: values (4), aims (4), structure (5) | `pages/About.tsx` | `content_sections` and `content_items` |
| Site images (`3`, `5`, `7`, `12`, `13`, `rev`) | `src/images/` | `media` bucket under `site/`, uploaded in Phase 2 |

One small formatting loss: the italics on "Ambassadors for Christ!" in the home history paragraph are not kept, since `paragraphs` is plain text.

### Staying in code, deliberately

| Item | Source | Why |
|---|---|---|
| Navigation and footer link lists | `Navigation.tsx`, `Footer.tsx` | They mirror the app's routes. |
| UI labels ("Back to Boards", "Read More", empty states) | Various | Part of the interface, not content. |
| Small section headings ("Established Boards", "Our Leadership") | Various | Interface copy. Easy to move later if wanted. |
| Reporter and gallery recruitment banners | `Blogs.tsx`, `Gallery.tsx` | Fixed calls to action using `mailto:` links. |
| Contact form subjects and `to_email` | `Contact.tsx` | Tied to the EmailJS form, which this project does not change. |
| Partner contribution form | `Partner.tsx` | It does nothing today. See open questions. |
| Logo | `src/images/logo.png` | Part of the app bundle, and used by `index.html`. |
| Page meta tags | `index.html` | Static HTML cannot read the database without server rendering. |
| Fallback scripture (John 3:16) | `FloatingServiceCards.tsx` | Fallback for when an external API fails. |
| Unused components | `ColoredCardsSection`, `MinistriesSection`, `DEFAULT_SLIDES`, `SubscribeForm` | Never displayed. Not seeded. |

### Seed TODOs: values needed from the owner

**Values set to NULL.** These must be resolved before launch, or the site will show gaps.

| # | Where | Why it is NULL | What the code currently has |
|---|---|---|---|
| 1 | `bank_details.account_number` | Placeholder | `[Your Account Number]` |
| 2 | `bank_details.alternative_account_number` | The second bank has no account number in the code | None |
| 3 | `bank_details.contribution_note` | The site cannot fulfil this claim, which also has legal weight. Confirm before restoring. | "All contributions are tax-deductible. You will receive a receipt via email." |
| 4 | `coordinator.email` | Link and display differ | Shows `anokyeyaw13@gmail.com`, links to `john.mensah@gmsu.org` |
| 5 | `coordinator.phone` | Link and display differ | Shows `+233 (0) 241 240 907`, links to `+233244123456` |
| 6 | `coordinator.whatsapp` | Link and display differ | Shows `+233 241 240 907`, links to `233244123456` |
| 7 | `contact_details.phones[CGC]` | Link and display differ | Shows `+233 (0) 241 240 907`, links to `+233244123456` |
| 8 | `contact_details.phones[Office]` | Placeholder, and link differs | Shows `+233 (0) 000 000 000`, links to `+233244123457` |
| 9 | `boards.member_count`, Publications | Pages disagree | 7 on `/boards`, 10 on the detail page |
| 10 | `boards.member_count`, Research & Education | Pages disagree | 7 and 12 |
| 11 | `boards.member_count`, Medical | Pages disagree | 6 and 11 |
| 12 | `stats` home `members` (draft) | Code disagrees with itself | `value: 50000`, but the animation stops at and shows 5K |
| 13 | `stats` home `years` (draft) | Code disagrees with itself | `value: 61`, but the animation stops at 60 |
| 14 | `stats` home `locals` (draft) | Pages disagree | 1,000 here, "100+" on the About section |
| 15 | `stats` home_about `locals` (draft) | Pages disagree | "100+" here, 1,000 on the Stats section |

The `stats` rows stay `draft` until filled in, so visitors do not see blanks. **Until they are resolved, the home stats band shows only Dioceses, and the About section shows two of its three boxes.**

**Values kept as written, for the owner to review.**

| # | Where | Issue |
|---|---|---|
| 16 | `yearly_theme.year` | **Assumed to be 2026.** The code shows the current year beside fixed text, so it would display the wrong year's theme each January. |
| 17 | `coordinator.stats` | Typo: "As Cordinator". |
| 18 | `content_items` `home/vision` item 4 | Reads oddly: "To responsible contributors to society". |
| 19 | `hero_slides` slide 2 | Missing space: "locals,Dioceses". |
| 20 | `content_items` `partner/ways` item 3 | Reads oddly: "Contribute the GHAMSU Connexional Legacy projects". |
| 21 | Board `vision`, `responsibilities`, `activities` | Generic church-template copy (building maintenance, prayer hotline, fixed weekly times). It may not describe the real boards. |
| 22 | Board descriptions | Audit and Project have different wording between the list and detail pages. Both are stored. |
| 23 | `boards.icon`, Medical | Uses a music icon. |
| 24 | `content_items` `home/engage` | Template copy with specific times ("every Sunday at 9 AM and 11 AM"). May be inaccurate. |
| 25 | `about/history` | Hardcoded age: "GHAMSU is 61yrs old". It will go out of date. |
| 26 | Organization name | Spelled both "Student's" and "Students'" across the site. |
| 27 | `bank_details.branch` | "Knust" capitalization. |
| 28 | `major_activities` and `page_heroes` images | External URLs (Google Photos, Unsplash, Pinterest). They can stop working, and reuse rights should be checked. |
| 29 | `contact.tsx` `to_email` (stays in code) | `info@gmsu.org` uses a different domain from `ghamsu.org`. |

---

## 4. Portable Text conversion

**Target:** TipTap / ProseMirror JSON in `posts.content`, in the form `{"type":"doc","content":[...]}`.

Conversion is small, because all live content uses only paragraphs, `h3`, bullet lists, bold and italic: 93 blocks across 5 posts, with no links and no inline images. The converter should still cover everything Sanity's editor allowed, since drafts may hold more.

| Portable Text | TipTap JSON |
|---|---|
| `block`, style `normal` | `{"type":"paragraph"}` |
| `block`, style `h1` to `h6` | `{"type":"heading","attrs":{"level":n}}` |
| `block`, style `blockquote` | `{"type":"blockquote","content":[paragraph]}` |
| Consecutive blocks with `listItem: bullet` | One `bulletList` of `listItem` > `paragraph` |
| Consecutive blocks with `listItem: number` | One `orderedList` of `listItem` > `paragraph` |
| `level` greater than 1 | A nested list inside the previous `listItem` |
| `span` | `{"type":"text","text":...,"marks":[...]}` |
| Decorators `strong`, `em`, `code`, `underline`, `strike-through` | Marks `bold`, `italic`, `code`, `underline`, `strike` |
| `markDefs` entry of type `link` | Mark `{"type":"link","attrs":{"href":...}}` |
| `image` block | `{"type":"image","attrs":{"src":"<media path>","alt":...,"caption":...,"focus":...}}` |
| `\n` inside a span | `{"type":"hardBreak"}` |

Rules:

- **Lists must be grouped.** Portable Text stores each list item as a separate block, while ProseMirror nests them, so consecutive items need merging into one list.
- **Empty spans must be dropped.** ProseMirror rejects text nodes with an empty string. An empty block becomes an empty paragraph with no `content`.
- **Unknown block or mark types must stop the script for that post,** rather than silently losing content.
- **Multiple marks on one span are kept,** which fixes a defect in the current renderer.
- **Images store the bucket path, not a full URL,** so a domain change does not break content.
- **`_key` values are dropped.** They have no meaning outside Sanity.

**Checks per post, in the Phase 2 report:**

1. The plain text from Portable Text and from the TipTap JSON must match, ignoring whitespace. Audit figures to compare against: `blog` 6,997 characters, `news` 1,281, `article` 2,560.
2. Counts of headings, list items and marks must match. `blog` should have 11 `h3` and 24 bullets.
3. The document must load in a TipTap editor without errors.

The original Portable Text stays in the Sanity export as a backup. It is not stored in Postgres.

**Rendering (Phase 3):** walk the JSON with `@tiptap/static-renderer` or a small React renderer, not `dangerouslySetInnerHTML`. Only allow `http`, `https`, `mailto` and `tel` link targets, since the JSON is user-authored.

---

## 5. Later phases

### Phase 2: Node migration script

**Status: written and tested. Not yet run against Supabase.**

```bash
node --test scripts/portable-text-to-tiptap.test.mjs                                    # converter unit tests
node --env-file=.env.migration scripts/migrate-from-sanity.mjs --dry-run                # read and check, write nothing
node --env-file=.env.migration scripts/migrate-from-sanity.mjs                          # the real migration
node --env-file=.env.migration scripts/migrate-from-sanity.mjs --stats-only             # likes and views only, at cutover
```

| File | Purpose |
|---|---|
| `scripts/migrate-from-sanity.mjs` | Command line, network calls and the summary. Needs Node 24 and `sharp` (root dev dependency, pinned to 0.34.5; run `npm install` at the repo root first). |
| `scripts/sanity-mappers.mjs` | Sanity documents to Supabase rows, following section 2. Pure. |
| `scripts/portable-text-to-tiptap.mjs` | The rich text converter in section 4, plus the checks that compare output with source. Pure. |
| `scripts/portable-text-to-tiptap.test.mjs` | 28 unit tests. |

**Secrets:** `.env.migration` at the repo root holds `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. It is git-ignored. The script lives outside `ghamsu-frontend-new`, so Vite never bundles it. It refuses plain `http` to a remote host, a publishable key, and any JWT whose role is not `service_role`, and it removes the key from any error text it prints. `--dry-run` never contacts Supabase and needs no credentials.

**What a full run does:**

1. Reads published documents through Sanity's public API. **Drafts are not visible to it, so they are not copied.**
2. Downloads every referenced Sanity image already resized (`?w=2000&fit=max&fm=webp&q=80`) and uploads it to `media/sanity/<assetId>.webp`. The path is fixed per image, so a re-run replaces the file instead of adding one. Hotspot and crop are fractions of the image, and `fit=max` keeps the aspect ratio, so the stored `*_focus` stays correct.
3. Resizes the six site images with `sharp` the same way (at most 2000 px wide, WebP, quality 80, orientation applied, metadata stripped) and uploads them as `site/<name>.webp`. After writing rows, it repoints the seeded references (`hero_slides`, `content_sections` and the `coordinator` setting) from the original `.jpg`/`.png` names. **It only changes references that still hold the seeded value,** so an image already replaced in `/admin` is kept. `0003_seed_hardcoded.sql` is left unchanged, because it has already been applied.
4. **Stops before writing any rows if any image failed,** so no row points at a missing file.
5. Upserts rows on `legacy_sanity_id`, in dependency order. References such as `posts.author_id` resolve to the new IDs. Child rows have no Sanity ID, so each run deletes and re-inserts them as a set.
6. Converts rich text and compares each post with its source (text, headings, list items, images, marks). Any difference is an error.

**Cautions:**

- **A full re-run overwrites later edits to migrated rows.** Once anyone edits in `/admin`, use only `--stats-only`.
- `--stats-only` touches only `view_count` and `like_count`, and does not change `updated_at`. Run it immediately before the switch, because counts collected by Sanity in between are lost.
- **Until the real migration runs, the seeded `site/` paths point at files that do not exist yet.** The migration uploads the files and repoints the references in the same run.

**Dry run, 2026-11-07:** 22 documents, 20 Sanity images plus 6 site images. Sanity images shrink from 45.9 MB to 3.1 MB, and site images from 10.4 MB to 3.0 MB, for 6.1 MB uploaded in total. The largest single file is 0.8 MB. All five posts pass the rich text checks. 0 errors, 4 warnings: two legacy posts have no author, drafts are not copied, and 3 images are used by no published document.

**Also tested, against a local imitation of Supabase rather than the real project:**

- A live run followed by a re-run creates no duplicate rows or files, and keeps the same IDs.
- Site images upload as WebP only, every seeded reference is repointed, and an image changed in `/admin` is left alone.
- `--stats-only` restores counts, leaves other edits alone, and leaves `updated_at` unchanged.
- `--dry-run` sends no requests, even with credentials present.
- Every image path in every row points at an uploaded file.
- All five converted posts load in TipTap's real schema.

One legacy post, `walking-in-faith-when-life-feels-uncertain`, was pasted into Sanity as a single block with blank lines. The converter splits blank lines into separate paragraphs, so it arrives as 18 paragraphs.

### Phase 3: Rewire the public pages

Keep the hook names and returned shapes where possible, so only `src/lib/*` and these 9 files need changes: `BlogDetail`, `Blogs`, `Events`, `Gallery`, `Sermons`, `Contact`, `BlogPreviewSection`, `FloatingServiceCards`, `UpcomingEvents`. The hardcoded pages also need to read from their new tables: `About`, `Boards`, `BoardDetail`, `Partner`, `Home`, `Footer`, `StatsSection`, `AboutSection`, `HistorySection`, `WhyChooseUs`, `DarkSection`, `BoardsHomeSection`.

Things that are easy to get wrong:

| Issue | What to do |
|---|---|
| **Public queries must filter `status = 'published'` explicitly** | RLS lets staff read drafts, so a logged-in admin viewing the public site would otherwise see them. |
| **Image sizes** | Decided: resized copies at upload, no Supabase Image Transformations. Migrated images are already 2000 px wide or less, in WebP. Pages use the stored file directly, so `urlFor(...).width()` calls are replaced by a plain public URL. Phase 4 uploads must be resized in the browser before upload. |
| **Category alias** | Sanity queries returned `category: "news"` for news, and components depend on it. Use `post_type` for the type and `category` for the real category. This also fixes audit bug 4. |
| **Slug shape** | Components read `post.slug.current`. It is now plain `post.slug`. |
| **Liked posts** | Keep the browser key as `liked_<legacy_sanity_id ?? id>`, so existing likers are not able to like again. |
| **Views** | Call `increment_post_view(slug)` once per page load. **Calling it from the browser still lets anyone inflate counts.** The function limits this to published posts, but it is not rate limited. |
| **Missing values** | Hide fields that are NULL (phone numbers, member counts, account number) rather than rendering blanks. |
| **Tailwind classes** | `boards.color` holds tokens such as `red`. Map them to full class names in code, because Tailwind does not compile classes that only exist in the database. |
| **Env vars** | Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel before deploying. Show a clear error if missing, as a missing Sanity variable currently white-screens the site. |
| **Rendering** | Replace `renderContent()` with the renderer in section 4. Add `mediaAttachments` to the post query, so the existing player works. |

Audit bugs worth fixing in this phase, since the code is being touched anyway: 1, 2, 4, 5, 6, 9, 11 and 13 in audit section 9.4.

**Cutover:**

1. Resolve the Seed TODOs above.
2. Run the full import.
3. Test a Vercel preview page by page against the live site.
4. Run `--counters-only`, then deploy immediately.
5. Remove `api/blog-stats.ts`, `@sanity/client`, `@sanity/image-url` and the Sanity env vars in a later release, once stable.
6. Keep the Sanity project and the export for a rollback period. **Deleting Sanity is irreversible and is the owner's decision, after verifying all images.**

### Phase 4: `/admin` dashboard

All routes lazy-load under `/admin`, so visitors do not download the admin code. Route guards are for user experience only. **Security comes entirely from RLS.**

| Area | Scope | Who |
|---|---|---|
| Login | Email and password via Supabase Auth, with no sign-up screen | All staff |
| Password reset and invite acceptance | `/admin/reset-password` and `/admin/set-password`. Add both to the Supabase redirect allow-list. | All staff |
| Dashboard shell | Reads the user's own `profiles.role`. A NULL role sees a "no access yet" message. | All staff |
| Posts | List, filter, TipTap editor, slug generated from title (96 characters maximum), cover image, publish and unpublish | Editor, admin |
| Other content | Events, sermons, galleries, executives, testimonials, boards, board members, activities, hero slides, page banners, stats, page sections | Editor, admin |
| Site settings | Yearly theme, contact, coordinator, bank details, footer, social links | Admin |
| User management | List staff, change role, deactivate | Admin |
| Subscribers | List | Admin, once a form exists |

Implementation notes:

- **Inviting users needs a server-side step.** Creating or removing an auth user needs the service role key, which must never be in the browser. Options: a small Supabase Edge Function (`invite-user`) that verifies the caller is an admin before calling `auth.admin.inviteUserByEmail`, or inviting from the Supabase dashboard and assigning the role in `/admin`. **Recommendation:** start with the dashboard route, and add the Edge Function if admins need to do this themselves. The rest of the app stays browser-only either way.
- **Do not send `view_count` or `like_count` in payloads.** Column privileges will reject the whole request. Send only the edited fields, not a whole fetched row.
- **Mirror database rules in forms.** Publishing requires certain fields (the `*_publish_requirements` constraints), so show a friendly message instead of a raw constraint error.
- **Resize images in the browser before upload.** The bucket caps files at 25 MB and accepts JPEG, PNG, WebP, AVIF and GIF.
- **Images in drafts are technically public** if someone has the exact URL, since the bucket is public. Warn editors not to upload anything confidential.
- **Removing unused images** needs a check that no row still references the file.
- **Scheduled publishing is not supported.** A post with `status = 'published'` and a future `published_at` is visible immediately.

---

## 6. Open questions

**Blocking launch**

1. **Decided:** Seed TODOs 1 to 15 stay NULL, and will be filled in from the dashboard. Each must be filled before it can appear on the site.
2. **Decided:** the tax-deductible and receipt claim stays off.
3. **Decided:** the Partner form is removed at cutover. Bank and MoMo details stay.
4. **Decided:** the six site images are resized with `sharp` before upload, the same as Sanity images, and stored as `site/*.webp`.

**Affecting scope**

5. Who else needs access, and in which role? Only `ghamsupcb@gmail.com` is defined so far.
6. Should the testimonial appear on the site again? It is migrated, but no page shows it. The old frontend did have a testimonials page.
7. Who wrote the 3 legacy `blog` posts? One has an author reference and two have none, and a name is required before publishing them.
8. Do you want `department`, `scripture_quotes` and `ghamsu_today` in the dashboard? The tables exist and no pages use them, so I would leave them out of Phase 4 until a page needs them.
9. Should the "Scripture of the Day" move from the external `beta.ourmanna.com` API to `scripture_quotes`, so that admins control it?
10. Should contact form messages be stored, or a subscribe or membership form be built? Those tables would need their own carefully scoped anonymous insert policy and spam protection. Treated as out of scope for now.
11. Should the board template copy be rewritten (TODO 21) before launch? It is now editable, so it can be done by the board owners at any time.

**Please confirm these assumptions**

12. Editors can delete content, and manage `stats`, boards and page copy. Only admins manage bank details, social links and other settings.
13. Your brief pointed to audit section 9.5 for hardcoded content, but that section lists owner decisions. The hardcoded list is in **section 9.3**, and I used both.
14. Likes are kept via `increment_post_like`, which you did not ask for. Removing it means removing the like button.
15. View and like counts can still be inflated by a script, since any browser may call those functions. Rate limiting would need an Edge Function. At this site's scale I would accept this, but it is your call.

---

## 7. Known limits of this design

- `posts.category` and other category lists are `CHECK` constraints, so adding a category needs a small migration.
- There is no revision history. An overwritten post cannot be recovered except from a database backup.
- `site_settings` values are free-form JSON. The database does not validate their shape, so the dashboard's forms must.
- New tables added later will receive Supabase's default grants to `anon` and `authenticated`. **Every future migration must enable RLS on its tables.**

---

## 8. Test results

Run on 2026-11-07 against the in-memory Postgres described in section 1, with no connection to Supabase.

**150 of 150 checks passed.**

| Area | What was checked |
|---|---|
| Migrations | All three apply in order. Every one of the 24 tables has RLS and at least one policy. |
| Admin bootstrap | Trigger and backfill both work, in any letter case. Metadata, lookalike addresses (`ghamsu.pcb@`, `ghamsupcb+x@`) and changing an email to the admin address all fail to grant admin. An unconfirmed admin account has no power. |
| Role safeguards | Editors and no-role users cannot self-promote. The last admin cannot be removed. A deactivated editor is blocked immediately. |
| Public access | Visitors see published rows only. They cannot read drafts, draft attachments, private settings, subscribers or profiles. They cannot insert into or delete from any of the 24 tables. |
| Counters | Published posts increment, drafts and unknown slugs do not. `updated_at` is unchanged. Staff and visitors cannot set counts directly. |
| Editor scope | Editors can manage content. They cannot change settings, bank details or social links, or read subscribers. |
| Constraints | Publish requirements, slug rules, category rules and URL checks all reject bad data. |
| Storage | Staff can upload and delete in `media`. Visitors and no-role users cannot upload, list or delete. Other buckets are off limits. |
| Seed | Row counts match. Every NULL in the TODO list is NULL. Source strings were compared with the seed by script, and the remaining differences were reviewed by hand: UI labels and deliberate NULLs only. |
| Real data | All 22 published Sanity documents fit the constraints, in a dry run held in memory only. Rich text and images were placeholders here, so section 4's converter is **not** yet tested. |

**Were the tests able to fail?** Yes. Each rule was deliberately weakened in a throwaway copy:

| Weakened rule | Result |
|---|---|
| Public can read drafts | Caught |
| Editors can manage settings | Caught |
| View counter ignores status | Caught |
| Every new user becomes admin | Caught |
| Anyone can upload media | Caught |
| Last-admin guard removed | Caught |
| RLS skipped on a table | Migration refuses to apply |
| Profile RLS policy weakened | Still blocked by the trigger |
| Profile trigger removed | Still blocked by RLS |
| Both profile layers removed | Caught |

**Not tested:** a real Supabase project, including its real `auth` and `storage` internals; actual file uploads and the bucket's size and type limits; real invite and password reset emails; and access through the Supabase API rather than direct SQL.
