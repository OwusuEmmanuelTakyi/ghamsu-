import { Users, Globe, Calendar, Award } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function StatsSection() {
  const [counts, setCounts] = useState({ members: 0, diocese: 0, events: 0, locals: 0 })
  const sectionRef = useRef(null)
  const hasAnimated = useRef(false)

  const stats = [
    {
      icon: Users,
      value: 5000,
      label: 'Active Members',
      key: 'members',
    },
    {
      icon: Globe,
      value: 60,
      label: 'Years of Service',
      key: 'events',
    },
    {
      icon: Calendar,
      value: 25,
      label: 'Connexional Diocese',
      key: 'diocese',
    },
    {
      icon: Award,
      value: 1000,
      label: 'Local Groups',
      key: 'locals',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true

          // Animate members 0 to 5000
          let memberCount = 0
          const memberInterval = setInterval(() => {
            memberCount += Math.ceil(5000 / 50)
            if (memberCount >= 5000) {
              memberCount = 5000
              clearInterval(memberInterval)
            }
            setCounts((prev) => ({ ...prev, members: memberCount }))
          }, 30)

          // Animate years 0 to 60
          let yearCount = 0
          const yearInterval = setInterval(() => {
            yearCount += Math.ceil(60 / 30)
            if (yearCount >= 60) {
              yearCount = 60
              clearInterval(yearInterval)
            }
            setCounts((prev) => ({ ...prev, events: yearCount }))
          }, 50)

          // Animate diocese 0 to 25
          let dioceseCount = 0
          const dioceseInterval = setInterval(() => {
            dioceseCount += 1
            if (dioceseCount >= 25) {
              dioceseCount = 25
              clearInterval(dioceseInterval)
            }
            setCounts((prev) => ({ ...prev, diocese: dioceseCount }))
          }, 80)

          // Animate locals 0 to 1000
          let localCount = 0
          const localInterval = setInterval(() => {
            localCount += Math.ceil(1000 / 50)
            if (localCount >= 1000) {
              localCount = 1000
              clearInterval(localInterval)
            }
            setCounts((prev) => ({ ...prev, locals: localCount }))
          }, 30)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`.replace('.0K', 'K')
    }
    return num.toString()
  }

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const countKey = stat.key as keyof typeof counts
            const currentCount = counts[countKey]

            return (
              <div key={index} className="text-center border-l border-accent/20 pl-6">
                <div className="mb-4 flex justify-center">
                  <Icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                </div>
                <div
                  className="text-5xl md:text-6xl mb-3 text-foreground tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  {formatNumber(currentCount)}
                  {stat.value >= 1000 && currentCount >= 1000 ? '' : currentCount > 0 ? '+' : ''}
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