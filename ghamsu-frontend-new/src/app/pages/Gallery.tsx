import { useState } from 'react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { useGallery } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const { data: galleries, loading, error } = useGallery({ category: selectedCategory })

  // Get unique categories from all galleries
  const allGalleries = useGallery().data || []
  const categories = ['All', ...Array.from(new Set(allGalleries.map((g) => g.category as string)))]

  if (error) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Gallery
          </h1>
          <p className="text-red-500">Error loading galleries: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <HeroSection
        title="Our Gallery"
        subtitle="Moments of faith, fellowship, and community captured in time."
        backgroundImage="https://images.unsplash.com/photo-1778082388302-38d8e5e40c7b?q=80&w=1059&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        isHomePage={false}
      />

      <div className="pb-24">
        {/* Category Filter */}
        <section className="px-4 py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                    !selectedCategory
                      ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                  }`}
                >
                  All
                </button>
                {categories.filter((cat) => cat !== 'All').map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2.5 font-medium transition-all rounded-lg ${
                      selectedCategory === category
                        ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="px-4 pb-16 sm:pb-20 md:pb-24">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading galleries...</p>
              </div>
            ) : !galleries || galleries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No galleries found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gallery, index) => (
                  <AnimatedSection key={gallery._id} delay={index * 0.05}>
                    {/* Gallery Card - Link to Album */}
                    <a
                      href={gallery.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square border border-border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 block"
                    >
                      <img
                        src={urlFor(gallery.coverImage).width(600).height(600).url()}
                        alt={gallery.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3
                            className="text-white text-lg sm:text-xl mb-1"
                            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                          >
                            {gallery.title}
                          </h3>
                          <p className="text-white/80 text-xs sm:text-sm mb-3">{gallery.category}</p>
                          <p className="text-white/70 text-xs">📸 {gallery.photoCount} photos</p>
                          <p className="text-white/70 text-xs mt-2">
                            {new Date(gallery.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </a>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}