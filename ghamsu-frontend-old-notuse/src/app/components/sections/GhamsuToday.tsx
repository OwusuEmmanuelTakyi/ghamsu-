import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Radio, BookOpen, ArrowRight, Calendar, MapPin, Clock } from "lucide-react";
import { sanityClient } from "../../../lib/sanity";
import { Link } from "react-router";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Event {
  _id: string;
  title: string;
  date: string;
  venue: string;
  eventType: string;
}

interface Blog {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  author?: { name: string };
  readTime?: number;
}

interface DailyVerse {
  reference: string;
  text: string;
  translation_name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GROQ Queries
// ─────────────────────────────────────────────────────────────────────────────

const EVENTS_QUERY = `
  *[_type == "event" && published == true && date >= $now]
  | order(date asc) [0...2] {
    _id,
    title,
    date,
    venue,
    eventType,
  }
`;

const BLOG_QUERY = `
  *[_type == "blog" && defined(publishedDate)]
  | order(publishedDate desc) [0] {
    _id,
    title,
    slug,
    excerpt,
    readTime,
    author->{ name },
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Date & Time Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getRelativeTime(iso: string): string {
  const now = new Date();
  const eventDate = new Date(iso);

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventMidnight = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );

  const diffDays = Math.round(
    (eventMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 6) return `In ${diffDays} days`;
  if (diffDays <= 13) return "Next week";

  return eventDate.toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric",
  });
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isHappeningNow(iso: string): boolean {
  const diffHours = (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 4;
}

function getEventLabel(iso: string): string {
  return isHappeningNow(iso) ? "Happening Now" : getRelativeTime(iso);
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Badge Style Helpers
// ─────────────────────────────────────────────────────────────────────────────

interface BadgeColors {
  dot: string;
  badge: string;
  text: string;
  pulse: boolean;
}

function getEventBadgeColors(iso: string): BadgeColors {
  if (isHappeningNow(iso)) {
    return {
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      pulse: true,
    };
  }

  const eventDate = new Date(iso);
  const todayMidnight = new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (new Date(eventDate.toDateString()).getTime() - todayMidnight) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 1) {
    return {
      dot: "bg-amber-500",
      badge: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      pulse: true,
    };
  }

  return {
    dot: "bg-blue-500",
    badge: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    pulse: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hooks
// ─────────────────────────────────────────────────────────────────────────────

function useUpcomingEvents() {
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanityClient
      .fetch<Event[]>(EVENTS_QUERY, { now: new Date().toISOString() })
      .then((res) => setData(res ?? []))
      .catch((err) => console.error("[Events] Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

function useLatestBlog() {
  const [data, setData] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanityClient
      .fetch<Blog>(BLOG_QUERY)
      .then((res) => setData(res))
      .catch((err) => console.error("[Blog] Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

/**
 * Fetches the Verse of the Day from the free Bible API (no key required).
 * Falls back gracefully to a hardcoded verse on error.
 */
function useDailyVerse() {
  const [data, setData] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const FALLBACK: DailyVerse = {
      reference: "2 Timothy 3:16–17",
      text:
        "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness, that the man of God may be complete, equipped for every good work.",
      translation_name: "ESV",
    };

    fetch("https://beta.ourmanna.com/api/v1/get?format=json&order=daily")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const verse = json?.verse?.details;
        if (verse?.text && verse?.reference) {
          setData({
            reference: verse.reference,
            text: verse.text.trim(),
            translation_name: verse.version ?? "NIV",
          });
        } else {
          setData(FALLBACK);
        }
      })
      .catch((err) => {
        console.error("[DailyVerse] Fetch error:", err);
        setData(FALLBACK);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Loader
// ─────────────────────────────────────────────────────────────────────────────

function CardSkeleton({ dark = false }: { dark?: boolean }) {
  const pulse = dark ? "bg-white/15" : "bg-gray-200";
  return (
    <div className="space-y-3 animate-pulse" aria-hidden="true">
      <div className={`h-3 ${pulse} rounded-full w-1/2`} />
      <div className={`h-3 ${pulse} rounded-full w-3/4`} />
      <div className={`h-3 ${pulse} rounded-full w-2/3`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Card A — Daily Scripture (fetched from Bible API) */
function ScriptureCard({ verse, loading }: { verse: DailyVerse | null; loading: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-8 shadow-xl"
      aria-label="Today's Scripture"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-lg">
          <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
        </div>

        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-400">
          Verse of the Day
        </p>
        <h3 className="mb-5 text-xl font-bold text-white">Today's Scripture</h3>

        {loading && <CardSkeleton dark />}

        {!loading && verse && (
          <>
            <blockquote className="flex-1 text-base italic leading-relaxed text-blue-100">
              "{verse.text}"
            </blockquote>
            <footer className="mt-5 flex items-center justify-between">
              <cite className="not-italic text-sm font-semibold text-orange-400">
                {verse.reference}
              </cite>
              <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs font-medium text-white/60">
                {verse.translation_name}
              </span>
            </footer>
          </>
        )}
      </div>
    </motion.article>
  );
}

/** Card B — Upcoming Events */
function EventsCard({ events, loading }: { events: Event[]; loading: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg"
      aria-label="Upcoming Events"
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-orange-100/60 blur-3xl" />

      <div className="relative z-10">
        {/* Icon with live pulse */}
        <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 shadow-lg">
          <span className="absolute inset-0 animate-ping rounded-xl bg-emerald-400 opacity-30" />
          <div className="h-2.5 w-2.5 rounded-full bg-white" />
        </div>

        <h3 className="mb-6 text-xl font-bold text-gray-900">Upcoming Events</h3>

        {loading && <CardSkeleton />}

        {!loading && events.length === 0 && (
          <p className="text-sm text-gray-400">No upcoming events at the moment.</p>
        )}

        {!loading && events.length > 0 && (
          <ul className="space-y-3" role="list">
            {events.map((event) => {
              const colors = getEventBadgeColors(event.date);
              const label = getEventLabel(event.date);
              return (
                <li
                  key={event._id}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 ${colors.badge}`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${colors.dot} ${
                      colors.pulse ? "animate-pulse" : ""
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug text-gray-900">{event.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {event.venue}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatEventTime(event.date)}
                      </span>
                    </div>
                    <span className={`mt-1.5 inline-block text-xs font-semibold ${colors.text}`}>
                      {label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.article>
  );
}

/** Card C — Blog of the Day */
function BlogCard({ blog, loading }: { blog: Blog | null; loading: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg"
      aria-label="Blog of the Day"
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 shadow-lg">
          <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
        </div>

        <h3 className="mb-6 text-xl font-bold text-gray-900">Blog of the Day</h3>

        {loading && <CardSkeleton />}

        {!loading && !blog && (
          <p className="text-sm text-gray-400">No posts yet — check back soon.</p>
        )}

        {!loading && blog && (
          <div className="flex flex-1 flex-col">
            <h4 className="mb-2 text-lg font-semibold leading-snug text-gray-900">
              {blog.title}
            </h4>

            {blog.author?.name && (
              <p className="mb-3 text-sm font-medium text-orange-500">
                By {blog.author.name}
                {blog.readTime ? ` · ${blog.readTime} min read` : ""}
              </p>
            )}

            <p className="flex-1 text-sm leading-relaxed text-gray-600 line-clamp-4">
              {blog.excerpt}
            </p>

            <a
              href={`/blog/${blog.slug.current}`}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition-colors duration-200 hover:text-orange-500"
              aria-label={`Read more: ${blog.title}`}
            >
              Read Full Post
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Section Component
// ─────────────────────────────────────────────────────────────────────────────

export function GhamsuToday() {
  const { data: events, loading: eventsLoading } = useUpcomingEvents();
  const { data: blog, loading: blogLoading } = useLatestBlog();
  const { data: verse, loading: verseLoading } = useDailyVerse();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section
      className="bg-gray-50 px-4 py-20"
      aria-labelledby="ghamsu-today-heading"
    >
      <div className="mx-auto max-w-7xl">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-2">
            <Radio className="h-4 w-4 animate-pulse text-orange-600" aria-hidden="true" />
            <span className="text-sm font-semibold text-orange-600">Live Updates</span>
          </div>

          <h2
            id="ghamsu-today-heading"
            className="mb-3 text-4xl font-bold text-gray-900 md:text-5xl"
          >
            GHAMSU Today
          </h2>
          <p className="text-lg text-gray-500">
            <time dateTime={new Date().toISOString().split("T")[0]}>{today}</time>
          </p>
        </motion.div>

        {/* ── Card Grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ScriptureCard verse={verse} loading={verseLoading} />
          <EventsCard events={events} loading={eventsLoading} />
          <BlogCard blog={blog} loading={blogLoading} />
        </div>

        {/* ── Weekly Highlights Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 to-blue-800 shadow-xl"
        >
          <div className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:p-12">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Calendar className="h-6 w-6 text-orange-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-1 text-2xl font-bold text-white md:text-3xl">
                  This Week's Highlights
                </h3>
                <p className="text-base leading-relaxed text-blue-200">
                  We invite you to our midweek and Sunday services.
                  Join a local chapter and grow together in faith.
                </p>
              </div>
            </div>

            <Link
              to="/contact"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-blue-900"
              aria-label="Contact a GHAMSU Executive"
            >
              Contact an Executive
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}