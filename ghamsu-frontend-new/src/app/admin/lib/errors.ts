// Turns database, storage and network errors into plain-language messages.
// Constraint names come from supabase/migrations/0001_schema.sql.

interface ErrorLike {
  message?: string
  code?: string
  details?: string | null
  hint?: string | null
  statusCode?: string | number
}

const UNIQUE_MESSAGES: [RegExp, string][] = [
  [/slug/, 'That slug is already used. Choose a different one.'],
  [/social_links_platform/, 'There is already a link for that platform.'],
  [/major_activities_title/, 'An activity with that title already exists.'],
  [/subscribers_email/, 'That email address is already subscribed.'],
  [/legacy_sanity_id/, 'This item was already imported from Sanity.'],
  [/sort_order/, 'Two items ended up in the same position. Please try reordering again.'],
  [/stats_section_stat_key/, 'That stat already exists in this section.'],
]

const CHECK_MESSAGES: [RegExp, string][] = [
  [/posts_publish_requirements/, 'To publish a post, add an excerpt, content, a featured image and an author.'],
  [/posts_category_valid/, "That category doesn't match the post type."],
  [/posts_content_check/, 'The post content could not be saved. Please try again.'],
  [/events_publish_requirements/, 'To publish an event, add a date, a venue and a flyer.'],
  [/sermons_publish_requirements/, 'To publish a sermon, add the preacher, the date and a link that matches the media type.'],
  [/galleries_publish_requirements/, 'To publish an album, add a description, cover image, photo count, date, album link and category.'],
  [/executives_publish_requirements/, 'To publish an executive, add a position, photo, display order and category.'],
  [/testimonials_publish_requirements/, 'To publish a testimonial, add the testimony text.'],
  [/departments_publish_requirements/, 'To publish a department, add a description.'],
  [/major_activities_dates_check/, 'The end must be after the start.'],
  [/capacity/, 'The maximum number of people must be at least 1.'],
  [/body_check/, 'The description could not be saved. Please try again.'],
  [/whatsapp/, 'WhatsApp numbers must be digits only, with the country code (for example 233241234567).'],
  [/email/, "That doesn't look like a valid email address."],
  [/url/, 'Links must start with http:// or https://.'],
  [/slug/, 'Slugs must be lowercase, with no spaces, and at most 96 characters.'],
  [/rating/, 'Rating must be a whole number from 1 to 5.'],
  [/photo_count/, 'Photo count must be at least 1.'],
  [/sort_order/, 'Display order must be a positive number.'],
  [/member_count/, "Member count can't be negative."],
  [/read_time/, "Read time can't be negative."],
  [/category|event_type|section|slot/, 'Please choose one of the listed options.'],
]

export function friendlyError(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.'
  const e = (typeof error === 'object' ? error : { message: String(error) }) as ErrorLike
  const message = e.message ?? ''
  const haystack = `${message} ${e.details ?? ''}`

  // Messages raised on purpose by the database are already readable.
  if (/last active admin/i.test(message)) return "You can't remove the last active admin. Make someone else an admin first."
  if (/Only admins can change roles/i.test(message)) return 'Only admins can change roles.'

  switch (e.code) {
    case '23505':
      return UNIQUE_MESSAGES.find(([pattern]) => pattern.test(haystack))?.[1] ?? 'That value is already used.'
    case '23514':
      return CHECK_MESSAGES.find(([pattern]) => pattern.test(haystack))?.[1] ?? "One of the values isn't allowed. Please check the form."
    case '23502':
      return 'A required field is missing.'
    case '23503':
      return 'This item is still linked to something else, so it cannot be changed this way.'
    case '22P02':
    case '22007':
    case '22008':
      return "One of the values isn't in the right format."
    case '42501':
      return "You don't have permission to do that. Ask an admin if you need access."
    case 'PGRST116':
      return 'That item no longer exists. It may have been deleted.'
  }

  if (/row-level security|permission denied/i.test(message)) {
    return "You don't have permission to do that. Ask an admin if you need access."
  }
  if (/JWT expired|invalid JWT|session.*missing/i.test(message)) return 'Your session has expired. Please sign in again.'
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) return "Couldn't reach the server. Check your internet connection and try again."
  if (/Payload too large|exceeded the maximum allowed size/i.test(message)) return 'That file is too large. The limit is 25 MB.'
  if (/mime type|invalid_mime_type/i.test(message)) return "That file type isn't allowed. Use a JPEG, PNG, WebP, AVIF or GIF image."
  if (/Invalid login credentials/i.test(message)) return 'Email or password is incorrect.'
  if (/Email not confirmed/i.test(message)) return 'This email address has not been confirmed yet. Check your inbox for the confirmation email.'
  if (/rate limit|too many requests/i.test(message)) return 'Too many attempts. Please wait a minute and try again.'
  if (/Password should be/i.test(message)) return message

  return message || 'Something went wrong. Please try again.'
}
