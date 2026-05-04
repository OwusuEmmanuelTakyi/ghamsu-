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
  *[_type == "ghamsuToday" && active == true][0] {
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
// ─── Events ────────────────────────────────────────────────────────────────

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

// ─── Blogs ─────────────────────────────────────────────────────────────────────
// Replace all BLOGS_QUERY related queries with these:

// ─── Blogs ─────────────────────────────────────────────────────────────

export const BLOGS_QUERY = `
  *[_type == "blog"] | order(publishedDate desc) {
    _id,
    title,
    slug,
    featuredImage,
    excerpt,
    category,
    publishedDate,
    readTime,
    featured,
    likes,
    views,
    authorName,
    authorLocal
  }
`

export const FEATURED_BLOGS_QUERY = `
  *[_type == "blog" && featured == true] | order(publishedDate desc)[0...3] {
    _id,
    title,
    slug,
    featuredImage,
    excerpt,
    category,
    publishedDate,
    readTime,
    featured,
    likes,
    views,
    authorName,
    authorLocal
  }
`

export const BLOG_BY_SLUG_QUERY = `
  *[_type == "blog" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    featuredImage,
    excerpt,
    content,
    category,
    publishedDate,
    readTime,
    featured,
    likes,
    views,
    authorName,
    authorLocal
  }
`

export const BLOGS_BY_CATEGORY_QUERY = `
  *[_type == "blog" && category == $category] | order(publishedDate desc) {
    _id,
    title,
    slug,
    featuredImage,
    excerpt,
    category,
    publishedDate,
    readTime,
    featured,
    likes,
    views,
    authorName,
    authorLocal
  }
`

// ─── Sermons ───────────────────────────────────────────────────────────────────
// ─── Sermons ───────────────────────────────────────────────────────────────

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
    university,
    testimony,
    date,
    featured
  }
`

export const FEATURED_TESTIMONIALS_QUERY = `
  *[_type == "testimonial" && featured == true] | order(date desc) {
    _id,
    name,
    photo,
    university,
    testimony
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

// ─── Executives ────────────────────────────────────────────────────────────────
export const EXECUTIVES_QUERY = `
  *[_type == "executive"] | order(order asc) {
    _id,
    name,
    position,
    image,
    universityChapter,
    phone,
    email,
    bio,
    order,
    category
  }
`

export const EXECUTIVES_BY_CATEGORY_QUERY = (category: string) => `
  *[_type == "executive" && category == "${category}"] | order(order asc) {
    _id,
    name,
    position,
    image,
    universityChapter,
    phone,
    email,
    bio,
    order,
    category
  }
`

// ─── Departments ───────────────────────────────────────────────────────────────
export const DEPARTMENTS_QUERY = `
  *[_type == "department"] {
    _id,
    name,
    image,
    description,
    activities,
    color,
    "leaderName": leader->name,
    "leaderPosition": leader->position,
    "leaderPhoto": leader->photo
  }
`