import { useState, useEffect } from 'react'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { useBlogs } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'
import { useNavigate, useLocation } from 'react-router'

export default function Blogs() {
  const [contentType, setContentType] = useState<'all' | 'news' | 'articles'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const navigate = useNavigate()
  const location = useLocation()

  // Handle hash anchor scrolling
  useEffect(() => {
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [location])

  // Handle content type based on hash or query parameter
  useEffect(() => {
    const hash = window.location.hash
    const searchParams = new URLSearchParams(location.search)
    
    if (hash === '#news') {
      setContentType('news')
      setSelectedCategory(undefined)
    } else if (hash === '#articles') {
      setContentType('articles')
      setSelectedCategory(undefined)
    } else if (hash === '#all-posts') {
      setContentType('all')
      setSelectedCategory(undefined)
    }
  }, [location.hash, location.search])

  const { data: blogs, loading, error } = useBlogs({ category: selectedCategory })

  // Get unique categories from all blogs
  const allBlogs = useBlogs().data || []
  const categories = ['All', ...Array.from(new Set(allBlogs.map((b) => b.category).filter(Boolean)))]

  // Filter content based on type
  const filteredContent = blogs?.filter((post) => {
    if (contentType === 'all') return true
    if (contentType === 'news') return post.category === 'news'
    if (contentType === 'articles') return post.category !== 'news'
    return true
  })

  if (error) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Blog
          </h1>
          <p className="text-red-500">Error loading blogs: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <HeroSection
        title="News & Articles"
        subtitle="Latest updates, insights, and practical wisdom for your spiritual journey."
        backgroundImage="https://images.unsplash.com/photo-1778088742542-ffe6bab6fe0e?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        isHomePage={false}
      />

      <div className="pb-24">
        {/* Content Type Filter */}
        <section id="all-posts" className="px-4 py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <button
                  onClick={() => setContentType('all')}
                  className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                    contentType === 'all'
                      ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setContentType('news')}
                  className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                    contentType === 'news'
                      ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                  }`}
                >
                  News
                </button>
                <button
                  onClick={() => setContentType('articles')}
                  className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                    contentType === 'articles'
                      ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                  }`}
                >
                  Articles
                </button>
              </div>
            </AnimatedSection>

            {/* Category Filter */}
            <AnimatedSection delay={0.1}>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                    !selectedCategory
                      ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                  }`}
                >
                  All Categories
                </button>
                {categories
                  .filter((cat) => cat !== 'All')
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-2.5 font-medium transition-all rounded-lg capitalize ${
                        selectedCategory === category
                          ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                      }`}
                    >
                      {category.replace('-', ' ')}
                    </button>
                  ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="px-4 pb-16 sm:pb-20 md:pb-24">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            ) : !filteredContent || filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No content found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredContent.map((post, index) => (
                  <AnimatedSection key={post._id} delay={index * 0.1}>
                    <article className="bg-card border border-border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group h-full flex flex-col">
                      {/* Featured Image */}
                      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                        <img
                          src={urlFor(post.featuredImage).width(600).height(300).url()}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          {/* Type Badge */}
                          <div
                            className={`px-3 py-1 text-sm font-medium rounded text-white ${
                              post.category === 'news' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                          >
                            {post.category === 'news' ? 'News' : 'Article'}
                          </div>
                          {/* Category Badge */}
                          {post.category && post.category !== 'news' && (
                            <div className="bg-accent text-accent-foreground px-3 py-1 text-sm font-medium rounded capitalize">
                              {post.category.replace('-', ' ')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <h2 className="text-2xl mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
                          {post.excerpt}
                        </p>

                        {/* Author/Reporter & Date */}
                        <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-4">
                          {/* Author or Reporter Info */}
                          {post.authorName && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 flex-shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-foreground font-semibold">{post.authorName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {post.category === 'news' ? 'Reporter' : 'Author'}
                                </span>
                                {post.authorLocal && (
                                  <span className="text-xs text-muted-foreground">{post.authorLocal}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Date */}
                          {post.publishedDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Read More Link */}
                        <button
                          onClick={() => navigate(`/blogs/${post.slug.current}`)}
                          className="flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium group mt-auto"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </article>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Reporter Recruitment Section */}
        <section className="px-4 py-16 sm:py-20 md:py-24 bg-[#003D82]">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 sm:mb-6 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Want to be our reporter? or contribute articles?
              </h2>
              <p className="text-white/80 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto font-light">
                Share your stories, cover community events, and spread the word about GHAMSU's inspiring activities. Join our team of reporters today!
              </p>
              <div className="h-[2px] w-20 bg-[#D4AF37] mx-auto mb-8 sm:mb-10" />
              <a
                href="mailto:ghamsupcb@gmail.com?subject=Reporter%20Application&body=Hello%2C%0A%0AI%20am%20interested%20in%20becoming%20a%20reporter%20for%20GHAMSU.%0A%0APlease%20let%20me%20know%20more%20about%20the%20opportunity.%0A%0AThank%20you!"
                className="inline-flex items-center gap-3 bg-[#D4AF37] text-[#003D82] px-8 sm:px-10 py-3 sm:py-4 rounded-lg hover:bg-white transition-colors font-semibold text-sm sm:text-base tracking-wide group"
              >
                📝 Apply as Reporter
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </div>
  )
}