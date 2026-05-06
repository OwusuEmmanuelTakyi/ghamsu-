import { Heart, Target, Users, Award } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'

export default function About() {
  const values = [
    {
      icon: Heart,
      title: 'Love & Compassion',
      description:
        'We believe in showing God\'s love through compassionate service to our community, living out the Methodist faith through action.',
    },
    {
      icon: Target,
      title: 'Purpose-Driven',
      description:
        'Helping individuals discover and fulfill their God-given purpose in life as Ambassadors for Christ.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building authentic relationships in unity and love, supporting one another in faith and leadership development.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Pursuing excellence in all we do to honor God, serve the church, and contribute responsibly to society.',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        title="About Us"
        subtitle="Discover our rich history, mission, and the values that guide our community"
        backgroundImage="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
        isHomePage={false}
      />

      <div className="pb-24">
        {/* Brief History */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 bg-secondary">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="mb-12">
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Our History
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light mb-6">
                  The Ghana Methodist Students' Union was formed in 1965 under the name Ghana Inter-University Methodist
                  Union (GIUMU). The birth of the union is credited to Prof. S.N. Quartey, a member of the Methodist Youth
                  Fellowship branch at Shama in the Western region.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light mb-6">
                  Two vibrant former students of Trinity Theological Seminary, Rt. Rev. Michael Kumi and Rt. Rev. Blankson,
                  enrolled at the University of Ghana and were elected as President and Secretary respectively. They linked
                  the University of Science and Technology (KNUST) and University of Cape Coast (UCC) into forming GIUMU.
                  Eventually, the Union was extended to include other tertiary institutions and second cycle institutions.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                  On 8th June 1984, at Annual Conference, it was decided that GHAMSU be constituted by all post-elementary
                  school Methodist students. The 23rd Annual Conference held at UCC was particularly historic, officially
                  unveiling the new GHAMSU emblem and adopting the anthem and slogan "Ambassadors for Christ!"
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Mission & Vision */}
        <section id="vision" className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 lg:gap-20">
              <AnimatedSection>
                <div className="border-l-2 border-accent pl-6 sm:pl-8">
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Our Mission
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                    To evangelize and disciple others to a personal faith in Christ, train and bring up spirit-filled leaders
                    who will affect the church and society at large.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="border-l-2 border-accent pl-6 sm:pl-8">
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Our Vision
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                    To develop Ambassadors in unity and love for Christ, witness Him to the nations, build on the strong
                    foundation of the Methodist Church, and produce responsible contributors to society.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 bg-secondary">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16 sm:mb-20">
                <div className="mb-4 sm:mb-6">
                  <div className="h-[1px] w-12 bg-accent mx-auto mb-3 sm:mb-4" />
                  <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    Our Foundation
                  </p>
                </div>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Core Values
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light">
                  The Methodist Faith: All need to be saved, All can be saved, All can know themselves to be saved, All can be
                  saved to the uttermost
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <AnimatedSection key={index} delay={index * 0.1}>
                    <div className="border-t-2 border-accent pt-6 sm:pt-8">
                      <div className="mb-6 sm:mb-8">
                        <Icon className="w-8 sm:w-10 h-8 sm:h-10 text-accent" strokeWidth={1.5} />
                      </div>
                      <h3
                        className="text-lg sm:text-xl mb-3 sm:mb-4 tracking-tight"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm font-light">{value.description}</p>
                    </div>
                  </AnimatedSection>
                )
              })}
            </div>
          </div>
        </section>

        {/* Motto & Slogan */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 lg:gap-20">
              <AnimatedSection>
                <div className="border-l-2 border-accent pl-6 sm:pl-8">
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Our Motto
                  </h2>
                  <p className="text-xl sm:text-2xl text-accent font-semibold mb-3 sm:mb-4">
                    "Ambassadors in Unity and Love"
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                    This motto encapsulates our commitment to unity, love, and representing Christ in all we do.
                  </p>
                </div>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <div className="border-l-2 border-accent pl-6 sm:pl-8">
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Our Slogan
                  </h2>
                  <p className="text-xl sm:text-2xl text-accent font-semibold mb-3 sm:mb-4">
                    "Ambassadors for Christ!"
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                    Members use this slogan for easy interaction and identification, anchored in 2 Corinthians 5:20.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Aims & Purpose */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 bg-secondary">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16 sm:mb-20">
                <div className="mb-4 sm:mb-6">
                  <div className="h-[1px] w-12 bg-accent mx-auto mb-3 sm:mb-4" />
                  <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    Purpose
                  </p>
                </div>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Our Aims
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <AnimatedSection delay={0.1}>
                <div className="bg-card border border-border p-6 sm:p-8">
                  <h3
                    className="text-lg sm:text-xl mb-4 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Witness & Faith
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light">
                    To witness the Lord Jesus Christ as the Lord and Savior and lead others to a personal faith in Jesus
                    Christ.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-card border border-border p-6 sm:p-8">
                  <h3
                    className="text-lg sm:text-xl mb-4 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Church Foundation
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light">
                    To build on the strong foundation of the Methodist Church and encourage responsible church membership in
                    all educational institutions.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="bg-card border border-border p-6 sm:p-8">
                  <h3
                    className="text-lg sm:text-xl mb-4 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Community Support
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light">
                    To encourage one another to live the Christian life and support personal spiritual development among
                    members.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <div className="bg-card border border-border p-6 sm:p-8">
                  <h3
                    className="text-lg sm:text-xl mb-4 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Societal Impact
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light">
                    To prepare individuals to be responsible contributors to society through service and Christian witness.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Organizational Structure */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16 sm:mb-20">
                <div className="mb-4 sm:mb-6">
                  <div className="h-[1px] w-12 bg-accent mx-auto mb-3 sm:mb-4" />
                  <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    Organization
                  </p>
                </div>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Our Structure
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light">
                  An organized framework structured around Connexional, Diocese, and Local levels
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  title: 'Connexional Executive',
                  description:
                    'The highest decision-making body consisting of Connexional leadership, Diocesan officers, and Board Chairpersons providing overall guidance.',
                  level: 'Executive',
                },
                {
                  title: 'Connexional Boards',
                  description:
                    'Six established boards managing key areas: Prayer, Publications, Audit, Medical, Research & Education, and Projects.',
                  level: 'Governance',
                },
                {
                  title: 'Diocesan Council',
                  description:
                    'Diocesan leadership overseeing circuits and locals, implementing Connexional directives at the diocesan level.',
                  level: 'Management',
                },
                {
                  title: 'Circuit Coordinators',
                  description:
                    'Leaders coordinating local groups within a diocese based on proximity and institutional level, facilitating circuit programs.',
                  level: 'Coordination',
                },
                {
                  title: 'Local Executives',
                  description:
                    'Local chapter leadership managing day-to-day operations, organizing SICE events, and coordinating member activities.',
                  level: 'Operations',
                },
                {
                  title: 'Members & Wings',
                  description:
                    'Dedicated members and specialized departments serving in various capacities, executing the Union\'s mission at grassroots level.',
                  level: 'Service',
                },
              ].map((structure, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="bg-card border border-border hover:border-accent/50 transition-all duration-500 p-6 sm:p-8 h-full">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider">
                        {structure.level}
                      </span>
                    </div>
                    <h3
                      className="text-lg sm:text-xl mb-4 tracking-tight"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      {structure.title}
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-light">{structure.description}</p>
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