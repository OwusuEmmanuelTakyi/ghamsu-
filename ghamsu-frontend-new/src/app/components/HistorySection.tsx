import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Gold Frame wrapper
// ─────────────────────────────────────────────────────────────────────────────

function GoldFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-3 sm:p-4">
      {/* Offset border rectangle */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 rounded-xl"
        style={{
          top: '12px',
          left: '12px',
          border: '2px solid rgba(212,175,55,0.7)',
          borderRadius: '12px',
        }}
      />
      {/* Top-left corner L */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-10 w-10 sm:h-14 sm:w-14"
        style={{
          borderTop: '3px solid #D4AF37',
          borderLeft: '3px solid #D4AF37',
          borderRadius: '6px 0 0 0',
        }}
      />
      {/* Bottom-right corner L */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 sm:h-14 sm:w-14"
        style={{
          borderBottom: '3px solid #D4AF37',
          borderRight: '3px solid #D4AF37',
          borderRadius: '0 0 6px 0',
        }}
      />
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function HistorySection() {
  return (
    <section className="py-16 px-4 sm:py-24 sm:px-6 lg:py-32 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Image side ── */}
          <AnimatedSection>
            <GoldFrame>
              <div className="relative overflow-hidden rounded-xl shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1778082948973-69296a83789f?q=80&w=1034&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="GHAMSU History"
                  className="w-full h-64 sm:h-96 md:h-[500px] lg:h-[580px] object-cover"
                  loading="lazy"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Floating year badge */}
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-3 sm:top-6 sm:right-6 sm:px-8 sm:py-6">
                  <p
                    className="text-2xl font-bold leading-none mb-0.5 sm:text-5xl sm:mb-1"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    1965
                  </p>
                  <p className="text-[10px] tracking-wider uppercase sm:text-sm">Founded</p>
                </div>
              </div>
            </GoldFrame>
          </AnimatedSection>

          {/* ── Content side ── */}
          <AnimatedSection delay={0.2}>
            <div>
              <div className="mb-6 sm:mb-8">
                <div className="h-[1px] w-12 bg-accent mb-4" />
                <p
                  className="text-accent text-xs tracking-[0.3em] uppercase"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Our Journey
                </p>
              </div>

              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 sm:mb-8 tracking-tight leading-[1.1]"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                A Legacy of Faith
                <br />& Ambassadors for Christ
              </h2>

              <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                  Ghana Methodist Students' Union was founded in 1965 under the name Ghana Inter-University Methodist
                  Union (GIUMU) by Prof. S.N. Quartey and two vibrant former seminary students, Rt. Rev. Michael Kumi and
                  Rt. Rev. Blankson. What began as a small fellowship on university campuses has grown into a vibrant
                  Connexional movement spanning multiple educational institutions.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                  In 1984, at the Annual Conference, GHAMSU was constituted to include all post-elementary Methodist
                  students. The historic 23rd Annual Conference at UCC unveiled our official emblem, anthem, and the
                  defining slogan "Ambassadors for Christ!" This marked a turning point in our identity and mission across
                  the nation.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                  Today, over 60 years later, GHAMSU continues to be a beacon of hope and spiritual guidance for Methodist
                  students. Our mission remains unchanged: to evangelize, disciple students to a personal faith in Christ,
                  and train spirit-filled leaders who will impact the church and society at large through faithful service
                  and Christian witness.
                </p>
              </div>

              <Link to="/about">
                <button className="group flex items-center gap-3 border-2 border-primary text-primary px-6 py-3 sm:px-10 sm:py-4 text-xs sm:text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start">
                  Read Our Full Story
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
              </Link>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}