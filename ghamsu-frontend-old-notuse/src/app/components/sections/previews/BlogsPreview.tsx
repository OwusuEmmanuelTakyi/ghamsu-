import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { sanityClient, imageUrl } from "../../../../lib/sanity";

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
] | order(publishedDate desc) [0...6] {
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
    month: "short",
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

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white animate-pulse border border-gray-200">
      <div className="h-40 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="space-y-1.5 pt-2">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ── Blog Card Component ────────────────────────────────────────────────────────
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group bg-white border border-gray-200 flex flex-col h-full transition-all duration-300 hover:shadow-lg"
    >
      {/* ── Image ── */}
      <Link
        to={`/blogs/${post.slug.current}`}
        className="block h-40 relative overflow-hidden bg-gradient-to-br from-blue-900 to-blue-700"
      >
        {post.featuredImage ? (
          <img
            src={imageUrl(post.featuredImage, 400, 300)}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/20 text-4xl font-bold">
              {post.title.charAt(0)}
            </span>
          </div>
        )}
      </Link>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category Badge */}
        {post.category && (
          <span className="inline-block mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
            {formatCategory(post.category)}
          </span>
        )}

        {/* Title */}
        <Link to={`/blogs/${post.slug.current}`}>
          <h3 className="text-base font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
        </Link>

        {/* Metadata */}
        <div className="mt-auto space-y-2 text-sm text-gray-600">
          {post.publishedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>{formatDate(post.publishedDate)}</span>
            </div>
          )}
          
          {post.readTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>{post.readTime} min read</span>
            </div>
          )}

          {post.author?.name && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>{post.author.name}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function BlogsPreview() {
  const { data: posts, loading, error } = useLatestBlogs();

  return (
    <section className="py-16 px-4 bg-white" aria-labelledby="blogs-heading">
      <div className="max-w-7xl mx-auto">

        {/* ── Header with Eyebrow & VIEW ALL Button ── */}
        <div className="mb-12">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 flex items-center gap-2"
          >
            <div className="h-px w-8 bg-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-600">
              Resources
            </span>
          </motion.div>

          {/* Title + Button Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-end justify-between gap-4"
          >
            <div className="flex-1">
              <h2
                id="blogs-heading"
                className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
              >
                Latest Blogs
              </h2>
              <p className="mt-2 text-base text-gray-600">
                Inspiring content to strengthen your faith journey
              </p>
            </div>

            <Link
              to="/blogs"
              className="mb-2 px-6 py-3 border-2 border-blue-900 text-blue-900 font-semibold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-blue-900 hover:text-white"
            >
              VIEW ALL
            </Link>
          </motion.div>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error State ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-red-500 font-semibold">{error}</p>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">
              No posts yet — check back soon.
            </p>
          </motion.div>
        )}

        {/* ── Blog Grid (5-6 columns on desktop) ── */}
        {!loading && !error && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12"
          >
            {posts.map((post, index) => (
              <BlogCard key={post._id} post={post} index={index} />
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
}