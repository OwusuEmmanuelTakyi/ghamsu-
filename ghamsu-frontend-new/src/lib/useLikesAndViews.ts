import { useState, useEffect, useCallback } from 'react'

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
  const [likes, setLikes] = useState<number>(0)
  const [views, setViews] = useState<number>(0)
  const [isLiking, setIsLiking] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Restore liked state from localStorage per post ──────────────────────
  useEffect(() => {
    if (!documentId) return

    try {
      const liked = localStorage.getItem(`liked_${documentId}`)
      setHasLiked(liked === 'true')
    } catch (err) {
      console.error('[useLikesAndViews] Failed to read liked state:', err)
    }
  }, [documentId])

  // ── Fetch initial stats from your Vercel API route ──────────────────────
  useEffect(() => {
    if (!documentId) return

    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/blog-stats?id=${encodeURIComponent(documentId)}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }

        const data = await response.json()

        setLikes(Number(data.likes ?? 0))
        setViews(Number(data.views ?? 0))
      } catch (err) {
        console.error('[useLikesAndViews] Failed to fetch stats:', err)
      }
    }

    fetchStats()
  }, [documentId])

  // ── Add view ─────────────────────────────────────────────────────────────
  const addView = useCallback(async () => {
    if (!documentId) return

    try {
      const response = await fetch('/api/blog-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: documentId,
          action: 'view',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add view')
      }

      const data = await response.json()

      setLikes(Number(data.likes ?? 0))
      setViews(Number(data.views ?? 0))
    } catch (err) {
      console.error('[useLikesAndViews] Error adding view:', err)
    }
  }, [documentId])

  // ── Auto-increment view once per browser session per post ───────────────
  useEffect(() => {
    if (!documentId) return

    const viewKey = `viewed_${documentId}`

    try {
      const alreadyViewed = sessionStorage.getItem(viewKey)

      if (!alreadyViewed) {
        addView()
        sessionStorage.setItem(viewKey, 'true')
      }
    } catch (err) {
      console.error('[useLikesAndViews] Failed to save view state:', err)
      addView()
    }
  }, [documentId, addView])

  // ── Add like ─────────────────────────────────────────────────────────────
  const addLike = useCallback(async () => {
    if (!documentId || isLiking || hasLiked) return

    setIsLiking(true)
    setError(null)

    setLikes((prev) => prev + 1)
    setHasLiked(true)

    try {
      localStorage.setItem(`liked_${documentId}`, 'true')

      const response = await fetch('/api/blog-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: documentId,
          action: 'like',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add like')
      }

      const data = await response.json()

      setLikes(Number(data.likes ?? 0))
      setViews(Number(data.views ?? 0))
    } catch (err) {
      console.error('[useLikesAndViews] Error adding like:', err)

      setLikes((prev) => Math.max(0, prev - 1))
      setHasLiked(false)
      localStorage.removeItem(`liked_${documentId}`)
      setError('Failed to add like')
    } finally {
      setIsLiking(false)
    }
  }, [documentId, isLiking, hasLiked])

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