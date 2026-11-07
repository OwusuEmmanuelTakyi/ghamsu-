import type { CSSProperties, SyntheticEvent } from 'react'
import { supabaseUrl } from './supabase'
import type { ImageFocus, MediaImage } from '../types/types'

const BUCKET = 'media'

/**
 * Turns a stored image path into a public URL in the media bucket.
 * Full http(s) URLs are returned unchanged. Missing values give ''.
 * No Supabase image transformations are used: files are stored pre-resized.
 */
export function mediaUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return ''
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  if (!supabaseUrl) return ''
  const encoded = pathOrUrl.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/')
  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/${encoded}`
}

/**
 * Applies a stored hotspot as CSS object-position, so object-cover crops keep
 * the chosen point in view. Returns undefined when there is no hotspot, so the
 * element's own classes (such as object-top) still apply.
 */
export function focusStyle(focus?: ImageFocus | null): CSSProperties | undefined {
  const spot = focus?.hotspot
  if (!spot || typeof spot.x !== 'number' || typeof spot.y !== 'number') return undefined
  const pct = (n: number) => `${Math.round(Math.min(1, Math.max(0, n)) * 1000) / 10}%`
  return { objectPosition: `${pct(spot.x)} ${pct(spot.y)}` }
}

/** src, alt and style for an <img>, in one spread. Uses the full-size image. */
export function imageProps(image: MediaImage | null | undefined, fallbackAlt: string) {
  return {
    src: mediaUrl(image?.path),
    alt: image?.alt || fallbackAlt,
    style: focusStyle(image?.focus),
  }
}

// ─── Thumbnails ────────────────────────────────────────────────────────────────
// Every uploaded image has a smaller copy (at most 800 px wide) stored at
// thumbs/<same path>. Cards and lists use it; detail pages use the full image.

export function thumbPath(path: string): string {
  return `thumbs/${path.replace(/^\/+/, '')}`
}

/** Thumbnail URL for a stored path. External URLs are returned unchanged. */
export function thumbUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return ''
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return mediaUrl(thumbPath(pathOrUrl))
}

/** If a thumbnail is missing, swap to the full image once (never loops). */
export function fallbackToFull(fullUrl: string) {
  return (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (!fullUrl || img.dataset.fullTried) return
    img.dataset.fullTried = '1'
    img.src = fullUrl
  }
}

/** Like imageProps, but loads the thumbnail and falls back to the full image. */
export function thumbProps(image: MediaImage | null | undefined, fallbackAlt: string) {
  return {
    src: thumbUrl(image?.path),
    alt: image?.alt || fallbackAlt,
    style: focusStyle(image?.focus),
    onError: fallbackToFull(mediaUrl(image?.path)),
  }
}
