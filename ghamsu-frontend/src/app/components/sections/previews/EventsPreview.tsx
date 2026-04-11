import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { sanityClient } from "../../../../lib/sanity"

// ── Types ──────────────────────────────────────────────────────────────────────
interface Event {
  _id: string;
  title: string;
  date: string;
  venue: string;
  description?: string;
  eventType: string;
}

// ── GROQ query ─────────────────────────────────────────────────────────────────
const EVENTS_QUERY = `*[
  _type == "event" &&
  published == true &&
  date >= $now
] | order(date asc) [0...3] {
  _id,
  title,
  date,
  venue,
  description,
  eventType,
}`;

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatEventType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// ── Hook ───────────────────────────────────────────────────────────────────────
function useUpcomingEvents() {
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sanityClient
      .fetch<Event[]>(EVENTS_QUERY, { now: new Date().toISOString() })
      .then((res) => { setData(res ?? []); setLoading(false); })
      .catch((err) => {
        console.error("Events fetch error:", err);
        setError("Failed to load events.");
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-900/20 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/5" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6 mt-1" />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export function EventsPreview() {
  const { data: events, loading, error } = useUpcomingEvents();

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">
            Upcoming
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join us in worship, fellowship, and service
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
        {!loading && !error && events.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-lg">
            No upcoming events at the moment — check back soon.
          </p>
        )}

        {/* ── Grid ── */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to="/events"
                  className="block bg-white rounded-lg p-6 shadow-md hover-lift border-l-4 border-blue-900 hover:border-orange-500 transition-colors duration-300 group"
                >
                  {/* Type badge */}
                  <div className="mb-4">
                    <span className="px-3 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-semibold">
                      {formatEventType(event.eventType)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-500 transition-colors duration-300">
                    {event.title}
                  </h3>

                  {/* Meta */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{formatTime(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Read more hint */}
                  <div className="flex items-center gap-1 mt-4 text-orange-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
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
            to="/events"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-md"
          >
            View All Events
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}