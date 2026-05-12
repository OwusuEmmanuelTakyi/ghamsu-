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
// Hero Slides
// ─────────────────────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    image:
      'https://images.unsplash.com/photo-1778082388125-c2a1c6a835ba?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0',
    eyebrow: 'Welcome Home',
    heading: "Ghana Methodist\nStudents' Union",
    subheading:
      "We are therefore Christ's ambassadors, as though God were making his appeal through us. We implore you on Christ's behalf: Be reconciled to God. — 2 Corinthians 5:20",
  },
  {
    image:
      'https://images.unsplash.com/photo-1778082948973-69296a83789f?q=80&w=1034&auto=format&fit=crop&ixlib=rb-4.1.0',
    eyebrow: 'Ambassadors for Christ',
    heading: 'Ambassadors\nin Unity & Love',
    subheading:
      'United across campuses, locals, and generations — one family, one mission, one Lord.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1778082388067-9203e6db7c59?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0',
    eyebrow: 'Ambassadors in Unity & Love',
    heading: 'Fellowship,\nWorship & Purpose',
    subheading:
      'Join us for fellowship, worship, and a journey of faith that transforms lives, campuses, and nations.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1778082388302-38d8e5e40c7b?q=80&w=1059&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    eyebrow: 'Since 1965',
    heading: "Sixty Years\nof God's Faithfulness",
    subheading:
      'From a handful of students to a Connexional movement — GHAMSU has been raising Ambassadors for Christ for over six decades.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Home Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      {/* Hero Section - Full height on desktop, reduced on mobile */}
      <HeroSection
        isHomePage={true}
        slides={HERO_SLIDES}
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
          <BoardsHomeSection />
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <BlogPreviewSection />
        </ScrollReveal>

        <ScrollReveal direction="left" delay={0.1}>
          <UpcomingEvents />
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