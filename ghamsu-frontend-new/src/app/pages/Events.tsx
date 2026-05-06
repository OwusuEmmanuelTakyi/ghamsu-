import { useState, useMemo } from 'react'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { useEvents } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'
import type { Event } from '../../../src/types/types'

export default function Events() {
  const [selectedType, setSelectedType] = useState<string | undefined>()

  const { data: allEvents, loading, error } = useEvents()
  const safeAllEvents: Event[] = allEvents || []

  // Derive unique event types
  const eventTypes = useMemo(() => {
    if (!allEvents) return ['All']
    const types = Array.from(new Set(safeAllEvents.map((e: Event) => e.eventType).filter(Boolean)))
    return ['All', ...types] as string[]
  }, [allEvents])

  // Filter events client-side
  const filteredEvents = useMemo((): Event[] => {
    if (!selectedType || selectedType === 'All') return safeAllEvents
    return safeAllEvents.filter((e: Event) => e.eventType === selectedType)
  }, [safeAllEvents, selectedType])

  if (error) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            Events
          </h1>
          <p className="text-red-500">Error loading events: {error.message}</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  return (
    <div>
      <HeroSection
        title="Upcoming Events"
        subtitle="Join us for worship, fellowship, and community events that strengthen faith and build connections."
        backgroundImage="https://lh3.googleusercontent.com/pw/AP1GczPgJ-D9S-fzrJR1is1c7g4gkRHtQbwo1ySL0aM2nqGE7-WqzVj_delsYsLvUbtR_0CE3gXq5pvTnn4fWyWjLVFOx5LdA8EEXWwwWupwRiky7nPt1uXB-gi20uuilw6j9IsBQGKZkkgn4j38aVXNz96n=w1445-h963-s-no-gm"
        isHomePage={false}
      />

      <div className="pb-24">
        <section className="px-4 py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="flex flex-wrap justify-center gap-3">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type === 'All' ? undefined : type)}
                    className={`px-6 py-2.5 font-medium transition-all rounded-lg capitalize ${
                      selectedType === type || (!selectedType && type === 'All')
                        ? 'bg-accent text-accent-foreground shadow-lg scale-105'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
                    }`}
                  >
                    {type}
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
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found{selectedType ? ` in "${selectedType}"` : ''}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event: Event, index: number) => (
                  <AnimatedSection key={event._id} delay={index * 0.1}>
                    <div className="bg-card border border-border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col group">
                      <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                        <img
                          src={urlFor(event.flyer).width(600).height(300).url()}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 space-y-2">
                          {event.eventType && (
                            <div className="bg-accent text-accent-foreground px-3 py-1 text-sm font-medium rounded capitalize inline-block">
                              {event.eventType}
                            </div>
                          )}
                          {isUpcoming(event.date) && (
                            <div className="bg-green-500 text-white px-3 py-1 text-sm font-medium rounded inline-block ml-2">
                              Upcoming
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3
                          className="text-2xl mb-4 group-hover:text-primary transition-colors"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                        >
                          {event.title}
                        </h3>

                        <div className="space-y-3 mb-4 flex-1">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{formatTime(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{event.venue}</span>
                          </div>
                        </div>

                        {event.description && (
                          <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="flex gap-3 mt-auto">
                          {event.registrationLink ? (
                            <a
                              href={event.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-primary text-primary-foreground py-3 hover:opacity-90 transition-opacity font-medium rounded flex items-center justify-center gap-2"
                            >
                              Register
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          ) : (
                            <button className="flex-1 bg-primary text-primary-foreground py-3 hover:opacity-90 transition-opacity font-medium rounded">
                              Learn More
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

        {filteredEvents.length > 0 && (
          <section className="px-4">
            <div className="max-w-7xl mx-auto">
              <AnimatedSection>
                <div className="bg-secondary rounded-lg p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                    Event Statistics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <p className="text-4xl font-bold text-accent">{allEvents.length}</p>
                      <p className="text-muted-foreground mt-2">{allEvents.length === 1 ? 'Event' : 'Events'}</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-accent">
                        {safeAllEvents.filter((e: Event) => isUpcoming(e.date)).length}
                      </p>
                      <p className="text-muted-foreground mt-2">Upcoming</p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-accent">{eventTypes.length - 1}</p>
                      <p className="text-muted-foreground mt-2">
                        {eventTypes.length - 1 === 1 ? 'Category' : 'Categories'}
                      </p>
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