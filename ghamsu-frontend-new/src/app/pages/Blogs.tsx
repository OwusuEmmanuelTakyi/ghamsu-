import { useState } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useBlogs } from '../../../src/lib/hooks';
import { urlFor } from '../../../src/lib/sanity';
import { useNavigate } from 'react-router';

export default function Blogs() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const navigate = useNavigate();
  
  const { data: blogs, loading, error } = useBlogs({ category: selectedCategory });

  // Get unique categories from all blogs
  const allBlogs = useBlogs().data || [];
  const categories = ['All', ...Array.from(new Set(allBlogs.map((b) => b.category).filter(Boolean)))];

  if (error) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 
            className="text-4xl mb-4" 
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
          >
            Blog
          </h1>
          <p className="text-red-500">Error loading blogs: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-4 mb-24">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h1
              className="text-5xl md:text-6xl mb-6"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              Church Blog
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Insights, encouragement, and practical wisdom for your spiritual journey.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                  !selectedCategory
                    ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                }`}
              >
                All
              </button>
              {categories.filter((cat) => cat !== 'All').map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                    selectedCategory === category
                      ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading blog posts...</p>
            </div>
          ) : !blogs || blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post, index) => (
                <AnimatedSection key={post._id} delay={index * 0.1}>
                  <article className="bg-card border border-border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group h-full flex flex-col">
                    {/* Featured Image */}
                    <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                      <img
                        src={urlFor(post.featuredImage).width(600).height(300).url()}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {post.category && (
                        <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 text-sm font-medium rounded capitalize">
                          {post.category.replace('-', ' ')}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h2
                        className="text-2xl mb-3 group-hover:text-primary transition-colors"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Author & Date */}
                      <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-4">
                        {/* Author Info */}
                        {post.authorName && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-foreground font-semibold">{post.authorName}</span>
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
    </div>
  );
}