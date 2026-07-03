import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { useEvents } from "../../../lib/hooks";
import { imageUrl } from "../../../lib/sanity";

const PAGE_SIZE = 6;

import type { Event } from "../../../types/types";

const EVENT_TYPE_LABELS: Record<string, string> = {
  conference: "Conference",
  worship: "Worship",
  outreach: "Outreach",
  fellowship: "Fellowship",
  training: "Training",
  other: "Other",
};

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GH", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventsSection() {
  const { data: events, loading, error } = useEvents();
  const [page, setPage] = useState(1);

  const totalPages = events ? Math.ceil(events.length / PAGE_SIZE) : 0;
  const paginated = events
    ? events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : [];

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
            What's Coming Up
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in upcoming activities and be part of something greater
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading events…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 font-medium">
              Failed to load events. Please try again later.
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && paginated.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No upcoming events at the moment.
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && paginated.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{paginated.map((event: Event, index: number) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover-lift overflow-hidden border border-gray-100 group"
                >
                  {/* Event Flyer */}
                  <div className="relative h-96 overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800">
                    {event.flyer ? (
                      <img
                        src={imageUrl(event.flyer, 800, 600)}
                        alt={event.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white/20" />
                      </div>
                    )}

                    {/* Gradient overlay — same as original */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Event type badge */}
                    {event.eventType && (
                      <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                        {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                      </span>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-900 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{event.venue}</span>
                      </div>
                    </div>

                    {/* Description preview */}
                    {event.description && (
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Register Button */}
                    {event.registrationLink ? (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all flex items-center justify-center gap-2 group shadow-md hover:shadow-lg"
                      >
                        <span>Register Now</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 rounded-lg bg-gray-200 text-gray-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        Registration Coming Soon
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination — replaces "View All Events" when there are multiple pages */}
            {totalPages > 1 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-center items-center gap-2 mt-12"
              >
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
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <button className="px-8 py-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-all shadow-md hover:shadow-lg">
                  View All Events
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}