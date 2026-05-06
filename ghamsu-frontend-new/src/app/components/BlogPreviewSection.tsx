import { Calendar, User, ArrowRight } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'
import { useFeaturedBlogs } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'

export function BlogPreviewSection() {
  const { data: blogs, loading, error } = useFeaturedBlogs()

  const displayBlogs = blogs && blogs.length > 0 ? blogs : []

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

      <section className="blog-section py-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection>
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="mb-4">
                  <div className="blog-eyebrow-line h-[1px] w-12 mb-4" />
                  <p
                    className="blog-eyebrow text-xs tracking-[0.3em] uppercase"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Latest Insights
                  </p>
                </div>
                <h2
                  className="blog-heading text-4xl md:text-5xl lg:text-6xl tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Recent Blogs
                </h2>
              </div>
              <Link to="/blogs">
                <button className="blog-cta-btn hidden md:flex items-center gap-3 px-8 py-3 text-sm tracking-wider uppercase font-semibold group focus:outline-none">
                  Read More Blogs
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
              </Link>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="text-center py-12">
              <p className="blog-loading">Loading blogs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading blogs: {error.message}</p>
            </div>
          ) : displayBlogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="blog-loading">No featured blogs available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayBlogs.map((blog, index) => (
                <AnimatedSection key={blog._id} delay={index * 0.1}>
                  <Link to={`/blogs/${blog.slug.current}`}>
                    <article className="blog-card overflow-hidden group h-full flex flex-col">
                      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                        <img
                          src={urlFor(blog.featuredImage).width(600).height(300).url()}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {blog.category && (
                          <div className="blog-category-badge absolute top-4 left-4 px-3 py-1 text-xs font-medium uppercase tracking-wider">
                            {blog.category}
                          </div>
                        )}
                      </div>
                      <div className="p-8 flex-1 flex flex-col">
                        <h3
                          className="blog-card-title text-2xl mb-4 tracking-tight transition-colors"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                        >
                          {blog.title}
                        </h3>
                        <p className="blog-card-excerpt leading-relaxed mb-6 font-light flex-1">
                          {blog.excerpt}
                        </p>
                        <div className="blog-card-meta flex items-center gap-4 text-xs pt-4">
                          {blog.authorName && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" strokeWidth={1.5} />
                              <span>{blog.authorName}</span>
                            </div>
                          )}
                          {blog.publishedDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" strokeWidth={1.5} />
                              <span>{new Date(blog.publishedDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/blogs">
              <button className="blog-cta-btn flex items-center gap-3 px-8 py-3 text-sm tracking-wider uppercase font-semibold group mx-auto focus:outline-none">
                Read More Blogs
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}