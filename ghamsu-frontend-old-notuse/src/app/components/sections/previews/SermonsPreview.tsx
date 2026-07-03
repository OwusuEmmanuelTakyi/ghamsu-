import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Calendar, User, ArrowRight, Headphones } from "lucide-react";
import { Link } from "react-router";
import { sanityClient, imageUrl } from "../../../../lib/sanity";
import type { Sermon } from "../../../../types/types";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]{11})/);
  return match?.[1] ?? null;
}

function getThumbnail(sermon: Sermon): string | null {
  if (sermon.thumbnail) return imageUrl(sermon.thumbnail, 800, 450);
  if (sermon.mediaType === "video" && sermon.videoUrl) {
    const ytId = getYouTubeId(sermon.videoUrl);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }
  return null;
}

function getMediaUrl(sermon: Sermon): string | null {
  return sermon.mediaType === "video" ? sermon.videoUrl ?? null : sermon.audioUrl ?? null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" });
}

function isVideo(sermon: Sermon): boolean {
  return sermon.mediaType === "video";
}

// ── Hook ───────────────────────────────────────────────────────────────────────
function useLatestSermons() {
  const [data, setData] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sanityClient.fetch<Sermon[]>(`*[_type == "sermon"] | order(date desc) [0...3] {
      _id,
      title,
      preacher,
      date,
      duration,
      mediaType,
      videoUrl,
      audioUrl,
      thumbnail
    }`)
    .then((res) => { setData(res ?? []); setLoading(false); })
    .catch((err) => {
      console.error("Sermons fetch error:", err);
      setError("Failed to load sermons.");
      setLoading(false);
    });
  }, []);

  return { data, loading, error };
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

// ── SermonCard ─────────────────────────────────────────────────────────────────
function SermonCard({ sermon, index }: { sermon: Sermon; index: number }) {
  const thumbnail = getThumbnail(sermon);
  const mediaUrl = getMediaUrl(sermon);
  const isVideoType = isVideo(sermon);

  return (
    <motion.div
      key={sermon._id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
    >
      {/* Thumbnail */}
      <a
        href={mediaUrl || undefined}
        target={mediaUrl ? "_blank" : undefined}
        rel={mediaUrl ? "noopener noreferrer" : undefined}
        className="block h-48 relative overflow-hidden"
        aria-label={`${isVideoType ? "Watch" : "Listen"}: ${sermon.title}`}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={sermon.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
            <span className="text-slate-400 text-4xl font-bold">{sermon.title.charAt(0)}</span>
          </div>
        )}
        {/* Play overlay */}
        {mediaUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              {isVideoType ? (
                <Play className="w-7 h-7 text-white ml-0.5" />
              ) : (
                <Headphones className="w-7 h-7 text-white" />
              )}
            </div>
          </div>
        )}
        {/* Duration */}
        {sermon.duration && (
          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            {sermon.duration}
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-3 left-3 bg-orange-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm">
          {isVideoType ? "Video" : "Audio"}
        </div>
      </a>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {sermon.title}
        </h3>
        <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span>{sermon.preacher}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(sermon.date)}</span>
          </div>
        </div>
        {mediaUrl && (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors w-full justify-center pt-2 border-t border-gray-100"
          >
            {isVideoType ? "Watch Now" : "Listen Now"}
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ── SermonsPreview ────────────────────────────────────────────────────────────
export function SermonsPreview() {
  const { data: sermons, loading, error } = useLatestSermons();

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">Messages</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Recent Sermons</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Powerful messages to strengthen your faith walk</p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && <p className="text-center text-red-500 py-10">{error}</p>}

        {!loading && !error && sermons.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-lg">No sermons available yet — check back soon.</p>
        )}

        {!loading && !error && sermons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {sermons.map((sermon, index) => <SermonCard key={sermon._id} sermon={sermon} index={index} />)}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <Link to="/sermons" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-md">
            View All Sermons
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

