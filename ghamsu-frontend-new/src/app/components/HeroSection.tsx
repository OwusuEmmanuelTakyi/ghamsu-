import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import heroImage1 from '../../images/3.jpg'
import heroImage2 from '../../images/7.jpg'
import heroImage3 from '../../images/5.jpg'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HeroSlide {
  image: string
  eyebrow: string
  heading: string
  subheading: string
}

interface HeroSectionProps {
  slides?: HeroSlide[]
  primaryButtonText?: string
  primaryButtonLink?: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
  isHomePage?: boolean

  // Inner-page props
  title?: string
  titleHighlight?: string
  subtitle?: string
  backgroundImage?: string
  tagline?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Slides
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: heroImage1,
    eyebrow: 'Welcome Home',
    heading: "Ghana Methodist\nStudents' Union",
    subheading:
      'A vibrant movement of students committed to faith, fellowship, and the transformation of every campus in Ghana for Christ.',
  },
  {
    image: heroImage2,
    eyebrow: 'Ambassadors for Christ',
    heading: 'Ambassadors\nin Unity & Love',
    subheading:
      'United across campuses and locals — one family pursuing one mission under one Lord.',
  },
  {
    image: heroImage3,
    eyebrow: 'Unity and Love',
    heading: 'Ambassadors\nFor Christ',
    subheading:
      'Join us for Spirit-filled worship, deep fellowship, and a journey of faith that transforms lives and nations.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Home Hero — synced text + image transitions, smooth fade-up heading
// ─────────────────────────────────────────────────────────────────────────────

function HomeHero({
  slides,
  primaryButtonText = 'Join Us',
  primaryButtonLink = '/contact',
  secondaryButtonText = 'Learn More',
  secondaryButtonLink = '/about',
}: {
  slides: HeroSlide[]
  primaryButtonText?: string
  primaryButtonLink?: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
}) {
  const SLIDE_DURATION = 6000

  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback(
    (i: number, d: number) => {
      setDir(d)
      setIndex((i + slides.length) % slides.length)
    },
    [slides.length],
  )

  const next = useCallback(() => {
    goTo(index + 1, 1)
  }, [index, goTo])

  const prev = useCallback(() => {
    goTo(index - 1, -1)
  }, [index, goTo])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      next()
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [next, paused])

  const slide = slides[index]

  // Shared easing for synced motion
  const ease = [0.22, 1, 0.36, 1] as const

  // Heading splits into words for staggered, smooth reveal
  const headingWords = slide.heading.split('\n').map((line) => line.split(' '))

  return (
    <>
      <style>{`
        :root {
          --ghamsu-blue: #003D82;
          --ghamsu-gold: #D4AF37;
        }

        .hero-section {
          background: var(--background);
          position: relative;
          overflow: hidden;
        }

        .hero-image-panel {
          background: #003D82;
        }

        .gold-bracket {
          position: absolute;
          width: 32px;
          height: 32px;
          pointer-events: none;
        }

        @media (min-width: 640px) {
          .gold-bracket { width: 44px; height: 44px; }
        }

        .gold-bracket-tl {
          top: -2px; left: -2px;
          border-top: 3px solid #D4AF37;
          border-left: 3px solid #D4AF37;
          border-radius: 6px 0 0 0;
        }
        .gold-bracket-tr {
          top: -2px; right: -2px;
          border-top: 3px solid #D4AF37;
          border-right: 3px solid #D4AF37;
          border-radius: 0 6px 0 0;
        }
        .gold-bracket-bl {
          bottom: -2px; left: -2px;
          border-bottom: 3px solid #D4AF37;
          border-left: 3px solid #D4AF37;
          border-radius: 0 0 0 6px;
        }
        .gold-bracket-br {
          bottom: -2px; right: -2px;
          border-bottom: 3px solid #D4AF37;
          border-right: 3px solid #D4AF37;
          border-radius: 0 0 6px 0;
        }

        .hero-dots {
          background-image: radial-gradient(circle, rgba(0,61,130,0.04) 1px, transparent 1px);
          background-size: 26px 26px;
        }

        .dark .hero-dots {
          background-image: radial-gradient(circle, rgba(212,175,55,0.06) 1px, transparent 1px);
        }

        .slide-dot {
          display: block;
          height: 8px;
          border-radius: 99px;
          transition: width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s ease;
        }
        .slide-dot-active { width: 36px; background: #D4AF37; }
        .slide-dot-inactive { width: 8px; background: rgba(0,61,130,0.25); }
        .dark .slide-dot-inactive { background: rgba(255,255,255,0.2); }
      `}</style>

      <section
        className="hero-section min-h-screen w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-label="GHAMSU hero slideshow"
      >
        <div className="flex flex-col md:flex-row md:min-h-screen">
          {/* LEFT TEXT SIDE — ~55% on desktop so image gets close to half */}
          <div
            className="hero-dots relative flex flex-col justify-center
              px-5 pb-10 pt-28
              sm:px-8 sm:pt-36 sm:pb-12
              md:w-[55%] md:px-10 md:pt-40 md:pb-20 md:min-h-screen
              lg:w-[54%] lg:px-16 lg:pt-44
              xl:w-[53%] xl:px-24 xl:pt-48"
          >
            <div
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72
                rounded-full opacity-10 blur-3xl"
              style={{ background: '#003D82' }}
              aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-3xl">
              {/* SYNCED CONTENT — crossfades in sync with the image (no mode=wait) */}
              <div className="relative grid">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={`content-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                    className="relative"
                    style={{
                      // Stack old + new during the crossfade so layout doesn't jump
                      gridArea: '1 / 1',
                    }}
                  >
                  {/* EYEBROW */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.5, ease, delay: 0.05 }}
                    className="mb-4 flex items-center gap-3 sm:mb-5"
                  >
                    <div
                      className="h-px w-8 sm:w-12"
                      style={{ background: '#D4AF37' }}
                      aria-hidden="true"
                    />
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.32em] sm:text-[11px] sm:tracking-[0.38em]"
                      style={{
                        color: 'var(--foreground)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {slide.eyebrow}
                    </p>
                  </motion.div>

                  {/* HEADING — word-by-word fade-up, smaller responsive sizes */}
                  <h1
                    className="mb-5 text-left font-black leading-[1.08] tracking-tight
                      text-[1.85rem]
                      sm:text-[2.4rem]
                      md:text-[2.6rem]
                      lg:text-[3.2rem]
                      xl:text-[3.75rem]
                      2xl:text-[4.25rem]
                      sm:mb-6"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 900,
                      color: '#003D82',
                    }}
                    aria-live="polite"
                  >
                    {headingWords.map((line, lineIdx) => (
                      <span
                        key={lineIdx}
                        className="block"
                        style={{ color: lineIdx > 0 ? '#D4AF37' : '#003D82' }}
                      >
                        {line.map((word, wordIdx) => {
                          // Global word index for stagger
                          const globalIdx =
                            headingWords
                              .slice(0, lineIdx)
                              .reduce((acc, l) => acc + l.length, 0) + wordIdx
                          return (
                            <motion.span
                              key={`${lineIdx}-${wordIdx}`}
                              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                              transition={{
                                duration: 0.55,
                                ease,
                                delay: 0.1 + globalIdx * 0.05,
                              }}
                              className="inline-block"
                              style={{ marginRight: '0.25em' }}
                            >
                              {word}
                            </motion.span>
                          )
                        })}
                      </span>
                    ))}
                  </h1>

                  {/* SUBHEADING */}
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease, delay: 0.3 }}
                    className="mb-7 max-w-2xl text-[0.92rem] font-medium leading-relaxed
                      text-foreground/75
                      sm:text-base sm:mb-8
                      md:text-[1.05rem]
                      lg:text-[1.15rem]"
                  >
                    {slide.subheading}
                  </motion.p>

                  {/* BUTTONS */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease, delay: 0.4 }}
                    className="flex flex-wrap items-center gap-3 sm:gap-4"
                  >
                    <Link to={primaryButtonLink}>
                      <button
                        className="group flex items-center gap-2 rounded-full
                          px-6 py-3 text-[13px] font-bold text-white
                          transition-all duration-300 hover:gap-3
                          sm:px-8 sm:py-3.5 sm:text-sm
                          md:px-9 md:py-4 md:text-base"
                        style={{ background: 'var(--accent)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                      >
                        {primaryButtonText}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </Link>

                    <Link to={secondaryButtonLink}>
                      <button
                        className="rounded-full border-2 px-6 py-3 text-[13px] font-semibold
                          transition-all duration-300
                          sm:px-8 sm:py-3.5 sm:text-sm
                          md:px-9 md:py-4 md:text-base"
                        style={{
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--accent)'
                          e.currentTarget.style.color = '#fff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--accent)'
                        }}
                      >
                        {secondaryButtonText}
                      </button>
                    </Link>
                  </motion.div>
                </motion.div>
                </AnimatePresence>
              </div>

              {/* DOTS — not animated with slide content, stays steady */}
              <div className="mt-9 flex items-center gap-2.5 sm:mt-12">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > index ? 1 : -1)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-pressed={i === index}
                    className="focus:outline-none"
                  >
                    <span
                      className={`slide-dot ${
                        i === index ? 'slide-dot-active' : 'slide-dot-inactive'
                      }`}
                    />
                  </button>
                ))}

                <span
                  className="ml-2 text-[10px] font-semibold tracking-[0.2em] sm:text-[11px]"
                  style={{ color: 'rgba(0,61,130,0.4)' }}
                >
                  {String(index + 1).padStart(2, '0')} /{' '}
                  {String(slides.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE SIDE — close to half on desktop */}
          <div
            className="hero-image-panel relative w-full overflow-hidden
              h-[300px]
              sm:h-[380px]
              md:h-auto md:w-[45%] md:min-h-screen
              lg:w-[46%]
              xl:w-[47%]"
          >
            <AnimatePresence custom={dir} initial={false}>
              <motion.img
                key={`image-${index}`}
                src={slide.image}
                alt={slide.eyebrow}
                custom={dir}
                initial={{
                  opacity: 0,
                  scale: 1.08,
                  x: dir > 0 ? 40 : -40,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 1.04,
                  x: dir > 0 ? -30 : 30,
                }}
                transition={{
                  duration: 0.7,
                  ease,
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,30,80,0.68) 0%, rgba(0,30,80,0.18) 45%, transparent 75%)',
              }}
              aria-hidden="true"
            />

            {/* Gold brackets */}
            <div className="absolute inset-4 sm:inset-6" aria-hidden="true">
              <div className="gold-bracket gold-bracket-tl" />
              <div className="gold-bracket gold-bracket-tr" />
              <div className="gold-bracket gold-bracket-bl" />
              <div className="gold-bracket gold-bracket-br" />
            </div>

            {/* Eyebrow chip — synced with slide */}
            <AnimatePresence initial={false}>
              <motion.div
                key={`chip-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5, ease, delay: 0.1 }}
                className="absolute bottom-5 left-5 z-10 flex items-center gap-2
                  rounded-full bg-white/90 px-3.5 py-2 shadow-lg backdrop-blur-sm sm:px-4"
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: '#D4AF37' }}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-800 sm:text-xs">
                  {slide.eyebrow}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="absolute bottom-5 right-5 z-10 flex gap-2">
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="flex h-9 w-9 items-center justify-center rounded-full
                  bg-white/20 text-white backdrop-blur-sm transition-all
                  hover:bg-white/40 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next slide"
                className="flex h-9 w-9 items-center justify-center rounded-full
                  bg-white/20 text-white backdrop-blur-sm transition-all
                  hover:bg-white/40 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 h-[3px]"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <motion.div
                key={`progress-${index}-${paused}`}
                className="h-full"
                style={{ background: '#D4AF37' }}
                initial={{ width: '0%' }}
                animate={{ width: paused ? '0%' : '100%' }}
                transition={{
                  duration: paused ? 0 : SLIDE_DURATION / 1000,
                  ease: 'linear',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner Page Hero (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function InnerHero({
  title,
  titleHighlight,
  subtitle,
  backgroundImage,
  tagline,
}: {
  title: string
  titleHighlight?: string
  subtitle: string
  backgroundImage: string
  tagline?: string
}) {
  return (
    <section
      className="relative flex h-[50vh] min-h-[300px] items-center
        justify-center overflow-hidden sm:h-[55vh] md:h-[60vh]"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        {tagline && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-4 flex flex-col items-center"
          >
            <div
              className="mb-2 h-px w-10"
              style={{ background: '#D4AF37' }}
              aria-hidden="true"
            />
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.3em] sm:text-xs"
              style={{
                color: '#D4AF37',
                fontFamily: 'var(--font-body)',
              }}
            >
              {tagline}
            </p>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 text-3xl font-bold leading-[1.1] tracking-tight text-white
            sm:text-4xl md:text-5xl"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
          }}
        >
          {title}
          {titleHighlight && (
            <>
              <br />
              <span style={{ color: '#D4AF37' }}>{titleHighlight}</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto max-w-xl text-xs font-light leading-relaxed
            text-white/75 sm:text-sm"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

export function HeroSection({
  slides,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  title = 'Page',
  titleHighlight,
  subtitle = '',
  backgroundImage = '',
  tagline,
  isHomePage = false,
}: HeroSectionProps) {
  if (isHomePage) {
    return (
      <HomeHero
        slides={slides ?? DEFAULT_SLIDES}
        primaryButtonText={primaryButtonText}
        primaryButtonLink={primaryButtonLink}
        secondaryButtonText={secondaryButtonText}
        secondaryButtonLink={secondaryButtonLink}
      />
    )
  }

  return (
    <InnerHero
      title={title}
      titleHighlight={titleHighlight}
      subtitle={subtitle}
      backgroundImage={backgroundImage}
      tagline={tagline}
    />
  )
}