import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

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
    image:
      'https://images.unsplash.com/photo-1778082388125-c2a1c6a835ba?q=80&w=900&auto=format&fit=crop',
    eyebrow: 'Welcome Home',
    heading: "Ghana Methodist\nStudents' Union",
    subheading:
      'A vibrant movement of students committed to faith, fellowship, and the transformation of every campus in Ghana for Christ.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1778082948973-69296a83789f?q=80&w=900&auto=format&fit=crop',
    eyebrow: 'Ambassadors for Christ',
    heading: 'Ambassadors\nin Unity & Love',
    subheading:
      'United across campuses and locals — one family pursuing one mission under one Lord.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1778082388067-9203e6db7c59?q=80&w=900&auto=format&fit=crop',
    eyebrow: 'Unity and Love',
    heading: 'Ambassadors\nFor Christ',
    subheading:
      'Join us for Spirit-filled worship, deep fellowship, and a journey of faith that transforms lives and nations.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1778082388302-38d8e5e40c7b?q=80&w=1059&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    eyebrow: 'Since 1965',
    heading: "Sixty + Years of\nGod's Faithfulness",
    subheading:
      'From a handful of students to a Connexional movement — raising Ambassadors for Christ for over six decades.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter Hook
// ─────────────────────────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setDisplayed('')
    setDone(false)

    if (!text) {
      setDone(true)
      return
    }

    let i = 0

    timerRef.current = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))

      if (i >= text.length) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        setDone(true)
      }
    }, speed)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [text, speed])

  return { displayed, done }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cursor Component
// ─────────────────────────────────────────────────────────────────────────────

function WritingCursor() {
  return (
    <span
      className="ml-1 inline-block w-[3px] animate-pulse align-middle"
      style={{
        height: '0.85em',
        background: '#D4AF37',
      }}
      aria-hidden="true"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Home Hero
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
  const [textKey, setTextKey] = useState(0)

  const goTo = useCallback(
    (i: number, d: number) => {
      setDir(d)
      setIndex((i + slides.length) % slides.length)
      setTextKey((key) => key + 1)
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

  const {
    displayed: displayedHeading,
    done: headingDone,
  } = useTypewriter(slide.heading, 35)

  const {
    displayed: displayedSubheading,
    done: subheadingDone,
  } = useTypewriter(slide.subheading, 18)

  const imageVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 50 : -50,
      scale: 1.04,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -40 : 40,
      scale: 0.98,
    }),
  }

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

        .dark .hero-section {
          background: var(--background);
        }

        .hero-image-panel {
          background: #003D82;
        }

        .gold-bracket {
          position: absolute;
          width: 34px;
          height: 34px;
          pointer-events: none;
        }

        @media (min-width: 640px) {
          .gold-bracket {
            width: 44px;
            height: 44px;
          }
        }

        .gold-bracket-tl {
          top: -2px;
          left: -2px;
          border-top: 3px solid #D4AF37;
          border-left: 3px solid #D4AF37;
          border-radius: 6px 0 0 0;
        }

        .gold-bracket-tr {
          top: -2px;
          right: -2px;
          border-top: 3px solid #D4AF37;
          border-right: 3px solid #D4AF37;
          border-radius: 0 6px 0 0;
        }

        .gold-bracket-bl {
          bottom: -2px;
          left: -2px;
          border-bottom: 3px solid #D4AF37;
          border-left: 3px solid #D4AF37;
          border-radius: 0 0 0 6px;
        }

        .gold-bracket-br {
          bottom: -2px;
          right: -2px;
          border-bottom: 3px solid #D4AF37;
          border-right: 3px solid #D4AF37;
          border-radius: 0 0 6px 0;
        }

        .hero-dots {
          background-image: none;
          background-size: 26px 26px;
        }

        .dark .hero-dots {
          background-image: radial-gradient(circle, rgba(212,175,55,0.06) 1px, transparent 1px);
        }

        .slide-dot {
          display: block;
          height: 8px;
          border-radius: 99px;
          transition:
            width 0.4s cubic-bezier(0.22,1,0.36,1),
            background 0.3s ease;
        }

        .slide-dot-active {
          width: 36px;
          background: #D4AF37;
        }

        .slide-dot-inactive {
          width: 8px;
          background: rgba(0,61,130,0.25);
        }

        .dark .slide-dot-inactive {
          background: rgba(255,255,255,0.2);
        }

        /* Mobile image height reduction */
        @media (max-width: 767px) {
          .hero-image-container {
            min-height: 280px;
          }
        }

        @media (min-width: 768px) {
          .hero-image-container {
            min-height: auto;
          }
        }
      `}</style>

      <section
        className="hero-section min-h-screen w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-label="GHAMSU hero slideshow"
      >
        <div className="flex flex-col md:flex-row md:min-h-screen">
          {/* LEFT TEXT SIDE */}
          <div
            className="hero-dots relative flex flex-col justify-center
            px-6 pb-8 pt-32 sm:px-10 sm:pt-40 sm:pb-10 md:w-[64%] md:px-12 md:pb-16 md:pt-20 md:min-h-screen
            lg:w-[66%] lg:px-20 xl:w-[68%] xl:px-28"
          >
            <div
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72
              rounded-full opacity-10 blur-3xl"
              style={{ background: '#003D82' }}
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-4xl">
              {/* EYEBROW */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`eyebrow-${textKey}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.4 }}
                  className="mb-5 flex items-center gap-3"
                >
                  <div
                    className="h-px w-10 sm:w-14"
                    style={{ background: '#D4AF37' }}
                    aria-hidden="true"
                  />

                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.38em] sm:text-xs"
                    style={{
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {slide.eyebrow}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* HEADING WITH TYPEWRITER */}
              <div className="mb-6 sm:mb-7">
                <h1
                  className="text-left text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[6.3rem] font-black leading-[1.05] tracking-tight"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 900,
                    color: '#003D82',
                  }}
                  aria-live="polite"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`heading-${textKey}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                      className="block"
                    >
                      {displayedHeading.split('\n').map((line, idx) => (
                        <span
                          key={idx}
                          className="block"
                          style={{ 
                            color: idx > 0 ? '#D4AF37' : '#003D82'
                          }}
                        >
                          {line}
                        </span>
                      ))}
                      {!headingDone && <WritingCursor />}
                    </motion.span>
                  </AnimatePresence>
                </h1>
              </div>

              {/* SUBHEADING WITH TYPEWRITER */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`subheading-${textKey}`}
                  className="mb-8 sm:mb-9 max-w-3xl text-sm sm:text-base md:text-lg lg:text-[1.35rem] leading-relaxed
                  text-foreground/80 font-medium"
                  initial={{ opacity: 0 }}
                  animate={headingDone ? { opacity: 1 } : { opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {displayedSubheading}
                  {headingDone && !subheadingDone && <WritingCursor />}
                </motion.p>
              </AnimatePresence>

              {/* BUTTONS */}
              <motion.div
                key={`buttons-${textKey}`}
                className="flex flex-wrap items-center gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={
                  headingDone
                    ? {
                        opacity: 1,
                        y: 0,
                      }
                    : {
                        opacity: 0,
                        y: 16,
                      }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                }}
              >
                <Link to={primaryButtonLink}>
                  <button
                    className="group flex items-center gap-2 rounded-full px-8 py-4 text-sm
                    font-bold text-white transition-all duration-300
                    hover:gap-3 sm:px-10 sm:py-4 sm:text-base"
                    style={{
                      background: 'var(--accent)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent)'
                      e.currentTarget.style.opacity = '0.9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent)'
                      e.currentTarget.style.opacity = '1'
                    }}
                  >
                    {primaryButtonText}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>

                <Link to={secondaryButtonLink}>
                  <button
                    className="rounded-full border-2 px-8 py-4 text-sm font-semibold
                    transition-all duration-300 sm:px-10 sm:py-4 sm:text-base"
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

              {/* DOTS */}
              <div className="mt-10 flex items-center gap-2.5 sm:mt-12">
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
                        i === index
                          ? 'slide-dot-active'
                          : 'slide-dot-inactive'
                      }`}
                    />
                  </button>
                ))}

                <span
                  className="ml-2 text-[11px] font-semibold tracking-[0.2em]"
                  style={{ color: 'rgba(0,61,130,0.4)' }}
                >
                  {String(index + 1).padStart(2, '0')} /{' '}
                  {String(slides.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE SIDE */}
          <div
            className="hero-image-panel hero-image-container relative w-full overflow-hidden
            h-[280px] sm:h-[350px] md:h-auto md:w-[36%] lg:w-[34%] xl:w-[32%] md:min-h-screen"
          >
            <AnimatePresence custom={dir} initial={false} mode="wait">
              <motion.img
                key={`image-${index}`}
                src={slide.image}
                alt={slide.eyebrow}
                custom={dir}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.75,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,30,80,0.68) 0%, rgba(0,30,80,0.18) 45%, transparent 75%)',
              }}
              aria-hidden="true"
            />

            <div className="absolute inset-4 sm:inset-6" aria-hidden="true">
              <div className="gold-bracket gold-bracket-tl" />
              <div className="gold-bracket gold-bracket-tr" />
              <div className="gold-bracket gold-bracket-bl" />
              <div className="gold-bracket gold-bracket-br" />
            </div>

            <div
              className="absolute bottom-5 left-5 z-10 flex items-center gap-2
              rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm"
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: '#D4AF37' }}
                aria-hidden="true"
              />

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-800 sm:text-xs">
                {slide.eyebrow}
              </span>
            </div>

            {/* Navigation buttons */}
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

            <div
              className="absolute bottom-0 left-0 right-0 z-20 h-[3px]"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <motion.div
                key={`progress-${index}`}
                className="h-full"
                style={{ background: '#D4AF37' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: SLIDE_DURATION / 1000,
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
// Inner Page Hero
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
          transition={{
            duration: 0.6,
            delay: 0.1,
          }}
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
          transition={{
            duration: 0.6,
            delay: 0.25,
          }}
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