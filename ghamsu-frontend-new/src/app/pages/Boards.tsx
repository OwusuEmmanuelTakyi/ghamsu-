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
      title: 'Annual Church Retreat',
      date: 'June 15-17, 2026',
      location: 'Mountain View Conference Center',
      description: 'A weekend of fellowship, worship, and spiritual renewal for the entire church family.',
      image: 'https://images.unsplash.com/photo-1569292567777-e5d61a759322?w=800',
    },
    {
      title: 'Community Service Day',
      date: 'May 20, 2026',
      location: 'Various Locations',
      description: 'Church-wide initiative to serve our community through various projects and programs.',
      image: 'https://images.unsplash.com/photo-1594913495702-0872744c6968?w=800',
    },
    {
      title: 'Mission Trip to Honduras',
      date: 'July 8-15, 2026',
      location: 'Tegucigalpa, Honduras',
      description: 'Medical and construction mission serving local communities.',
      image: 'https://images.unsplash.com/photo-1594913421979-b9399c0cd4f9?w=800',
    },
  ]

  return (
    <div>
      <HeroSection
        title="Our Connexional Boards"
        subtitle="Dedicated leadership serving our community with purpose, vision, and spiritual guidance."
        backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
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