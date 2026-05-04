import { useParams, useNavigate } from 'react-router';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { useBlogBySlug } from '../../../src/lib/hooks';
import { urlFor } from '../../../src/lib/sanity';

export default function BlogDetail() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

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
    );
  }

  const { data: blog, loading, error } = useBlogBySlug(slug);

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
    );
  }

  if (loading) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

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
    );
  }

  return (
    <div className="pt-32 pb-24">
      {/* Back Button */}
      <section className="px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <button
              onClick={() => navigate('/blogs')}
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* Article */}
      <article className="px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            {/* Featured Image */}
            {blog.featuredImage && (
              <img
                src={urlFor(blog.featuredImage).width(800).url()}
                alt={blog.title}
                className="w-full h-96 object-cover rounded-lg mb-8"
              />
            )}

            {/* Title */}
            <h1
              className="text-5xl md:text-6xl mb-6"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}
            >
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground mb-8 pb-8 border-b flex-wrap">
              {/* Author with Local */}
              {blog.authorName && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{blog.authorName}</span>
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
                  <span>{new Date(blog.publishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}

              {/* Read Time */}
              {blog.readTime && (
                <span className="text-sm">
                  ⏱️ {blog.readTime} min read
                </span>
              )}

              {/* Category */}
              {blog.category && (
                <span className="bg-accent text-accent-foreground px-3 py-1 rounded text-sm capitalize">
                  {blog.category.replace('-', ' ')}
                </span>
              )}
            </div>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed italic border-l-4 border-accent pl-4">
              {blog.excerpt}
            </p>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              {blog.content && blog.content.length > 0 ? (
                <div className="text-lg leading-relaxed text-foreground space-y-6">
                  {blog.content.map((block: any, idx: number) => {
                    // Handle text blocks
                    if (block._type === 'block') {
                      return (
                        <div key={idx} className="prose prose-lg max-w-none">
                          {block.children?.map((child: any, childIdx: number) => (
                            <span key={childIdx}>{child.text}</span>
                          )).join('')}
                        </div>
                      );
                    }

                    // Handle image blocks
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
                      );
                    }

                    return null;
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No content available for this blog post.</p>
              )}
            </div>

            {/* Stats */}
            {(blog.likes !== undefined || blog.views !== undefined) && (
              <div className="flex gap-8 py-8 border-t border-b my-8">
                {blog.likes !== undefined && (
                  <div>
                    <p className="text-3xl font-bold text-accent">{blog.likes}</p>
                    <p className="text-sm text-muted-foreground mt-1">👍 Likes</p>
                  </div>
                )}
                {blog.views !== undefined && (
                  <div>
                    <p className="text-3xl font-bold text-accent">{blog.views}</p>
                    <p className="text-sm text-muted-foreground mt-1">👁️ Views</p>
                  </div>
                )}
              </div>
            )}

            {/* Author Info Section */}
            {blog.authorName && (
              <div className="bg-secondary/50 rounded-lg p-8 my-8 border border-border">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  About the Author
                </h3>
                <p className="font-semibold text-lg mb-1">{blog.authorName}</p>
                {blog.authorLocal && (
                  <p className="text-accent font-medium">{blog.authorLocal}</p>
                )}
              </div>
            )}
          </AnimatedSection>
        </div>
      </article>

      {/* Back to Blog */}
      <section className="px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Blog Posts
            </button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}