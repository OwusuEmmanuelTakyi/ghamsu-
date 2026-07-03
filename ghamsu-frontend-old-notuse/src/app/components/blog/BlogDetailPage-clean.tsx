import { useParams, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  BookOpen,
  Share2,
  Facebook,
  Twitter,
  Link2,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { useBlogBySlug, useBlogs } from "../../../lib/hooks";
import { imageUrl } from "../../../lib/sanity";

// ── Portable Text renderers ────────────────────────────────────────────────────
const ptComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <figure className="my-8">
        <img
          src={imageUrl(value, 900)}
          alt={value.alt ?? ""}
          className="w-full rounded-xl shadow-md"
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value && value.href ? value.href : "#";
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 underline hover:text-orange-600 transition-colors"
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  block: {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-gray-900 mt-10 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-5 text-lg">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-orange-500 pl-6 py-1 my-6 italic text-gray-600 text-lg bg-orange-50 rounded-r-xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside pl-6 mb-5 space-y-2 text-gray-700 text-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside pl-6 mb-5 space-y-2 text-gray-700 text-lg">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
};

// ── Category label map ────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  faith: "Faith",
  leadership: "Leadership",
  "campus-life": "Campus Life",
  devotionals: "Devotionals",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(isoString: string | undefined): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fallbackCopy(text: string): void {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    alert("Link copied to clipboard!");
  } catch {
    alert("Could not copy. Please copy the link manually.");
  }
  document.body.removeChild(textarea);
}

async function handleShare(title: string): Promise<void> {
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({ title, url, text: title });
      return;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(function() {
      alert("Link copied to clipboard!");
    }).catch(function() {
      fallbackCopy(url);
    });
  } else {
    fallbackCopy(url);
  }
}

// ── Main component ─────────────────────────────────────────────────────────────
export function BlogDetailPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: blog, loading, error } = useBlogBySlug(slug ?? "");
  const { data: allBlogs } = useBlogs();

  const related = allBlogs
    ? allBlogs.filter((p: any) => p._id !== (blog?._id) && p.category === blog?.category)
      .slice(0, 3)
    : [];

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="min-h-screen bg-white">

      {/* ── Back nav ── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Articles
          </button>
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-400">
            <Link to="/" className="hover:text-orange-500 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/blog" className="hover:text-orange-500 transition-colors">
              Articles
            </Link>
            {blog && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-700 truncate max-w-48">{blog.title}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          <p className="text-gray-500">Loading article…</p>
        </div>
      )}

      {/* ── Error / Not found ── */}
      {(error || (!loading && !blog)) && (
        <div className="flex flex-col items-center justify-center py-40 gap-6 text-center px-4">
          <BookOpen className="w-16 h-16 text-gray-200" />
          <h2 className="text-2xl font-bold text-gray-800">Article not found</h2>
          <p className="text-gray-500 max-w-sm">
            This article may have been removed or the link is incorrect.
          </p>
          <Link
            to="/blog"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Browse All Articles
          </Link>
        </div>
      )}

      {/* ── Article ── */}
      {!loading && blog && (
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero image */}
          {blog.featuredImage && (
            <div className="w-full h-72 md:h-96 lg:h-[500px] overflow-hidden relative">
              <img
                src={imageUrl(blog.featuredImage, 1400, 700)}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
          )}

          <div className="max-w-4xl mx-auto px-4 py-12">

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {blog.category && (
                <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-900 text-sm font-semibold">
                  {CATEGORY_MAP[blog.category] || blog.category}
                </span>
              )}
              {blog.publishedDate && (
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  {formatDate(blog.publishedDate)}
                </div>
              )}
              {blog.readTime && (
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  {blog.readTime} min read
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-500 leading-relaxed mb-8 border-l-4 border-orange-500 pl-5">
              {blog.excerpt}
            </p>

            {/* Author */}
            {blog.authorName && (
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 mb-10">
                {blog.authorPhoto ? (
                  <img
                    src={imageUrl(blog.authorPhoto, 80, 80)}
                    alt={blog.authorName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900">{blog.authorName}</p>
                  {blog.authorPosition && (
                    <p className="text-orange-500 text-sm font-medium">{blog.authorPosition}</p>
                  )}
                  {blog.authorBio && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{blog.authorBio}</p>
                  )}
                </div>
              </div>
            )}

            <hr className="border-gray-100 mb-10" />

            {/* Portable Text body */}
            {blog.content ? (
              <div className="prose-article">
                <PortableText value={blog.content} components={ptComponents} />
              </div>
            ) : (
              <p className="text-gray-400 italic text-center py-10">
                Article content not available.
              </p>
            )}

            {/* ── Share ── */}
            <div className="mt-14 pt-8 border-t border-gray-100">
              <p className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-orange-500" />
                Share this article
              </p>
              <div className="flex flex-wrap gap-3">

                {/* Native share */}
                {hasNativeShare && (
                  <button
                    onClick={() => handleShare(blog.title)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors shadow"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                )}

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1877f2] hover:bg-[#1464d8] text-white text-sm font-semibold transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>

                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(blog.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black hover:bg-gray-800 text-white text-sm font-semibold transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  X / Twitter
                </a>

                {/* Copy link */}
                <button
                  onClick={() => handleShare(blog.title)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Copy Link
                </button>

              </div>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  More in{" "}
                  <span className="text-orange-500">
                    {CATEGORY_MAP[blog.category || ""] || "Articles"}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map((post: any) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug.current}`}
                      className="group block rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="h-40 overflow-hidden bg-gray-100">
                        {post.featuredImage ? (
                          <img
                            src={imageUrl(post.featuredImage, 400, 280)}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-orange-400" />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">
                          {formatDate(post.publishedDate)}
                        </p>
                        <h4 className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2 text-sm">
                          {post.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-16 text-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to All Articles
              </Link>
            </div>

          </div>
        </motion.article>
      )}
    </div>
  );
}
