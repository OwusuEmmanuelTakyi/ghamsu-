import { Heart, Globe, Church, Users } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import { motion } from 'motion/react'
import { useRef } from 'react'
import { useInView } from 'motion/react'

// ─────────────────────────────────────────────────────────────────────────────
// Gold Frame (mirrored from AboutSection)
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
// Data
// ─────────────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Heart,
    title: 'To develop Ambassadors in unity and love for Christ',
    number: '01',
  },
  {
    icon: Globe,
    title: 'To witness Him to the nations ',
    number: '02',
  },
  {
    icon: Church,
    title: 'To build on the strong foundation of the church',
    number: '03',
  },
  {
    icon: Users,
    title: 'To responsible contributors to society',
    number: '04',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function WhyChooseUs() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  return (
    <>
      <style>{`
        .why-section             { background-color: #003D82; }
        .why-eyebrow-line        { background-color: #D4AF37; }
        .why-eyebrow             { color: #D4AF37; }
        .why-heading             { color: #FFFFFF; }
        .why-body                { color: rgba(255,255,255,0.68); }
        .why-card {
          background-color: #002f6c;
          border: 1px solid rgba(212, 175, 55, 0.2);
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }
        .why-card:hover {
          border-color: rgba(212, 175, 55, 0.55);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.15);
        }
        .why-card-top-bar        { background-color: #D4AF37; }
        .why-card-number         { color: rgba(212, 175, 55, 0.35); }
        .why-icon-box            { border: 1px solid rgba(212, 175, 55, 0.35); transition: border-color 0.3s, background-color 0.3s; }
        .why-card:hover .why-icon-box { border-color: #D4AF37; background-color: rgba(212, 175, 55, 0.08); }
        .why-icon                { color: #D4AF37; }
        .why-card-title          { color: #FFFFFF; }
        .why-card-micro-divider  { background-color: rgba(212, 175, 55, 0.35); }
        .why-badge               { background-color: rgba(255,255,255,0.93); }
        .why-badge-text          { color: #003D82; }

        /* Dark mode overrides */
        .dark .why-section             { background-color: var(--background); }
        .dark .why-eyebrow-line        { background-color: var(--accent); }
        .dark .why-eyebrow             { color: var(--accent); }
        .dark .why-heading             { color: var(--foreground); }
        .dark .why-body                { color: var(--muted-foreground); }
        .dark .why-card {
          background-color: var(--card);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .dark .why-card:hover {
          border-color: var(--accent);
          box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.4));
        }
        .dark .why-card-top-bar        { background-color: var(--accent); }
        .dark .why-card-number         { color: color-mix(in srgb, var(--accent) 40%, transparent); }
        .dark .why-icon-box            { border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
        .dark .why-card:hover .why-icon-box { border-color: var(--accent); background-color: color-mix(in srgb, var(--accent) 5%, transparent); }
        .dark .why-icon                { color: var(--accent); }
        .dark .why-card-title          { color: var(--foreground); }
        .dark .why-card-micro-divider  { background-color: color-mix(in srgb, var(--accent) 30%, transparent); }
        .dark .why-badge               { background-color: rgba(255,255,255,0.9); }
        .dark .why-badge-text          { color: #1e3a5f; }
      `}</style>

      <section
        ref={sectionRef}
        className="why-section px-4 py-16 sm:px-6 sm:py-24 lg:py-32"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-20">

            {/* ── IMAGE — first on mobile, left on desktop ── */}
            <AnimatedSection delay={0.15} className="order-first">
              <GoldFrame>
                <div className="relative overflow-hidden rounded-xl shadow-2xl">
                  <img
                    src="https://lh3.googleusercontent.com/pw/AP1GczNUNG-ZFXVI3NR6SnOJhW25LeNN6DQy_Ei9RPt7BHQ-Gx81_KjFlE977gdpfk1VY9mgY4z3AgqGJ7mZjHadmFuh6E1BF71FxPdyO5yllPhF1pgyRSRSBWjjan-8SD1oO5Np-eb7YRj4HyHD-XgwH_dQ=w1265-h948-s-no-gm?authuser=0"
                    alt="GHAMSU vision gathering"
                    className="h-60 w-full object-cover xs:h-72 sm:h-96 lg:h-[580px]"
                    loading="lazy"
                  />
                  {/* Dark gradient for badge readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Badge */}
                  <div className="why-badge absolute bottom-4 left-4 flex items-center gap-2 rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm sm:px-4 sm:py-2.5">
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#D4AF37' }}
                    />
                    <p className="why-badge-text text-[10px] font-bold uppercase tracking-widest sm:text-xs">
                      Our Vision
                    </p>
                  </div>
                </div>
              </GoldFrame>
            </AnimatedSection>

            {/* ── CONTENT ── */}
            <AnimatedSection delay={0} className="order-last">
              <div>
                {/* Eyebrow */}
                <div className="mb-5 sm:mb-7">
                  <div className="why-eyebrow-line mb-3 h-px w-10 sm:w-12" />
                  <p
                    className="why-eyebrow text-[11px] tracking-[0.3em] uppercase sm:text-xs"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                   The Four Pillars
                  </p>
                </div>

                {/* Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="why-heading mb-5 text-[1.75rem] leading-[1.1] tracking-tight sm:text-4xl sm:mb-6 md:text-5xl lg:mb-10 lg:text-[3.5rem]"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  GHAMSU VISION
                </motion.h2>

                {/* Vision Cards — stacked list */}
                <div className="space-y-3 sm:space-y-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1 + 0.15,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <div className="why-card relative rounded-xl overflow-hidden flex items-center gap-4 sm:gap-5 px-5 py-4 sm:px-6 sm:py-5">
                          {/* Top accent bar */}
                          <motion.div
                            className="why-card-top-bar absolute top-0 left-0 right-0 h-[2px]"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.25 }}
                            style={{ originX: 0 }}
                          />

                          {/* Icon */}
                          <motion.div
                            className="why-icon-box flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.5,
                              delay: index * 0.1 + 0.2,
                              type: 'spring',
                              stiffness: 120,
                            }}
                          >
                            <Icon className="why-icon w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                          </motion.div>

                          {/* Title */}
                          <h3
                            className="why-card-title text-sm sm:text-base font-semibold tracking-tight flex-1"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {feature.title}
                          </h3>

                          {/* Number */}
                          <span
                            className="why-card-number text-xl sm:text-2xl font-light flex-shrink-0"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {feature.number}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>
    </>
  )
}