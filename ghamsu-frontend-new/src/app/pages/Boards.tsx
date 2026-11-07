import { Users } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { boardIcon } from '../components/boardStyles'
import { useBoards, useMajorActivities } from '../../lib/hooks'
import { Link } from 'react-router'

export default function Boards() {
  const { data: boards, loading: boardsLoading } = useBoards()
  const { data: activities } = useMajorActivities()

  return (
    <div>
      <HeroSection
        title="Our Connexional Boards"
        subtitle="Six Boards Across the Connexion and Supporting the Connexional Executives in discharging their duties effectively"
        pageKey="boards"
        isHomePage={false}
      />

      <div className="pb-24">
        {/* Boards Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="mb-12 sm:mb-16">
                <div className="h-[1px] w-12 bg-accent mb-4" />
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Established Boards
                </h2>
              </div>
            </AnimatedSection>

            {boardsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading boards...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {(boards ?? []).map((board, index) => {
                  const Icon = boardIcon(board.icon)
                  return (
                    <AnimatedSection key={board.id} delay={index * 0.1}>
                      <Link to={`/boards/${board.slug}`}>
                        <div className="bg-card border border-border hover:border-accent/50 transition-all duration-500 group h-full">
                          <div className="h-[2px] w-full bg-accent" />
                          <div className="p-6 sm:p-8">
                            <div className="mb-6">
                              <Icon className="w-10 h-10 text-accent" strokeWidth={1.5} />
                            </div>
                            <h3
                              className="text-lg sm:text-xl mb-3 tracking-tight group-hover:text-accent transition-colors"
                              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                            >
                              {board.title}
                            </h3>
                            {board.description && (
                              <p className="text-muted-foreground leading-relaxed font-light text-xs sm:text-sm mb-6">
                                {board.description}
                              </p>
                            )}
                            {board.memberCount !== null && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground pb-4 mb-4 border-b border-border">
                                <Users className="w-4 h-4" strokeWidth={1.5} />
                                <span>{board.memberCount} Members</span>
                              </div>
                            )}
                            <button className="w-full border border-border text-foreground py-2.5 text-xs tracking-wider uppercase font-medium hover:bg-foreground/5 transition-all duration-300 group-hover:border-accent">
                              Learn More
                            </button>
                          </div>
                        </div>
                      </Link>
                    </AnimatedSection>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Major Activities */}
        {activities && activities.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 bg-[#003D82] dark:bg-[#0a1628]">
  <div className="max-w-[1400px] mx-auto">
    <AnimatedSection>
      <div className="mb-12 sm:mb-16">
        <div className="h-[1px] w-12 bg-[#D4AF37] mb-4" />
        <h2
          className="text-3xl sm:text-4xl md:text-5xl tracking-tight text-white"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          Major Activities
        </h2>
      </div>
    </AnimatedSection>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      {activities.map((activity, index) => (
        <AnimatedSection key={activity.id} delay={index * 0.1}>
          <div className="bg-white/10 dark:bg-[#0d1f3c] border border-white/20 dark:border-white/10 hover:border-[#D4AF37] dark:hover:border-[#D4AF37]/50 backdrop-blur-sm transition-all duration-500 overflow-hidden">
            {activity.imageUrl && (
              <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                <img
                  src={activity.imageUrl}
                  alt={activity.imageAlt || activity.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}
            <div className="p-6 sm:p-8">
              <h3
                className="text-xl sm:text-2xl mb-4 tracking-tight text-white"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                {activity.title}
              </h3>
              <div className="space-y-2 mb-6 text-xs sm:text-sm text-white/60 font-light">
                {activity.dateText && <p>{activity.dateText}</p>}
                {activity.location && <p>{activity.location}</p>}
              </div>
              {activity.description && (
                <p className="text-white/65 leading-relaxed font-light text-xs sm:text-sm mb-8">
                  {activity.description}
                </p>
              )}
              <button className="w-full border border-[#D4AF37]/50 text-[#D4AF37] py-3 text-xs sm:text-sm tracking-wider uppercase font-medium hover:bg-[#D4AF37]/10 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  </div>
</section>
        )}
      </div>
    </div>
  )
}
