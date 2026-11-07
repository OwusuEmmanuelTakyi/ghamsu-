import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Blog } from '../types/types'

interface LikesAndViews {
  likes: number
  views: number
  isLiking: boolean
  hasLiked: boolean
  error: string | null
  addLike: () => Promise<void>
}

// Browser storage can be unavailable (private mode, blocked site data), so every
// access is guarded and the counters still work without it.
const storage = {
  get(area: Storage | undefined, key: string) {
    try { return area?.getItem(key) ?? null } catch { return null }
  },
  set(area: Storage | undefined, key: string, value: string) {
    try { area?.setItem(key, value) } catch { /* ignore */ }
  },
  remove(area: Storage | undefined, key: string) {
    try { area?.removeItem(key) } catch { /* ignore */ }
  },
}
const local = typeof window !== 'undefined' ? window.localStorage : undefined
const session = typeof window !== 'undefined' ? window.sessionStorage : undefined

/**
 * Likes and views through the increment_post_like and increment_post_view
 * database functions, which only change published posts.
 *
 * The like key is liked_<Sanity ID> for migrated posts, as it was before, so
 * people who already liked a post cannot like it again.
 */
export function useLikesAndViews(post: Blog | null): LikesAndViews {
  const slug = post?.slug.current
  const recordId = post ? post.legacyId ?? post._id : null
  const likeKey = recordId ? `liked_${recordId}` : null

  const [likes, setLikes] = useState(post?.likes ?? 0)
  const [views, setViews] = useState(post?.views ?? 0)
  const [isLiking, setIsLiking] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset when a different post loads.
  useEffect(() => {
    setLikes(post?.likes ?? 0)
    setViews(post?.views ?? 0)
    setHasLiked(likeKey ? storage.get(local, likeKey) === 'true' : false)
    setError(null)
  }, [post?._id])

  // One view per browser session per post.
  useEffect(() => {
    if (!slug || !recordId || !supabase) return
    const viewedKey = `viewed_${recordId}`
    if (storage.get(session, viewedKey)) return
    storage.set(session, viewedKey, 'true')

    supabase.rpc('increment_post_view', { post_slug: slug }).then(({ data, error: rpcError }) => {
      if (rpcError) {
        storage.remove(session, viewedKey)
        console.error('[views] Could not record the view:', rpcError.message)
        return
      }
      if (typeof data === 'number') setViews(data)
    })
  }, [slug, recordId])

  const addLike = async () => {
    if (!slug || !likeKey || !supabase || isLiking || hasLiked) return
    setIsLiking(true)
    setError(null)

    // Optimistic update, rolled back if the call fails.
    setLikes((prev) => prev + 1)
    setHasLiked(true)
    storage.set(local, likeKey, 'true')

    const { data, error: rpcError } = await supabase.rpc('increment_post_like', { post_slug: slug })
    if (rpcError || typeof data !== 'number') {
      console.error('[likes] Could not record the like:', rpcError?.message ?? 'no matching published post')
      setLikes((prev) => prev - 1)
      setHasLiked(false)
      storage.remove(local, likeKey)
      setError('Failed to add like')
    } else {
      setLikes(data)
    }
    setIsLiking(false)
  }

  return { likes, views, isLiking, hasLiked, error, addLike }
}
