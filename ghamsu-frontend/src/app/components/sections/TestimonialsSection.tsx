import { motion } from "motion/react";
import { Quote, Star, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { useTestimonials } from "../../../lib/hooks";
import { imageUrl } from "../../../lib/sanity";
import type { Testimonial } from "../../../types/types";

// ── Reusable card — white bg, orange/navy, matches BoardDetailPage style ───────
export function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full rounded-t-xl bg-gradient-to-r from-blue-900 via-blue-700 to-orange-500" />

      <div className="p-6 flex flex-col flex-1">
        {/* Stars + quote icon row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-0.5">
            {[...Array(testimonial.rating ?? 5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
            ))}
          </div>
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
            <Quote className="w-4 h-4 text-orange-400" />
          </div>
        </div>

        {/* Testimony */}
        <p className="text-gray-700 leading-relaxed italic text-sm flex-1 mb-6 line-clamp-5">
          "{testimonial.testimony}"
        </p>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-5" />

        {/* Person */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-orange-100">
            {testimonial.photo ? (
              <img
                src={imageUrl(testimonial.photo, 80, 80)}
                alt={testimonial.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-base">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{testimonial.name}</p>
            <p className="text-orange-500 text-xs font-medium truncate">
              {testimonial.role ?? testimonial.university ?? "GHAMSU Member"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Homepage section ───────────────────────────────────────────────────────────
export function TestimonialsSection() {
  const { data: testimonials, loading, error } = useTestimonials();
  const preview = testimonials?.slice(0, 6) ?? [];
  const hasMore = (testimonials?.length ?? 0) > 6;

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">
            Testimonies
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Student Testimonies
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories of faith, growth and transformation from GHAMSU members
            across campuses in Ghana
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 py-16">
            Failed to load testimonies. Please try again later.
          </p>
        )}

        {/* Empty */}
        {!loading && !error && preview.length === 0 && (
          <p className="text-center text-gray-400 py-16 text-lg">
            No testimonies yet — check back soon.
          </p>
        )}

        {/* Grid */}
        {!loading && !error && preview.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {preview.map((t, i) => (
                <TestimonialCard key={t._id} testimonial={t} index={i} />
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link
                to="/testimonials"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-md hover:shadow-lg group"
              >
                {hasMore ? "Read More Testimonies" : "View All Testimonies"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}