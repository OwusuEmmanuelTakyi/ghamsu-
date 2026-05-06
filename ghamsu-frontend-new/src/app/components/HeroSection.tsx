import { Link } from 'react-router'
import { motion } from 'motion/react'

interface HeroSectionProps {
  title: string
  titleHighlight?: string // Text after the line break
  subtitle: string
  backgroundImage: string
  primaryButtonText?: string
  primaryButtonLink?: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
  tagline?: string
  isHomePage?: boolean // True for home, false for other pages
}

export function HeroSection({
  title,
  titleHighlight,
  subtitle,
  backgroundImage,
  primaryButtonText = 'Give Today',
  primaryButtonLink = '/partner',
  secondaryButtonText = 'Learn More',
  secondaryButtonLink = '/about',
  tagline = 'Welcome Home',
  isHomePage = false,
}: HeroSectionProps) {
  return (
    <section className={`relative ${isHomePage ? 'h-[70vh] md:h-[80vh]' : 'h-[50vh] sm:h-[55vh] md:h-[60vh]'} flex items-center ${isHomePage ? 'md:items-start md:pt-24' : 'md:items-center'} justify-center overflow-hidden`}>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full">
          <img
            src={backgroundImage}
            alt="Hero background"
            className="w-full h-full object-cover scale-105"
          />
        </div>
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        {isHomePage && (
          <>
            {/* Tagline - Only on home */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 md:mb-6 inline-block"
            >
              <div className="h-[1px] w-12 bg-accent mx-auto mb-3" />
              <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                {tagline}
              </p>
            </motion.div>
          </>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: isHomePage ? 0.1 : 0 }}
          className={`${isHomePage ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl' : 'text-3xl sm:text-4xl md:text-5xl'} text-white mb-3 sm:mb-4 md:mb-6 tracking-tight leading-[1.1]`}
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          {title}
          {titleHighlight && <br />}
          {titleHighlight && titleHighlight}
        </motion.h1>

        {/* Subtitle with fade transition */}
        <motion.p
          key={subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`${isHomePage ? 'text-xs sm:text-sm md:text-base' : 'text-xs sm:text-sm'} text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed font-light`}
        >
          {subtitle}
        </motion.p>

        {/* Buttons - Only on home */}
        {isHomePage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            {primaryButtonText && (
              <Link to={primaryButtonLink || '#'}>
                <button className="bg-accent text-accent-foreground px-6 sm:px-8 py-2.5 sm:py-3 text-xs tracking-wider uppercase font-semibold hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                  {primaryButtonText}
                </button>
              </Link>
            )}
            {secondaryButtonText && (
              <Link to={secondaryButtonLink || '#'}>
                <button className="border-2 border-white/40 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs tracking-wider uppercase font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                  {secondaryButtonText}
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}