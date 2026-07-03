import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import aboutImage from '../../images/3.jpg'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '60+',  label: 'Years of\nImpact'      },
  { value: '100+', label: 'Locals\nNationwide'    },
  { value: 'Many', label: 'Lives\nTransformed'    },
]

const PILLARS = [
  'Rooted in Scripture & Methodist tradition',
  'Spirit-filled praise & worship culture',
  'Active campus evangelism through SICE',
  'Missions outreach beyond campus gates',
]

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

export function AboutSection() {
  return (
    <>
      <style>{`
        .about-section             { background-color: #003D82; }
        .about-eyebrow-line        { background-color: #D4AF37; }
        .about-eyebrow             { color: #D4AF37; }
        .about-heading             { color: #FFFFFF; }
        .about-body                { color: rgba(255,255,255,0.68); }
        .about-pillar              { color: rgba(255,255,255,0.8); }
        .about-pillar-icon         { color: #D4AF37; flex-shrink: 0; }
        .about-stat-box            {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 14px;
          transition: background 0.3s, transform 0.3s;
        }
        .about-stat-box:hover      { background: rgba(255,255,255,0.11); transform: translateY(-2px); }
        .about-stat-value          { color: #D4AF37; }
        .about-stat-label          { color: rgba(255,255,255,0.55); }
        .about-cta-btn             {
          border: 2px solid #D4AF37;
          color: #D4AF37;
          background: transparent;
          transition: background 0.3s, color 0.3s, transform 0.2s;
        }
        .about-cta-btn:hover       { background-color: #D4AF37; color: #003D82; transform: translateY(-1px); }
        .about-badge               { background-color: rgba(255,255,255,0.93); }
        .about-badge-text          { color: #003D82; }

        /* Dark mode overrides */
        .dark .about-section       { background-color: var(--secondary); }
        .dark .about-eyebrow-line  { background-color: var(--accent); }
        .dark .about-eyebrow       { color: var(--accent); }
        .dark .about-heading       { color: var(--foreground); }
        .dark .about-body          { color: var(--muted-foreground); }
        .dark .about-pillar        { color: var(--foreground); }
        .dark .about-pillar-icon   { color: var(--accent); }
        .dark .about-stat-box      { background-color: var(--background); border-color: var(--border); }
        .dark .about-stat-box:hover{ background-color: var(--card); }
        .dark .about-stat-value    { color: var(--foreground); }
        .dark .about-stat-label    { color: var(--muted-foreground); }
        .dark .about-cta-btn       { border-color: var(--primary); color: var(--primary); }
        .dark .about-cta-btn:hover { background-color: var(--primary); color: var(--primary-foreground); }
        .dark .about-badge         { background-color: rgba(255,255,255,0.9); }
        .dark .about-badge-text    { color: #1e3a5f; }
      `}</style>

      <section className="about-section px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-20">

            {/* ── IMAGE — first on mobile, right on desktop ── */}
            <AnimatedSection delay={0.15} className="order-first lg:order-last">
              <GoldFrame>
                <div className="relative overflow-hidden rounded-xl shadow-2xl">
                  <img
                    src={aboutImage}
                    alt="GHAMSU community gathering"
                    className="h-60 w-full object-cover xs:h-72 sm:h-96 lg:h-[580px]"
                  />
                  {/* Dark gradient for badge readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Since 1965 badge — always visible */}
                  <div className="about-badge absolute bottom-4 left-4 flex items-center gap-2 rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm sm:px-4 sm:py-2.5">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#D4AF37' }}
                    />
                    <p className="about-badge-text text-[10px] font-bold uppercase tracking-widest sm:text-xs">
                      Since 1965
                    </p>
                  </div>
                </div>
              </GoldFrame>
            </AnimatedSection>

            {/* ── CONTENT ── */}
            <AnimatedSection className="order-last lg:order-first">
              <div>
                {/* Eyebrow */}
                <div className="mb-5 sm:mb-7">
                  <div className="about-eyebrow-line mb-3 h-px w-10 sm:w-12" />
                  <p
                    className="about-eyebrow text-[11px] tracking-[0.3em] uppercase sm:text-xs"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Our Story
                  </p>
                </div>

                {/* Heading */}
                <h2
                  className="about-heading mb-5 text-[1.75rem] leading-[1.1] tracking-tight sm:text-4xl sm:mb-6 md:text-5xl lg:mb-8 lg:text-[3.5rem]"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Transforming Lives
                  <br />Since 1965
                </h2>

                {/* Body copy — single paragraph on mobile */}
                <p className="about-body mb-5 text-sm font-light leading-relaxed sm:mb-6 sm:text-[15px]">
                  For over 60 years, Ghana Methodist Students' Union has been a beacon of faith
                  and spiritual guidance across our Connexion — creating a welcoming community
                  where students encounter God's love, grow in faith, and discover their purpose
                  as Ambassadors for Christ.
                </p>

                {/* Pillars checklist */}
                <ul className="mb-7 space-y-2.5 sm:mb-9" role="list">
                  {PILLARS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="about-pillar-icon mt-0.5 h-4 w-4" aria-hidden="true" />
                      <span className="about-pillar text-sm leading-snug sm:text-[15px]">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Stat Boxes */}
                <div className="mb-8 grid grid-cols-3 gap-2.5 sm:mb-10 sm:gap-4">
                  {STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="about-stat-box flex flex-col items-center justify-center px-2 py-4 text-center sm:px-4 sm:py-5"
                    >
                      <p
                        className="about-stat-value mb-1 text-xl font-bold leading-none sm:text-2xl lg:text-3xl"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {stat.value}
                      </p>
                      <p className="about-stat-label mt-1.5 text-[9px] uppercase leading-tight tracking-wider sm:text-[11px]">
                        {stat.label.replace('\n', ' ')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link to="/about" aria-label="Read our full story">
                  <button className="about-cta-btn w-full rounded-sm px-8 py-3.5 text-xs font-semibold uppercase tracking-wider focus:outline-none focus-visible:ring-2 sm:w-auto sm:px-10 sm:py-4 sm:text-sm">
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