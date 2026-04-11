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

// ─── Client ────────────────────────────────────────────────────────────────────
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01', // use current date for latest API
  useCdn: import.meta.env.VITE_SANITY_USE_CDN !== 'false', // true by default, set VITE_SANITY_USE_CDN=false for non-CDN
  token: import.meta.env.VITE_SANITY_TOKEN || undefined,
})

// ─── Image URL Builder ─────────────────────────────────────────────────────────
const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ─── Typed helpers ─────────────────────────────────────────────────────────────
/** Returns an optimized image URL string with optional width and height. */
export function imageUrl(source: SanityImageSource, width?: number, height?: number): string {
  let img = urlFor(source).auto('format').fit('crop')
  if (width) img = img.width(width)
  if (height) img = img.height(height)
  return img.url()
}