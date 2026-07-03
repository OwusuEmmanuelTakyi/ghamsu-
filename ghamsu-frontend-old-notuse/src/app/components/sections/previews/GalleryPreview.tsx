import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useGallery } from "../../../../lib/hooks";   // ← same hook as GallerySection
import { imageUrl } from "../../../../lib/sanity";     // ← same helper as GallerySection
import type { GalleryItem } from "../../../../types/types"; // ← same type

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="relative h-64 rounded-lg overflow-hidden bg-gray-200 animate-pulse shadow-md" />
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export function GalleryPreview() {
  const { data: albums, loading, error } = useGallery(); // ← same hook

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
            Memories
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Photo Gallery
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Capturing moments of faith, fellowship, and joy
          </p>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <p className="text-center text-red-500 py-10">Failed to load gallery.</p>
        )}

        {/* ── Empty ── */}
        {!loading && !error && (!albums || albums.length === 0) && (
          <p className="text-center text-gray-400 py-10 text-lg">
            No photos yet — check back soon.
          </p>
        )}

        {/* ── Grid ── */}
        {!loading && !error && albums && albums.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {albums.slice(0, 6).map((album: GalleryItem, index: number) => (
              <motion.a
                key={album._id}
                href={album.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="relative h-64 rounded-lg overflow-hidden group cursor-pointer shadow-md block"
              >
                {/* Image */}
                {album.coverImage ? (
                  <img
                    src={imageUrl(album.coverImage, 800, 500)}
                    alt={album.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700" />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-start justify-end p-4">
                  {album.category && (
                    <span className="text-orange-400 text-xs font-semibold uppercase tracking-wide mb-1">
                      {album.category}
                    </span>
                  )}
                  <h3 className="text-white font-semibold text-lg leading-snug">
                    {album.title}
                  </h3>
                </div>
              </motion.a>
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
            to="/gallery"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-md"
          >
            View Full Gallery
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}