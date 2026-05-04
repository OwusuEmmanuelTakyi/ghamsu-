import { Calendar, Clock, MapPin } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';
import { Link } from 'react-router';

export function UpcomingEvents() {
  const events = [
    {
      title: 'Sunday Worship Service',
      date: 'May 7, 2026',
      time: '9:00 AM',
      location: 'Main Sanctuary',
      image: 'https://images.unsplash.com/photo-1662151820001-0c8d949304a4?w=800',
    },
    {
      title: 'Youth Night',
      date: 'May 10, 2026',
      time: '6:00 PM',
      location: 'Youth Center',
      image: 'https://images.unsplash.com/photo-1594913421979-b9399c0cd4f9?w=800',
    },
    {
      title: 'Community Outreach',
      date: 'May 15, 2026',
      time: '10:00 AM',
      location: 'Downtown',
      image: 'https://images.unsplash.com/photo-1594913495702-0872744c6968?w=800',
    },
    {
      title: 'Prayer Meeting',
      date: 'May 17, 2026',
      time: '7:00 PM',
      location: 'Prayer Room',
      image: 'https://images.unsplash.com/photo-1569292567777-e5d61a759322?w=800',
    },
    {
      title: 'Family Festival',
      date: 'May 25, 2026',
      time: '2:00 PM',
      location: 'Church Grounds',
      image: 'https://images.unsplash.com/photo-1713012633197-1426a345ca99?w=800',
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {events.map((event, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <div className="bg-card border border-border hover:border-accent/50 transition-all duration-500 overflow-hidden group">
                <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                  <img
                    src={event.image}
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
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" strokeWidth={1.5} />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent" strokeWidth={1.5} />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/events">
            <button className="border-2 border-primary text-primary px-8 py-3 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              View All Events
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
