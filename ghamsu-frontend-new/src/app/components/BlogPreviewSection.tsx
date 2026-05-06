import { Calendar, User, ArrowRight } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'
import { useFeaturedBlogs } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'

export function BlogPreviewSection() {
  const { data: blogs, loading, error } = useFeaturedBlogs()

  const displayBlogs = blogs && blogs.length > 0 ? blogs : []

  return (
    <section className="py-32 px-6">
      <div className="max-w-[1400px] mx-auto">
        <AnimatedSection>
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="mb-4">
                <div className="h-[1px] w-12 bg-accent mb-4" />
                <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                  Latest Insights
                </p>
              </div>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Recent Blogs
              </h2>
            </div>
            <Link to="/blogs">
              <button className="hidden md:flex items-center gap-3 border-2 border-primary text-primary px-8 py-3 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 group">
                Read More Blogs
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </button>
            </Link>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading blogs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading blogs: {error.message}</p>
          </div>
        ) : displayBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured blogs available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayBlogs.map((blog, index) => (
              <AnimatedSection key={blog._id} delay={index * 0.1}>
                <Link to={`/blogs/${blog.slug.current}`}>
                  <article className="bg-card border border-border hover:border-accent/50 transition-all duration-500 overflow-hidden group h-full flex flex-col">
                    <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                      <img
                        src={urlFor(blog.featuredImage).width(600).height(300).url()}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {blog.category && (
                        <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 text-xs font-medium uppercase tracking-wider">
                          {blog.category}
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3
                        className="text-2xl mb-4 tracking-tight group-hover:text-accent transition-colors"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        {blog.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6 font-light flex-1">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
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
            <button className="flex items-center gap-3 border-2 border-primary text-primary px-8 py-3 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 group mx-auto">
              Read More Blogs
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}