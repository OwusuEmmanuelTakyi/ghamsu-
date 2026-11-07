import { Users, ArrowLeft } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection'
import { boardColors, boardIcon } from '../components/boardStyles'
import { useBoard } from '../../lib/hooks'
import { thumbProps } from '../../lib/media'
import { useNavigate, useParams } from 'react-router'

export default function BoardDetail() {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const { data: board, loading } = useBoard(slug)

  if (loading) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    )
  }

  if (!slug || !board) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/boards')}
            className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Boards
          </button>
          <div className="text-center">
            <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              Board Not Found
            </h1>
            <p className="text-muted-foreground">The board you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const Icon = boardIcon(board.icon)
  const { color, accentColor } = boardColors(board.color)
  const description = board.detailDescription || board.description

  return (
    <div className="pt-32 pb-24">
      {/* Back Button */}
      <section className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <button
              onClick={() => navigate('/boards')}
              className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Boards
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* Hero Section */}
      <section className="px-6 mb-24">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="mb-8">
              <div className={`w-16 h-16 ${color} rounded-lg flex items-center justify-center mb-6`}>
                <Icon className={`w-8 h-8 ${accentColor}`} strokeWidth={1.5} />
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                {board.title}
              </h1>
              {description && (
                <p className="text-base text-muted-foreground leading-relaxed font-light max-w-2xl">
                  {description}
                </p>
              )}
            </div>

            {board.memberCount !== null && (
              <div className="flex items-center gap-4 py-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  <span className="text-lg font-semibold">{board.memberCount}</span>
                  <span className="text-muted-foreground">Members</span>
                </div>
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>

      {/* Vision Section */}
      {board.vision && (
        <section className="px-6 mb-24 bg-secondary py-24">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2
                className="text-3xl md:text-4xl mb-8 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Our Vision
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed font-light">{board.vision}</p>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Responsibilities Section */}
      {board.responsibilities.length > 0 && (
        <section className="px-6 mb-24">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2
                className="text-3xl md:text-4xl mb-12 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Key Responsibilities
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {board.responsibilities.map((responsibility, index) => (
                  <AnimatedSection key={index} delay={index * 0.05}>
                    <div className="bg-card border border-border p-6 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-2 ${accentColor} mt-2 flex-shrink-0`} />
                        <p className="text-base text-muted-foreground leading-relaxed">{responsibility}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Activities Section */}
      {board.activities.length > 0 && (
        <section className="px-6 mb-24 bg-secondary py-24">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2
                className="text-3xl md:text-4xl mb-12 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Activities & Schedule
              </h2>

              <div className="space-y-4">
                {board.activities.map((activity, index) => (
                  <AnimatedSection key={index} delay={index * 0.05}>
                    <div className="bg-card border border-border p-6 rounded-lg">
                      <p className="text-base leading-relaxed">{activity}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Members Section (shown once members are added) */}
      {board.members.length > 0 && (
        <section className="px-6 mb-24">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2
                className="text-3xl md:text-4xl mb-12 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Board Members
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {board.members.map((member) => {
                  const photo = thumbProps(member.image, member.name)
                  return (
                    <div key={member.id} className="bg-card border border-border rounded-lg overflow-hidden text-center">
                      {photo.src && (
                        <img {...photo} loading="lazy" decoding="async" className="w-full h-56 object-cover object-top" />
                      )}
                      <div className="p-5">
                        <p className="font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{member.name}</p>
                        {member.position && (
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{member.position}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-12 text-center">
              <h2
                className="text-2xl md:text-3xl mb-4 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Interested in {board.title} Activity?
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                If you have a passion for this ministry and would like to support the {board.title}, we'd love to hear from you!
              </p>
              <button className="border-2 border-primary text-primary px-10 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                Connect with us
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
