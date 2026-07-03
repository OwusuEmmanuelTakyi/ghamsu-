import { motion } from "motion/react";
import { Calendar, User, ArrowRight, BookOpen, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useBlogs } from "../../../lib/hooks";
import { imageUrl } from "../../../lib/sanity";
import type { Blog } from "../../../types/types";

const categories = ["All", "Devotionals", "Faith", "Leadership", "Campus Life"];

const CATEGORY_MAP: Record<string, string> = {
  faith: "Faith",
  leadership: "Leadership",
  "campus-life": "Campus Life",
  devotionals: "Devotionals",
};

function formatDate(isoString?: string) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogsSection() {
  const { data: blogs, loading, error } = useBlogs();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    !blogs
      ? []
      : activeCategory === "All"
      ? blogs
      : blogs.filter(
          (p) => CATEGORY_MAP[p.category ?? ""] === activeCategory
        );

  const featuredPost = blogs?.find((p) => p.featured) ?? blogs?.[0] ?? null;
  const gridPosts = filtered.filter((p) => p._id !== featuredPost?._id).slice(0, 6);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-4">
            <BookOpen className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600">Resources</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Articles & Insights
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Inspiring content to strengthen your faith journey and campus experience
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                activeCategory === category
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading articles…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">
              Failed to load articles. Please try again later.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No articles in this category yet.</p>
          </div>
        )}

        {/* Featured Article */}
        {!loading && !error && featuredPost && activeCategory === "All" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 hover-lift group">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image */}
                <div className="h-80 lg:h-auto relative overflow-hidden">
                  {featuredPost.featuredImage ? (
                    <img
                      src={imageUrl(featuredPost.featuredImage, 900, 600)}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-orange-500" />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold shadow-lg">
                      Featured Article
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    {featuredPost.category && (
                      <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-900 text-sm font-semibold">
                        {CATEGORY_MAP[featuredPost.category] ?? featuredPost.category}
                      </span>
                    )}
                    {featuredPost.publishedDate && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPost.publishedDate)}
                      </div>
                    )}
                    {featuredPost.readTime && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime} min read
                      </div>
                    )}
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-orange-500 transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    {featuredPost.authorName && (
                      <div className="flex items-center gap-2 text-gray-600">
                        {featuredPost.authorPhoto ? (
                          <img
                            src={imageUrl(featuredPost.authorPhoto, 40, 40)}
                            alt={featuredPost.authorName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                        <span className="font-medium">{featuredPost.authorName}</span>
                      </div>
                    )}
                    <Link
                      to={`/blog/${featuredPost.slug.current}`}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all shadow-md group"
                    >
                      Read More
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid Articles */}
        {!loading && !error && gridPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridPosts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
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
                      className="text-orange-500 hover:text-orange-600 font-semibold text-sm flex items-center gap-1 transition-colors group"
                    >
                      Read
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* View All Button */}
        {!loading && !error && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/blog"
              className="inline-block px-8 py-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-all shadow-md hover:shadow-lg"
            >
              View All Articles
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}