# Sanity to Supabase Migration Audit: GHAMSU website

Snapshot date: 2026-11-07. Git branch `main`, last commit `75bdd0e8`. Repository: `github.com/OwusuEmmanuelTakyi/ghamsu-`.

## Read this first

**The reader of this document cannot see the codebase.** All source that matters is pasted verbatim. Paths are relative to the repo root.

The ten facts that most affect the plan:

1. **This is not a Next.js site.** It is a client-side React 18 single-page app built with Vite 6 and React Router 7. There is no SSR, SSG, ISR, `next.config`, `next/image`, App Router, Pages Router, `generateStaticParams` or middleware. Every page fetches in the browser with `useEffect`. Do not plan around Next.js features unless a framework change is a deliberate decision.
2. **The content volume is very small:** 22 published content documents and 23 images (49.3 MB) were visible at snapshot time. A one-off script is enough. See section 6.
3. **There are no singletons, no custom block types and no multilingual fields.** The only reference in use is one undeclared legacy field.
4. **Only 17 of the 22 documents appear on the site.** The other 5 (3 `blog`, 1 `author`, 1 `testimonial`) have no live rendering path. `department`, `scriptureQuote`, `ghamsuToday` and `subscriber` have no visible documents at all. Section 6 has the per-type status.
5. **Three legacy `blog` posts are the richest content and are not displayed anywhere.** Keeping or dropping them is an owner decision. See section 9.
6. **Rich text is stored as Portable Text, but the live renderer is a broken hand-written loop.** It flattens headings and lists to plain text and has no link support. The real `@portabletext/react` renderer was deleted with the old frontend and is preserved in section 5.
7. **The only write to Sanity is `/api/blog-stats`, which increments likes and views.** It has no authentication and can patch any document ID. Do not copy that design.
8. **No form saves anything to a database.** The contact form sends email through EmailJS from the browser. The partner form does nothing. The subscribe component is an empty file.
9. **Much of the site's editable content is hardcoded in React, not in Sanity:** boards, activities, the coordinator profile, statistics, the yearly theme, social links and bank details. A dashboard that only replaces Sanity will not let admins edit these. See section 9.3.
10. **There are no Supabase traces in the repo.** No dependency, client, migration or env var.

### How this was verified, and what was not

| Item | Status |
|---|---|
| Repository source | Read directly. All pasted code is embedded from the files by script, not retyped. |
| Live content figures | Measured by anonymous, read-only GROQ queries against the public dataset on 2026-11-07. |
| Drafts and versions | **Not visible.** Anonymous reads cannot see `drafts.*` documents. The real document total may be higher. |
| Private-path documents | **Not visible.** Documents with a dot-separated ID path are hidden from anonymous reads. |
| Sanity authenticated access | **Failed.** The Sanity MCP session has expired ("Session not found"), so datasets, the deployed schema, members and tokens were not inspected. |
| Vercel settings and env vars | Not inspected. Only `vercel.json` and code references were read. |
| Supabase account | Not inspected. "No Supabase usage" refers to this repository only. |
| Running the app | Not done for this audit. Behaviour notes come from reading the code. |

The owner should re-run the counts with an authenticated `sanity dataset export` before cutover (section 6.3).

Labels used below: **Fact** means read from code or measured. **Suggestion** means the author's recommendation for the planner to weigh.

---

## 1. PROJECT OVERVIEW

### 1.1 Repository layout

This is a monorepo-style folder without workspaces. It holds two independent npm projects plus a small stray root manifest.

| Path | Purpose |
|---|---|
| `ghamsu-frontend-new/` | The public website (Vite + React). |
| `ghamsu-cms/` | Sanity Studio, a separate project with its own `package.json`. |
| `package.json` (root) | Only two devDependencies (`@types/react-slick`, `slick-carousel`). Not a workspace root. |
| `.vite/` (root) | Tracked Vite cache leftovers. Not functional. |
| `*-TODO.md`, `TODO.md` (root) | Notes from earlier work, mostly about the deleted `ghamsu-frontend/`. Stale. |

An older `ghamsu-frontend/` folder was deleted in commit `7e32d235`. It remains in git history and is referenced below as "the old frontend".

### 1.2 Framework and versions

| Technology | package.json | Locked version | Notes |
|---|---|---|---|
| Next.js | not used | none | `next-themes` is a standalone theme library and does not imply Next.js. |
| Router | `react-router` 7.13.0 | 7.13.0 | Library mode: `createBrowserRouter`. Neither App Router nor Pages Router applies. |
| React / React DOM | optional peer 18.3.1 | 18.3.1 | Declared only under `peerDependencies`, not `dependencies`. |
| Build tool | `vite` 6.3.5 | 6.3.5 | `@vitejs/plugin-react` 4.7.0. |
| Tailwind CSS | `tailwindcss` 4.1.12 | 4.1.12 | Via `@tailwindcss/vite` 4.1.12. |
| TypeScript | **not declared** | 5.9.3 (transitive) | The frontend has no `tsconfig.json` and no type-check step. `npm run build` is `vite build`, so type errors do not fail the build. |
| UI | Radix UI, shadcn-style `components/ui/*`, MUI 7.3.5 | | `@mui/material` has zero imports in `src`. |
| Studio: `sanity` | `^5.24.0` | 5.24.0 | Studio uses React 19.2.5, separate from the frontend's React 18. |

### 1.3 Dependencies, with Sanity packages flagged

**Sanity-related packages:**

| Package | Project | Version | Used for |
|---|---|---|---|
| `@sanity/client` | frontend | `^7.22.0` (locked 7.22.0) | **SANITY:** browser client in `src/lib/sanity.ts`; server client in `api/blog-stats.ts`. |
| `@sanity/image-url` | frontend | `^2.1.1` (locked 2.1.1) | **SANITY:** image URL builder in `src/lib/sanity.ts`. |
| `sanity` | CMS | `^5.24.0` | **SANITY:** Studio and CLI. |
| `@sanity/vision` | CMS | `^5.24.0` | **SANITY:** GROQ playground in Studio. |
| `@sanity/eslint-config-studio` | CMS dev | `^6.0.0` | **SANITY:** lint config. |
| `styled-components` | CMS | `^6.1.18` | Required by Studio only. |

**Not installed:** `next-sanity`, `@portabletext/react` (the old frontend had `^6.0.3`, the current one does not), `sanity` in the frontend, `groq`, `@sanity/preview-kit`, `@sanity/visual-editing`.

**Declared but with zero imports in `src`/`api` (checked individually):** `resend`, `web-push`, `@mui/material`, `react-slick`, `react-dnd`, `canvas-confetti`, `date-fns`. Other packages were not individually checked.

Full manifests follow.

`ghamsu-frontend-new/package.json`:

```json
{
  "name": "@figma/my-make-file",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "@emailjs/browser": "^4.4.1",
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/icons-material": "7.3.5",
    "@mui/material": "7.3.5",
    "@popperjs/core": "2.11.8",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "@sanity/client": "^7.22.0",
    "@sanity/image-url": "^2.1.1",
    "@vercel/analytics": "^2.0.1",
    "canvas-confetti": "1.9.4",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "framer-motion": "^12.38.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-router": "7.13.0",
    "react-slick": "0.31.0",
    "recharts": "2.15.2",
    "resend": "^6.12.3",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2",
    "web-push": "^3.6.7"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vercel/node": "^5.7.15",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "vite": "6.3.5",
    "vite-plugin-sitemap": "^0.8.2"
  },
  "peerDependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "react-dom": {
      "optional": true
    }
  },
  "pnpm": {
    "overrides": {
      "vite": "6.3.5"
    }
  }
}
```

`ghamsu-cms/package.json`:

```json
{
  "name": "ghamsu-cms",
  "private": true,
  "version": "1.0.0",
  "main": "package.json",
  "license": "UNLICENSED",
  "scripts": {
    "build": "sanity build",
    "deploy": "sanity deploy",
    "deploy-graphql": "sanity graphql deploy",
    "dev": "sanity dev",
    "start": "sanity start"
  },
  "keywords": [
    "sanity"
  ],
  "dependencies": {
    "@sanity/vision": "^5.24.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "sanity": "^5.24.0",
    "styled-components": "^6.1.18"
  },
  "devDependencies": {
    "@sanity/eslint-config-studio": "^6.0.0",
    "@types/react": "^19.2.14",
    "eslint": "^9.28",
    "prettier": "^3.5",
    "typescript": "^5.8"
  },
  "prettier": {
    "bracketSpacing": false,
    "printWidth": 100,
    "semi": false,
    "singleQuote": true
  }
}
```

`package.json` (root):

```json
{
  "devDependencies": {
    "@types/react-slick": "^0.23.13",
    "slick-carousel": "^1.8.1"
  }
}
```

### 1.4 Folder structure

Generated from `git ls-files`, so it holds tracked files only. `node_modules`, `.next` and `.git` are excluded. The untracked, git-ignored `ghamsu-frontend-new/.env` also exists locally.

```text
.
├── .vite
│   └── deps
│       ├── _metadata.json
│       └── package.json
├── ghamsu-cms
│   ├── schemaTypes
│   │   ├── article.ts
│   │   ├── author.ts
│   │   ├── blog.ts
│   │   ├── event.ts
│   │   ├── executive.ts
│   │   ├── gallery.ts
│   │   ├── index.ts
│   │   ├── misc.ts
│   │   ├── news.ts
│   │   ├── sermon.ts
│   │   └── subscriber.ts
│   ├── static
│   │   └── .gitkeep
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── sanity.cli.ts
│   ├── sanity.config.ts
│   └── tsconfig.json
├── ghamsu-frontend-new
│   ├── api
│   │   └── blog-stats.ts
│   ├── guidelines
│   │   └── Guidelines.md
│   ├── src
│   │   ├── app
│   │   │   ├── components
│   │   │   │   ├── figma
│   │   │   │   │   └── ImageWithFallback.tsx
│   │   │   │   ├── ui
│   │   │   │   │   ├── accordion.tsx
│   │   │   │   │   ├── alert-dialog.tsx
│   │   │   │   │   ├── alert.tsx
│   │   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   │   ├── avatar.tsx
│   │   │   │   │   ├── badge.tsx
│   │   │   │   │   ├── breadcrumb.tsx
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── calendar.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── carousel.tsx
│   │   │   │   │   ├── chart.tsx
│   │   │   │   │   ├── checkbox.tsx
│   │   │   │   │   ├── collapsible.tsx
│   │   │   │   │   ├── command.tsx
│   │   │   │   │   ├── context-menu.tsx
│   │   │   │   │   ├── dialog.tsx
│   │   │   │   │   ├── drawer.tsx
│   │   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   │   ├── form.tsx
│   │   │   │   │   ├── hover-card.tsx
│   │   │   │   │   ├── input-otp.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── label.tsx
│   │   │   │   │   ├── menubar.tsx
│   │   │   │   │   ├── navigation-menu.tsx
│   │   │   │   │   ├── pagination.tsx
│   │   │   │   │   ├── popover.tsx
│   │   │   │   │   ├── progress.tsx
│   │   │   │   │   ├── radio-group.tsx
│   │   │   │   │   ├── resizable.tsx
│   │   │   │   │   ├── scroll-area.tsx
│   │   │   │   │   ├── select.tsx
│   │   │   │   │   ├── separator.tsx
│   │   │   │   │   ├── sheet.tsx
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── skeleton.tsx
│   │   │   │   │   ├── slider.tsx
│   │   │   │   │   ├── sonner.tsx
│   │   │   │   │   ├── switch.tsx
│   │   │   │   │   ├── table.tsx
│   │   │   │   │   ├── tabs.tsx
│   │   │   │   │   ├── textarea.tsx
│   │   │   │   │   ├── toggle-group.tsx
│   │   │   │   │   ├── toggle.tsx
│   │   │   │   │   ├── tooltip.tsx
│   │   │   │   │   ├── use-mobile.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── AboutSection.tsx
│   │   │   │   ├── AnimatedSection.tsx
│   │   │   │   ├── BackToTop.tsx
│   │   │   │   ├── BlogPreviewSection.tsx
│   │   │   │   ├── BoardsHomeSection.tsx
│   │   │   │   ├── ColoredCardsSection.tsx
│   │   │   │   ├── DarkSection.tsx
│   │   │   │   ├── FloatingServiceCards.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── HistorySection.tsx
│   │   │   │   ├── MinistriesSection.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── PageLoader.tsx
│   │   │   │   ├── ScrollToTop.tsx
│   │   │   │   ├── StatsSection.tsx
│   │   │   │   ├── SubscribeForm.tsx
│   │   │   │   ├── UpcomingEvents.tsx
│   │   │   │   └── WhyChooseUs.tsx
│   │   │   ├── pages
│   │   │   │   ├── About.tsx
│   │   │   │   ├── BlogDetail.tsx
│   │   │   │   ├── Blogs.tsx
│   │   │   │   ├── BoardDetail.tsx
│   │   │   │   ├── Boards.tsx
│   │   │   │   ├── Contact.tsx
│   │   │   │   ├── Events.tsx
│   │   │   │   ├── Gallery.tsx
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Notfound.tsx
│   │   │   │   ├── Partner.tsx
│   │   │   │   └── Sermons.tsx
│   │   │   ├── App.tsx
│   │   │   └── routes.tsx
│   │   ├── images
│   │   │   ├── 1.jpg
│   │   │   ├── 12.jpg
│   │   │   ├── 13.jpg
│   │   │   ├── 2.jpg
│   │   │   ├── 3.jpg
│   │   │   ├── 4.jpg
│   │   │   ├── 5.jpg
│   │   │   ├── 6.jpg
│   │   │   ├── 7.jpg
│   │   │   ├── 8.jpg
│   │   │   ├── 9.jpg
│   │   │   ├── logo.png
│   │   │   ├── logo1.png
│   │   │   └── rev.png
│   │   ├── imports
│   │   │   ├── image-1.png
│   │   │   └── image.png
│   │   ├── lib
│   │   │   ├── hooks.ts
│   │   │   ├── queries.ts
│   │   │   ├── sanity.ts
│   │   │   └── useLikesAndViews.ts
│   │   ├── styles
│   │   │   ├── custom.css
│   │   │   ├── fonts.css
│   │   │   ├── globals.css
│   │   │   ├── index.css
│   │   │   ├── tailwind.css
│   │   │   └── theme.css
│   │   ├── types
│   │   │   └── types.ts
│   │   └── main.tsx
│   ├── .gitignore
│   ├── ATTRIBUTIONS.md
│   ├── default_shadcn_theme.css
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── vercel.json
│   └── vite.config.ts
├── .gitignore
├── EVENTS-SECTION-FIX-TODO.md
├── EventsPage-Fix-TODO.md
├── GALLERY-PLAN-TODO.md
├── GALLERY-TODO.md
├── LICENSE
├── LOGO-FIX-TODO.md
├── package-lock.json
├── package.json
├── TODO-BlogDetail-Fix.md
└── TODO.md
```

### 1.5 Sanity Studio location

**Separate project, not embedded.** It lives in `ghamsu-cms/` and the website has no `/studio` route. No deployed Studio URL was found in the repo. `ghamsu-cms/node_modules` is not installed in this checkout.

The config uses default `structureTool()` with no custom structure, plus `visionTool()`:

`ghamsu-cms/sanity.config.ts`:

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'GHAMSU CMS',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
```

`ghamsu-cms/sanity.cli.ts`:

```ts
import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'rgbuxwes',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  }
})
```

### 1.6 Deployment

**Vercel** (detected from `vercel.json`, `@vercel/node`, `@vercel/analytics` and the `.vercel.app` CORS rule). Production domain per code: `https://www.ghamsu.org`, also `https://ghamsu.vercel.app`. The Vercel project's root directory is presumably `ghamsu-frontend-new`, but was not verified. No `netlify.toml`, Dockerfile or `.github` workflows exist. See section 7 for `vercel.json`.

### 1.7 Existing Supabase usage

**None in this repository.** Case-insensitive search across source found no dependency, import, env var or SQL. No `*.sql` files exist.

---

## 2. SANITY SCHEMAS (most important)

### 2.1 Summary

13 types are registered, all of type `document`. There are no reusable top-level `object` types. Three inline object shapes exist inside arrays (`news.mediaAttachments[]`, `ghamsuToday.happeningNow[]`, `ghamsuToday.laterToday[]`).

| Type name | Title | Source file | Slug | Rich text | Visible docs | Rendered on site? |
|---|---|---|---|---|---|---|
| `event` | Events | `event.ts` | no | no | 3 | Yes |
| `author` | Authors | `author.ts` | no | no | 1 | **No** |
| `blog` | Blogs / Articles | `blog.ts` | yes | yes | 3 | **No** (legacy) |
| `sermon` | Sermons | `sermon.ts` | no | no | 3 | Yes |
| `news` | News | `news.ts` | yes | yes | 1 | Yes |
| `article` | Articles | `article.ts` | yes | yes | 1 | Yes |
| `subscriber` | Subscribers | `subscriber.ts` | no | no | 0 | **No** |
| `testimonial` | Testimonials | `misc.ts` | no | no | 1 | **No** |
| `gallery` | Gallery | `gallery.ts` | no | no | 6 | Yes |
| `executive` | Executives | `executive.ts` | no | no | 3 | Yes |
| `department` | Departments / Ministries | `misc.ts` | no | no | 0 | **No** |
| `scriptureQuote` | Scripture Quotes | `misc.ts` | no | no | 0 | **No** |
| `ghamsuToday` | GHAMSU Today Updates | `misc.ts` | no | no | 0 | **No** |

**Trap: `misc.ts` also exports stale versions of `gallery` and `executive` that are not registered.** `schemaTypes/index.ts` imports `gallery` from `gallery.ts` and `executive` from `executive.ts`. Only those are active. The stale shapes are documented in 2.17. The live data matches the active shapes: 6/6 galleries have `coverImage`, 3/3 executives have `image`.

Sanity adds these system fields to every document, and they should be preserved or mapped: `_id` (string), `_type`, `_createdAt`, `_updatedAt`, `_rev`.

"Req" means `Rule.required()`. "Filled" is live data from anonymous reads, shown as documents with the field out of visible documents.

### 2.2 `event` (document)

| Field | Type | Req | Options, validation, default, description | Filled |
|---|---|---|---|---|
| `title` | string | yes | | 3/3 |
| `date` | datetime | yes | | 3/3 |
| `venue` | string | yes | | 3/3 |
| `flyer` | image | yes | `hotspot: true`; title "Event Flyer / Poster"; no custom fields | 3/3 |
| `description` | text | no | `rows: 4` | 3/3 |
| `eventType` | string | no | list: `conference`, `worship`, `outreach`, `fellowship`, `training`, `other` | 3/3 (all `other`) |
| `registrationLink` | url | no | | 2/3 (both YouTube links) |
| `published` | boolean | no | `initialValue: false` | 3/3 (all `true`) |

Orderings: `dateDesc` (`date` desc). Preview: title, date, flyer. `published` is an application-level flag on top of Sanity's own draft system, and this is the only type with one. `EVENTS_QUERY` filters on it.

### 2.3 `author` (document)

| Field | Type | Req | Options | Filled |
|---|---|---|---|---|
| `name` | string | yes | | 1/1 |
| `photo` | image | no | `hotspot: true` | 1/1 |
| `bio` | text | no | `rows: 3` | 0/1 |
| `position` | string | no | title "Title / Position" | 0/1 |

Preview: name, position, photo. No current schema references this type. One legacy `blog` document does (see 2.4).

### 2.4 `blog` (document, legacy)

Same field set as `article` (2.7), with these differences: the category field is `category` rather than `articleCategory`, and `publishedDate` is optional rather than required.

| Field | Type | Req | Options, default, description | Filled |
|---|---|---|---|---|
| `title` | string | yes | | 3/3 |
| `slug` | slug | yes | `source: 'title'`, `maxLength: 96` | 3/3 |
| `featuredImage` | image | yes | `hotspot: true` | 3/3 |
| `excerpt` | text | yes | `rows: 3` | 3/3 |
| `content` | array | yes | Portable Text, see 2.15 | 3/3 |
| `authorName` | string | yes | "Name of the person who wrote this blog post" | **0/3** |
| `authorLocal` | string | no | 'Local chapter, position, or affiliation (e.g., "UG Local", "Chapel Leader", "Student")' | 0/3 |
| `category` | string | no | list: `faith`, `leadership`, `campus-life`, `devotionals` | 3/3 (`devotionals`, `faith`, `leadership`) |
| `publishedDate` | datetime | no | | 3/3 |
| `readTime` | number | no | title "Read Time (minutes)" | 3/3 |
| `featured` | boolean | no | `initialValue: false` | 3/3 (2 true, 1 false) |
| `likes` | number | no | `initialValue: 0`, `readOnly`, "Automatically updated when readers like the article." | **0/3** |
| `views` | number | no | `initialValue: 0`, `readOnly`, "Automatically updated each time the article is opened." | **0/3** |
| `author` | reference | n/a | **Not in the schema.** Undeclared legacy field found in the data. Presumably points to `author`. | 1/3 |

Orderings: `publishedDateDesc`, `mostLiked` (`likes` desc), `mostViewed` (`views` desc). Preview: title, category, featuredImage.

**Data drift (Fact):** these documents predate the current schema. `authorName` is required by the schema, but no document has it, so an author name must be taken from the `author` reference (only 1 of 3) or supplied by a person.

### 2.5 `sermon` (document)

| Field | Type | Req | Options, validation, description | Filled |
|---|---|---|---|---|
| `title` | string | yes | | 3/3 |
| `preacher` | string | yes | Free text, not a reference. | 3/3 |
| `date` | datetime | yes | | 3/3 |
| `mediaType` | string | yes | radio: `video` "Video (YouTube / Vimeo)", `audio` "Audio (SoundCloud / Anchor / direct link)" | 3/3 (all `video`) |
| `videoUrl` | url | conditional | Required when `mediaType == 'video'` (custom rule); hidden otherwise. "Paste a YouTube or Vimeo link (e.g. https://youtu.be/abc123)" | 3/3 |
| `audioUrl` | url | conditional | Required when `mediaType == 'audio'` (custom rule); hidden otherwise. "Paste a SoundCloud, Anchor, Spotify, or direct .mp3 link" | 0/3 |
| `thumbnail` | image | no | `hotspot: true` | 3/3 |
| `scriptureReference` | string | no | | 2/3 |
| `description` | text | no | `rows: 4` | 1/3 |
| `series` | string | no | Free text, not a reference. | 2/3 |
| `duration` | string | no | Title "Duration (e.g. 45:30)". Free-text string, not a number. | 3/3 |

Orderings: `dateDesc`. Preview: custom `prepare` adds an emoji by media type.

### 2.6 `news` (document)

| Field | Type | Req | Options, default, description | Filled |
|---|---|---|---|---|
| `title` | string | yes | | 1/1 |
| `slug` | slug | yes | `source: 'title'`, `maxLength: 96` | 1/1 |
| `featuredImage` | image | yes | `hotspot: true` | 1/1 |
| `excerpt` | text | yes | `rows: 3` | 1/1 |
| `content` | array | yes | Portable Text, see 2.15 | 1/1 |
| `reporter` | string | yes | "Name of the reporter who wrote this news story" | 1/1 |
| `reporterPosition` | string | no | 'Reporter position or local chapter (e.g., "UG Local", "Communications Officer")' | 1/1 |
| `mediaAttachments` | array of inline object `mediaItem` | no | "Add video or audio links related to this news story (YouTube, Vimeo, SoundCloud, etc.)" | **0/1** |
| `newsCategory` | string | no | list: `announcement`, `event-coverage`, `campus-news`, `union-update` | 1/1 |
| `publishedDate` | datetime | yes | | 1/1 |
| `featured` | boolean | no | `initialValue: false` | 1/1 |
| `likes` | number | no | `initialValue: 0`, `readOnly`, "Automatically updated when readers like the news." | 1/1 |
| `views` | number | no | `initialValue: 0`, `readOnly`, "Automatically updated each time the news is opened." | 1/1 |

Inline object `mediaItem` (array of objects, ordered):

| Field | Type | Req | Options, description |
|---|---|---|---|
| `mediaType` | string | yes | radio: `video`, `audio` |
| `label` | string | yes | "Short label shown above the player" |
| `url` | url | yes | `uri({scheme: ['http','https']})`. "Paste a YouTube, Vimeo, SoundCloud, Spotify, or direct media link here" |
| `description` | string | no | "Brief context shown below the player" |

Orderings: `publishedDateDesc`, `mostLiked`, `mostViewed`. Preview: title, newsCategory, featuredImage.

**News has no `readTime` field, unlike `article`.** **Fact:** no slug query projects `mediaAttachments`, so the player in `BlogDetail.tsx` can never render it today (see section 9.4).

### 2.7 `article` (document)

| Field | Type | Req | Options, default, description | Filled |
|---|---|---|---|---|
| `title` | string | yes | | 1/1 |
| `slug` | slug | yes | `source: 'title'`, `maxLength: 96` | 1/1 |
| `featuredImage` | image | yes | `hotspot: true` | 1/1 |
| `excerpt` | text | yes | `rows: 3` | 1/1 |
| `content` | array | yes | Portable Text, see 2.15 | 1/1 |
| `authorName` | string | yes | "Name of the person who wrote this article" | 1/1 |
| `authorLocal` | string | no | 'Local chapter, position, or affiliation (e.g., "UG Local", "Chapel Leader", "Student")' | 1/1 |
| `articleCategory` | string | no | list: `faith`, `leadership`, `campus-life`, `devotionals` | 1/1 |
| `publishedDate` | datetime | yes | | 1/1 |
| `readTime` | number | no | Title "Read Time (minutes)" | 1/1 |
| `featured` | boolean | no | `initialValue: false` | 1/1 |
| `likes` | number | no | `initialValue: 0`, `readOnly` | 1/1 |
| `views` | number | no | `initialValue: 0`, `readOnly` | 1/1 |

Orderings: `publishedDateDesc`, `mostLiked`, `mostViewed`. Preview: title, articleCategory, featuredImage.

### 2.8 `subscriber` (document)

| Field | Type | Req | Validation |
|---|---|---|---|
| `email` | string | yes | `.email()` |
| `subscribedAt` | datetime | no | |

Written as a plain typed object rather than with `defineType`. **No code in the repo creates these documents.** Zero are visible. See section 8.

### 2.9 `testimonial` (document)

| Field | Type | Req | Options, default, description | Filled |
|---|---|---|---|---|
| `name` | string | yes | | 1/1 |
| `photo` | image | no | `hotspot: true` | 1/1 |
| `role` | string | no | Title "Role / Year & Course". "e.g. 4th Year Medical Student, UG" | 1/1 |
| `local` | string | no | | 1/1 |
| `testimony` | text | yes | `rows: 5` | 1/1 |
| `rating` | number | yes | `min(1).max(5).integer()`, `initialValue: 5` | 1/1 |
| `featured` | boolean | no | `initialValue: false` | 1/1 |
| `date` | datetime | no | | 1/1 |

Orderings: `dateDesc`. Preview: name, role, photo. Queries also request a `university` field that does not exist in the schema.

### 2.10 `gallery` (document, active version from `gallery.ts`)

This is an album card that links to an external album. It does not hold the photos themselves.

| Field | Type | Req | Options, validation, description | Filled |
|---|---|---|---|---|
| `title` | string | yes | | 6/6 |
| `description` | string | yes | | 6/6 |
| `coverImage` | image | yes | `hotspot: true` | 6/6 |
| `photoCount` | number | yes | `min(1).integer()`. "Total number of photos in this album". Manually typed. | 6/6 |
| `date` | datetime | yes | | 6/6 |
| `link` | url | yes | "Google Drive or Google Photos link to the full album" | 6/6 (Google Photos, Pixieset) |
| `category` | string | yes | dropdown: `Conference`, `Worship`, `Outreach`, `Music`, `Study`, `Events`, `Training`, `Recreation` (values are Title Case) | 6/6 |

Orderings: `dateDesc`. Preview: custom `prepare` shows category and photo count.

### 2.11 `executive` (document, active version from `executive.ts`)

| Field | Type | Req | Options, validation, description | Filled |
|---|---|---|---|---|
| `name` | string | yes | Title "Full Name" | 3/3 |
| `position` | string | yes | | 3/3 |
| `image` | image | yes | `hotspot: true`; title "Profile Photo" | 3/3 |
| `phone` | string | no | "Display format e.g. +233 24 123 4567" | 3/3 |
| `email` | string | no | Custom regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` when present | 3/3 |
| `whatsapp` | string | no | Custom regex `^\d+$` when present. "Digits only, with country code — no spaces, dashes, or + sign. e.g. 233241234567" | 3/3 |
| `order` | number | yes | `required().integer().positive()`. "Lower numbers appear first. e.g. President = 1, Vice President = 2" | 3/3 |
| `category` | string | yes | radio: `connexional`, `Connexional Boards`, `Diocese`, `local` | 3/3 (`connexional`: 2, `Connexional Boards`: 1) |
| `bio` | text | no | `rows: 3` | 1/3 |

Orderings: `orderAsc`. Preview: custom `prepare`. **The enum values have inconsistent casing and a space, and the code matches them literally.** The contact page's filter offers only `connexional`, `Connexional Boards` and `Diocese`, so `local` executives would never display.

### 2.12 `department` (document)

| Field | Type | Req | Options |
|---|---|---|---|
| `name` | string | yes | |
| `image` | image | no | `hotspot: true` |
| `description` | text | yes | `rows: 4` |
| `leader` | **reference (single)** to `executive` | no | **The only declared reference in the schema.** |
| `activities` | array of string | no | |
| `color` | string | no | Title "Color (hex)". No validation. |

No visible documents. Preview: name, image.

### 2.13 `scriptureQuote` (document)

| Field | Type | Req | Options |
|---|---|---|---|
| `quoteText` | text | yes | `rows: 4` |
| `reference` | string | yes | Title "Reference (e.g. John 3:16)". A plain string, not a Sanity reference. |
| `active` | boolean | no | `initialValue: true` |
| `displayOrder` | number | no | |

Orderings: `displayOrderAsc`. No visible documents. Preview: reference, quoteText.

### 2.14 `ghamsuToday` (document)

| Field | Type | Req | Contents |
|---|---|---|---|
| `themeTitle` | string | no | |
| `themeDescription` | text | no | `rows: 3` |
| `scriptureReference` | string | no | |
| `happeningNow` | array of inline object | no | `{ title: string, location: string }` |
| `laterToday` | array of inline object | no | `{ title: string, time: string, location: string }`. `time` is free text. |
| `date` | datetime | no | |
| `active` | boolean | no | `initialValue: false` |

No visible documents. Preview: themeTitle, date.

### 2.15 Portable Text fields

Three identical fields: `blog.content`, `news.content`, `article.content`. Each is required and is an array of:

```ts
of: [
  { type: 'block' },   // no styles, lists or marks config, so Studio defaults apply
  {
    type: 'image',
    options: { hotspot: true },
    fields: [
      { name: 'alt', type: 'string', title: 'Alt Text' },
      { name: 'caption', type: 'string', title: 'Caption' },
    ],
  },
]
```

- **Allowed by Sanity's defaults, because nothing is customized.** This list comes from Sanity's documented defaults, not from this repo. Styles: `normal`, `h1` to `h6`, `blockquote`. Lists: `bullet`, `number`. Decorators: `strong`, `em`, `code`, `underline`, `strike-through`. Annotations: `link` with `href`.
- **Custom blocks:** only the inline `image`. No embeds, no references inside text, no custom annotations.

**What the data actually uses (Fact):**

| Measure | `blog` (3 docs) | `news` (1) | `article` (1) |
|---|---|---|---|
| Top-level items | 80 | 5 | 8 |
| Item types | block only | block only | block only |
| Styles | `normal` 69, `h3` 11 | `normal` 5 | `normal` 8 |
| Lists | `bullet` 24, all level 1 | none | none |
| Decorator marks on spans | `strong` 6, `em` 2 | `em` 1 | none |
| Links and other annotations | **0** | **0** | **0** |
| Inline images | **0** | **0** | **0** |
| Inline children types | span only (84) | span only (6) | span only (8) |
| Text characters | 6,997 (largest doc 2,795) | 1,281 | 2,560 |

**Consequence:** the live content needs only paragraphs, `h3`, bullets, bold and italic. The rendering pipeline for inline images and links must still exist, since editors are allowed to use them.

### 2.16 Slugs, images, singletons, ordering

**Slugs**

| Type | Field | Source | maxLength | Route |
|---|---|---|---|---|
| `news` | `slug` | `title` | 96 | `/blogs/:slug` |
| `article` | `slug` | `title` | 96 | `/blogs/:slug` |
| `blog` | `slug` | `title` | 96 | not routed; `BLOG_BY_SLUG_QUERY` excludes this type |

`news` and `article` share one URL namespace, and nothing in the schema enforces uniqueness across them. Live data: 5 slugs, 0 collisions, 0 missing.

**Images**

All top-level images use `hotspot: true` and have **no custom fields**, so featured images, flyers, photos and covers have no `alt`. Components use the document's title or name as alt text. Only Portable Text images have `alt` and `caption`. No `file` type is used anywhere, and zero file assets exist.

| Type.field | Required |
|---|---|
| `event.flyer` | yes |
| `blog.featuredImage`, `news.featuredImage`, `article.featuredImage` | yes |
| `gallery.coverImage` | yes |
| `executive.image` | yes |
| `sermon.thumbnail`, `author.photo`, `testimonial.photo`, `department.image` | no |
| `content[]` image (with `alt`, `caption`) | n/a |

Image object shape as stored:

```ts
export interface SanityImage {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
  caption?: string
}
```

**Singletons**

None. No type is enforced as a singleton, since there is no custom desk structure and no fixed document IDs. `ghamsuToday` behaves like one only at query time (`active == true` ordered by `date desc`, first result), and it is not used by the site. Site-wide settings do not exist in Sanity. They are hardcoded (section 9.3).

**Orderings config**

| Type | Orderings |
|---|---|
| `event`, `gallery`, `sermon`, `testimonial` | date, newest first |
| `blog`, `news`, `article` | `publishedDate` desc; likes desc; views desc |
| `executive` | `order` asc |
| `scriptureQuote` | `displayOrder` asc |

These affect only Studio list views. Site ordering comes from the GROQ queries.

**References (complete list)**

| From | To | Cardinality | Declared? |
|---|---|---|---|
| `department.leader` | `executive` | single, optional | yes (0 documents use it) |
| `blog.author` | presumably `author` | single | **no**, legacy data only (1 document) |

There are no array-of-reference fields.

### 2.17 Stale, unregistered types in `misc.ts`

These are dead code and are not in the schema. They are recorded because old documents could in principle match them (no visible ones do).

- **Stale `gallery`:** `title`, `images[]` (image with `alt`, `caption`), `eventCategory`, `date`, `description`. Actual photos stored in the document.
- **Stale `executive`:** `name`, `position`, `photo`, `universityChapter`, `phone`, `email`, `bio`, `order`, `category` (`national`, `regional`, `local`).

### 2.18 Full schema source

`ghamsu-cms/schemaTypes/index.ts`:

```ts
import event from './event'
import author from './author'
import blog from './blog'
import sermon from './sermon'
import { testimonial, department, scriptureQuote, ghamsuToday } from './misc'
import executive from './executive'
import { gallery } from './gallery'
import news from './news'
import article from './article'
import subscriber from './subscriber'

export const schemaTypes = [
  // Core content
  event,
  author,
 blog,
  sermon,
  news,
  article,
  subscriber,
  // Supporting content
  testimonial,
  gallery,
  executive,
  department,
  scriptureQuote,
  ghamsuToday,
]
```

`ghamsu-cms/schemaTypes/event.ts`:

```ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'flyer',
      title: 'Event Flyer / Poster',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type / Category',
      type: 'string',
      options: {
        list: [
          { title: 'Conference', value: 'conference' },
          { title: 'Worship', value: 'worship' },
          { title: 'Outreach', value: 'outreach' },
          { title: 'Fellowship', value: 'fellowship' },
          { title: 'Training', value: 'training' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'registrationLink',
      title: 'Registration Link',
      type: 'url',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Date, Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'date', media: 'flyer' },
  },
})
```

`ghamsu-cms/schemaTypes/author.ts`:

```ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'Authors',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'position',
      title: 'Title / Position',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'position', media: 'photo' },
  },
})
```

`ghamsu-cms/schemaTypes/blog.ts`:

```ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'blog',
  title: 'Blogs / Articles',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // ── Author Information ───────────────────────────────────────────
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Name of the person who wrote this blog post',
    }),
    defineField({
      name: 'authorLocal',
      title: 'Author Local / Position',
      type: 'string',
      description: 'Local chapter, position, or affiliation (e.g., "UG Local", "Chapel Leader", "Student")',
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Faith', value: 'faith' },
          { title: 'Leadership', value: 'leadership' },
          { title: 'Campus Life', value: 'campus-life' },
          { title: 'Devotionals', value: 'devotionals' },
        ],
      },
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'datetime',
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),

    // ── Engagement fields ────────────────────────────────────────────
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated when readers like the article.',
    }),
    defineField({
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated each time the article is opened.',
    }),
  ],
  orderings: [
    {
      title: 'Published Date, Newest First',
      name: 'publishedDateDesc',
      by: [{ field: 'publishedDate', direction: 'desc' }],
    },
    {
      title: 'Most Liked',
      name: 'mostLiked',
      by: [{ field: 'likes', direction: 'desc' }],
    },
    {
      title: 'Most Viewed',
      name: 'mostViewed',
      by: [{ field: 'views', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'featuredImage',
    },
  },
})
```

`ghamsu-cms/schemaTypes/sermon.ts`:

```ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'sermon',
  title: 'Sermons',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'preacher',
      title: 'Preacher',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video (YouTube / Vimeo)', value: 'video' },
          { title: 'Audio (SoundCloud / Anchor / direct link)', value: 'audio' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'Paste a YouTube or Vimeo link (e.g. https://youtu.be/abc123)',
      type: 'url',
      hidden: ({ document }) => document?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.mediaType === 'video' && !value) {
            return 'Video URL is required when Media Type is Video'
          }
          return true
        }),
    }),
    defineField({
      name: 'audioUrl',
      title: 'Audio URL',
      description: 'Paste a SoundCloud, Anchor, Spotify, or direct .mp3 link',
      type: 'url',
      hidden: ({ document }) => document?.mediaType !== 'audio',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.mediaType === 'audio' && !value) {
            return 'Audio URL is required when Media Type is Audio'
          }
          return true
        }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'scriptureReference',
      title: 'Scripture Reference',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'string',
    }),
    defineField({
      name: 'duration',
      title: 'Duration (e.g. 45:30)',
      type: 'string',
    }),
  ],
  orderings: [
    {
      title: 'Date, Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'preacher',
      media: 'thumbnail',
      mediaType: 'mediaType',
    },
    prepare({ title, subtitle, media, mediaType }) {
      return {
        title,
        subtitle: `${mediaType === 'video' ? '🎬' : '🎙️'} ${subtitle}`,
        media,
      }
    },
  },
})
```

`ghamsu-cms/schemaTypes/news.ts`:

```ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt',     type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption'  },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // ── Reporter Information ───────────────────────────────────────────────
    defineField({
      name: 'reporter',
      title: 'Reporter Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Name of the reporter who wrote this news story',
    }),
    defineField({
      name: 'reporterPosition',
      title: 'Reporter Position / Local',
      type: 'string',
      description: 'Reporter position or local chapter (e.g., "UG Local", "Communications Officer")',
    }),

    // ── Media Attachments ─────────────────────────────────────────────────
    defineField({
      name: 'mediaAttachments',
      title: 'Media Attachments',
      type: 'array',
      description: 'Add video or audio links related to this news story (YouTube, Vimeo, SoundCloud, etc.)',
      of: [
        {
          type: 'object',
          name: 'mediaItem',
          title: 'Media Item',
          fields: [
            defineField({
              name: 'mediaType',
              title: 'Media Type',
              type: 'string',
              options: {
                list: [
                  { title: '🎥 Video',  value: 'video' },
                  { title: '🎵 Audio',  value: 'audio' },
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Short label shown above the player (e.g. "Watch the Sermon", "Listen to the Report")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Paste a YouTube, Vimeo, SoundCloud, Spotify, or direct media link here',
              validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
            }),
            defineField({
              name: 'description',
              title: 'Short Description (optional)',
              type: 'string',
              description: 'Brief context shown below the player',
            }),
          ],
          preview: {
            select: {
              title:    'label',
              subtitle: 'url',
              type:     'mediaType',
            },
            prepare({ title, subtitle, type }) {
              return {
                title:    `${type === 'video' ? '🎥' : '🎵'} ${title}`,
                subtitle: subtitle,
              }
            },
          },
        },
      ],
    }),

    // ── Classification ────────────────────────────────────────────────────
    defineField({
      name: 'newsCategory',
      title: 'News Category',
      type: 'string',
      options: {
        list: [
          { title: 'Announcement',   value: 'announcement'   },
          { title: 'Event Coverage', value: 'event-coverage' },
          { title: 'Campus News',    value: 'campus-news'    },
          { title: 'Union Update',   value: 'union-update'   },
        ],
      },
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),

    // ── Engagement ────────────────────────────────────────────────────────
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated when readers like the news.',
    }),
    defineField({
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated each time the news is opened.',
    }),
  ],

  orderings: [
    {
      title: 'Published Date, Newest First',
      name: 'publishedDateDesc',
      by: [{ field: 'publishedDate', direction: 'desc' }],
    },
    {
      title: 'Most Liked',
      name: 'mostLiked',
      by: [{ field: 'likes', direction: 'desc' }],
    },
    {
      title: 'Most Viewed',
      name: 'mostViewed',
      by: [{ field: 'views', direction: 'desc' }],
    },
  ],

  preview: {
    select: {
      title:    'title',
      subtitle: 'newsCategory',
      media:    'featuredImage',
    },
  },
})
```

`ghamsu-cms/schemaTypes/article.ts`:

```ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'article',
  title: 'Articles',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // ── Author Information ───────────────────────────────────────────
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Name of the person who wrote this article',
    }),
    defineField({
      name: 'authorLocal',
      title: 'Author Local / Position',
      type: 'string',
      description: 'Local chapter, position, or affiliation (e.g., "UG Local", "Chapel Leader", "Student")',
    }),

    defineField({
      name: 'articleCategory',
      title: 'Article Category',
      type: 'string',
      options: {
        list: [
          { title: 'Faith', value: 'faith' },
          { title: 'Leadership', value: 'leadership' },
          { title: 'Campus Life', value: 'campus-life' },
          { title: 'Devotionals', value: 'devotionals' },
        ],
      },
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),

    // ── Engagement fields ────────────────────────────────────────────
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated when readers like the article.',
    }),
    defineField({
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated each time the article is opened.',
    }),
  ],
  orderings: [
    {
      title: 'Published Date, Newest First',
      name: 'publishedDateDesc',
      by: [{ field: 'publishedDate', direction: 'desc' }],
    },
    {
      title: 'Most Liked',
      name: 'mostLiked',
      by: [{ field: 'likes', direction: 'desc' }],
    },
    {
      title: 'Most Viewed',
      name: 'mostViewed',
      by: [{ field: 'views', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'articleCategory',
      media: 'featuredImage',
    },
  },
})
```

`ghamsu-cms/schemaTypes/subscriber.ts`:

```ts
interface Field {
  name: string;
  title: string;
  type: string;
  validation?: (Rule: any) => any;
}

interface SubscriberSchema {
  name: string;
  title: string;
  type: string;
  fields: Field[];
}

const subscriber: SubscriberSchema = {
  name: 'subscriber',
  title: 'Subscribers',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
    },
    {
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
    },
  ],
};

export default subscriber;
```

`ghamsu-cms/schemaTypes/gallery.ts`:

```ts
import { defineField, defineType } from 'sanity'

// ─── Gallery ───────────────────────────────────────────────────────────────────
export const gallery = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "photoCount",
      title: "Photo Count",
      type: "number",
      description: "Total number of photos in this album",
      validation: (Rule) => Rule.required().min(1).integer(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "link",
      title: "Album Link",
      type: "url",
      description: "Google Drive or Google Photos link to the full album",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Conference", value: "Conference" },
          { title: "Worship", value: "Worship" },
          { title: "Outreach", value: "Outreach" },
          { title: "Music", value: "Music" },
          { title: "Study", value: "Study" },
          { title: "Events", value: "Events" },
          { title: "Training", value: "Training" },
          { title: "Recreation", value: "Recreation" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Date, Newest First",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage",
      photoCount: "photoCount",
    },
    prepare({ title, subtitle, media, photoCount }) {
      return {
        title,
        subtitle: `📸 ${subtitle} · ${photoCount} photos`,
        media,
      };
    },
  },
})
```

`ghamsu-cms/schemaTypes/executive.ts`:

```ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'executive',
  title: 'Executives',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'Position / Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Profile Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      description: 'Display format e.g. +233 24 123 4567',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? true
            : 'Must be a valid email address'
        }),
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp Number',
      description: 'Digits only, with country code — no spaces, dashes, or + sign. e.g. 233241234567',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          return /^\d+$/.test(value)
            ? true
            : 'WhatsApp number must contain digits only (no spaces, dashes, or + sign)'
        }),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      description: 'Lower numbers appear first. e.g. President = 1, Vice President = 2',
      type: 'number',
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Connexional Executive', value: 'connexional' },
          { title: 'Connexional Boards',    value: 'Connexional Boards' },
          { title: 'Diocese',               value: 'Diocese' },
          { title: 'Local',                 value: 'local' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: 'Display Order (ascending)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'position',
      media: 'image',
      order: 'order',
      category: 'category',
    },
    prepare({ title, subtitle, media, order, category }) {
      const categoryLabel: Record<string, string> = {
        connexional: 'Connexional Executive',
        'Connexional Boards': 'Connexional Boards',
        Diocese: 'Diocese',
        local: 'Local',
      }
      return {
        title: `${order ? `#${order} · ` : ''}${title}`,
        subtitle: `${subtitle} — ${categoryLabel[category] ?? category}`,
        media,
      }
    },
  },
})
```

`ghamsu-cms/schemaTypes/misc.ts`:

```ts
import { defineField, defineType } from 'sanity'

// ─── Testimonials ──────────────────────────────────────────────────────────────
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'role',
      title: 'Role / Year & Course',
      description: 'e.g. 4th Year Medical Student, UG',
      type: 'string',
    }),
    defineField({
      name: 'local',
      title: 'Local',
      type: 'string',
    }),
    defineField({
      name: 'testimony',
      title: 'Testimony',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1–5)',
      type: 'number',
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
    }),
  ],
  orderings: [
    { title: 'Newest First', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})

// ─── Gallery ───────────────────────────────────────────────────────────────────
export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: 'eventCategory', title: 'Event / Category', type: 'string' }),
    defineField({ name: 'date', title: 'Date', type: 'datetime' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
  ],
  preview: { select: { title: 'title', subtitle: 'eventCategory' } },
})

// ─── Executives / Leadership ───────────────────────────────────────────────────
export const executive = defineType({
  name: 'executive',
  title: 'Executives / Leadership',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'position', title: 'Position / Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'universityChapter', title: 'University / Chapter', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 3 }),
    defineField({ name: 'order', title: 'Order (for sorting)', type: 'number' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'National', value: 'national' },
          { title: 'Regional', value: 'regional' },
          { title: 'Local', value: 'local' },
        ],
      },
    }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'position', media: 'photo' } },
})

// ─── Departments / Ministries ──────────────────────────────────────────────────
export const department = defineType({
  name: 'department',
  title: 'Departments / Ministries',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'image', title: 'Icon / Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'leader',
      title: 'Leader',
      type: 'reference',
      to: [{ type: 'executive' }],
    }),
    defineField({
      name: 'activities',
      title: 'Activities',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'color', title: 'Color (hex)', type: 'string' }),
  ],
  preview: { select: { title: 'name', media: 'image' } },
})

// ─── Scripture Quotes ──────────────────────────────────────────────────────────
export const scriptureQuote = defineType({
  name: 'scriptureQuote',
  title: 'Scripture Quotes',
  type: 'document',
  fields: [
    defineField({ name: 'quoteText', title: 'Quote Text', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'reference', title: 'Reference (e.g. John 3:16)', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({ name: 'displayOrder', title: 'Display Order', type: 'number' }),
  ],
  orderings: [{ title: 'Display Order', name: 'displayOrderAsc', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: { select: { title: 'reference', subtitle: 'quoteText' } },
})

// ─── GHAMSU Today Updates ──────────────────────────────────────────────────────
export const ghamsuToday = defineType({
  name: 'ghamsuToday',
  title: 'GHAMSU Today Updates',
  type: 'document',
  fields: [
    defineField({ name: 'themeTitle', title: 'Theme Title', type: 'string' }),
    defineField({ name: 'themeDescription', title: 'Theme Description', type: 'text', rows: 3 }),
    defineField({ name: 'scriptureReference', title: 'Scripture Reference', type: 'string' }),
    defineField({
      name: 'happeningNow',
      title: 'Happening Now Events',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Title' },
            { name: 'location', type: 'string', title: 'Location' },
          ],
          preview: { select: { title: 'title', subtitle: 'location' } },
        },
      ],
    }),
    defineField({
      name: 'laterToday',
      title: 'Later Today Events',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Title' },
            { name: 'time', type: 'string', title: 'Time' },
            { name: 'location', type: 'string', title: 'Location' },
          ],
          preview: { select: { title: 'title', subtitle: 'time' } },
        },
      ],
    }),
    defineField({ name: 'date', title: 'Date', type: 'datetime' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'themeTitle', subtitle: 'date' } },
})
```

---

## 3. DATA FETCHING

### 3.1 Sanity client config

| Setting | Browser client (`src/lib/sanity.ts`) | Server client (`api/blog-stats.ts`) |
|---|---|---|
| `projectId` | `import.meta.env.VITE_SANITY_PROJECT_ID` (value `rgbuxwes`, not a secret) | `process.env.VITE_SANITY_PROJECT_ID` |
| `dataset` | env, default `production` | env, default `production` |
| `apiVersion` | `2024-01-01` | `2024-01-01` |
| `useCdn` | `!import.meta.env.DEV` (CDN in production only) | `false` |
| `perspective` | `published` | not set |
| `token` | `VITE_SANITY_TOKEN` in dev only, `undefined` in production: `[REDACTED: no value in code]` | `process.env.SANITY_WRITE_TOKEN`: `[REDACTED: no value in code]` |

**The dataset is public (Fact):** tokenless queries return content. Any document in it is world-readable, which is why a `subscriber` type there would be a privacy problem if it ever gets used.

`ghamsu-frontend-new/src/lib/sanity.ts`:

```ts
import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

declare global {
  interface ImportMetaEnv {
    readonly VITE_SANITY_PROJECT_ID: string
    readonly VITE_SANITY_DATASET: string
    readonly VITE_SANITY_TOKEN?: string
    readonly VITE_SANITY_USE_CDN?: string
  }
}

const isDev = import.meta.env.DEV

// ─── Client ────────────────────────────────────────────────────────────────────
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: !isDev,                // CDN in production, direct API in dev
  perspective: 'published',      // ← only fetch published docs, never drafts
  token: isDev
    ? import.meta.env.VITE_SANITY_TOKEN || undefined
    : undefined,                 // ← never send token in production (breaks CDN)
})

// ─── Image URL Builder ─────────────────────────────────────────────────────────
const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ─── Typed helpers ─────────────────────────────────────────────────────────────
export function imageUrl(
  source: SanityImageSource,
  width?: number,
  height?: number
): string {
  let img = urlFor(source).auto('format').fit('crop')
  if (width) img = img.width(width)
  if (height) img = img.height(height)
  return img.url()
}
```

### 3.2 Fetch pattern

All content goes through one generic hook, `useSanityData`, in `src/lib/hooks.ts`: `useEffect` plus `sanityClient.fetch`, returning `{ data, loading, error }`. There is **no cache, no request de-duplication and no shared store**. Every mounted hook makes its own request. For example, the home page fetches news and articles twice, and `Blogs`, `Sermons` and `Gallery` each run their list query twice.

### 3.3 Every GROQ query

There are 31 named queries in `src/lib/queries.ts` plus 2 inline ones. **11 named queries and 1 inline query are live. 20 named queries have hooks that nothing calls.** Full text is in 3.4.

**Live queries**

| Constant | Lines in `queries.ts` | Params | Hook | Used by |
|---|---|---|---|---|
| `EVENTS_QUERY` | 24-36 | none | `useEvents()` | `pages/Events.tsx`, `components/UpcomingEvents.tsx`, `components/FloatingServiceCards.tsx` |
| `NEWS_QUERY` | 67-86 | none | `useNews()` | `components/BlogPreviewSection.tsx`, `components/FloatingServiceCards.tsx` |
| `ARTICLES_QUERY` | 153-171 | none | `useArticles()` | `components/BlogPreviewSection.tsx`, `components/FloatingServiceCards.tsx` |
| `BLOGS_QUERY` | 235-263 | none | `useBlogs()` | `pages/Blogs.tsx` (twice) |
| `BLOGS_BY_CATEGORY_QUERY` | 326-354 | `$category` | `useBlogs({category})` | `pages/Blogs.tsx` |
| `BLOG_BY_SLUG_QUERY` | 295-324 | `$slug` | `useBlogBySlug(slug)` | `pages/BlogDetail.tsx` |
| `SERMONS_QUERY` | 357-372 | none | `useSermons()` | `pages/Sermons.tsx` (twice when unfiltered) |
| `SERMONS_BY_TYPE_QUERY` | 391-406 | `$mediaType` | `useSermons({mediaType})` | `pages/Sermons.tsx` |
| `GALLERY_QUERY` | 455-466 | none | `useGallery()` | `pages/Gallery.tsx` (twice when unfiltered) |
| `GALLERY_BY_CATEGORY_QUERY` | 468-479 | `$category` | `useGallery({category})` | `pages/Gallery.tsx` |
| `EXECUTIVES_BY_CATEGORY_QUERY` | 525-538 | `$category` | `useExecutives({category})` | `pages/Contact.tsx` |

**Inline queries**

| File | Query | Params | Status |
|---|---|---|---|
| `src/lib/useLikesAndViews.ts:44` | `*[_id == $id][0]{ likes, views }` | `$id` | Live, used by `BlogDetail`. Goes through the CDN in production. |
| `api/blog-stats.ts:47` | `*[_id == $id][0]{likes, views}` | `$id` | GET branch. The frontend never calls GET. |

**Defined but unused (no component calls the hook)**

| Constant | Params | Hook | Note |
|---|---|---|---|
| `SCRIPTURE_QUOTES_QUERY` | none | `useScriptureQuotes` | |
| `GHAMSU_TODAY_QUERY` | none | `useGhamsuToday` | |
| `EVENT_BY_ID_QUERY` | `$id` | `useEventById` | No published check. |
| `EVENTS_BY_TYPE_QUERY` | `$eventType` | `useEvents({eventType})` | `Events.tsx` filters client-side instead. |
| `FEATURED_NEWS_QUERY` | none | `useFeaturedNews` | |
| `NEWS_BY_SLUG_QUERY` | `$slug` | `useNewsBySlug` | |
| `NEWS_BY_CATEGORY_QUERY` | `$category` | `useNews({newsCategory})` | **Bug:** the hook passes `newsCategory`, the query needs `$category`. Would fail if called. |
| `FEATURED_ARTICLES_QUERY` | none | `useFeaturedArticles` | |
| `ARTICLE_BY_SLUG_QUERY` | `$slug` | `useArticleBySlug` | |
| `ARTICLES_BY_CATEGORY_QUERY` | `$category` | `useArticles({articleCategory})` | **Same bug.** |
| `FEATURED_BLOGS_QUERY` | none | `useFeaturedBlogs` | |
| `SERMON_BY_ID_QUERY` | `$id` | `useSermonById` | |
| `TESTIMONIALS_QUERY` | none | `useTestimonials` | Requests nonexistent `university`. |
| `FEATURED_TESTIMONIALS_QUERY` | none | `useFeaturedTestimonials` | Same. |
| `TESTIMONIAL_BY_ID_QUERY` | `$id` | `useTestimonialById` | Same. |
| `GALLERY_BY_ID_QUERY` | `$id` | `useGalleryById` | |
| `EXECUTIVES_QUERY` | none | `useExecutives()` | `Contact.tsx` always passes a category. |
| `EXECUTIVE_BY_ID_QUERY` | `$id` | `useExecutiveById` | |
| `DEPARTMENTS_QUERY` | none | `useDepartments` | Dereferences `leader->{_id,name,position}`. |
| `DEPARTMENT_BY_ID_QUERY` | `$id` | `useDepartmentById` | Same. |

**Query semantics that must be reproduced:**

- `_type == "news" || _type == "article"` builds one mixed list ordered by `publishedDate desc`.
- Computed aliases: for news, `"category": "news"`, `"authorName": reporter`, `"authorLocal": reporterPosition`. For articles, `"category": articleCategory`. **Components rely on these aliases.**
- In the combined queries, news keeps its real category in `newsCategory`, while `category` is the literal `"news"`.
- `featuredImage`, `flyer` and similar are returned as raw image objects. Assets are not dereferenced, and the URL is derived from `asset._ref` (section 5).
- No query has pagination. All lists are unbounded.
- News and article queries have no published flag. Only `event` filters on one.

### 3.4 Full query and hook source

`ghamsu-frontend-new/src/lib/queries.ts`:

```ts
// ─── Scripture Quotes ──────────────────────────────────────────────────────────
export const SCRIPTURE_QUOTES_QUERY = `
  *[_type == "scriptureQuote" && active == true] | order(displayOrder asc) {
    _id,
    quoteText,
    reference
  }
`

// ─── GHAMSU Today ──────────────────────────────────────────────────────────────
export const GHAMSU_TODAY_QUERY = `
  *[_type == "ghamsuToday" && active == true] | order(date desc)[0] {
    _id,
    themeTitle,
    themeDescription,
    scriptureReference,
    happeningNow,
    laterToday,
    date
  }
`

// ─── Events ────────────────────────────────────────────────────────────────────
export const EVENTS_QUERY = `
  *[_type == "event" && published == true] | order(date asc) {
    _id,
    title,
    date,
    venue,
    flyer,
    description,
    eventType,
    registrationLink,
    published
  }
`

export const EVENT_BY_ID_QUERY = `
  *[_type == "event" && _id == $id][0] {
    _id,
    title,
    date,
    venue,
    flyer,
    description,
    eventType,
    registrationLink,
    published
  }
`

export const EVENTS_BY_TYPE_QUERY = `
  *[_type == "event" && published == true && eventType == $eventType] | order(date asc) {
    _id,
    title,
    date,
    venue,
    flyer,
    description,
    eventType,
    registrationLink,
    published
  }
`

// ─── News ──────────────────────────────────────────────────────────────────────
export const NEWS_QUERY = `
  *[_type == "news"] | order(publishedDate desc) {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    newsCategory,
    publishedDate,
    featured,
    likes,
    views,
    reporter,
    reporterPosition,
    "category": "news",
    "authorName": reporter,
    "authorLocal": reporterPosition
  }
`

export const FEATURED_NEWS_QUERY = `
  *[_type == "news" && featured == true] | order(publishedDate desc)[0...3] {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    newsCategory,
    publishedDate,
    featured,
    likes,
    views,
    reporter,
    reporterPosition,
    "category": "news",
    "authorName": reporter,
    "authorLocal": reporterPosition
  }
`

export const NEWS_BY_SLUG_QUERY = `
  *[_type == "news" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    content,
    newsCategory,
    publishedDate,
    featured,
    likes,
    views,
    reporter,
    reporterPosition,
    "category": "news",
    "authorName": reporter,
    "authorLocal": reporterPosition
  }
`

export const NEWS_BY_CATEGORY_QUERY = `
  *[_type == "news" && newsCategory == $category] | order(publishedDate desc) {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    newsCategory,
    publishedDate,
    featured,
    likes,
    views,
    reporter,
    reporterPosition,
    "category": "news",
    "authorName": reporter,
    "authorLocal": reporterPosition
  }
`

// ─── Articles ──────────────────────────────────────────────────────────────────
export const ARTICLES_QUERY = `
  *[_type == "article"] | order(publishedDate desc) {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    articleCategory,
    publishedDate,
    readTime,
    featured,
    likes,
    views,
    authorName,
    authorLocal,
    "category": articleCategory
  }
`

export const FEATURED_ARTICLES_QUERY = `
  *[_type == "article" && featured == true] | order(publishedDate desc)[0...3] {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    articleCategory,
    publishedDate,
    readTime,
    featured,
    likes,
    views,
    authorName,
    authorLocal,
    "category": articleCategory
  }
`

export const ARTICLE_BY_SLUG_QUERY = `
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    content,
    articleCategory,
    publishedDate,
    readTime,
    featured,
    likes,
    views,
    authorName,
    authorLocal,
    "category": articleCategory
  }
`

export const ARTICLES_BY_CATEGORY_QUERY = `
  *[_type == "article" && articleCategory == $category] | order(publishedDate desc) {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    articleCategory,
    publishedDate,
    readTime,
    featured,
    likes,
    views,
    authorName,
    authorLocal,
    "category": articleCategory
  }
`

// ─── Combined Blogs (News + Articles) ──────────────────────────────────────────
export const BLOGS_QUERY = `
  *[_type == "news" || _type == "article"] | order(publishedDate desc) {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    publishedDate,
    featured,
    likes,
    views,
    _type == "news" => {
      "newsCategory": newsCategory,
      "reporter": reporter,
      "reporterPosition": reporterPosition,
      "category": "news",
      "authorName": reporter,
      "authorLocal": reporterPosition
    },
    _type == "article" => {
      "articleCategory": articleCategory,
      "authorName": authorName,
      "authorLocal": authorLocal,
      "category": articleCategory,
      "readTime": readTime
    }
  }
`

export const FEATURED_BLOGS_QUERY = `
  *[(_type == "news" || _type == "article") && featured == true] | order(publishedDate desc)[0...3] {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    publishedDate,
    featured,
    likes,
    views,
    _type == "news" => {
      "newsCategory": newsCategory,
      "reporter": reporter,
      "reporterPosition": reporterPosition,
      "category": "news",
      "authorName": reporter,
      "authorLocal": reporterPosition
    },
    _type == "article" => {
      "articleCategory": articleCategory,
      "authorName": authorName,
      "authorLocal": authorLocal,
      "category": articleCategory,
      "readTime": readTime
    }
  }
`

export const BLOG_BY_SLUG_QUERY = `
  *[(_type == "news" || _type == "article") && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    content,
    publishedDate,
    featured,
    likes,
    views,
    _type == "news" => {
      "newsCategory": newsCategory,
      "reporter": reporter,
      "reporterPosition": reporterPosition,
      "category": "news",
      "authorName": reporter,
      "authorLocal": reporterPosition
    },
    _type == "article" => {
      "articleCategory": articleCategory,
      "authorName": authorName,
      "authorLocal": authorLocal,
      "category": articleCategory,
      "readTime": readTime
    }
  }
`

export const BLOGS_BY_CATEGORY_QUERY = `
  *[(_type == "news" || _type == "article") && (newsCategory == $category || articleCategory == $category)] | order(publishedDate desc) {
    _id,
    _type,
    title,
    slug,
    featuredImage,
    excerpt,
    publishedDate,
    featured,
    likes,
    views,
    _type == "news" => {
      "newsCategory": newsCategory,
      "reporter": reporter,
      "reporterPosition": reporterPosition,
      "category": "news",
      "authorName": reporter,
      "authorLocal": reporterPosition
    },
    _type == "article" => {
      "articleCategory": articleCategory,
      "authorName": authorName,
      "authorLocal": authorLocal,
      "category": articleCategory,
      "readTime": readTime
    }
  }
`

// ─── Sermons ───────────────────────────────────────────────────────────────────
export const SERMONS_QUERY = `
  *[_type == "sermon"] | order(date desc) {
    _id,
    title,
    preacher,
    date,
    mediaType,
    videoUrl,
    audioUrl,
    thumbnail,
    scriptureReference,
    description,
    series,
    duration
  }
`

export const SERMON_BY_ID_QUERY = `
  *[_type == "sermon" && _id == $id][0] {
    _id,
    title,
    preacher,
    date,
    mediaType,
    videoUrl,
    audioUrl,
    thumbnail,
    scriptureReference,
    description,
    series,
    duration
  }
`

export const SERMONS_BY_TYPE_QUERY = `
  *[_type == "sermon" && mediaType == $mediaType] | order(date desc) {
    _id,
    title,
    preacher,
    date,
    mediaType,
    videoUrl,
    audioUrl,
    thumbnail,
    scriptureReference,
    description,
    series,
    duration
  }
`

// ─── Testimonials ──────────────────────────────────────────────────────────────
export const TESTIMONIALS_QUERY = `
  *[_type == "testimonial"] | order(date desc) {
    _id,
    name,
    photo,
    role,
    local,
    university,
    testimony,
    rating,
    date,
    featured
  }
`

export const FEATURED_TESTIMONIALS_QUERY = `
  *[_type == "testimonial" && featured == true] | order(date desc) {
    _id,
    name,
    photo,
    role,
    local,
    university,
    testimony,
    rating,
    date,
    featured
  }
`

export const TESTIMONIAL_BY_ID_QUERY = `
  *[_type == "testimonial" && _id == $id][0] {
    _id,
    name,
    photo,
    role,
    local,
    university,
    testimony,
    rating,
    date,
    featured
  }
`

// ─── Gallery ───────────────────────────────────────────────────────────────────
export const GALLERY_QUERY = `
  *[_type == "gallery"] | order(date desc) {
    _id,
    title,
    description,
    coverImage,
    photoCount,
    date,
    link,
    category
  }
`

export const GALLERY_BY_CATEGORY_QUERY = `
  *[_type == "gallery" && category == $category] | order(date desc) {
    _id,
    title,
    description,
    coverImage,
    photoCount,
    date,
    link,
    category
  }
`

export const GALLERY_BY_ID_QUERY = `
  *[_type == "gallery" && _id == $id][0] {
    _id,
    title,
    description,
    coverImage,
    photoCount,
    date,
    link,
    category
  }
`

// ─── Executives ────────────────────────────────────────────────────────────────
export const EXECUTIVES_QUERY = `
  *[_type == "executive"] | order(order asc) {
    _id,
    name,
    position,
    image,
    phone,
    email,
    whatsapp,
    order,
    category,
    bio
  }
`

export const EXECUTIVE_BY_ID_QUERY = `
  *[_type == "executive" && _id == $id][0] {
    _id,
    name,
    position,
    image,
    phone,
    email,
    whatsapp,
    order,
    category,
    bio
  }
`

export const EXECUTIVES_BY_CATEGORY_QUERY = `
  *[_type == "executive" && category == $category] | order(order asc) {
    _id,
    name,
    position,
    image,
    phone,
    email,
    whatsapp,
    order,
    category,
    bio
  }
`

// ─── Departments ───────────────────────────────────────────────────────────────
export const DEPARTMENTS_QUERY = `
  *[_type == "department"] {
    _id,
    name,
    image,
    description,
    leader->{
      _id,
      name,
      position
    },
    activities,
    color
  }
`

export const DEPARTMENT_BY_ID_QUERY = `
  *[_type == "department" && _id == $id][0] {
    _id,
    name,
    image,
    description,
    leader->{
      _id,
      name,
      position
    },
    activities,
    color
  }
`
```

`ghamsu-frontend-new/src/lib/hooks.ts`:

```ts
import { useState, useEffect } from 'react'
import { sanityClient } from './sanity'
import {
  SCRIPTURE_QUOTES_QUERY,
  GHAMSU_TODAY_QUERY,
  EVENTS_QUERY,
  EVENTS_BY_TYPE_QUERY,
  EVENT_BY_ID_QUERY,
  NEWS_QUERY,
  FEATURED_NEWS_QUERY,
  NEWS_BY_SLUG_QUERY,
  NEWS_BY_CATEGORY_QUERY,
  ARTICLES_QUERY,
  FEATURED_ARTICLES_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  ARTICLES_BY_CATEGORY_QUERY,
  BLOGS_QUERY,
  FEATURED_BLOGS_QUERY,
  BLOG_BY_SLUG_QUERY,
  BLOGS_BY_CATEGORY_QUERY,
  SERMONS_QUERY,
  SERMONS_BY_TYPE_QUERY,
  SERMON_BY_ID_QUERY,
  TESTIMONIALS_QUERY,
  FEATURED_TESTIMONIALS_QUERY,
  TESTIMONIAL_BY_ID_QUERY,
  GALLERY_QUERY,
  GALLERY_BY_CATEGORY_QUERY,
  GALLERY_BY_ID_QUERY,
  EXECUTIVES_QUERY,
  EXECUTIVE_BY_ID_QUERY,
  EXECUTIVES_BY_CATEGORY_QUERY,
  DEPARTMENTS_QUERY,
  DEPARTMENT_BY_ID_QUERY,
} from './queries'
import type {
  ScriptureQuote,
  GhamsuToday,
  Event,
  News,
  Article,
  Blog,
  Sermon,
  Testimonial,
  GalleryItem,
  Executive,
  Department,
  SanityFetchState,
} from '../types/types'

// ─── Generic fetcher hook ──────────────────────────────────────────────────────
function useSanityData<T>(query: string, params?: Record<string, unknown>): SanityFetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    sanityClient
      .fetch<T>(query, params || {})
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [query, JSON.stringify(params)])

  return { data, loading, error }
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Scripture Quotes ──────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useScriptureQuotes(): SanityFetchState<ScriptureQuote[]> {
  return useSanityData<ScriptureQuote[]>(SCRIPTURE_QUOTES_QUERY)
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── GHAMSU Today ──────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useGhamsuToday(): SanityFetchState<GhamsuToday> {
  return useSanityData<GhamsuToday>(GHAMSU_TODAY_QUERY)
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Events ────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useEvents(filters?: { eventType?: string }): SanityFetchState<Event[]> {
  const query = filters?.eventType ? EVENTS_BY_TYPE_QUERY : EVENTS_QUERY
  return useSanityData<Event[]>(query, filters)
}

export function useEventById(id: string): SanityFetchState<Event | null> {
  return useSanityData<Event | null>(EVENT_BY_ID_QUERY, { id })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── News (Separate) ───────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useNews(filters?: { newsCategory?: string }): SanityFetchState<News[]> {
  const query = filters?.newsCategory ? NEWS_BY_CATEGORY_QUERY : NEWS_QUERY
  return useSanityData<News[]>(query, filters)
}

export function useFeaturedNews(): SanityFetchState<News[]> {
  return useSanityData<News[]>(FEATURED_NEWS_QUERY)
}

export function useNewsBySlug(slug: string): SanityFetchState<News | null> {
  return useSanityData<News | null>(NEWS_BY_SLUG_QUERY, { slug })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Articles (Separate) ───────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useArticles(filters?: { articleCategory?: string }): SanityFetchState<Article[]> {
  const query = filters?.articleCategory ? ARTICLES_BY_CATEGORY_QUERY : ARTICLES_QUERY
  return useSanityData<Article[]>(query, filters)
}

export function useFeaturedArticles(): SanityFetchState<Article[]> {
  return useSanityData<Article[]>(FEATURED_ARTICLES_QUERY)
}

export function useArticleBySlug(slug: string): SanityFetchState<Article | null> {
  return useSanityData<Article | null>(ARTICLE_BY_SLUG_QUERY, { slug })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Blogs (Combined News + Articles) ──────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useBlogs(filters?: { category?: string }): SanityFetchState<Blog[]> {
  const query = filters?.category ? BLOGS_BY_CATEGORY_QUERY : BLOGS_QUERY
  return useSanityData<Blog[]>(query, filters)
}

export function useFeaturedBlogs(): SanityFetchState<Blog[]> {
  return useSanityData<Blog[]>(FEATURED_BLOGS_QUERY)
}

export function useBlogBySlug(slug: string): SanityFetchState<Blog | null> {
  return useSanityData<Blog | null>(BLOG_BY_SLUG_QUERY, { slug })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Sermons ───────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useSermons(filters?: { mediaType?: string }): SanityFetchState<Sermon[]> {
  const query = filters?.mediaType ? SERMONS_BY_TYPE_QUERY : SERMONS_QUERY
  return useSanityData<Sermon[]>(query, filters)
}

export function useSermonById(id: string): SanityFetchState<Sermon | null> {
  return useSanityData<Sermon | null>(SERMON_BY_ID_QUERY, { id })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Testimonials ──────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useTestimonials(): SanityFetchState<Testimonial[]> {
  return useSanityData<Testimonial[]>(TESTIMONIALS_QUERY)
}

export function useFeaturedTestimonials(): SanityFetchState<Testimonial[]> {
  return useSanityData<Testimonial[]>(FEATURED_TESTIMONIALS_QUERY)
}

export function useTestimonialById(id: string): SanityFetchState<Testimonial | null> {
  return useSanityData<Testimonial | null>(TESTIMONIAL_BY_ID_QUERY, { id })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Gallery ───────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useGallery(filters?: { category?: string }): SanityFetchState<GalleryItem[]> {
  const query = filters?.category ? GALLERY_BY_CATEGORY_QUERY : GALLERY_QUERY
  return useSanityData<GalleryItem[]>(query, filters)
}

export function useGalleryById(id: string): SanityFetchState<GalleryItem | null> {
  return useSanityData<GalleryItem | null>(GALLERY_BY_ID_QUERY, { id })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Executives ────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useExecutives(filters?: { category?: string }): SanityFetchState<Executive[]> {
  const query = filters?.category ? EXECUTIVES_BY_CATEGORY_QUERY : EXECUTIVES_QUERY
  return useSanityData<Executive[]>(query, filters)
}

export function useExecutiveById(id: string): SanityFetchState<Executive | null> {
  return useSanityData<Executive | null>(EXECUTIVE_BY_ID_QUERY, { id })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Departments ───────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

export function useDepartments(): SanityFetchState<Department[]> {
  return useSanityData<Department[]>(DEPARTMENTS_QUERY)
}

export function useDepartmentById(id: string): SanityFetchState<Department | null> {
  return useSanityData<Department | null>(DEPARTMENT_BY_ID_QUERY, { id })
}
```

`ghamsu-frontend-new/src/lib/useLikesAndViews.ts`:

```ts
import { useState, useEffect } from 'react'
import { sanityClient } from './sanity'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LikesAndViews {
  likes: number
  views: number
  isLiking: boolean
  hasLiked: boolean
  error: string | null
  addLike: () => Promise<void>
  addView: () => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useLikesAndViews(documentId: string): LikesAndViews {
  const [likes,     setLikes]     = useState<number>(0)
  const [views,     setViews]     = useState<number>(0)
  const [isLiking,  setIsLiking]  = useState(false)
  const [hasLiked,  setHasLiked]  = useState(false)
  const [hasViewed, setHasViewed] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  // ── Restore liked state from localStorage ───────────────────────────────
  useEffect(() => {
    if (!documentId) return
    const liked = localStorage.getItem(`liked_${documentId}`)
    if (liked === 'true') setHasLiked(true)
  }, [documentId])

  // ── Fetch initial likes & views via GROQ (replaces broken GraphQL) ──────
  useEffect(() => {
    if (!documentId) return

    const fetchStats = async () => {
      try {
        const data = await sanityClient.fetch<{ likes: number; views: number }>(
          `*[_id == $id][0]{ likes, views }`,
          { id: documentId }
        )
        if (data) {
          setLikes(data.likes ?? 0)
          setViews(data.views ?? 0)
        }
      } catch (err) {
        console.error('[useLikesAndViews] Failed to fetch stats:', err)
      }
    }

    fetchStats()
  }, [documentId])

  // ── Auto-increment view once per session ────────────────────────────────
  useEffect(() => {
    if (!hasViewed && documentId) {
      addView()
      setHasViewed(true)
    }
  }, [documentId])

  // ── Add like ─────────────────────────────────────────────────────────────
  const addLike = async () => {
    if (isLiking || hasLiked) return

    setIsLiking(true)
    setError(null)

    // Optimistic update — feels instant
    setLikes((prev) => prev + 1)
    setHasLiked(true)
    localStorage.setItem(`liked_${documentId}`, 'true')

    try {
      const response = await fetch('/api/blog-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: documentId, action: 'like' }),
      })

      if (!response.ok) throw new Error('Failed to add like')

      const data = await response.json()
      setLikes(data.likes)
    } catch (err) {
      console.error('[useLikesAndViews] Error adding like:', err)
      // Roll back optimistic update
      setLikes((prev) => prev - 1)
      setHasLiked(false)
      localStorage.removeItem(`liked_${documentId}`)
      setError('Failed to add like')
    } finally {
      setIsLiking(false)
    }
  }

  // ── Add view ─────────────────────────────────────────────────────────────
  const addView = async () => {
    try {
      const response = await fetch('/api/blog-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: documentId, action: 'view' }),
      })

      if (!response.ok) throw new Error('Failed to add view')

      const data = await response.json()
      setViews(data.views)
    } catch (err) {
      console.error('[useLikesAndViews] Error adding view:', err)
      // Not user-facing — fail silently
    }
  }

  return {
    likes,
    views,
    isLiking,
    hasLiked,
    error,
    addLike,
    addView,
  }
}
```

### 3.5 Caching, revalidation, preview, webhooks

| Feature | Status |
|---|---|
| ISR, `revalidate`, `revalidateTag`, `revalidatePath` | None. Not applicable to this stack. |
| `fetch` cache options | None. |
| HTTP caching | Sanity API CDN in production only (`useCdn`). Content updates appear after CDN propagation, with no action from the site. |
| Draft mode, preview | None. `perspective: 'published'` is forced. |
| Webhook routes called by Sanity | None. |
| Live or listener subscriptions | None. |
| Client-side cache libraries (React Query, SWR) | None. |

### 3.6 `generateStaticParams` / `getStaticPaths`

Not applicable. Dynamic routes resolve at runtime in the browser. `vite-plugin-sitemap` lists only 9 static routes, so **blog and board detail URLs are absent from the sitemap**.

---

## 4. PAGES AND ROUTES

Every page is client-rendered and lazy-loaded inside one `Layout` (`Navigation`, `Footer`, `ScrollToTop`, `BackToTop`, `PageLoader`). Rendering mode for all pages: **CSR**. Nothing is static, SSR or ISR. Vercel rewrites all paths to `index.html`. Route order places `*` before the slug routes, and React Router ranks by specificity, so this works.

| Path | File (`ghamsu-frontend-new/src/app/`) | Content shown | Sanity queries | CMS-driven? |
|---|---|---|---|---|
| `/` | `pages/Home.tsx` | Hero slides, service cards, about, history, previews, boards, stats | `NEWS_QUERY`, `ARTICLES_QUERY`, `EVENTS_QUERY` via child components | Partly |
| `/about` | `pages/About.tsx` | History, mission, vision, values, motto, aims, structure | none | **Hardcoded** |
| `/events` | `pages/Events.tsx` | Event grid with client-side type filter and stats | `EVENTS_QUERY` | Yes, except hero |
| `/blogs` | `pages/Blogs.tsx` | Mixed news and article grid, type and category filters | `BLOGS_QUERY`, `BLOGS_BY_CATEGORY_QUERY` | Yes, except hero |
| `/blogs/:slug` | `pages/BlogDetail.tsx` | Post with likes, views and share | `BLOG_BY_SLUG_QUERY`, `*[_id == $id][0]{likes, views}`, POST `/api/blog-stats` | Yes |
| `/sermons` | `pages/Sermons.tsx` | Sermon grid with media type filter and stats | `SERMONS_QUERY`, `SERMONS_BY_TYPE_QUERY` | Yes, except hero |
| `/boards` | `pages/Boards.tsx` | Six boards and three major activities | none | **Hardcoded** |
| `/boards/:slug` | `pages/BoardDetail.tsx` | Board vision, responsibilities, activities | none | **Hardcoded** |
| `/gallery` | `pages/Gallery.tsx` | Album cards linking to external albums | `GALLERY_QUERY`, `GALLERY_BY_CATEGORY_QUERY` | Yes, except hero |
| `/contact` | `pages/Contact.tsx` | Contact form, coordinator profile, executive directory | `EXECUTIVES_BY_CATEGORY_QUERY` | Partly |
| `/partner` | `pages/Partner.tsx` | Giving options, bank details, non-functional form | none | **Hardcoded** |
| `*` | `pages/Notfound.tsx` | 404 | none | Hardcoded |

**API routes**

| Path | File | Methods | Purpose |
|---|---|---|---|
| `/api/blog-stats` | `ghamsu-frontend-new/api/blog-stats.ts` | GET, POST, OPTIONS | Read or increment `likes` and `views`. Vercel serverless function. |

Not served by plain `vite dev`, so likes and views need `vercel dev` or fail locally. No Vite proxy exists.

**Home page data sections:**

| Component | Data | Behaviour to preserve |
|---|---|---|
| `FloatingServiceCards` | news, articles, events, plus external OurManna API | "Today's News" is the newest news item. "Article of the Day" picks deterministically from the date string (`seed % articles.length`). "Upcoming Program" is the first event within the next 3 days. Scripture comes from `beta.ourmanna.com` with a John 3:16 fallback, **not** from `scriptureQuote`. |
| `BlogPreviewSection` | news, articles | Newest 1 news plus newest 2 articles. Ignores `featured`. |
| `UpcomingEvents` | events | First 5 events by `date asc`. **Does not filter out past events**, despite its title. |

**The `featured` field is not used by any live query or component.**

`ghamsu-frontend-new/src/app/routes.tsx`:

```tsx
import { createBrowserRouter, Outlet, useNavigation } from 'react-router';
import { lazy, Suspense } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { BackToTop } from './components/BackToTop';
import { PageLoader } from './components/PageLoader';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Events = lazy(() => import('./pages/Events'));
const Blogs = lazy(() => import('./pages/Blogs'));
const Sermons = lazy(() => import('./pages/Sermons'));
const Boards = lazy(() => import('./pages/Boards'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Partner = lazy(() => import('./pages/Partner'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const BoardDetail = lazy(() => import('./pages/BoardDetail'));
const Notfound = lazy(() => import('./pages/Notfound'));

function Layout() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';

  return (
    <div className="min-h-screen bg-background">
      <PageLoader show={isLoading} />
      <ScrollToTop />
      <Navigation />
      <main>
        <Suspense fallback={<PageLoader show={true} />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'events', Component: Events },
      { path: 'blogs', Component: Blogs },
      { path: 'sermons', Component: Sermons },
      { path: 'boards', Component: Boards },
      { path: 'gallery', Component: Gallery },
      { path: 'contact', Component: Contact },
      { path: 'partner', Component: Partner },
      { path: '*', Component: Notfound },
      { path: 'blogs/:slug', Component: BlogDetail },

      { path: 'boards/:slug', Component: BoardDetail }
    ],
  },
]);
```

---

## 5. RENDERING SANITY CONTENT

### 5.1 Image handling

Helpers live in `src/lib/sanity.ts` using `createImageUrlBuilder` from `@sanity/image-url`:

```ts
// ─── Image URL Builder ─────────────────────────────────────────────────────────
const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ─── Typed helpers ─────────────────────────────────────────────────────────────
export function imageUrl(
  source: SanityImageSource,
  width?: number,
  height?: number
): string {
  let img = urlFor(source).auto('format').fit('crop')
  if (width) img = img.width(width)
  if (height) img = img.height(height)
  return img.url()
}
```

`urlFor` is the one in use. **`imageUrl` is exported but not imported by the current site.**

Assets are referenced as `image-<assetId>-<width>x<height>-<ext>`, and the builder turns that into `https://cdn.sanity.io/images/rgbuxwes/production/<assetId>-<width>x<height>.<ext>?...`. All images render through plain `<img>` tags, mostly with CSS `object-cover`.

| File | Image | Transformation |
|---|---|---|
| `pages/BlogDetail.tsx:365` | `featuredImage` | `.width(800)` |
| `pages/BlogDetail.tsx:307` | inline content image | `.width(800)` |
| `pages/Blogs.tsx:171` | `featuredImage` | `.width(600).height(300)` |
| `components/BlogPreviewSection.tsx:189` | `featuredImage` | `.width(600).height(300)` |
| `components/FloatingServiceCards.tsx:107,118` | `featuredImage` | `.width(200).height(200)` |
| `pages/Events.tsx:113` | `flyer` | `.width(600).height(300)` |
| `components/UpcomingEvents.tsx:76` | `flyer` | `.width(400).height(300)` |
| `pages/Sermons.tsx:107` | `thumbnail` | `.width(600).height(300)` |
| `pages/Gallery.tsx:94` | `coverImage` | `.width(600).height(600)` |
| `pages/Contact.tsx:435` | `image` | `.width(400).height(500)` |

- **Format:** no call uses `.auto('format')`, so images are served in their original format.
- **Hotspot and crop:** the full image object is passed to the builder, which applies `crop` and `hotspot` when calculating the rect. Live use is minimal: 1 of 22 document images has either (1 executive has both).
- **`next/image`, `remotePatterns`:** not applicable. There is no image allowlist or CSP in this project.
- **`index.html`:** `og:image` and the favicon point at `/src/images/logo.png`, with no per-post social images.
- **Non-Sanity images:** site imagery comes from local `src/images/*` imports and hardcoded external URLs (6 from `lh3.googleusercontent.com`, 8 from `images.unsplash.com`, 1 from `i.pinimg.com`). Those URLs are outside this migration's scope but may be fragile, especially the Google Photos ones.

### 5.2 Portable Text rendering (current, defective)

**Fact:** the current site does **not** use `@portabletext/react`. There is no separate serializer file. `renderContent()` inside `BlogDetail.tsx` loops over blocks manually (lines 275-331).

| Input | Live behaviour |
|---|---|
| `normal` paragraph | `<div class="mb-6">` with spans. |
| `h1` to `h6` | **Rendered as a plain `<div>`.** The first `if (block._type === 'block')` returns before the heading branch, so that branch is unreachable. It would also crash, since `React` is not imported in this file. |
| `blockquote` | Plain `<div>`, no quote styling. |
| Bullet and number lists | **Rendered as plain `<div>`s.** The list branches are unreachable for the same reason. Even if reached, each item would become its own `<ul>`. |
| `strong`, `em`, `code` | Rendered, but only **one mark per span** (priority strong, em, code). Bold italic loses one. |
| `underline`, `strike-through` | Ignored. |
| `link` annotation | **Ignored. The link is lost and only the text shows.** `markDefs` is never read. |
| Inline image | Rendered with `urlFor(block).width(800)`, `alt` fallback `'Blog image'`, and `caption` as `figcaption`. |

The live `news` and `article` posts use only paragraphs and `em`, so nobody notices today. The `blog` posts use `h3` and bullets, so **displaying them would require fixing rendering**.

The `prose` class is present on the wrapper, but no typography plugin is installed in `package.json`.

The full `BlogDetail.tsx` follows, including the media player, which handles YouTube, Vimeo, Facebook, SoundCloud, Spotify and direct files:

`ghamsu-frontend-new/src/app/pages/BlogDetail.tsx`:

```tsx
import { useParams, useNavigate } from 'react-router'
import { Calendar, User, ArrowLeft, Heart, Eye, Share2, Play, Music } from 'lucide-react'
import { AnimatedSection } from '../components/AnimatedSection'
import { useBlogBySlug } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'
import { useLikesAndViews } from '../../../src/lib/useLikesAndViews'
import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MediaAttachment {
  mediaType: 'video' | 'audio'
  label: string
  url: string
  description?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Share Helper
// ─────────────────────────────────────────────────────────────────────────────

async function sharePost(title: string) {
  const url = window.location.href
  if (navigator.share) {
    try { await navigator.share({ title, url }) } catch {}
    return
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    return 'copied'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Media URL helpers
// ─────────────────────────────────────────────────────────────────────────────

function getEmbedUrl(url: string, type: 'video' | 'audio'): string | null {
  try {
    const u = new URL(url)

    if (type === 'video') {
      // YouTube
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        const id = u.hostname.includes('youtu.be')
          ? u.pathname.slice(1)
          : u.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
      // Vimeo
      if (u.hostname.includes('vimeo.com')) {
        const id = u.pathname.split('/').filter(Boolean).pop()
        return id ? `https://player.vimeo.com/video/${id}` : null
      }
      // Facebook
      if (u.hostname.includes('facebook.com') || u.hostname.includes('fb.watch')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`
      }
    }

    if (type === 'audio') {
      // SoundCloud
      if (u.hostname.includes('soundcloud.com')) {
        return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f97316&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`
      }
      // Spotify
      if (u.hostname.includes('spotify.com')) {
        const path = u.pathname
          .replace('/episode/', '/embed/episode/')
          .replace('/track/', '/embed/track/')
        return `https://open.spotify.com${path}`
      }
    }

    // Direct file URL — return as-is for native player
    return url
  } catch {
    return null
  }
}

function isDirectMediaUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mp3|wav|m4a|aac)(\?.*)?$/i.test(url)
}

// ─────────────────────────────────────────────────────────────────────────────
// Media Player
// ─────────────────────────────────────────────────────────────────────────────

function MediaPlayer({ item }: { item: MediaAttachment }) {
  const embedUrl  = getEmbedUrl(item.url, item.mediaType)
  const isDirect  = isDirectMediaUrl(item.url)
  const isVideo   = item.mediaType === 'video'

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border bg-secondary/40 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
          isVideo
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400'
        }`}>
          {isVideo
            ? <Play  className="h-4 w-4 fill-current" aria-hidden="true" />
            : <Music className="h-4 w-4"              aria-hidden="true" />
          }
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground text-sm sm:text-base">{item.label}</p>
          {item.description && (
            <p className="truncate text-xs text-muted-foreground mt-0.5">{item.description}</p>
          )}
        </div>

        <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          isVideo
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
        }`}>
          {item.mediaType}
        </span>
      </div>

      {/* Player body */}
      <div className="p-4 sm:p-5">
        {isVideo && (
          isDirect ? (
            <video controls className="w-full rounded-xl" style={{ maxHeight: 420 }} src={item.url}>
              Your browser does not support the video tag.
            </video>
          ) : embedUrl ? (
            <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
                title={item.label}
              />
            </div>
          ) : (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Play className="h-4 w-4 fill-white" /> Watch Video
            </a>
          )
        )}

        {!isVideo && (
          isDirect ? (
            <audio controls className="w-full" src={item.url}>
              Your browser does not support the audio element.
            </audio>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full rounded-xl"
              height={item.url.includes('soundcloud') ? 166 : 152}
              allow="autoplay"
              loading="lazy"
              title={item.label}
            />
          ) : (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
              <Music className="h-4 w-4" /> Listen to Audio
            </a>
          )
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BlogDetail() {
  const { slug }     = useParams<{ slug?: string }>()
  const navigate     = useNavigate()
  const [copyToast, setCopyToast] = useState(false)

  const handleShare = async (title: string) => {
    const result = await sharePost(title)
    if (result === 'copied') {
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 2500)
    }
  }

  // ── Guards ───────────────────────────────────────────────────────────────

  if (!slug) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate('/blogs')} className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </button>
          <div className="text-center">
            <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Invalid Blog</h1>
            <p className="text-muted-foreground">No blog slug provided.</p>
          </div>
        </div>
      </div>
    )
  }

  const { data: blog, loading, error } = useBlogBySlug(slug)
  const { likes, views, isLiking, hasLiked, addLike } = useLikesAndViews(blog?._id || '')

  if (error) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate('/blogs')} className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </button>
          <div className="text-center">
            <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Error Loading Blog</h1>
            <p className="text-red-500">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate('/blogs')} className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </button>
          <div className="text-center">
            <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Blog Post Not Found</h1>
            <p className="text-muted-foreground">The blog post you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const isNews      = blog.category === 'news' || blog._type === 'news'
  const contentType = isNews ? 'News' : 'Article'
  const authorLabel = isNews ? 'Reporter' : 'Author'
  const mediaAttachments: MediaAttachment[] = blog.mediaAttachments ?? []

  // ── Content renderer ─────────────────────────────────────────────────────

  const renderContent = () => {
    if (!blog.content || !Array.isArray(blog.content)) {
      return <p className="text-muted-foreground">No content available for this post.</p>
    }

    return blog.content.map((block: any, idx: number) => {
      if (block._type === 'block') {
        return (
          <div key={idx} className="mb-6">
            {block.children?.map((child: any, childIdx: number) => {
              const text = child.text
              let element = <span key={childIdx}>{text}</span>
              if (child.marks?.includes('strong'))      element = <strong key={childIdx} className="font-semibold">{text}</strong>
              else if (child.marks?.includes('em'))     element = <em key={childIdx} className="italic">{text}</em>
              else if (child.marks?.includes('code'))   element = <code key={childIdx} className="bg-secondary/50 px-2 py-1 rounded font-mono text-sm">{text}</code>
              return element
            })}
          </div>
        )
      }

      if (block._type === 'block' && block.style?.startsWith('h')) {
        const level = block.style.charAt(1)
        return React.createElement(`h${level}`, {
          key: idx,
          className: `text-${level === '1' ? '3xl' : level === '2' ? '2xl' : 'xl'} font-bold mt-8 mb-4`
        }, block.children?.map((child: any) => child.text).join(''))
      }

      if (block._type === 'image') {
        return (
          <figure key={idx} className="my-12">
            <img src={urlFor(block).width(800).url()} alt={block.alt || 'Blog image'} className="w-full rounded-lg" />
            {block.caption && <figcaption className="text-center text-sm text-muted-foreground mt-4 italic">{block.caption}</figcaption>}
          </figure>
        )
      }

      if (block.listItem === 'bullet') {
        return (
          <ul key={idx} className="list-disc list-inside mb-6 space-y-2">
            <li>{block.children?.map((child: any) => child.text).join('')}</li>
          </ul>
        )
      }

      if (block.listItem === 'number') {
        return (
          <ol key={idx} className="list-decimal list-inside mb-6 space-y-2">
            <li>{block.children?.map((child: any) => child.text).join('')}</li>
          </ol>
        )
      }

      return null
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="pt-32 pb-24">

      {/* Toast */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg">
          🔗 Link copied to clipboard
        </div>
      )}

      {/* Back */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <button onClick={() => navigate('/blogs')} className="flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* Article */}
      <article className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>

            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="relative">
                <img
                  src={urlFor(blog.featuredImage).width(800).url()}
                  alt={blog.title}
                  className="w-full h-96 object-cover rounded-lg mb-8 sm:mb-10 md:mb-12"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm">
                    <Eye className="w-4 h-4" /><span>{views}</span>
                  </div>
                  <button
                    onClick={addLike}
                    disabled={isLiking || hasLiked}
                    aria-label={hasLiked ? 'You liked this post' : 'Like this post'}
                    className={`flex items-center gap-2 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm transition-all duration-200 disabled:opacity-60 ${hasLiked ? 'bg-red-500/80 scale-105' : 'bg-black/50 hover:bg-red-500/70 active:scale-95'}`}
                  >
                    <Heart className={`w-4 h-4 transition-all duration-200 ${hasLiked ? 'fill-white' : ''}`} />
                    <span>{likes}</span>
                  </button>
                  <button
                    onClick={() => handleShare(blog.title)}
                    aria-label="Share this post"
                    className="flex items-center gap-2 bg-black/50 hover:bg-blue-500/70 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm transition-all duration-200 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              {blog.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground mb-8 pb-8 border-b flex-wrap">
              <span className={`inline-block px-3 py-1 rounded text-xs sm:text-sm font-medium ${isNews ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'}`}>
                {contentType}
              </span>
              {blog.authorName && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm sm:text-base">{blog.authorName}</span>
                    <span className="text-xs text-muted-foreground">{authorLabel}</span>
                    {blog.authorLocal && <span className="text-xs text-muted-foreground">{blog.authorLocal}</span>}
                  </div>
                </div>
              )}
              {blog.publishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">
                    {new Date(blog.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              {blog.readTime && <span className="text-xs sm:text-sm">⏱️ {blog.readTime} min read</span>}
              {blog.category && blog.category !== 'news' && (
                <span className="bg-accent text-accent-foreground px-3 py-1 rounded text-xs sm:text-sm capitalize inline-block">
                  {blog.category.replace('-', ' ')}
                </span>
              )}
            </div>

            {/* Excerpt */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 leading-relaxed italic border-l-4 border-accent pl-4">
              {blog.excerpt}
            </p>

            {/* Body content */}
            <div className="prose prose-lg max-w-none mb-12 sm:mb-16 text-base sm:text-lg leading-relaxed text-foreground space-y-6">
              {renderContent()}
            </div>

            {/* ── Media Attachments ── */}
            {mediaAttachments.length > 0 && (
              <div className="mb-12 sm:mb-16">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2">
                    📎 Media
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-4">
                  {mediaAttachments.map((item, idx) => (
                    <MediaPlayer key={idx} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Stats + Share */}
            {(likes !== undefined || views !== undefined) && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-8 border-t border-b my-8 sm:my-10">
                <div className="flex gap-8">
                  {likes !== undefined && (
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-accent">{likes}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">👍 Likes</p>
                    </div>
                  )}
                  {views !== undefined && (
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-accent">{views}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">👁️ Views</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={addLike}
                    disabled={isLiking || hasLiked}
                    aria-label={hasLiked ? 'Already liked' : 'Like this post'}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border disabled:opacity-60 ${hasLiked ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/30' : 'border-border hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95'}`}
                  >
                    <Heart className={`w-4 h-4 transition-all duration-200 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    {hasLiked ? 'Liked' : 'Like'}
                  </button>
                  <button
                    onClick={() => handleShare(blog.title)}
                    aria-label="Share this post"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            )}

            {/* Author */}
            {blog.authorName && (
              <div className="bg-secondary/50 rounded-lg p-6 sm:p-8 my-8 sm:my-10 border border-border">
                <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  About the {authorLabel}
                </h3>
                <p className="font-semibold text-base sm:text-lg mb-1">{blog.authorName}</p>
                {blog.authorLocal && <p className="text-accent font-medium text-sm sm:text-base">{blog.authorLocal}</p>}
              </div>
            )}

          </AnimatedSection>
        </div>
      </article>

      {/* Bottom back button */}
      <section className="px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 md:mt-24">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Blog Posts
            </button>
          </AnimatedSection>
        </div>
      </section>

    </div>
  )
}
```

### 5.3 Portable Text rendering (old, working version, from git history)

This is deleted from the working tree but preserved at commit `7e32d235~1`, in `ghamsu-frontend/src/app/components/blog/BlogDetailPage.tsx`. It used `@portabletext/react` `^6.0.3` as `<PortableText value={blog.content} components={ptComponents} />`. **It covers all block, list and mark types in the live data, including links.** The colour classes reflect an older theme.

```tsx
// ── Portable Text renderers ────────────────────────────────────────────────────
const ptComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <figure className="my-8">
        <img
          src={imageUrl(value, 900)}
          alt={value.alt ?? ""}
          className="w-full rounded-xl shadow-md"
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href ?? "#";
      const isExternal = typeof window !== "undefined" && 
        href.startsWith("http") && 
        !href.startsWith(window.location.origin);
      return (
        <a
          href={href}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-orange-500 underline hover:text-orange-600 transition-colors"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  block: {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-gray-900 mt-10 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-5 text-lg">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-orange-500 pl-6 py-1 my-6 italic text-gray-600 text-lg bg-orange-50 rounded-r-xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-5 space-y-2 text-gray-700 text-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-5 space-y-2 text-gray-700 text-lg">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
};

// ── Category label map ─────────────────────────────────────────────────────────
```

### 5.4 Other Sanity-specific helpers

| File | What it does |
|---|---|
| `src/lib/sanity.ts` | Client, `urlFor`, `imageUrl`. Pasted in 3.1. |
| `src/lib/queries.ts` | All GROQ. Pasted in 3.4. |
| `src/lib/hooks.ts` | All fetch hooks. Pasted in 3.4. |
| `src/lib/useLikesAndViews.ts` | Stats fetch and like or view actions. Pasted in 3.4. |
| `api/blog-stats.ts` | Server-side counter. Pasted in section 8. |
| `src/types/types.ts` | Content types. Pasted in 5.5. |

Files importing Sanity helpers that must change at migration: `pages/BlogDetail.tsx`, `pages/Blogs.tsx`, `pages/Events.tsx`, `pages/Gallery.tsx`, `pages/Sermons.tsx`, `pages/Contact.tsx`, `components/BlogPreviewSection.tsx`, `components/FloatingServiceCards.tsx`, `components/UpcomingEvents.tsx`.

**Suggestion:** keep the existing hook names and returned shapes where practical. Only the 9 files above and `src/lib/*` touch the data layer, so this boundary keeps the change small.

### 5.5 TypeScript types

Hand-written in `src/types/types.ts`. **No `sanity typegen`.** Since the frontend has no `tsconfig.json`, they are not enforced at build time. Known drift: `Blog = News | Article` omits `mediaAttachments`, though `BlogDetail.tsx` reads it. `Testimonial.university` does not exist in the schema.

`ghamsu-frontend-new/src/types/types.ts`:

```ts
// ─── Shared ────────────────────────────────────────────────────────────────────
export interface SanityImage {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
  caption?: string
}

// ─── Scripture Quote ───────────────────────────────────────────────────────────
export interface ScriptureQuote {
  _id: string
  quoteText: string
  reference: string
}

// ─── GHAMSU Today ──────────────────────────────────────────────────────────────
export interface HappeningNowItem {
  title: string
  location: string
}

export interface LaterTodayItem {
  title: string
  time: string
  location: string
}

export interface GhamsuToday {
  _id: string
  themeTitle: string
  themeDescription: string
  scriptureReference: string
  happeningNow: HappeningNowItem[]
  laterToday: LaterTodayItem[]
  date: string
}

// ─── Event ─────────────────────────────────────────────────────────────────────
export type EventType = 'conference' | 'worship' | 'outreach' | 'fellowship' | 'training' | 'other'

export interface Event {
  _id: string
  _type: 'event'
  title: string
  date: string
  venue: string
  flyer: SanityImage
  description?: string
  eventType?: EventType
  registrationLink?: string
  published: boolean
}

// ─── News ──────────────────────────────────────────────────────────────────────
export type NewsCategory = 'announcement' | 'event-coverage' | 'campus-news' | 'union-update'

export interface News {
  _id: string
  _type: 'news'
  title: string
  slug: {
    current: string
  }
  featuredImage: SanityImage
  excerpt: string
  content?: PortableTextContent
  reporter: string                  // ← Reporter name (required)
  reporterPosition?: string         // ← Reporter position/local (optional)
  newsCategory?: NewsCategory
  publishedDate?: string
  featured: boolean
  likes: number
  views: number
  category?: 'news'                 // ← For unified blog filtering
}

// ─── Article ───────────────────────────────────────────────────────────────────
export type ArticleCategory = 'faith' | 'leadership' | 'campus-life' | 'devotionals'

export interface Article {
  _id: string
  _type: 'article'
  title: string
  slug: {
    current: string
  }
  featuredImage: SanityImage
  excerpt: string
  content?: PortableTextContent
  authorName: string               // ← Author name (required)
  authorLocal?: string             // ← Author position/local (optional)
  articleCategory?: ArticleCategory
  publishedDate?: string
  readTime?: number
  featured: boolean
  likes: number
  views: number
  category?: ArticleCategory       // ← For unified blog filtering
}

// ─── Blog (Legacy - Maps to News or Article) ───────────────────────────────────
export type Blog = News | Article

// ─── Sermon ────────────────────────────────────────────────────────────────────
export type MediaType = 'video' | 'audio'

export interface Sermon {
  _id: string
  _type: 'sermon'
  title: string
  preacher: string
  date: string
  mediaType: MediaType
  videoUrl?: string
  audioUrl?: string
  thumbnail?: SanityImage
  scriptureReference?: string
  description?: string
  series?: string
  duration?: string
}

// ─── Testimonial ──────────────────────────────────────────────────────────────
export interface Testimonial {
  _id: string
  name: string
  photo?: SanityImage
  role?: string
  local?: string
  university?: string
  testimony: string
  rating?: number
  date?: string
  featured?: boolean
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
export interface GalleryItem {
  _id: string
  title: string
  description?: string
  coverImage: SanityImage
  photoCount: number
  date?: string
  link: string
  category?: string
}

// ─── Executive ────────────────────────────────────────────────────────────────
export interface Executive {
  _id: string
  name: string
  position: string
  image: SanityImage
  phone?: string
  email?: string
  whatsapp?: string
  order?: number
  category?: 'connexional' | 'Connexional Boards' | 'Diocese' | 'local'
  bio?: string
}

// ─── Department ───────────────────────────────────────────────────────────────
export interface Department {
  _id: string
  name: string
  image?: SanityImage
  description: string
  leader?: {
    _id: string
    name: string
    position: string
  }
  activities?: string[]
  color?: string
}

// ─── Portable Text Content ────────────────────────────────────────────────────
export type PortableTextContent = Array<{
  _type: string
  _key?: string
  children?: Array<{ _type: string; text: string; [key: string]: unknown }>
  [key: string]: unknown
}>

// ─── Fetch State ──────────────────────────────────────────────────────────────
export interface SanityFetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}
```

---

## 6. CONTENT INVENTORY

### 6.1 Published content, measured 2026-11-07

Anonymous reads of dataset `production` in project `rgbuxwes`. 45 visible documents: 22 content documents and 23 image assets.

| Type | Docs | Earliest created | Rendered? | Likes / views total | Notes |
|---|---|---|---|---|---|
| `gallery` | 6 | 2026-04-11 | Yes | n/a | All links are external albums. |
| `event` | 3 | 2026-04-10 | Yes | n/a | All `published: true`, all `eventType: other`. |
| `sermon` | 3 | 2026-04-10 | Yes | n/a | All video, YouTube links. |
| `executive` | 3 | 2026-04-11 | Yes | n/a | Holds public phone and email values. |
| `news` | 1 | 2026-05-06 | Yes | 8 / 70 | Last updated 2026-11-01. |
| `article` | 1 | 2026-05-06 | Yes | 6 / 54 | Last updated 2026-11-03. |
| `blog` | 3 | 2026-04-10 | **No** | none | Legacy. Richest formatting. |
| `author` | 1 | 2026-04-11 | **No** | n/a | Referenced by 1 `blog`. |
| `testimonial` | 1 | 2026-04-18 | **No** | n/a | The old frontend displayed testimonials. |
| `subscriber` | 0 | | No | | |
| `department` | 0 | | No | | |
| `scriptureQuote` | 0 | | No | | |
| `ghamsuToday` | 0 | | No | | |

The recent `_updatedAt` on `news` and `article` is most likely from view increments, not editing. The other types were last edited between April and August 2026.

So **17 of the 22 documents render today** (gallery 6, event 3, sermon 3, executive 3, news 1, article 1), and 5 do not (blog 3, author 1, testimonial 1).

### 6.2 Assets

| Measure | Value |
|---|---|
| Image assets | 23 (20 JPEG, 3 PNG) |
| Total size | 49.3 MB |
| Largest file | 20.6 MB |
| Largest width | 8,500 px |
| Unreferenced by visible documents | 3 (may be used by drafts) |
| File assets | 0 |
| Images with hotspot / crop among document images | 1 / 1 |
| Images in Portable Text | 0 |

Integrity checks: 0 duplicate slugs, 0 missing slugs, 0 broken `department.leader` references (none exist), no missing image asset references.

### 6.3 Exports and the CLI

- **Existing exports:** none. No `*.ndjson`, `*.tar.gz` or seed files were found.
- **Is `npx sanity dataset export` runnable here?** Not as-is, but it is close:
  - `ghamsu-cms/sanity.cli.ts` configures `projectId: 'rgbuxwes'` and `dataset: 'production'`. Good.
  - `ghamsu-cms/node_modules` is missing, so run `npm install` in `ghamsu-cms` first.
  - A logged-in user is expected: `npx sanity login`. The owner must do this. Whether an export can run without login was not tested.
  - Command: `cd ghamsu-cms && npx sanity dataset export production ../sanity-export.tar.gz`. Export writes outside the code and includes assets.
  - `sanity.config.ts` reads `SANITY_STUDIO_PROJECT_ID` from the environment and `ghamsu-cms` has no env file, so **`sanity dev` and `sanity build` may need that variable**. The value is the same project ID. Not tested.
- **Why an export matters even with few documents:** it is the only way to see drafts, and it gives a backup before cutover. Do not commit the export, since it could contain private data.

---

## 7. ENVIRONMENT AND CONFIG

### 7.1 Environment variables (names only)

| Name | Referenced in | Runs in | Notes |
|---|---|---|---|
| `VITE_SANITY_PROJECT_ID` | `src/lib/sanity.ts:7,18`, `api/blog-stats.ts:5` | browser, server | Missing value crashes the whole app at import time. |
| `VITE_SANITY_DATASET` | `src/lib/sanity.ts:8,19`, `api/blog-stats.ts:6` | browser, server | Defaults to `production`. |
| `VITE_SANITY_TOKEN` | `src/lib/sanity.ts:9,24` | browser, dev only | Optional. `VITE_` values can reach client code, so this should never be a write token. |
| `VITE_SANITY_USE_CDN` | `src/lib/sanity.ts:10` | none | Type declaration only. Never read. |
| `SANITY_WRITE_TOKEN` | `api/blog-stats.ts:9` | server | Secret. **Not in any local env file.** Presumably set in Vercel; not verified. |
| `SANITY_STUDIO_PROJECT_ID` | `ghamsu-cms/sanity.config.ts:10` | Studio | |
| `SANITY_STUDIO_DATASET` | `ghamsu-cms/sanity.config.ts:11` | Studio | Defaults to `production`. |
| `VITE_EMAILJS_SERVICE_ID` | `src/app/pages/Contact.tsx:60` | browser | |
| `VITE_EMAILJS_TEMPLATE_ID` | `src/app/pages/Contact.tsx:61` | browser | |
| `VITE_EMAILJS_PUBLIC_KEY` | `src/app/pages/Contact.tsx:35` | browser | Public by design. |
| `VITE_EMAILJS_MEMBERSHIP_TEMPLATE_ID` | Local `.env` only | none | Used by the deleted `JoinSection`. Not referenced by current code. |
| `DEV` (`import.meta.env.DEV`) | `src/lib/sanity.ts:14` | browser | Vite built-in. |

**Local env state:** `ghamsu-frontend-new/.env` was restored from git history during this session, holding only the Sanity project and dataset plus EmailJS values. It is git-ignored. `ghamsu-frontend/.env` remains in git history, with EmailJS identifiers and no Sanity token. Nothing there requires rotation, since those values all ship to browsers anyway. There is no `.env.example`.

### 7.2 Config files

`next.config.js/ts`: **does not exist.** The equivalents follow.

`ghamsu-frontend-new/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
    sitemap({
      hostname: 'https://www.ghamsu.org', // Use hostname instead of baseUrl
      routes: [
        '/',
        '/about',
        '/sermons',
        '/events',
        '/boards',
        '/gallery',
        '/blogs',
        '/contact',
        '/partner',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
```

`ghamsu-frontend-new/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

`.gitignore` (root; `ghamsu-frontend-new/.gitignore` is empty):

```text
node_modules
.env
dist
build
```

### 7.3 Middleware

None. No `middleware.ts`, and no Vercel edge middleware.

### 7.4 Auth

**No authentication exists on the public site:** no login, sessions, roles or protected routes. The only logged-in surface is Sanity Studio, through Sanity's own accounts. Current Studio members and roles could not be inspected. **Supabase Auth, admin roles and RLS policies will all be new work.** Admin user identities must come from the owner.

---

## 8. FORMS AND WRITES

| Feature | File | Submits to | Stored? | Status |
|---|---|---|---|---|
| Contact form | `src/app/pages/Contact.tsx:43-77` | EmailJS, from the browser | **No database.** Email only. | Working, if env is set |
| Like button | `useLikesAndViews.ts` then `/api/blog-stats` | Sanity patch `inc likes` | Yes, on the document | Working in production |
| View counter | `useLikesAndViews.ts` then `/api/blog-stats` | Sanity patch `inc views` | Yes, on the document | Working in production |
| Partner "Make a Contribution" form | `src/app/pages/Partner.tsx:174-252` | **Nothing.** No `onSubmit`, no `action`, no `name` attributes. Submit reloads the page. | No | **Non-functional** |
| Subscribe form | `src/app/components/SubscribeForm.tsx` | **Empty file (0 bytes).** Imported nowhere. | No | **Does not exist** |
| Reporter application | `pages/Blogs.tsx:261` | `mailto:` link | No | Works via mail client |
| Gallery submission | `pages/Gallery.tsx:136` | `mailto:` link | No | Works via mail client |
| Event registration | `event.registrationLink` | External URL | No | Link only |
| Join Us, Join Now | Home, Footer | Link to `/contact` | No | No registration form exists |
| Membership form (removed) | Old `JoinSection.tsx`, git history | EmailJS | No | Deleted. Fields: `fullName`, `email`, `phone`, `school`, `level`, `program`. |

**Contact form fields:** `fullName` (required), `email` (required), `phone` (optional), `subject` (select: General Inquiry, Prayer Request, Event Information, Membership Inquiry, Partnership, Other; default General Inquiry), `message` (required). There is no spam protection or rate limiting.

```tsx
  useEffect(() => {
    emailjs.init((import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const templateParams = {
        to_email: 'info@gmsu.org',
        from_name: formData.fullName,
        from_email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      }

      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams
      )

      if (response.status === 200) {
        setSubmitStatus('success')
        setFormData({ fullName: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
        setTimeout(() => setSubmitStatus('idle'), 5000)
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Failed to send message. Please try again later.')
      console.error('EmailJS error:', error)
    } finally {
      setLoading(false)
    }
  }
```

**Likes and views behaviour to preserve or deliberately change:**

- Like limit: one per browser, per document, enforced only by `localStorage` key `liked_<documentId>`. Optimistic UI, rolled back on failure.
- View: one increment per `BlogDetail` page load. The code comment says "once per session", but there is no session logic. Reloading counts again.
- Atomic increment on the server: `.setIfMissing({likes:0, views:0}).inc({[field]:1})`.

`ghamsu-frontend-new/api/blog-stats.ts`:

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@sanity/client"

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID!,
  dataset: process.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

const ALLOWED_ORIGINS = [
  "https://www.ghamsu.org",
  "https://ghamsu.vercel.app",
  "http://localhost:5173",
]

function setCors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || ""

  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)

  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : ALLOWED_ORIGINS[0])
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  res.setHeader("Vary", "Origin")
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res)

  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  try {
    if (req.method === "GET") {
      const id = req.query.id as string

      if (!id) {
        return res.status(400).json({ error: "Post id is required" })
      }

      const post = await client.fetch(
        `*[_id == $id][0]{likes, views}`,
        { id }
      )

      return res.status(200).json({
        likes: post?.likes ?? 0,
        views: post?.views ?? 0,
      })
    }

    if (req.method === "POST") {
      const { id, action } = req.body

      if (!id || !["like", "view"].includes(action)) {
        return res.status(400).json({
          error: "Invalid request — id and action (like|view) are required",
        })
      }

      const field = action === "like" ? "likes" : "views"

      const updated = await client
        .patch(id)
        .setIfMissing({ likes: 0, views: 0 })
        .inc({ [field]: 1 })
        .commit({ returnDocuments: true })

      return res.status(200).json({
        likes: updated.likes ?? 0,
        views: updated.views ?? 0,
      })
    }

    return res.status(405).json({ error: "Method not allowed" })
  } catch (err) {
    console.error("[blog-stats] API error:", err)
    return res.status(500).json({ error: "Failed to process blog stats" })
  }
}
```

**Security problems in this endpoint (Fact):**

- No authentication and no rate limiting. Anyone can inflate counts with a script.
- **`id` is not restricted to post types.** Any document ID in the dataset can be patched, which adds `likes` and `views` fields to it (an `executive`, for example). `*[_id == $id]` on the read side is equally untyped.
- CORS only restricts browsers, and it allows every `*.vercel.app` origin, not just this project's.

**Suggestion:** implement counters in Supabase as a `SECURITY DEFINER` RPC restricted to published posts, or an Edge Function with rate limiting. Do not give the anonymous role direct UPDATE on post tables, and never expose the service role key to the browser.

---

## 9. MIGRATION RISK NOTES

### 9.1 Risk assessment

| Topic | Level | Finding |
|---|---|---|
| Deeply nested objects | Low | Deepest structures are image objects, `news.mediaAttachments[]` and `ghamsuToday` arrays. |
| Polymorphic arrays | Low to medium | Portable Text is the only one (`block` or `image`). `mediaAttachments` is uniform. |
| Rich text with embedded references | **None today** | No references inside rich text. Zero inline images or links in live data, though the schema allows them. |
| Image hotspots | Low | 1 document uses them. Keep the data anyway. |
| Multilingual fields | **None** | English only. No i18n plugin or locale fields. |
| Drafts and versioning | Medium | Sanity gives drafts, publish and history for free. Only `event` has its own `published` flag. See 9.2. |
| Volume | Very low | 22 documents, 23 images. Manual review of every record is realistic. |
| Unified `/blogs` feed | Medium | See 9.2. |
| Hardcoded content | **High for dashboard scope** | See 9.3. |
| Rich text editing in a custom dashboard | **High** | The largest single build item. See 9.2. |
| Image pipeline | Medium to high | See 9.2. |
| Security | **High** | Moving from a read-only public dataset to a database with public write paths. See 9.2. |

### 9.2 Specific issues to plan for

**1. Rich text storage and editing.** Choices: keep Portable Text as `jsonb` (exact fidelity, existing renderer in 5.3 reusable, but it needs a Portable Text editor in the dashboard) or convert to another format such as TipTap JSON or HTML (better editors, but a one-time conversion, and HTML requires sanitizing). **Suggestion:** with 5 posts using only paragraphs, `h3`, bullets, bold and italic, conversion is cheap and low-risk, so choose by whichever editor the dashboard will use. Whichever is chosen, replace the broken `renderContent()`. Portable Text `_key` values have no meaning outside Sanity.

**2. News, articles and the unified feed.** `/blogs` mixes two types in one list, and `/blogs/:slug` resolves from both. **Suggestion:** one `posts` table with a `post_type` discriminator (`news`, `article`), a slug unique across the table, and type-specific columns (`read_time`, `media_attachments`). This enforces what Sanity does not: slug uniqueness across types. Handle these differences:

| Concept | `news` | `article` | `blog` (legacy) |
|---|---|---|---|
| Author name | `reporter` | `authorName` | absent; 1 of 3 has `author` ref |
| Author detail | `reporterPosition` | `authorLocal` | absent |
| Category field | `newsCategory` | `articleCategory` | `category` |
| Category values | `announcement`, `event-coverage`, `campus-news`, `union-update` | `faith`, `leadership`, `campus-life`, `devotionals` | same as article |
| `readTime` | no | yes | yes |
| `mediaAttachments` | yes | no | no |
| `publishedDate` required | yes | yes | no |
| Counters | yes | yes | absent, so default to 0 |

Frontend code also expects the computed `category` (`"news"` or the article category), `authorName`, `authorLocal` and `slug.current`. Either keep them through a view or mapper, or update the components.

**3. Preserve URLs and IDs.** `/blogs/<slug>` URLs may be shared publicly, so keep slugs exactly. Keep the Sanity `_id` in a `legacy_sanity_id` column. **`localStorage` likes use `liked_<sanity _id>`,** so new primary keys let previous likers like again. Either keep the old ID as the key value or accept that minor effect.

**4. Likes and views must be delta-synced.** Counters keep changing until cutover (both live posts were updated within a week of this audit). Import content early if desired, but re-copy counters at the final switch, or freeze the endpoint during it.

**5. Images must be copied before Sanity is shut down.** Every migrated image URL currently depends on `cdn.sanity.io`. Copy originals to Supabase Storage first.

- Originals are very large (up to 20.6 MB and 8,500 px wide), and the site currently relies on Sanity's on-the-fly resizing at every call site in 5.1. **Serving originals directly would badly hurt page speed, particularly on mobile data.**
- Options: Supabase Image Transformations (check current plan availability and pricing), resize on upload in the dashboard, or an external image CDN. Check Supabase's upload size limit against the 20.6 MB file.
- Store `alt`, `caption`, and hotspot and crop values if the dashboard will offer focal-point control. For hotspots, a simple route is CSS `object-position`. For the single image with a crop, either bake the crop in on migration or keep the numbers.
- 3 unreferenced assets may be used only by drafts. Check with the authenticated export before dropping them.
- Top-level images have no alt text field. **Suggestion:** add one in the new schema, since this is a cheap accessibility gain.

**6. Draft and publish workflow.** Sanity provides drafts, publishing and revision history automatically. Postgres provides none of these. **Suggestion:** add `status` (`draft`, `published`) and `published_at` to all content tables, and have RLS expose only published rows to anonymous users. Revision history is optional, and could be left for later. Map `event.published` to the same status.

**7. Things Studio gives you that the dashboard must rebuild:**

- Form validation (section 2), including conditional sermon rules and regex on executive fields. **Mirror these as Postgres constraints where possible,** as Sanity's validation only ran in Studio.
- Slug generation from title, maximum 96 characters.
- Image upload with hotspot and crop selection.
- List ordering (date, most liked, most viewed, display order).
- Previews, read-only counters, conditional field visibility.
- Enum dropdowns and radios.
- A rich text editor.

**8. Enum values.** Values are inconsistent: `executive.category` mixes `connexional`, `Connexional Boards`, `Diocese`, `local`; gallery uses Title Case; others use kebab case. Frontend code matches exact strings (`Contact.tsx` filter and labels). Either keep values exactly, or normalize them and update the code together. **Suggestion:** use `text` with `CHECK` constraints or lookup tables rather than Postgres `ENUM`, since new categories are likely.

**9. Free-text fields that resemble structured data.** Mostly fine to keep as text: `sermon.preacher`, `sermon.series` (candidates for later normalization), `sermon.duration` (string such as `45:30`; `formatDuration` parses it by `split(':')` and falls back to `0 min`), `executive.phone`, `ghamsuToday.laterToday[].time`.

**10. Datetimes.** All `datetime` fields are ISO 8601 UTC strings, so use `timestamptz`. Display relies on the browser's locale and timezone. The `event.date` field holds both date and time, and the UI displays both.

**11. Row-level security and privacy.**

- Enable RLS on every table. Anonymous: read published content only. Admin writes require an authenticated admin role.
- Contact details on `executive` are public on the site today, so public read is consistent with current behaviour. If any future column is private, use a view or separate table.
- Any new tables for subscribers, messages or membership hold personal data and must not be publicly readable. **Suggestion:** anonymous insert only, with spam protection, and no anonymous select.
- The EmailJS keys already ship in the browser. If forms move to Supabase, an Edge Function with Resend could replace this (`resend` is already declared but unused).

**12. Environment and failure behaviour.** `createClient` runs at import time, so a missing Sanity env var white-screens the entire site, as happened during this session. There is also no route `errorElement`. Keep this in mind for the Supabase client. Vercel needs new env vars before deploying the switch.

**13. Unmatched behaviours worth deciding, not assuming:**

- Pagination: none today. Fine at this volume, but consider it for the admin.
- Data freshness: Sanity CDN delay disappears with direct Postgres reads.
- Client-side filters: `Events.tsx` filters in memory. `Blogs`, `Sermons` and `Gallery` re-query.
- **External scripture API:** `beta.ourmanna.com` feeds the home page, while `scriptureQuote` sits unused. Owner may want dashboard control.
- **SEO:** client rendering, a single set of static meta tags and a static sitemap mean posts have no per-page metadata. Pre-existing and not caused by Sanity, but a framework discussion belongs in the same conversation if SEO matters.

**14. Cutover and rollback.** **Suggestion:** deploy the Supabase data layer behind the same hook names, verify page by page against Sanity, then switch. Keep the Sanity project read-only for a period and keep the export as a backup. **Deleting the Sanity project or dataset is irreversible and should be an explicit owner decision, made only after images are verified.**

### 9.3 Hardcoded content not in Sanity

**Fact:** none of this is in the CMS today, so admins cannot edit it after a like-for-like migration. **The owner should decide which of these belong in the dashboard.**

| Content | Location | Suggested model if moved | Notes |
|---|---|---|---|
| Six boards: list | `pages/Boards.tsx:7-50` | `boards` | |
| Six boards: home summary | `components/BoardsHomeSection.tsx:6-43` | same `boards` | Third copy, with different text. |
| Six boards: detail (vision, responsibilities, activities, members, colours) | `pages/BoardDetail.tsx:9-154` | same `boards` | **Member counts conflict:** publications 7 vs 10, research 7 vs 12, medical 6 vs 11. Much of the text is generic church-template copy. |
| Major activities | `pages/Boards.tsx:52-74` | `activities` or `event` | |
| Coordinator profile | `pages/Contact.tsx:274-376` | `executive` plus fields | **Contact links do not match the displayed values** (see 9.4). |
| Contact details | `pages/Contact.tsx:105-157` | `site_settings` singleton | Office number is a zero placeholder. |
| Social links (8) | `components/Footer.tsx:20-69` | `site_settings` | |
| Yearly theme and scripture | `components/Footer.tsx:75-90` | `site_settings` | **The year updates automatically while the theme text does not.** It will display the wrong year's theme each January. |
| Home hero slides | `pages/Home.tsx:69-91` | `hero_slides` | `HeroSection.tsx:43-58` has separate defaults. |
| Statistics | `components/StatsSection.tsx:9-34`, `components/AboutSection.tsx:11-13` | `site_settings` or `stats` | **Numbers conflict:** see 9.4. |
| About page text | `pages/About.tsx` | `pages` or structured sections | History includes a hardcoded age ("61yrs old"). |
| Bank details | `pages/Partner.tsx:98-157` | `site_settings` | **Account number is the literal placeholder `[Your Account Number]`.** |
| Page hero images | Each page's `HeroSection` prop | `site_settings` or per-page config | External URLs. |
| Navigation | `components/Navigation.tsx:43-55` | Probably keep in code | |

A site settings table would be the first real singleton in this system.

Unused template components with placeholder content, imported nowhere: `ColoredCardsSection.tsx`, `MinistriesSection.tsx`, `figma/ImageWithFallback.tsx`, `SubscribeForm.tsx` (empty).

### 9.4 Existing bugs found during the audit

These are not caused by the migration and were **not changed**, as this audit is read-only. Decide whether to fix them along the way. Porting them unknowingly would carry them over.

| # | File | Issue | Effect |
|---|---|---|---|
| 1 | `pages/BlogDetail.tsx:280-330` | Headings and lists unreachable, links ignored, one mark per span | Formatting lost |
| 2 | `lib/queries.ts:109,295` | Slug queries omit `mediaAttachments` | Media player can never appear on the site |
| 3 | `lib/hooks.ts:118-121,135-138` | Filter key differs from `$category` param | Would fail if the filters were used; currently unused |
| 4 | `pages/Blogs.tsx:44-48` with `queries.ts:327` | Category button `news` queries `newsCategory == "news"`, a value that never exists | Selecting "news" in the category row shows no results |
| 5 | `components/FloatingServiceCards.tsx:109,120` | Fallback links `/blogs?category=news` and `?category=articles`, which `Blogs.tsx` does not read | Filter silently ignored |
| 6 | `components/UpcomingEvents.tsx:28` | Takes the first 5 by ascending date with no future filter | "Upcoming" can show oldest past events |
| 7 | `pages/Events.tsx:172` | "Learn More" button has no action | Dead button |
| 8 | `pages/Sermons.tsx:118,168` | Hover play button has no action. "Watch" opens the raw embed URL in a new tab. | Minor UX |
| 9 | `pages/Partner.tsx:174-252` | Form does nothing; states contributions are "tax-deductible" and receipts will be emailed | **A claim the site cannot fulfil. Owner should review.** |
| 10 | `pages/Partner.tsx:132` | Placeholder account number | **Donors have no account number** |
| 11 | `pages/Contact.tsx:124-130,346-352` | `tel:`, `wa.me` and `mailto:` targets differ from displayed numbers and email, including a `john.mensah@...` address | **Coordinator contact links go to the wrong place** |
| 12 | `pages/Contact.tsx:51` | `to_email` is `info@gmsu.org`, a different domain from `ghamsu.org` | Whether this matters depends on the EmailJS template, which was not inspected |
| 13 | `components/StatsSection.tsx:12,42-48` | `value: 50000` but the animation stops at 5,000. `value: 61` but the count stops at 60. | Inconsistent figures, and `AboutSection` says "100+" locals while stats says 1,000 |
| 14 | `pages/BlogDetail.tsx:223-224` | Hooks called after a conditional return | Violates Rules of Hooks; rarely triggers since the route always has a slug |
| 15 | `index.html` | `og:image` uses `/src/images/logo.png`, a source path that a production build does not serve at that path | Social previews likely have no image; not verified |

### 9.5 Decisions needed from the owner

| Decision | Options | Default if no answer (Suggestion) |
|---|---|---|
| Keep the 3 legacy `blog` posts? | Publish as articles; archive unpublished; drop | Migrate as **unpublished drafts**, since they hold the most original writing and nothing is lost. An author name is needed for at least 2 of them. |
| Keep `testimonial` and restore the display? | Restore; store only; drop | Store, with display decided later. |
| Which empty types to build? | `department`, `scriptureQuote`, `ghamsuToday`, `author`, `subscriber` | Build none until a page needs them. |
| Scope of hardcoded content in the dashboard | Section 9.3 | Include boards and site settings, at minimum. |
| Stay on Vite or move to Next.js? | Separate decision | Stay on Vite. Changing framework is unnecessary for this migration. |
| Build real forms? | Contact storage, subscribe, membership, donations | Treat as a separate phase. Real payments are their own project. |
| Who are the admins? | Names and roles | Needed before any auth work. |
