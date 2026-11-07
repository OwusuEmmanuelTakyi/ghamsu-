// ─── Shared ────────────────────────────────────────────────────────────────────
export interface ImageFocus {
  hotspot?: { x: number; y: number; width?: number; height?: number } | null
  crop?: { top: number; bottom: number; left: number; right: number } | null
}

/** An image stored in the Supabase media bucket. */
export interface MediaImage {
  path: string
  alt?: string | null
  caption?: string | null
  focus?: ImageFocus | null
}

export interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

// ─── Rich text (TipTap / ProseMirror JSON) ─────────────────────────────────────
export interface RichTextMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface RichTextNode {
  type: string
  attrs?: Record<string, unknown>
  content?: RichTextNode[]
  marks?: RichTextMark[]
  text?: string
}

// ─── Event ─────────────────────────────────────────────────────────────────────
export type EventType = 'conference' | 'worship' | 'outreach' | 'fellowship' | 'training' | 'other'

export interface Event {
  _id: string
  _type: 'event'
  title: string
  date: string
  venue: string
  flyer: MediaImage | null
  description?: string
  eventType?: EventType
  registrationLink?: string
}

// ─── Posts (news and articles) ─────────────────────────────────────────────────
export type NewsCategory = 'announcement' | 'event-coverage' | 'campus-news' | 'union-update'
export type ArticleCategory = 'faith' | 'leadership' | 'campus-life' | 'devotionals'

export interface MediaAttachment {
  mediaType: 'video' | 'audio'
  label: string
  url: string
  description?: string
}

interface PostBase {
  _id: string
  /** The Sanity ID for migrated posts. Keeps the old liked_<id> browser keys valid. */
  legacyId: string | null
  title: string
  slug: { current: string }
  featuredImage: MediaImage | null
  excerpt: string
  content?: RichTextNode | null
  authorName?: string
  authorLocal?: string
  publishedDate?: string
  featured: boolean
  likes: number
  views: number
  mediaAttachments?: MediaAttachment[]
}

export interface News extends PostBase {
  _type: 'news'
  newsCategory?: NewsCategory
  /** Always 'news', so lists can treat news as one category. */
  category: 'news'
  readTime?: undefined
}

export interface Article extends PostBase {
  _type: 'article'
  articleCategory?: ArticleCategory
  category?: ArticleCategory
  readTime?: number
}

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
  thumbnail: MediaImage | null
  scriptureReference?: string
  description?: string
  series?: string
  duration?: string
}

// ─── Gallery ───────────────────────────────────────────────────────────────────
export interface GalleryItem {
  _id: string
  title: string
  description?: string
  coverImage: MediaImage | null
  photoCount: number
  date: string
  link: string
  category?: string
}

// ─── Executive ─────────────────────────────────────────────────────────────────
export interface Executive {
  _id: string
  name: string
  position: string
  image: MediaImage | null
  phone?: string
  email?: string
  whatsapp?: string
  order?: number
  category?: 'connexional' | 'Connexional Boards' | 'Diocese' | 'local'
  bio?: string
}

// ─── Boards ────────────────────────────────────────────────────────────────────
export interface BoardMember {
  id: string
  name: string
  position: string | null
  bio: string | null
  phone: string | null
  email: string | null
  image: MediaImage | null
}

export interface Board {
  id: string
  slug: string
  title: string
  summary: string | null
  description: string | null
  detailDescription: string | null
  icon: string | null
  homeIcon: string | null
  color: string | null
  memberCount: number | null
  vision: string | null
  responsibilities: string[]
  activities: string[]
  members: BoardMember[]
}

export interface MajorActivity {
  id: string
  title: string
  dateText: string | null
  location: string | null
  description: string | null
  imageUrl: string
  imageAlt: string | null
}

// ─── Hero images ───────────────────────────────────────────────────────────────
export interface HeroSlide {
  image: string
  eyebrow: string
  heading: string
  subheading: string
}

export interface PageHero {
  page: string
  title: string
  subtitle: string | null
  imageUrl: string
  imageAlt: string | null
}

// ─── Site settings and small lists ─────────────────────────────────────────────
export interface SocialLink {
  id: string
  platform: string
  label: string
  url: string
  icon: string | null
}

export interface Stat {
  id: string
  key: string
  label: string
  numericValue: number | null
  displayValue: string | null
  icon: string | null
}

export interface YearlyThemeSetting {
  year?: number | null
  title?: string | null
  scripture?: string | null
}

export interface ContactDetailsSetting {
  address_lines?: string[] | null
  phones?: { label?: string | null; number?: string | null }[] | null
  emails?: string[] | null
}

export interface CoordinatorSetting {
  name?: string | null
  title?: string | null
  section_heading?: string | null
  section_subheading?: string | null
  image_path?: string | null
  image_alt?: string | null
  bio_paragraphs?: string[] | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  stats?: { value?: string | null; label?: string | null }[] | null
}

export interface BankDetailsSetting {
  section_heading?: string | null
  section_subheading?: string | null
  account_name?: string | null
  bank_name?: string | null
  branch?: string | null
  account_number?: string | null
  alternative_bank?: string | null
  alternative_account_number?: string | null
  momo_name?: string | null
  momo_number?: string | null
  momo_network?: string | null
  international_note?: string | null
  receipt_note?: string | null
}
