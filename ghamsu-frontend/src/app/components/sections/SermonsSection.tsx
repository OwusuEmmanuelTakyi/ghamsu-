import { motion } from "motion/react";
import { Play, Video, Headphones, Calendar, Clock, Eye } from "lucide-react";
import { useSermons } from "../../../lib/hooks";
import { sanityClient, urlFor } from "../../../lib/sanity";
import type { Sermon } from "../../../types/types";

export function SermonsSection() {
  const { data: sermonsData, loading, error } = useSermons();
  const sermons: Sermon[] = sermonsData || [];
  if (loading) {
    return (
      <section id="sermons" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-slate-800 rounded-t-2xl" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-700 rounded w-1/2" />
                  <div className="h-10 bg-slate-700 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="sermons" className="py-24 px-4">
        <div className="text-center">
          <p className="text-white/50">Failed to load sermons.</p>
        </div>
      </section>
    );
  }

  const getThumbnailUrl = (sermon: Sermon): string => {
    if (!sermon.thumbnail) return '/api/placeholder/800/420';
    return urlFor(sermon.thumbnail).width(800).height(420).fit('crop').auto('format').url() || '/api/placeholder/800/420';
  };

  const getMediaUrl = (sermon: Sermon): string | undefined => {
    return sermon.videoUrl || sermon.audioFile?.asset?._ref;
  };

  const isVideo = (sermon: Sermon): boolean => {
    return !!sermon.videoUrl;
  };

  return (
    <section id="sermons" className="py-24 px-4 relative overflow-hidden bg-gradient-to-b from-slate-950 to-blue-950/50">
      {/* Background effects */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/50 border border-orange-500/30 mb-4">
            <Video className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-orange-200">Watch & Listen</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Recent Sermons
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Experience powerful messages that transform lives and strengthen faith through our video and audio sermons
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sermons.slice(0, 6).map((sermon: Sermon, index: number) => (
            <motion.div
              key={sermon._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <a
                href={getMediaUrl(sermon)}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-blue-900/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative h-64 overflow-hidden bg-slate-950">
                  <img
                    src={getThumbnailUrl(sermon)}
                    alt={sermon.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/50"
                    >
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </motion.div>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${
                      isVideo(sermon)
                        ? "bg-orange-500/90 border-orange-400/50 text-white"
                        : "bg-blue-900/90 border-blue-700/50 text-blue-100"
                    }`}>
                      {isVideo(sermon) ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : (
                        <Headphones className="w-3.5 h-3.5" />
                      )}
                      <span className="text-xs font-medium">
                        {isVideo(sermon) ? "Video" : "Audio"}
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm text-white">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">{sermon.duration || 'TBA'}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {sermon.title}
                  </h3>

                  <div className="flex items-center gap-2 text-blue-300 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-700/30">
                      <span className="text-xs font-bold">{sermon.preacher?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'MS'}</span>
                    </div>
                    <span className="text-sm font-medium">{sermon.preacher || 'GHAMSU Speaker'}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{sermon.date ? new Date(sermon.date).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Upcoming'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>1.2k</span>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a href="/sermons" className="px-10 py-4 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
            View All Sermons
          </a>
        </motion.div>
      </div>
    </section>
  );
}
