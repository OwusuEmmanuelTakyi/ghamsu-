import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '60+',    label: 'Years of Impact'   },
  { value: '100+',   label: 'Locals Nationwide' },
  { value: '100k+',  label: 'Lives Transformed' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AboutSection() {
  return (
    <section className="bg-secondary px-4 py-16 sm:px-6 sm:py-20 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Image (shown first on mobile) ── */}
          <AnimatedSection delay={0.1} className="order-first lg:order-last">
            <div className="relative overflow-hidden rounded-2xl shadow-xl lg:rounded-none lg:shadow-none">
              <img
                src="https://images.unsplash.com/photo-1569292567777-e5d61a759322?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBjb21tdW5pdHklMjBwZW9wbGV8ZW58MXx8fHwxNzc3ODU1NzcxfDA&ixlib=rb-4.0.0&q=80&w=1080"
                alt="GHAMSU community gathering"
                className="h-64 w-full object-cover sm:h-80 lg:h-[600px]"
                loading="lazy"
              />
              {/* Mobile overlay badge */}
              <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-4 py-2.5 backdrop-blur-sm lg:hidden">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-900">
                  Since 1965
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Content ── */}
          <AnimatedSection className="order-last lg:order-first">
            <div>
              {/* Eyebrow */}
              <div className="mb-6 sm:mb-8">
                <div className="mb-3 h-px w-10 bg-accent sm:w-12" />
                <p
                  className="text-xs tracking-[0.3em] uppercase text-accent"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Our Story
                </p>
              </div>

              {/* Heading */}
              <h2
                className="mb-6 text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl lg:mb-8"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Transforming Lives
                <br className="hidden sm:block" />
                {' '}Since 1965
              </h2>

              {/* Body copy */}
              <p className="mb-4 text-sm font-light leading-relaxed text-muted-foreground sm:text-base sm:mb-6">
                For over 60 years, Ghana Methodist Students' Union has been a beacon of faith
                and spiritual guidance across our Connexion. We are committed to creating a
                welcoming community where students from all walks of life can encounter God's
                love, grow in their faith, and discover their purpose as Ambassadors for Christ.
              </p>
              <p className="mb-8 text-sm font-light leading-relaxed text-muted-foreground sm:text-base sm:mb-10">
                Our vision is to develop Ambassadors in unity and love, witness Christ to the
                nations, build on the strong foundation of the Methodist Church, and produce
                responsible contributors to society through evangelism, discipleship, and
                Spirit-filled leadership.
              </p>

              {/* Stats */}
              <div className="mb-8 grid grid-cols-3 gap-4 border-b border-border pb-8 sm:gap-8 sm:mb-10 sm:pb-10">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <p
                      className="mb-1 text-xl font-semibold text-foreground sm:text-2xl lg:text-3xl"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link to="/about" aria-label="Read our full story">
                <button className="w-full border-2 border-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground sm:w-auto sm:px-10 sm:py-4 sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  Our Story
                </button>
              </Link>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}