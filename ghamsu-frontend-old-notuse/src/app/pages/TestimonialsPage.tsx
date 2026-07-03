import { useState } from "react";
import { motion } from "motion/react";
import { Quote, Star, Loader2, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useTestimonials } from "../../lib/hooks";
import { TestimonialCard } from "../components/sections/TestimonialsSection";

const PAGE_SIZE = 9;

export function TestimonialsPage() {
  const { data: testimonials, loading, error } = useTestimonials();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = testimonials?.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.role?.toLowerCase().includes(q) ||
      t.university?.toLowerCase().includes(q) ||
      t.testimony.toLowerCase().includes(q)
    );
  }) ?? [];

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero banner — mirrors BoardDetailPage hero style ── */}
      <div className="relative bg-gradient-to-br from-blue-900 to-blue-800 py-20 px-4 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-8 left-1/3 w-32 h-32 rounded-full bg-orange-500/10" />

        {/* Back link */}
        <div className="max-w-7xl mx-auto mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          {/* Icon */}
          <div className="inline-flex w-16 h-16 rounded-full bg-orange-500 items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
            <Quote className="w-8 h-8 text-white" />
          </div>

          <p className="text-orange-400 font-semibold uppercase tracking-wide mb-3 text-sm">
            Testimonies
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Student Testimonies
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Real stories of faith, growth and transformation from GHAMSU members
            across campuses in Ghana
          </p>

          {/* Stats strip */}
          {testimonials && testimonials.length > 0 && (
            <div className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-white/10 border border-white/20">
              <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="text-white/80 text-sm font-medium">
                {testimonials.length} testimonies shared
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 py-14">

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, local or keyword…"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
            />
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-gray-400 text-sm">Loading testimonies…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 py-20">
            Failed to load testimonies. Please try again later.
          </p>
        )}

        {/* Empty */}
        {!loading && !error && paginated.length === 0 && (
          <div className="text-center py-20">
            <Quote className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {search
                ? `No testimonies found for "${search}"`
                : "No testimonies yet — check back soon."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-orange-500 text-sm hover:text-orange-600 font-medium transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && paginated.length > 0 && (
          <>
            {/* Result count when searching */}
            {search && (
              <p className="text-gray-400 text-sm text-center mb-8">
                Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginated.map((t, i) => (
                <TestimonialCard key={t._id} testimonial={t} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-center items-center gap-2"
              >
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-all"
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
                        : "bg-white border border-gray-200 text-gray-600 hover:border-blue-900 hover:text-blue-900"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-blue-900 hover:text-white hover:border-blue-900 transition-all"
                >
                  Next →
                </button>
              </motion.div>
            )}
          </>
        )}

        {/* ── Bottom CTA — matches BoardDetailPage "Get Involved" card ── */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Have a Testimony to Share?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Your story could inspire another student. Reach out to us and let
              your testimony be heard across the connexion.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-lg hover:shadow-xl group"
            >
              Share Your Testimony
              <Quote className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}