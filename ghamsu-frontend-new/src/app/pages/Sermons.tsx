import { useState } from 'react'
import { Play, Calendar, User, Headphones } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { useSermons } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'

export default function Sermons() {
  const [selectedType, setSelectedType] = useState<string | undefined>()

  const { data: sermons, loading, error } = useSermons({ mediaType: selectedType })

  const allSermons = useSermons().data || []
  const mediaTypes = ['All', ...Array.from(new Set(allSermons.map((s) => s.mediaType).filter(Boolean)))]

  if (error) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Sermons
          </h1>
          <p className="text-red-500">Error loading sermons: {error.message}</p>
        </div>
      </div>
    )
  }

  const getVideoUrl = (url: string) => {
    if (!url) return url
    if (url.includes('youtu')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      return match ? `https://www.youtube.com/embed/${match[1]}` : url
    }
    if (url.includes('vimeo')) {
      const match = url.match(/(?:vimeo\.com\/)(\d+)/)
      return match ? `https://player.vimeo.com/video/${match[1]}` : url
    }
    return url
  }

  const formatDuration = (duration: string | undefined) => {
    if (!duration) return '0 min'
    if (duration.includes('min')) return duration
    const [minutes] = duration.split(':')
    return `${minutes} min`
  }

  return (
    <div>
      <HeroSection
        title="Sermons & Teachings"
        subtitle="Watch or listen to inspiring messages that will strengthen your faith and transform your life."
        backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
        isHomePage={false}
      />

      <div className="pb-24">
        <section className="px-4 py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSelectedType(undefined)}
                  className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                    !selectedType ? 'bg-accent text-accent-foreground shadow-lg scale-105' : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                  }`}
                >
                  All
                </button>
                {mediaTypes
                  .filter((type) => type !== 'All')
                  .map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-6 py-2.5 font-medium transition-all rounded-lg capitalize ${
                        selectedType === type ? 'bg-accent text-accent-foreground shadow-lg scale-105' : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                      }`}
                    >
                      {type === 'video' ? '🎬 Videos' : '🎙️ Audio'}
                    </button>
                  ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section className="px-4 pb-16 sm:pb-20 md:pb-24">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading sermons...</p>
              </div>
            ) : !sermons || sermons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No sermons found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sermons.map((sermon, index) => (
                  <AnimatedSection key={sermon._id} delay={index * 0.1}>
                    <div className="bg-card border border-border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group h-full flex flex-col">
                      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                        {sermon.thumbnail ? (
                          <img
                            src={urlFor(sermon.thumbnail).width(600).height(300).url()}
                            alt={sermon.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-50" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 ml-1" />
                          </button>
                        </div>

                        {sermon.series && (
                          <div className="absolute top-4 left-4 bg-accent text-accent-foreground border border-accent px-3 py-1 text-sm font-medium rounded">
                            {sermon.series}
                          </div>
                        )}

                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 text-sm font-medium rounded">
                          {sermon.mediaType === 'video' ? '🎬 Video' : '🎙️ Audio'}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-2xl mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                          {sermon.title}
                        </h3>

                        <div className="space-y-2 mb-4 text-sm text-muted-foreground flex-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-accent flex-shrink-0" />
                            <span>{sermon.preacher}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                            <span>{new Date(sermon.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-accent flex-shrink-0" />
                            <span>{formatDuration(sermon.duration)}</span>
                          </div>
                          {sermon.scriptureReference && (
                            <div className="text-xs bg-secondary/50 px-2 py-1 rounded mt-2">
                              {sermon.scriptureReference}
                            </div>
                          )}
                        </div>

                        {sermon.description && (
                          <p className="text-muted-foreground leading-relaxed mb-4 text-sm line-clamp-2">
                            {sermon.description}
                          </p>
                        )}

                        <div className="flex gap-3 mt-auto">
                          {sermon.mediaType === 'video' && sermon.videoUrl && (
                            <a
                              href={getVideoUrl(sermon.videoUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-primary text-primary-foreground py-3 hover:bg-primary/90 transition-all font-medium rounded flex items-center justify-center gap-2"
                            >
                              <Play className="w-4 h-4" />
                              Watch
                            </a>
                          )}
                          {sermon.mediaType === 'audio' && sermon.audioUrl && (
                            <a
                              href={sermon.audioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-accent text-accent-foreground py-3 hover:bg-accent/90 transition-all font-medium rounded flex items-center justify-center gap-2"
                            >
                              <Headphones className="w-4 h-4" />
                              Listen
                            </a>
                          )}
                          {!sermon.videoUrl && !sermon.audioUrl && (
                            <button className="flex-1 bg-secondary text-muted-foreground py-3 cursor-not-allowed rounded font-medium">
                              Coming Soon
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </section>

        {sermons && sermons.length > 0 && (
          <section className="px-4">
            <div className="max-w-7xl mx-auto">
              <AnimatedSection>
                <div className="bg-secondary rounded-lg p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                    Sermon Library
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <p className="text-4xl font-bold text-accent">{sermons.length}</p>
                      <p className="text-muted-foreground mt-2">Total Sermons</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-accent">{sermons.filter((s) => s.mediaType === 'video').length}</p>
                      <p className="text-muted-foreground mt-2">Videos</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-accent">{sermons.filter((s) => s.mediaType === 'audio').length}</p>
                      <p className="text-muted-foreground mt-2">Audio</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}