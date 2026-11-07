import { HeroSection } from '../components/HeroSection'
import { FloatingServiceCards } from '../components/FloatingServiceCards'
import { WhyChooseUs } from '../components/WhyChooseUs'
import { HistorySection } from '../components/HistorySection'
import { AboutSection } from '../components/AboutSection'
import { BoardsHomeSection } from '../components/BoardsHomeSection'
import { BlogPreviewSection } from '../components/BlogPreviewSection'
import { UpcomingEvents } from '../components/UpcomingEvents'
import { DarkSection } from '../components/DarkSection'
import { StatsSection } from '../components/StatsSection'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useHeroSlides } from '../../lib/hooks'

// ─────────────────────────────────────────────────────────────────────────────
// Scroll Animation Wrapper
// ─────────────────────────────────────────────────────────────────────────────

function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
}: {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const directionOffset = {
    up: { y: 80, x: 0 },
    down: { y: -80, x: 0 },
    left: { x: 80, y: 0 },
    right: { x: -80, y: 0 },
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directionOffset[direction],
        filter: 'blur(8px)',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'blur(0px)',
      }}
      transition={{
        duration: 0.85,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Home Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: heroSlides } = useHeroSlides()

  return (
    <>
      {/* Hero Section - Full height on desktop, reduced on mobile */}
      <HeroSection
        isHomePage={true}
        slides={heroSlides ?? []}
        primaryButtonText="Join Us"
        primaryButtonLink="/contact"
        secondaryButtonText="Learn More"
        secondaryButtonLink="/about"
      />

      {/* Floating Service Cards - Below Hero */}
      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <FloatingServiceCards />
      </motion.div>

      {/* Main Content Sections */}
      <main className="overflow-hidden">
        <ScrollReveal direction="up" delay={0.1}>
          <WhyChooseUs />
        </ScrollReveal>

        <ScrollReveal direction="left" delay={0.1}>
          <HistorySection />
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.1}>
          <AboutSection />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <BlogPreviewSection />
        </ScrollReveal>
 
        <ScrollReveal direction="left" delay={0.1}>
          <UpcomingEvents />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <BoardsHomeSection />
        </ScrollReveal>

        

        <ScrollReveal direction="up" delay={0.1}>
          <DarkSection />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <StatsSection />
        </ScrollReveal>
      </main>
    </>
  )
}