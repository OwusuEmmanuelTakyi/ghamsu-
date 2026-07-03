import { useState, useEffect } from 'react'
import { sanityClient } from './sanity'
import {
  SCRIPTURE_QUOTES_QUERY,
  GHAMSU_TODAY_QUERY,
  EVENTS_QUERY,
  BLOGS_QUERY,
  FEATURED_BLOGS_QUERY,
  BLOG_BY_SLUG_QUERY,
  SERMONS_QUERY,
  TESTIMONIALS_QUERY,
  FEATURED_TESTIMONIALS_QUERY,
  GALLERY_QUERY,
  EXECUTIVES_QUERY,
  DEPARTMENTS_QUERY,
} from './queries'
import type {
  ScriptureQuote,
  GhamsuToday,
  Event,
  Blog,
  Sermon,
  Testimonial,
  GalleryItem,
  Executive,
  Department,
} from '../types/types'

// ─── Generic fetcher hook ──────────────────────────────────────────────────────
function useSanityData<T>(query: string, params?: Record<string, unknown>) {
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

    return () => { cancelled = true }
  }, [query, JSON.stringify(params)])

  return { data, loading, error }
}

// ─── Scripture Quotes ──────────────────────────────────────────────────────────
export function useScriptureQuotes() {
  return useSanityData<ScriptureQuote[]>(SCRIPTURE_QUOTES_QUERY)
}

// ─── GHAMSU Today ──────────────────────────────────────────────────────────────
export function useGhamsuToday() {
  return useSanityData<GhamsuToday>(GHAMSU_TODAY_QUERY)
}

// ─── Events ────────────────────────────────────────────────────────────────────
export function useEvents() {
  return useSanityData<Event[]>(EVENTS_QUERY)
}

// ─── Blogs ─────────────────────────────────────────────────────────────────────
export function useBlogs(featured = false) {
  const query = featured ? FEATURED_BLOGS_QUERY : BLOGS_QUERY
  return useSanityData<Blog[]>(query)
}

export function useBlogBySlug(slug: string) {
  return useSanityData<Blog>(BLOG_BY_SLUG_QUERY, { slug })
}

// ─── Sermons ───────────────────────────────────────────────────────────────────
export function useSermons() {
  return useSanityData<Sermon[]>(SERMONS_QUERY)
}

// ─── Testimonials ──────────────────────────────────────────────────────────────
export function useTestimonials(featured = false) {
  const query = featured ? FEATURED_TESTIMONIALS_QUERY : TESTIMONIALS_QUERY
  return useSanityData<Testimonial[]>(query)
}

// ─── Gallery ───────────────────────────────────────────────────────────────────
export function useGallery() {
  return useSanityData<GalleryItem[]>(GALLERY_QUERY)
}

// ─── Executives ────────────────────────────────────────────────────────────────
export function useExecutives() {
  return useSanityData<Executive[]>(EXECUTIVES_QUERY)
}

// ─── Departments ───────────────────────────────────────────────────────────────
export function useDepartments() {
  return useSanityData<Department[]>(DEPARTMENTS_QUERY)
}