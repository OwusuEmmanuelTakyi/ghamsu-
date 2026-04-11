import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { sanityClient, imageUrl } from "../../../../lib/sanity";

// Image builder removed - using lib/sanity imageUrl

// ── Types ──────────────────────────────────────────────────────────────────────
interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  category?: string;
  featuredImage?: any;
  publishedDate?: string;
  readTime?: number;
  author?: { name: string };
}

// ── GROQ query ─────────────────────────────────────────────────────────────────
const BLOGS_QUERY = `*[
  _type == "blog" &&
  defined(publishedDate)
] | order(publishedDate desc) [0...3] {
  _id,
  title,
  slug,
  excerpt,
  category,
  featuredImage,
  publishedDate,
  readTime,
  author->{ name },
}`;

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Hook ───────────────────────────────────────────────────────────────────────
function useLatestBlogs() {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sanityClient
      .fetch<BlogPost[]>(BLOGS_QUERY)
      .then((res) => { setData(res ?? []); setLoading(false); })
      .catch((err) => {
        console.error("Blogs fetch error:", err);
        setError("Failed to load blog posts.");
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export function BlogsPreview() {
  const { data: posts, loading, error } = useLatestBlogs();

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">
            Resources
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Latest Blogs & Articles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Inspiring content to strengthen your faith journey
          </p>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <p className="text-center text-red-500 py-10">{error}</p>
        )}

        {/* ── Empty ── */}
        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-lg">
            No posts yet — check back soon.
          </p>
        )}

        {/* ── Grid ── */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover-lift group flex flex-col"
              >
                {/* ── Image ── */}
                <Link
                  to={`/blogs/${post.slug.current}`}
                  className="block h-48 relative overflow-hidden"
                >
                  {post.featuredImage ? (
                    <img
src={imageUrl(post.featuredImage, 400, 400)}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                      <span className="text-white/30 text-5xl font-bold">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {post.category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-md bg-white/95 backdrop-blur-sm text-blue-900 text-xs font-semibold">
                        {formatCategory(post.category)}
                      </span>
                    </div>
                  )}
                </Link>

                {/* ── Content ── */}
                <div className="p-6 bg-white flex flex-col flex-1">
                  {/* Date + read time */}
                  <div className="flex items-center gap-3 text-gray-500 text-sm mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{post.publishedDate ? formatDate(post.publishedDate) : ""}</span>
                    </div>
                    {post.readTime && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{post.readTime} min read</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <Link to={`/blogs/${post.slug.current}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Author + Read More */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                    {post.author?.name && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <User className="w-4 h-4 shrink-0" />
                        <span className="text-gray-600">{post.author.name}</span>
                      </div>
                    )}
                    <Link
                      to={`/blog/${post.slug.current}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors group/link ml-auto"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── View All ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-md"
          >
            View All Blogs
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}