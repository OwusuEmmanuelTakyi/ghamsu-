import { useParams, useNavigate } from 'react-router'
import { Calendar, User, ArrowLeft, Heart, Eye, Share2 } from 'lucide-react'
import { AnimatedSection } from '../components/AnimatedSection'
import { useBlogBySlug } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'
import { useLikesAndViews } from '../../../src/lib/useLikesAndViews'
import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Share Helper
// ─────────────────────────────────────────────────────────────────────────────

async function sharePost(title: string) {
  const url = window.location.href

  // Use native Web Share API if available (mobile devices, modern browsers)
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
    } catch (err) {
      // User cancelled — do nothing
    }
    return
  }

  // Fallback: copy link to clipboard
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    // Last resort fallback for very old browsers
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    return 'copied'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BlogDetail() {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const [copyToast, setCopyToast] = useState(false)

  // ── Share handler ────────────────────────────────────────────────────────

  const handleShare = async (title: string) => {
    const result = await sharePost(title)
    if (result === 'copied') {
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 2500)
    }
  }

  // ── Guard: no slug ───────────────────────────────────────────────────────

  if (!slug) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/blogs')}
            className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
          <div className="text-center">
            <h1
              className="text-4xl mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              Invalid Blog
            </h1>
            <p className="text-muted-foreground">No blog slug provided.</p>
          </div>
        </div>
      </div>
    )
  }

  const { data: blog, loading, error } = useBlogBySlug(slug)
  const { likes, views, isLiking, hasLiked, addLike } = useLikesAndViews(blog?._id || '')

  // ── Guard: error ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/blogs')}
            className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
          <div className="text-center">
            <h1
              className="text-4xl mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              Error Loading Blog
            </h1>
            <p className="text-red-500">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Guard: loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    )
  }

  // ── Guard: not found ─────────────────────────────────────────────────────

  if (!blog) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/blogs')}
            className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
          <div className="text-center">
            <h1
              className="text-4xl mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              Blog Post Not Found
            </h1>
            <p className="text-muted-foreground">The blog post you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const isNews = blog.category === 'news' || blog._type === 'news'
  const contentType = isNews ? 'News' : 'Article'
  const authorLabel = isNews ? 'Reporter' : 'Author'

  // ── Content renderer ─────────────────────────────────────────────────────

  const renderContent = () => {
    if (!blog.content || !Array.isArray(blog.content)) {
      return <p className="text-muted-foreground">No content available for this post.</p>
    }

    return blog.content.map((block: any, idx: number) => {
      if (block._type === 'block') {
        return (
          <div key={idx} className="mb-6">
            {block.children?.map((child: any, childIdx: number) => {
              const text = child.text
              let element = <span key={childIdx}>{text}</span>

              if (child.marks?.includes('strong')) {
                element = <strong key={childIdx} className="font-semibold">{text}</strong>
              } else if (child.marks?.includes('em')) {
                element = <em key={childIdx} className="italic">{text}</em>
              } else if (child.marks?.includes('code')) {
                element = <code key={childIdx} className="bg-secondary/50 px-2 py-1 rounded font-mono text-sm">{text}</code>
              }

              return element
            })}
          </div>
        )
      }

      if (block._type === 'block' && block.style?.startsWith('h')) {
        const level = block.style.charAt(1)
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements
        return (
          <HeadingTag key={idx} className={`text-${level === '1' ? '3xl' : level === '2' ? '2xl' : 'xl'} font-bold mt-8 mb-4`}>
            {block.children?.map((child: any) => child.text).join('')}
          </HeadingTag>
        )
      }

      if (block._type === 'image') {
        return (
          <figure key={idx} className="my-12">
            <img
              src={urlFor(block).width(800).url()}
              alt={block.alt || 'Blog image'}
              className="w-full rounded-lg"
            />
            {block.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-4 italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        )
      }

      if (block.listItem === 'bullet') {
        return (
          <ul key={idx} className="list-disc list-inside mb-6 space-y-2">
            <li>{block.children?.map((child: any) => child.text).join('')}</li>
          </ul>
        )
      }

      if (block.listItem === 'number') {
        return (
          <ol key={idx} className="list-decimal list-inside mb-6 space-y-2">
            <li>{block.children?.map((child: any) => child.text).join('')}</li>
          </ol>
        )
      }

      return null
    })
  }

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="pt-32 pb-24">

      {/* ── Copy toast notification ── */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg animate-fade-in">
          🔗 Link copied to clipboard
        </div>
      )}

      {/* ── Back Button ── */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <button
              onClick={() => navigate('/blogs')}
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Article ── */}
      <article className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>

            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="relative">
                <img
                  src={urlFor(blog.featuredImage).width(800).url()}
                  alt={blog.title}
                  className="w-full h-96 object-cover rounded-lg mb-8 sm:mb-10 md:mb-12"
                />

                {/* Views, Likes & Share Overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {/* Views */}
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{views}</span>
                  </div>

                  {/* Like button */}
                  <button
                    onClick={addLike}
                    disabled={isLiking || hasLiked}
                    aria-label={hasLiked ? 'You liked this post' : 'Like this post'}
                    className={`flex items-center gap-2 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm transition-all duration-200 disabled:opacity-60 ${
                      hasLiked
                        ? 'bg-red-500/80 scale-105'
                        : 'bg-black/50 hover:bg-red-500/70 active:scale-95'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all duration-200 ${
                        hasLiked ? 'fill-white' : ''
                      }`}
                    />
                    <span>{likes}</span>
                  </button>

                  {/* Share button */}
                  <button
                    onClick={() => handleShare(blog.title)}
                    aria-label="Share this post"
                    className="flex items-center gap-2 bg-black/50 hover:bg-blue-500/70 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm transition-all duration-200 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            )}

            {/* Title */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl mb-6 sm:mb-8"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground mb-8 pb-8 border-b flex-wrap">
              {/* Type Badge */}
              <span className={`inline-block px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                isNews ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'
              }`}>
                {contentType}
              </span>

              {/* Author/Reporter */}
              {blog.authorName && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm sm:text-base">{blog.authorName}</span>
                    <span className="text-xs text-muted-foreground">{authorLabel}</span>
                    {blog.authorLocal && (
                      <span className="text-xs text-muted-foreground">{blog.authorLocal}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Date */}
              {blog.publishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">
                    {new Date(blog.publishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {/* Read Time */}
              {blog.readTime && (
                <span className="text-xs sm:text-sm">⏱️ {blog.readTime} min read</span>
              )}

              {/* Category */}
              {blog.category && blog.category !== 'news' && (
                <span className="bg-accent text-accent-foreground px-3 py-1 rounded text-xs sm:text-sm capitalize inline-block">
                  {blog.category.replace('-', ' ')}
                </span>
              )}
            </div>

            {/* Excerpt */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 leading-relaxed italic border-l-4 border-accent pl-4">
              {blog.excerpt}
            </p>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12 sm:mb-16 text-base sm:text-lg leading-relaxed text-foreground space-y-6">
              {renderContent()}
            </div>

            {/* Stats + Share row */}
            {(likes !== undefined || views !== undefined) && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-8 border-t border-b my-8 sm:my-10">
                <div className="flex gap-8">
                  {likes !== undefined && (
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-accent">{likes}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">👍 Likes</p>
                    </div>
                  )}
                  {views !== undefined && (
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-accent">{views}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">👁️ Views</p>
                    </div>
                  )}
                </div>

                {/* Like + Share action buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={addLike}
                    disabled={isLiking || hasLiked}
                    aria-label={hasLiked ? 'Already liked' : 'Like this post'}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border disabled:opacity-60 ${
                      hasLiked
                        ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-500/10 dark:border-red-500/30'
                        : 'border-border hover:border-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all duration-200 ${
                        hasLiked ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                    {hasLiked ? 'Liked' : 'Like'}
                  </button>

                  <button
                    onClick={() => handleShare(blog.title)}
                    aria-label="Share this post"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            )}

            {/* Author Info */}
            {blog.authorName && (
              <div className="bg-secondary/50 rounded-lg p-6 sm:p-8 my-8 sm:my-10 border border-border">
                <h3
                  className="text-xl sm:text-2xl font-bold mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  About the {authorLabel}
                </h3>
                <p className="font-semibold text-base sm:text-lg mb-1">{blog.authorName}</p>
                {blog.authorLocal && (
                  <p className="text-accent font-medium text-sm sm:text-base">{blog.authorLocal}</p>
                )}
              </div>
            )}

          </AnimatedSection>
        </div>
      </article>

      {/* ── Bottom Back Button ── */}
      <section className="px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20 md:mt-24">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Blog Posts
            </button>
          </AnimatedSection>
        </div>
      </section>

    </div>
  )
}