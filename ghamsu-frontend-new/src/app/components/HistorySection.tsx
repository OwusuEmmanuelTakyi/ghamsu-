import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

export function HistorySection() {
  return (
    <section className="py-32 px-6 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Image side */}
          <AnimatedSection>
            <div className="relative">
              <div className="relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1778082948973-69296a83789f?q=80&w=1034&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="GHAMSU History"
                  className="w-full h-64 sm:h-96 md:h-[500px] lg:h-[600px] object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Floating year badge */}
              <div className="absolute top-8 right-8 bg-accent text-accent-foreground px-8 py-6">
                <p className="text-5xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  1965
                </p>
                <p className="text-sm tracking-wider uppercase">Founded</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Content side */}
          <AnimatedSection delay={0.2}>
            <div>
              <div className="mb-8">
                <div className="h-[1px] w-12 bg-accent mb-4" />
                <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                  Our Journey
                </p>
              </div>

              <h2
                className="text-4xl md:text-5xl lg:text-6xl mb-8 tracking-tight leading-[1.1]"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                A Legacy of Faith<br />& Ambassadors for Christ
              </h2>

              <div className="space-y-6 mb-10">
                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  Ghana Methodist Students' Union was founded in 1965 under the name Ghana Inter-University Methodist
                  Union (GIUMU) by Prof. S.N. Quartey and two vibrant former seminary students, Rt. Rev. Michael Kumi and
                  Rt. Rev. Blankson. What began as a small fellowship on university campuses has grown into a vibrant
                  Connexional movement spanning multiple educational institutions.
                </p>

                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  In 1984, at the Annual Conference, GHAMSU was constituted to include all post-elementary Methodist
                  students. The historic 23rd Annual Conference at UCC unveiled our official emblem, anthem, and the
                  defining slogan "Ambassadors for Christ!" This marked a turning point in our identity and mission across
                  the nation.
                </p>

                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  Today, over 60 years later, GHAMSU continues to be a beacon of hope and spiritual guidance for Methodist
                  students. Our mission remains unchanged: to evangelize, disciple students to a personal faith in Christ,
                  and train spirit-filled leaders who will impact the church and society at large through faithful service
                  and Christian witness.
                </p>
              </div>

              <Link to="/about">
                <button className="group flex items-center gap-3 border-2 border-primary text-primary px-10 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  Read Our Full Story
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}