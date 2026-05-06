import { Users, TrendingUp, Heart, BookOpen, Music, Globe } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { Link } from 'react-router'

export default function Boards() {
  const boards = [
    {
      icon: Heart,
      title: 'Prayer Board',
      slug: 'prayer-board',
      description: 'Coordinating prayer initiatives, intercession ministries, and spiritual warfare strategies for the church.',
      members: 8,
    },
    {
      icon: BookOpen,
      title: 'Publications & Communications Board',
      slug: 'publications-board',
      description: 'Managing all church communications, publications, media outreach, and digital presence.',
      members: 10,
    },
    {
      icon: TrendingUp,
      title: 'Audit Board',
      slug: 'audit-board',
      description: 'Ensuring financial accountability, transparency, and proper stewardship of church resources.',
      members: 6,
    },
    {
      icon: Users,
      title: 'Project Board',
      slug: 'project-board',
      description: 'Overseeing church development projects, infrastructure improvements, and facility management.',
      members: 9,
    },
    {
      icon: Globe,
      title: 'Research & Education Board',
      slug: 'research-board',
      description: 'Advancing theological research, educational programs, and training initiatives for ministry development.',
      members: 12,
    },
    {
      icon: Music,
      title: 'Medical Board',
      slug: 'medical-board',
      description: 'Providing healthcare ministry, wellness initiatives, and medical outreach to the community.',
      members: 11,
    },
  ]

  const activities = [
    {
      title: 'GHAMSU CONNEXIONAL CONFERENCE',
      date: '2026',
      location: 'To be communicated',
      description: 'A conference to bring all ambassadors together for fellowship, training, and strategic planning for the year ahead.',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczMe29lNS0rbP0Q-68s37jb-9UU_D-n54XCgHEFyMr0J-0x7HVLPEpdp2HLxD7QslltBu1uf3R912KE6YagesJhgDnN-kmP47oxLylsKLd50Bmx5Q1iiyZLUAGNp4GvURi37DkCuS2jxdk3J59htuu37=w1445-h963-s-no-gm',
    },
    {
      title: 'CONNEXIONAL PRAYER CONFERENCE',
      date: 'May 20, 2026',
      location: 'Various Dioceses',
      description: 'Prayer conference across the connexion to unite in intercession for the church, nation, and global issues.',
      image: 'https://images.unsplash.com/photo-1778104101737-d9f436018791?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'GHAMSU MISSIONS',
      date: 'July 8-15, 2026',
      location: 'To be communicated',
      description: 'reaching the unreached with the gospel through evangelism, church planting, and humanitarian outreach in strategic locations.',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczMJHUyBQ5iy7R-xD1mpi3uMT12J3Tjmi2s_LgWhiWaemphbtGftPORhvznjeB_rA0kN_ej0W8bv2Wg4_gSYnmfPSTS2RTMHQKfYAhwsOVl3mZPp1-oDInFPWLPdQyPoTn1J_3hfm97TrLWoLKSK59JU=w1445-h963-s-no-gm',
    },
  ]

  return (
    <div>
      <HeroSection
        title="Our Connexional Boards"
        subtitle="Six Boards Across the Connexion and Supporting the Connexional Executives in discharging their duties effectively"
        backgroundImage="https://lh3.googleusercontent.com/pw/AP1GczM-xcSh0NRQjWjjA63q85xh-nEhYVlrXtfhqB0q6x5lmI_AZnzfXUaRlqoO8zwjShsDRx-BBqNCAlQxDxRqL3PR0YjsU66ePSD3kp3wuelWoDIvM4wpPlEmzhguVjSe9BTUIKFGen5RnVQ40oPU_5KU=w1143-h963-s-no-gm"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {boards.map((board, index) => {
                const Icon = board.icon
                return (
                  <AnimatedSection key={index} delay={index * 0.1}>
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
                          <p className="text-muted-foreground leading-relaxed font-light text-xs sm:text-sm mb-6">
                            {board.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pb-4 mb-4 border-b border-border">
                            <Users className="w-4 h-4" strokeWidth={1.5} />
                            <span>{board.members} Members</span>
                          </div>
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
          </div>
        </section>

        {/* Major Activities */}
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
        <AnimatedSection key={index} delay={index * 0.1}>
          <div className="bg-white/10 dark:bg-[#0d1f3c] border border-white/20 dark:border-white/10 hover:border-[#D4AF37] dark:hover:border-[#D4AF37]/50 backdrop-blur-sm transition-all duration-500 overflow-hidden">
            <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-6 sm:p-8">
              <h3
                className="text-xl sm:text-2xl mb-4 tracking-tight text-white"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                {activity.title}
              </h3>
              <div className="space-y-2 mb-6 text-xs sm:text-sm text-white/60 font-light">
                <p>{activity.date}</p>
                <p>{activity.location}</p>
              </div>
              <p className="text-white/65 leading-relaxed font-light text-xs sm:text-sm mb-8">
                {activity.description}
              </p>
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
      </div>
    </div>
  )
}