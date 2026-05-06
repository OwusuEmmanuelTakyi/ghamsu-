import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '60+',   label: 'Years of Impact'   },
  { value: '100+',  label: 'Locals Nationwide' },
  { value: '100k+', label: 'Lives Transformed' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AboutSection() {
  return (
    <>
      <style>{`
        .about-section {
          background-color: #003D82;
        }
        .about-eyebrow-line {
          background-color: #D4AF37;
        }
        .about-eyebrow {
          color: #D4AF37;
        }
        .about-heading {
          color: #FFFFFF;
        }
        .about-body {
          color: rgba(255, 255, 255, 0.65);
        }
        .about-stat-value {
          color: #FFFFFF;
        }
        .about-stat-label {
          color: rgba(255, 255, 255, 0.55);
        }
        .about-stat-divider {
          border-color: rgba(212, 175, 55, 0.25);
        }
        .about-cta-btn {
          border: 2px solid #D4AF37;
          color: #D4AF37;
          background: transparent;
          transition: background 0.3s, color 0.3s;
        }
        .about-cta-btn:hover {
          background-color: #D4AF37;
          color: #003D82;
        }
        .about-badge {
          background-color: rgba(255, 255, 255, 0.92);
        }
        .about-badge-text {
          color: #003D82;
        }

        /* Dark mode — restore original CSS variable styles */
        .dark .about-section {
          background-color: var(--secondary);
        }
        .dark .about-eyebrow-line {
          background-color: var(--accent);
        }
        .dark .about-eyebrow {
          color: var(--accent);
        }
        .dark .about-heading {
          color: var(--foreground);
        }
        .dark .about-body {
          color: var(--muted-foreground);
        }
        .dark .about-stat-value {
          color: var(--foreground);
        }
        .dark .about-stat-label {
          color: var(--muted-foreground);
        }
        .dark .about-stat-divider {
          border-color: var(--border);
        }
        .dark .about-cta-btn {
          border-color: var(--primary);
          color: var(--primary);
        }
        .dark .about-cta-btn:hover {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
        .dark .about-badge {
          background-color: rgba(255, 255, 255, 0.9);
        }
        .dark .about-badge-text {
          color: #1e3a5f;
        }
      `}</style>

      <section className="about-section px-4 py-16 sm:px-6 sm:py-20 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

            {/* ── Image (shown first on mobile) ── */}
            <AnimatedSection delay={0.1} className="order-first lg:order-last">
              <div className="relative overflow-hidden rounded-2xl shadow-xl lg:rounded-none lg:shadow-none">
                <img
                  src="https://images.unsplash.com/photo-1778082388067-9203e6db7c59?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="GHAMSU community gathering"
                  className="h-64 w-full object-cover sm:h-80 lg:h-[600px]"
                  loading="lazy"
                />
                {/* Mobile overlay badge */}
                <div className="about-badge absolute bottom-4 left-4 rounded-xl px-4 py-2.5 backdrop-blur-sm lg:hidden">
                  <p className="about-badge-text text-xs font-bold uppercase tracking-widest">
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
                  <div className="about-eyebrow-line mb-3 h-px w-10 sm:w-12" />
                  <p
                    className="about-eyebrow text-xs tracking-[0.3em] uppercase"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Our Story
                  </p>
                </div>

                {/* Heading */}
                <h2
                  className="about-heading mb-6 text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl lg:mb-8"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Transforming Lives
                  <br className="hidden sm:block" />
                  {' '}Since 1965
                </h2>

                {/* Body copy */}
                <p className="about-body mb-4 text-sm font-light leading-relaxed sm:text-base sm:mb-6">
                  For over 60 years, Ghana Methodist Students' Union has been a beacon of faith
                  and spiritual guidance across our Connexion. We are committed to creating a
                  welcoming community where students from all walks of life can encounter God's
                  love, grow in their faith, and discover their purpose as Ambassadors for Christ.
                </p>
                <p className="about-body mb-8 text-sm font-light leading-relaxed sm:text-base sm:mb-10">
                  Our vision is to develop Ambassadors in unity and love, witness Christ to the
                  nations, build on the strong foundation of the Methodist Church, and produce
                  responsible contributors to society through evangelism, discipleship, and
                  Spirit-filled leadership.
                </p>

                {/* Stats */}
                <div className="about-stat-divider mb-8 grid grid-cols-3 gap-4 border-b pb-8 sm:gap-8 sm:mb-10 sm:pb-10">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <p
                        className="about-stat-value mb-1 text-xl font-semibold sm:text-2xl lg:text-3xl"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {stat.value}
                      </p>
                      <p className="about-stat-label text-[10px] uppercase tracking-wider sm:text-xs">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link to="/about" aria-label="Read our full story">
                  <button className="about-cta-btn w-full px-8 py-3.5 text-xs font-semibold uppercase tracking-wider sm:w-auto sm:px-10 sm:py-4 sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                    Our Story
                  </button>
                </Link>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>
    </>
  )
}