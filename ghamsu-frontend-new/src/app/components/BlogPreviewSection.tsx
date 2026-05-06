import { Calendar, User, ArrowRight } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'
import { useNews, useArticles } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'

export function BlogPreviewSection() {
  const { data: news, loading: newsLoading } = useNews()
  const { data: articles, loading: articlesLoading } = useArticles()

  // Get latest news (first item) and latest articles (first 2 items)
  const latestNews = news && news.length > 0 ? [news[0]] : []
  const latestArticles = articles && articles.length > 0 ? articles.slice(0, 2) : []
  const loading = newsLoading || articlesLoading

  // Combine for display (1 news + 2 articles)
  const displayItems = [
    ...latestNews.map((item: any) => ({ ...item, type: 'news', _type: 'news' })),
    ...latestArticles.map((item: any) => ({ ...item, type: 'article', _type: 'article' })),
  ]

  const getTypeLabel = (type: string) => {
    return type === 'news' ? 'News' : 'Article'
  }

  const getTypeColor = (type: string) => {
    return type === 'news' 
      ? 'bg-red-500/20 text-red-600' 
      : 'bg-blue-500/20 text-blue-600'
  }

  return (
    <>
      <style>{`
        .blog-section {
          background-color: #FFFFFF;
        }
        .blog-eyebrow-line {
          background-color: #D4AF37;
        }
        .blog-eyebrow {
          color: #D4AF37;
        }
        .blog-heading {
          color: #003D82;
        }
        .blog-cta-btn {
          border: 2px solid #003D82;
          color: #003D82;
          background: transparent;
          transition: background 0.3s, color 0.3s;
        }
        .blog-cta-btn:hover {
          background-color: #003D82;
          color: #FFFFFF;
        }
        .blog-card {
          background-color: #F8F9FB;
          border: 1px solid rgba(0, 61, 130, 0.12);
          transition: border-color 0.5s, box-shadow 0.5s;
        }
        .blog-card:hover {
          border-color: rgba(212, 175, 55, 0.55);
          box-shadow: 0 8px 30px rgba(0, 61, 130, 0.1);
        }
        .blog-card-title {
          color: #003D82;
        }
        .blog-card:hover .blog-card-title {
          color: #D4AF37;
        }
        .blog-card-excerpt {
          color: rgba(0, 61, 130, 0.6);
        }
        .blog-card-meta {
          color: rgba(0, 61, 130, 0.5);
          border-top: 1px solid rgba(0, 61, 130, 0.1);
        }
        .blog-category-badge {
          background-color: #D4AF37;
          color: #003D82;
        }
        .blog-loading {
          color: rgba(0, 61, 130, 0.55);
        }

        /* Dark mode — restore original CSS variable styles */
        .dark .blog-section {
          background-color: transparent;
        }
        .dark .blog-eyebrow-line {
          background-color: var(--accent);
        }
        .dark .blog-eyebrow {
          color: var(--accent);
        }
        .dark .blog-heading {
          color: var(--foreground);
        }
        .dark .blog-cta-btn {
          border-color: var(--primary);
          color: var(--primary);
        }
        .dark .blog-cta-btn:hover {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
        .dark .blog-card {
          background-color: var(--card);
          border: 1px solid var(--border);
        }
        .dark .blog-card:hover {
          border-color: color-mix(in srgb, var(--accent) 50%, transparent);
          box-shadow: none;
        }
        .dark .blog-card-title {
          color: var(--foreground);
        }
        .dark .blog-card:hover .blog-card-title {
          color: var(--accent);
        }
        .dark .blog-card-excerpt {
          color: var(--muted-foreground);
        }
        .dark .blog-card-meta {
          color: var(--muted-foreground);
          border-top: 1px solid var(--border);
        }
        .dark .blog-category-badge {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }
        .dark .blog-loading {
          color: var(--muted-foreground);
        }
      `}</style>

      <section className="blog-section py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection>
            <div className="flex justify-between items-end mb-12 sm:mb-16">
              <div>
                <div className="mb-4 sm:mb-6">
                  <div className="blog-eyebrow-line h-[1px] w-12 mb-3 sm:mb-4" />
                  <p
                    className="blog-eyebrow text-xs tracking-[0.3em] uppercase"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Latest Insights
                  </p>
                </div>
                <h2
                  className="blog-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  News & Blogs
                </h2>
              </div>
              <Link to="/blogs#all-posts">
                <button className="blog-cta-btn hidden md:flex items-center gap-3 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm tracking-wider uppercase font-semibold group focus:outline-none">
                  Read More
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
              </Link>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="text-center py-12">
              <p className="blog-loading">Loading blogs and news...</p>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="blog-loading">No featured blogs or news available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {displayItems.map((item, index) => {
                const isNews = item.type === 'news'
                const typeLabel = getTypeLabel(item.type)
                const typeColorClass = getTypeColor(item.type)

                return (
                  <AnimatedSection key={item._id} delay={index * 0.1}>
                    <Link to={`/blogs/${item.slug.current}`}>
                      <article className="blog-card overflow-hidden group h-full flex flex-col rounded-lg">
                        <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                          <img
                            src={urlFor(item.featuredImage).width(600).height(300).url()}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          {/* Type Badge */}
                          <div className={`absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 sm:px-3 py-1 text-xs font-medium uppercase tracking-wider rounded ${typeColorClass}`}>
                            {typeLabel}
                          </div>
                          {/* Category Badge - Only for articles */}
                          {item.type === 'article' && item.category && (
                            <div className="blog-category-badge absolute top-3 sm:top-4 right-3 sm:right-4 px-2.5 sm:px-3 py-1 text-xs font-medium uppercase tracking-wider rounded">
                              {item.category.replace('-', ' ')}
                            </div>
                          )}
                        </div>
                        <div className="p-5 sm:p-6 md:p-8 flex-1 flex flex-col">
                          <h3
                            className="blog-card-title text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 tracking-tight transition-colors"
                            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                          >
                            {item.title}
                          </h3>
                          <p className="blog-card-excerpt text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-light flex-1 line-clamp-2">
                            {item.excerpt}
                          </p>
                          <div className="blog-card-meta flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs pt-4">
                            {item.authorName && (
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={1.5} />
                                <span className="truncate">{item.authorName}</span>
                              </div>
                            )}
                            {item.publishedDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" strokeWidth={1.5} />
                                <span>{new Date(item.publishedDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  </AnimatedSection>
                )
              })}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/blogs#all-posts">
              <button className="blog-cta-btn inline-flex items-center gap-3 px-6 py-2.5 text-xs tracking-wider uppercase font-semibold group focus:outline-none">
                Read More Blogs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}