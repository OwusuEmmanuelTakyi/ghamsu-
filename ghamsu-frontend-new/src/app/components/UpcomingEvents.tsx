import { Calendar, Clock, MapPin } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'
import { useEvents } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'

export function UpcomingEvents() {
  const { data: events, loading, error } = useEvents()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
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

  const displayEvents = events && events.length > 0 ? events.slice(0, 5) : []

  return (
    <section className="py-32 px-6 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <AnimatedSection>
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="mb-4">
                <div className="h-[1px] w-12 bg-accent mb-4" />
                <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                  What's Happening
                </p>
              </div>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Upcoming Events
              </h2>
            </div>
            <Link to="/events">
              <button className="hidden md:block border-2 border-primary text-primary px-8 py-3 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                View All
              </button>
            </Link>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading events: {error.message}</p>
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {displayEvents.map((event, index) => (
              <AnimatedSection key={event._id} delay={index * 0.1}>
                <div className="bg-card border border-border hover:border-accent/50 transition-all duration-500 overflow-hidden group">
                  <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                    <img
                      src={urlFor(event.flyer).width(400).height(300).url()}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3
                      className="text-lg mb-4 tracking-tight line-clamp-2 min-h-[3.5rem]"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" strokeWidth={1.5} />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" strokeWidth={1.5} />
                        <span>{formatTime(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" strokeWidth={1.5} />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link to="/events">
            <button className="border-2 border-primary text-primary px-8 py-3 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              View All Events
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}