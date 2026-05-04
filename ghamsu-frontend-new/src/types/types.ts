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

// ─── Blog ──────────────────────────────────────────────────────────────────────
// Find the Blog interface and replace it with this:

export type BlogCategory = 'faith' | 'leadership' | 'campus-life' | 'devotionals'

export interface Blog {
  _id: string
  _type: 'blog'
  title: string
  slug: {
    current: string
  }
  featuredImage: SanityImage
  excerpt: string
  content?: PortableTextContent
  authorName: string           // ← Direct string field
  authorLocal?: string         // ← Direct string field (optional)
  category?: BlogCategory
  publishedDate?: string
  readTime?: number
  featured: boolean
  likes: number
  views: number
}

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
  university?: string
  testimony: string
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
  activities?: string[]
  color?: string
  leaderName?: string
  leaderPosition?: string
  leaderPhoto?: SanityImage
}