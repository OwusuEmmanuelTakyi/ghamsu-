import { motion } from "motion/react";
import { Quote, Star, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { useTestimonials } from "../../../../lib/hooks";
import { imageUrl } from "../../../../lib/sanity";

export function TestimonialsPreview() {
  const { data: testimonials, loading, error } = useTestimonials();

  // Show only the 3 most recent (Sanity query already orders by date desc)
  const preview = testimonials?.slice(0, 3) ?? [];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
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
            What Ambassadors Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real testimonies from students whose lives have been transformed
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 py-10">
            Failed to load testimonies. Please try again later.
          </p>
        )}

        {/* Empty */}
        {!loading && !error && preview.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            No testimonies yet — check back soon.
          </p>
        )}

        {/* Cards — 3 most recent */}
        {!loading && !error && preview.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {preview.map((testimonial, index) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md hover-lift"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating ?? 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />
                  ))}
                </div>

                <Quote className="w-10 h-10 text-orange-200 mb-4" />

                {/* Testimony text */}
                <p className="text-gray-700 mb-6 italic line-clamp-4">
                  "{testimonial.testimony}"
                </p>

                {/* Person */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-orange-100">
                    {testimonial.photo ? (
                      <img
                        src={imageUrl(testimonial.photo, 80, 80)}
                        alt={testimonial.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-orange-500 font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role ?? testimonial.university ?? "GHAMSU Member"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA — always visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-md"
          >
            Read More Testimonies
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}