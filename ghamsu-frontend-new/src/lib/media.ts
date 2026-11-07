import type { CSSProperties } from 'react'
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

/** src, alt and style for an <img>, in one spread. */
export function imageProps(image: MediaImage | null | undefined, fallbackAlt: string) {
  return {
    src: mediaUrl(image?.path),
    alt: image?.alt || fallbackAlt,
    style: focusStyle(image?.focus),
  }
}
