import { useState, useEffect } from 'react'
import { sanityClient } from './sanity'
import {
  SCRIPTURE_QUOTES_QUERY,
  GHAMSU_TODAY_QUERY,
  EVENTS_QUERY,
  EVENTS_BY_TYPE_QUERY,
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
  return useSanityData<Event | null>(EVENTS_QUERY, { id })
}

// ────────────────────────────────────────────────────────────────────────────────
// ─── Blogs ─────────────────────────────────────────────────────────────────────
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