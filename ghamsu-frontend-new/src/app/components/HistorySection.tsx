import { AnimatedSection } from './AnimatedSection';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export function HistorySection() {
  return (
    <section className="py-32 px-6 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Image side */}
          <AnimatedSection>
            <div className="relative">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1569292567773-229e2b7521ee?w=1200"
                  alt="Church History"
                  className="w-full h-64 sm:h-96 md:h-[500px] lg:h-[600px] object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Floating year badge */}
              <div className="absolute top-8 right-8 bg-accent text-accent-foreground px-8 py-6">
                <p className="text-5xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>1999</p>
                <p className="text-sm tracking-wider uppercase">Founded</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Content side */}
          <AnimatedSection delay={0.2}>
            <div>
              <div className="mb-8">
                <div className="h-[1px] w-12 bg-accent mb-4" />
                <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                  Our Journey
                </p>
              </div>

              <h2
                className="text-4xl md:text-5xl lg:text-6xl mb-8 tracking-tight leading-[1.1]"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                A Legacy of Faith<br />& Community
              </h2>

              <div className="space-y-6 mb-10">
                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  Ghana Methodist Student's Union was founded in 1999 by a small group of passionate believers who shared
                  a vision to create a welcoming community where people could encounter God's love and
                  discover their purpose. What began as a handful of families meeting in a living room
                  has grown into a vibrant congregation of over 5,000 members.
                </p>

                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  Over the past 25 years, we've witnessed countless lives transformed, families restored,
                  and communities renewed. From our humble beginnings to our current multi-campus presence,
                  our mission has remained unchanged: to be a beacon of hope and a catalyst for positive
                  change in our city and beyond.
                </p>

                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  Today, we continue to grow and adapt while staying rooted in timeless biblical truths.
                  Our journey is marked by faithful service, innovative ministry, and an unwavering
                  commitment to making disciples who make a difference in the world.
                </p>
              </div>

              <Link to="/about">
                <button className="group flex items-center gap-3 border-2 border-primary text-primary px-10 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  Read Our Full Story
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
