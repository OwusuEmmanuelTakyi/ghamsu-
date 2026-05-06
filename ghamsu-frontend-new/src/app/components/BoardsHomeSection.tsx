import { Heart, FileText, Shield, Wrench, GraduationCap, Activity } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'
import { Link } from 'react-router'

export function BoardsHomeSection() {
  const boards = [
    {
      icon: Heart,
      title: 'Prayer Board',
      slug: 'prayer-board',
      description: 'Coordinating prayer initiatives and intercession ministries.',
    },
    {
      icon: FileText,
      title: 'Publications & Communications Board',
      slug: 'publications-board',
      description: 'Managing church communications and media outreach.',
    },
    {
      icon: Shield,
      title: 'Audit Board',
      slug: 'audit-board',
      description: 'Ensuring financial accountability and transparency.',
    },
    {
      icon: Wrench,
      title: 'Project Board',
      slug: 'project-board',
      description: 'Overseeing church development and infrastructure projects.',
    },
    {
      icon: GraduationCap,
      title: 'Research & Education Board',
      slug: 'research-board',
      description: 'Advancing theological research and educational programs.',
    },
    {
      icon: Activity,
      title: 'Medical Board',
      slug: 'medical-board',
      description: 'Providing healthcare ministry and wellness initiatives.',
    },
  ]

  return (
    <section className="py-32 px-6">
      <div className="max-w-[1400px] mx-auto">
        <AnimatedSection>
          <div className="text-center mb-20">
            <div className="mb-6">
              <div className="h-[1px] w-12 bg-accent mx-auto mb-4" />
              <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                Leadership
              </p>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Our Boards
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-light leading-relaxed">
              Dedicated leadership serving our community with purpose and vision
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board, index) => {
            const Icon = board.icon
            return (
              <AnimatedSection key={index} delay={index * 0.1}>
                <Link to={`/boards/${board.slug}`}>
                  <div className="group relative overflow-hidden bg-card border border-border hover:border-accent/50 transition-all duration-500 h-full">
                    <div className="h-[2px] w-full bg-accent" />
                    <div className="p-8">
                      <div className="mb-6">
                        <Icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                      </div>
                      <h3
                        className="text-lg mb-3 tracking-tight group-hover:text-accent transition-colors"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        {board.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed font-light mb-6">
                        {board.description}
                      </p>
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
  )
}