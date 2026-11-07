import { Users, Globe, Calendar, Award, BarChart3, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useStats } from '../../lib/hooks'
import type { Stat } from '../../types/types'

// Icon names stored in stats.icon.
const ICONS: Record<string, LucideIcon> = { Users, Globe, Calendar, Award }

// Literal class names so Tailwind compiles them.
const GRID_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
}

const ANIMATION_MS = 1500

function formatNumber(num: number) {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`.replace('.0K', 'K')
  return num.toString()
}

/** Counts up to its target once the section scrolls into view. */
function AnimatedValue({ stat, start }: { stat: Stat; start: boolean }) {
  const target = stat.numericValue
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!start || target === null) return
    let frame = 0
    const began = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / ANIMATION_MS)
      setCurrent(Math.round(target * progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [start, target])

  if (target === null) return <>{stat.displayValue}</>
  // As before: a "+" after numbers under 1,000; thousands show as "K".
  return <>{formatNumber(current)}{current > 0 && current < 1000 ? '+' : ''}</>
}

export function StatsSection() {
  const { data: stats } = useStats('home')
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [stats?.length])

  // Hide the band entirely until at least one stat is filled in and published.
  if (!stats?.length) return null

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <div className={`grid ${GRID_COLUMNS[Math.min(stats.length, 4)]} gap-12 md:gap-16`}>
          {stats.map((stat) => {
            const Icon = ICONS[stat.icon ?? ''] ?? BarChart3
            return (
              <div key={stat.id} className="text-center border-l border-accent/20 pl-6">
                <div className="mb-4 flex justify-center">
                  <Icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                </div>
                <div
                  className="text-5xl md:text-6xl mb-3 text-foreground tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  <AnimatedValue stat={stat} start={visible} />
                </div>
                <div className="text-muted-foreground text-xs tracking-wider uppercase">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
