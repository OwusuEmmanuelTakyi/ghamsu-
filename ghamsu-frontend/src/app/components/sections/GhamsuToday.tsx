import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Radio, BookOpen, ArrowRight } from "lucide-react";
import { sanityClient } from "../../../lib/sanity";
import { Link } from "react-router";

// ── Types ──────────────────────────────────────────────────────────────────────
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

// ── GROQ queries ───────────────────────────────────────────────────────────────
const EVENTS_QUERY = `*[_type == "event" && published == true && date >= $now] | order(date asc) [0...2] {
  _id,
  title,
  date,
  venue,
  eventType,
}`;

const BLOG_QUERY = `*[_type == "blog" && defined(publishedDate)] | order(publishedDate desc) [0] {
  _id,
  title,
  slug,
  excerpt,
  readTime,
  author->{ name },
}`;

// ── Helpers ────────────────────────────────────────────────────────────────────
function getRelativeTime(iso: string): string {
  const now = new Date();
  const eventDate = new Date(iso);
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const diffDays = Math.round((eventDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 6) return `In ${diffDays} days`;
  if (diffDays <= 13) return "Next week";
  return eventDate.toLocaleDateString("en-GH", { month: "short", day: "numeric" });
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GH", { hour: "numeric", minute: "2-digit", hour12: true });
}

function isHappeningNow(iso: string): boolean {
  const diffHours = (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 4;
}

function getEventLabel(iso: string): string {
  return isHappeningNow(iso) ? "Happening Now" : getRelativeTime(iso);
}

function getLabelColors(iso: string) {
  if (isHappeningNow(iso)) {
    return { dot: "bg-green-500", badge: "bg-green-50 border-green-200", text: "text-green-600", pulse: true };
  }
  const eventDate = new Date(iso);
  const diffDays = Math.round((new Date(eventDate.toDateString()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) {
    return { dot: "bg-orange-500", badge: "bg-orange-50 border-orange-200", text: "text-orange-600", pulse: true };
  }
  return { dot: "bg-blue-500", badge: "bg-blue-50 border-blue-200", text: "text-blue-600", pulse: false };
}

// ── Hooks ──────────────────────────────────────────────────────────────────────
function useUpcomingEvents() {
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanityClient.fetch<Event[]>(EVENTS_QUERY, { now: new Date().toISOString() })
      .then((res) => { setData(res ?? []); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  return { data, loading };
}

function useLatestBlog() {
  const [data, setData] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanityClient.fetch<Blog>(BLOG_QUERY)
      .then((res) => { setData(res); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  return { data, loading };
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function CardSkeleton({ dark = false }: { dark?: boolean }) {
  const bg = dark ? "bg-white/10" : "bg-gray-200";
  return (
    <div className="space-y-4 animate-pulse">
      <div className={`h-4 ${bg} rounded w-1/2`} />
      <div className={`h-4 ${bg} rounded w-3/4`} />
      <div className={`h-4 ${bg} rounded w-2/3`} />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export function GhamsuToday() {
  const { data: events, loading: eventsLoading } = useUpcomingEvents();
  const { data: blog, loading: blogLoading } = useLatestBlog();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-4">
            <Radio className="w-4 h-4 text-orange-600 animate-pulse" />
            <span className="text-sm font-semibold text-orange-600">Live Updates</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            GHAMSU Today
          </h2>
          <p className="text-gray-600 text-lg">{today}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 shadow-lg hover-lift relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-lg bg-orange-500 flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Today's Theme</h3>
              <blockquote className="text-xl italic text-white mb-3 font-medium">"Walking in the Word"</blockquote>
              <p className="text-orange-400 font-semibold text-sm mb-4">2 Timothy 3:16–17</p>
              <p className="text-blue-100 leading-relaxed">
                All Scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for [a]instruction in righteousness, that the man of God may be complete, thoroughly equipped for every good work.
              </p>
            </div>
          </motion.div>

          {/* Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover-lift border border-gray-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-lg bg-green-500 flex items-center justify-center mb-6 shadow-lg relative">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Upcoming Events</h3>

              {eventsLoading && <CardSkeleton />}

              {!eventsLoading && events.length === 0 && (
                <p className="text-gray-400 text-sm">No upcoming events right now.</p>
              )}

              {!eventsLoading && events.length > 0 && (
                <div className="space-y-4">
                  {events.map((event) => {
                    const colors = getLabelColors(event.date);
                    const label = getEventLabel(event.date);
                    return (
                      <div key={event._id} className={`flex items-start gap-3 p-3 rounded-lg border ${colors.badge}`}>
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${colors.dot} ${colors.pulse ? "animate-pulse" : ""}`} />
                        <div className="min-w-0">
                          <p className="text-gray-900 font-semibold leading-snug">{event.title}</p>
                          <p className="text-gray-500 text-sm mt-0.5">{event.venue}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs font-semibold ${colors.text}`}>{label}</span>
                            <span className="text-gray-300 text-xs">·</span>
                            <span className="text-gray-400 text-xs">{formatEventTime(event.date)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Blog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover-lift border border-gray-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-lg bg-blue-900 flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Blog of the Day</h3>

              {blogLoading && <CardSkeleton />}

              {!blogLoading && !blog && (
                <p className="text-gray-400 text-sm">No posts yet — check back soon.</p>
              )}

              {!blogLoading && blog && (
                <div className="flex flex-col flex-1">
                  <h4 className="text-gray-900 font-semibold text-lg leading-snug mb-2">{blog.title}</h4>
                  {blog.author?.name && (
                    <p className="text-orange-500 text-sm font-medium mb-3">
                      By {blog.author.name}{blog.readTime ? ` · ${blog.readTime} min read` : ""}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 flex-1">{blog.excerpt}</p>
                  <a
                    href={`/blog/${blog.slug.current}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-900 hover:text-orange-500 transition-colors duration-200 group"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 text-white shadow-lg"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">This Week's Highlights</h3>
              <p className="text-blue-100 text-lg">
                We invite you to our midweek and Sunday services. Join a nearby local and grow together in faith.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                  to="/contact"
                 className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:scale-105"
                      >
                    Contact an Executive
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

