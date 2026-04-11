import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Calendar, Clock, User, BookOpen, ArrowRight, Loader2, Search } from "lucide-react";
import { useBlogs } from "../../../lib/hooks";
import { imageUrl } from "../../../lib/sanity";
import type { Blog } from "../../../types/types";

const CATEGORIES = ["All", "Devotionals", "Faith", "Leadership", "Campus Life"];
const CATEGORY_MAP: Record<string, string> = {
  faith: "Faith",
  leadership: "Leadership",
  "campus-life": "Campus Life",
  devotionals: "Devotionals",
};
const PAGE_SIZE = 9;

function formatDate(isoString?: string) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogListPage() {
  const { data: blogs, loading, error } = useBlogs();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = !blogs
    ? []
    : blogs
        .filter((p) =>
          activeCategory === "All"
            ? true
            : CATEGORY_MAP[p.category ?? ""] === activeCategory
        )
        .filter((p) =>
          search.trim()
            ? p.title.toLowerCase().includes(search.toLowerCase()) ||
              p.excerpt.toLowerCase().includes(search.toLowerCase())
            : true
        );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilter(cat: string) {
    setActiveCategory(cat);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-blue-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-4">
            <BookOpen className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">Resources</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Articles & Insights</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Inspiring content to strengthen your faith journey and campus experience
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-center text-red-500 py-20">
            Failed to load articles. Please try again later.
          </p>
        )}

        {!loading && !error && paginated.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No articles found.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && paginated.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginated.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover-lift group flex flex-col"
                >
                  <div className="h-56 relative overflow-hidden flex-shrink-0">
                    {post.featuredImage ? (
                      <img
                        src={imageUrl(post.featuredImage, 600, 400)}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900 to-orange-400" />
                    )}
                    {post.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold">
                          {CATEGORY_MAP[post.category] ?? post.category}
                        </span>
                      </div>
                    )}
                    {post.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-bold">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-gray-500 text-sm mb-3 flex-wrap">
                      {post.publishedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.publishedDate)}
                        </div>
                      )}
                      {post.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min read
                        </div>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      {post.authorName && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          {post.authorPhoto ? (
                            <img
                              src={imageUrl(post.authorPhoto, 32, 32)}
                              alt={post.authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span className="truncate">{post.authorName}</span>
                        </div>
                      )}
                      <Link
                        to={`/blog/${post.slug.current}`}
                        className="text-orange-500 hover:text-orange-600 font-semibold text-sm flex items-center gap-1 transition-colors group/link"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      page === i + 1
                        ? "bg-blue-900 text-white shadow-md"
                        : "border border-gray-200 hover:border-blue-900 hover:text-blue-900"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}