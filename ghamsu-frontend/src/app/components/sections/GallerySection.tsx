import { useState } from "react";
import { motion } from "motion/react";
import { Camera, ExternalLink, Image, Calendar, Loader2 } from "lucide-react";
import { useGallery } from "../../../lib/hooks";
import { imageUrl } from "../../../lib/sanity";
import type { GalleryItem } from "../../../types/types";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GH", {
    month: "long",
    year: "numeric",
  });
}
const currentYear = new Date().getFullYear();
const CATEGORIES = ["All", "Conference", "Worship", "Outreach", "Music", "Study", "Events", "Training", "Recreation"];

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="h-64 bg-muted" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────
function AlbumCard({ album, index }: { album: GalleryItem; index: number }) {
  return (
    <motion.a
      href={album.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
    >
      {/* ── Cover image ── */}
      <div className="relative h-64 overflow-hidden bg-muted">
        <img
          src={imageUrl(album.coverImage, 800, 500)}
          alt={album.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Category badge */}
        {album.category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold backdrop-blur-sm">
              {album.category}
            </span>
          </div>
        )}

        {/* External link icon — appears on hover */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-secondary">
          <ExternalLink className="w-5 h-5 text-white" />
        </div>

        {/* Photo count pill */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15">
          <Image className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-xs font-medium">{album.photoCount} photos</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-6 flex flex-col flex-1">
        {album.date && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(album.date)}</span>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {album.title}
        </h3>

        {album.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
            {album.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all duration-300 mt-auto">
          <span className="text-sm font-medium">View Full Album</span>
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>

      {/* Hover border glow */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-2xl transition-all duration-300 pointer-events-none" />
    </motion.a>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export function GallerySection() {
  const { data: albums, loading, error } = useGallery();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = albums
    ? activeCategory === "All"
      ? albums
      : albums.filter((a) => a.category === activeCategory)
    : [];

  return (
    <section id="gallery" className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Photo Gallery</span>
          </div>
          <h2 className="text-4xl md:text-5xl mb-5 text-foreground">
            Our <span className="text-primary">Memories</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Browse through our photo albums and relive special moments from our
            events, worship services, and fellowship activities
          </p>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-destructive font-medium">Failed to load gallery.</p>
            <p className="text-muted-foreground text-sm">Please check your Sanity connection and try again.</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">
              {activeCategory === "All"
                ? "No albums yet — check back soon."
                : `No albums in "${activeCategory}" yet.`}
            </p>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((album, index) => (
              <AlbumCard key={album._id} album={album} index={index} />
            ))}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <Camera className="w-12 h-12 text-primary" />
            <div>
              <h3 className="text-xl mb-2 text-foreground font-semibold">
                Want to share your photos?
              </h3>
              <p className="text-muted-foreground mb-4">
                Get in Touch with the Publications and Communications Board to Submit Content
              </p>
              <a
                href="mailto:ghamsupcb@gmail.com?subject=Photos%20to%20share"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/30"
              >
                <span>Contact PCB MEDIA' {currentYear} "</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}