import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import historyImage from '../../images/12.jpg'

// ─────────────────────────────────────────────────────────────────────────────
// Gold Frame
// ─────────────────────────────────────────────────────────────────────────────

function GoldFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-3 sm:p-5">
      {/* Offset shadow border */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: 14, left: 14, right: 0, bottom: 0,
          border: '1.5px solid rgba(212,175,55,0.55)',
          borderRadius: 14,
        }}
      />
      {/* Top-left L bracket */}
      <div
        className="pointer-events-none absolute top-0 left-0"
        style={{
          width: 44, height: 44,
          borderTop: '3px solid #D4AF37',
          borderLeft: '3px solid #D4AF37',
          borderRadius: '8px 0 0 0',
        }}
      />
      {/* Top-right L bracket */}
      <div
        className="pointer-events-none absolute top-0 right-0"
        style={{
          width: 44, height: 44,
          borderTop: '3px solid #D4AF37',
          borderRight: '3px solid #D4AF37',
          borderRadius: '0 8px 0 0',
        }}
      />
      {/* Bottom-left L bracket */}
      <div
        className="pointer-events-none absolute bottom-0 left-0"
        style={{
          width: 44, height: 44,
          borderBottom: '3px solid #D4AF37',
          borderLeft: '3px solid #D4AF37',
          borderRadius: '0 0 0 8px',
        }}
      />
      {/* Bottom-right L bracket */}
      <div
        className="pointer-events-none absolute bottom-0 right-0"
        style={{
          width: 44, height: 44,
          borderBottom: '3px solid #D4AF37',
          borderRight: '3px solid #D4AF37',
          borderRadius: '0 0 8px 0',
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
    <section className="bg-secondary px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-20">

          {/* ── IMAGE ── */}
          <AnimatedSection>
            <GoldFrame>
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img
                  src={historyImage}
                  alt="GHAMSU History"
                  className="h-60 w-full object-cover xs:h-72 sm:h-96 md:h-[480px] lg:h-[580px]"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Year badge — responsive size */}
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-2.5 shadow-lg sm:top-6 sm:right-6 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
                  <p
                    className="text-xl font-bold leading-none sm:text-3xl lg:text-5xl"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    1965
                  </p>
                  <p className="mt-0.5 text-[9px] tracking-wider uppercase sm:text-xs sm:mt-1">
                    Founded
                  </p>
                </div>
              </div>
            </GoldFrame>
          </AnimatedSection>

          {/* ── CONTENT ── */}
          <AnimatedSection delay={0.2}>
            <div>
              {/* Eyebrow */}
              <div className="mb-5 sm:mb-7">
                <div className="mb-3 h-px w-10 bg-accent sm:w-12" />
                <p
                  className="text-[11px] tracking-[0.3em] uppercase text-accent sm:text-xs"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Our Journey
                </p>
              </div>

              {/* Heading */}
              <h2
                className="mb-6 text-[1.75rem] leading-[1.1] tracking-tight text-foreground sm:text-4xl sm:mb-8 md:text-5xl lg:text-[3.5rem]"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                A Legacy of Faith
                <br />& Ambassadors for Christ
              </h2>

              {/* Body */}
              <div className="mb-8 space-y-4 sm:mb-10 sm:space-y-5">
                <p className="text-sm font-light leading-relaxed text-muted-foreground sm:text-[15px]">
                  Ghana Methodist Students' Union was founded in 1965 under the name Ghana
                  Inter-University Methodist Union (GIUMU) by Prof. S.N. Quartey and two
                  vibrant former seminary students, Rt. Rev. Michael Kumi and Rt. Rev. Blankson.
                  What began as a small fellowship has grown into a vibrant Connexional movement
                  spanning multiple educational institutions.
                </p>
                <p className="text-sm font-light leading-relaxed text-muted-foreground sm:text-[15px]">
                  In 1984, GHAMSU was constituted to include all post-elementary Methodist
                  students. The historic 23rd Annual Conference at UCC unveiled our official
                  emblem, anthem, and the defining slogan <em>"Ambassadors for Christ!"</em> —
                  a turning point in our identity and mission.
                </p>
                <p className="hidden text-sm font-light leading-relaxed text-muted-foreground sm:block sm:text-[15px]">
                  Today, over 60 years later, GHAMSU continues to be a beacon of hope for
                  Methodist students — evangelising, discipling, and training spirit-filled
                  leaders who impact church and society through faithful service.
                </p>
              </div>

              {/* CTA */}
              <Link to="/about">
                <button className="group flex w-full items-center justify-center gap-3 border-2 border-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground focus:outline-none sm:w-auto sm:justify-start sm:px-10 sm:py-4 sm:text-sm">
                  Read Our Full Story
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
                    strokeWidth={2}
                  />
                </button>
              </Link>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}