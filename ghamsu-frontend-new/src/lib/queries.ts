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