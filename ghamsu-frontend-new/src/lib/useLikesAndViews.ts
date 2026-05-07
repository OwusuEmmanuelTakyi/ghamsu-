import { useState, useEffect } from 'react'
import { sanityClient } from './sanity'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LikesAndViews {
  likes: number
  views: number
  isLiking: boolean
  hasLiked: boolean
  error: string | null
  addLike: () => Promise<void>
  addView: () => Promise<void>
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useLikesAndViews(documentId: string): LikesAndViews {
  const [likes,     setLikes]     = useState<number>(0)
  const [views,     setViews]     = useState<number>(0)
  const [isLiking,  setIsLiking]  = useState(false)
  const [hasLiked,  setHasLiked]  = useState(false)
  const [hasViewed, setHasViewed] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  // ── Restore liked state from localStorage ───────────────────────────────
  useEffect(() => {
    if (!documentId) return
    const liked = localStorage.getItem(`liked_${documentId}`)
    if (liked === 'true') setHasLiked(true)
  }, [documentId])

  // ── Fetch initial likes & views via GROQ (replaces broken GraphQL) ──────
  useEffect(() => {
    if (!documentId) return

    const fetchStats = async () => {
      try {
        const data = await sanityClient.fetch<{ likes: number; views: number }>(
          `*[_id == $id][0]{ likes, views }`,
          { id: documentId }
        )
        if (data) {
          setLikes(data.likes ?? 0)
          setViews(data.views ?? 0)
        }
      } catch (err) {
        console.error('[useLikesAndViews] Failed to fetch stats:', err)
      }
    }

    fetchStats()
  }, [documentId])

  // ── Auto-increment view once per session ────────────────────────────────
  useEffect(() => {
    if (!hasViewed && documentId) {
      addView()
      setHasViewed(true)
    }
  }, [documentId])

  // ── Add like ─────────────────────────────────────────────────────────────
  const addLike = async () => {
    if (isLiking || hasLiked) return

    setIsLiking(true)
    setError(null)

    // Optimistic update — feels instant
    setLikes((prev) => prev + 1)
    setHasLiked(true)
    localStorage.setItem(`liked_${documentId}`, 'true')

    try {
      const response = await fetch('/api/blog-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: documentId, action: 'like' }),
      })

      if (!response.ok) throw new Error('Failed to add like')

      const data = await response.json()
      setLikes(data.likes)
    } catch (err) {
      console.error('[useLikesAndViews] Error adding like:', err)
      // Roll back optimistic update
      setLikes((prev) => prev - 1)
      setHasLiked(false)
      localStorage.removeItem(`liked_${documentId}`)
      setError('Failed to add like')
    } finally {
      setIsLiking(false)
    }
  }

  // ── Add view ─────────────────────────────────────────────────────────────
  const addView = async () => {
    try {
      const response = await fetch('/api/blog-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: documentId, action: 'view' }),
      })

      if (!response.ok) throw new Error('Failed to add view')

      const data = await response.json()
      setViews(data.views)
    } catch (err) {
      console.error('[useLikesAndViews] Error adding view:', err)
      // Not user-facing — fail silently
    }
  }

  return {
    likes,
    views,
    isLiking,
    hasLiked,
    error,
    addLike,
    addView,
  }
}