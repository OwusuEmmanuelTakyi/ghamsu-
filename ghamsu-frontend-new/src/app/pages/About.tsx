import { Heart, Target, Users, Award } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';

export default function About() {
  const values = [
    {
      icon: Heart,
      title: 'Love & Compassion',
      description: 'We believe in showing God\'s love through compassionate service to our community.',
    },
    {
      icon: Target,
      title: 'Purpose-Driven',
      description: 'Helping individuals discover and fulfill their God-given purpose in life.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building authentic relationships and supporting one another in faith.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Pursuing excellence in all we do to honor God and serve others.',
    },
  ];

  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-6 mb-24">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="mb-6">
              <div className="h-[1px] w-12 bg-accent mx-auto mb-4" />
              <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                Who We Are
              </p>
            </div>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              About Ghana Methodist Student's Union
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed font-light max-w-2xl mx-auto">
              A vibrant community of believers committed to faith, fellowship, and making a difference in the world.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 mb-24 bg-secondary py-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <AnimatedSection>
              <div className="border-l-2 border-accent pl-8">
                <h2
                  className="text-4xl md:text-5xl mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Our Mission
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  To be a transformative community that empowers people to experience God's love,
                  grow in their faith, and serve others with compassion. We are dedicated to creating
                  an inclusive environment where everyone can encounter Christ and discover their purpose.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="border-l-2 border-accent pl-8">
                <h2
                  className="text-4xl md:text-5xl mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Our Vision
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed font-light">
                  To see lives transformed, families restored, and communities renewed through the
                  power of the Gospel. We envision a church that reaches across generations and cultures,
                  making disciples who make a lasting impact in their spheres of influence.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="px-6 mb-24">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="mb-6">
                <div className="h-[1px] w-12 bg-accent mx-auto mb-4" />
                <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                  Our Foundation
                </p>
              </div>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Core Values
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto font-light">
                The principles that guide everything we do
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="border-t-2 border-accent pt-8">
                    <div className="mb-8">
                      <Icon className="w-10 h-10 text-accent" strokeWidth={1.5} />
                    </div>
                    <h3
                      className="text-xl mb-4 tracking-tight"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm font-light">
                      {value.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Church Structure */}
      <section className="px-6 bg-secondary py-32">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection>
            <div className="text-center mb-20">
              <div className="mb-6">
                <div className="h-[1px] w-12 bg-accent mx-auto mb-4" />
                <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                  Organization
                </p>
              </div>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Our Structure
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto font-light">
                An organized framework designed to serve our community effectively
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Senior Leadership',
                description: 'Senior Pastor, Associate Pastors, and Executive Team providing spiritual direction and oversight.',
                level: 'Executive'
              },
              {
                title: 'Board of Directors',
                description: 'Six established boards managing key areas: Prayer, Publications, Audit, Projects, Research & Education, and Medical.',
                level: 'Governance'
              },
              {
                title: 'Ministry Teams',
                description: 'Specialized teams leading worship, youth, children, outreach, and various ministry initiatives.',
                level: 'Operations'
              },
              {
                title: 'Department Heads',
                description: 'Leaders overseeing specific departments including administration, facilities, and communications.',
                level: 'Management'
              },
              {
                title: 'Small Group Leaders',
                description: 'Facilitators guiding Bible study groups, prayer circles, and community fellowship gatherings.',
                level: 'Community'
              },
              {
                title: 'Volunteers & Servants',
                description: 'Dedicated members serving in various capacities throughout the church and community.',
                level: 'Service'
              },
            ].map((structure, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="bg-card border border-border hover:border-accent/50 transition-all duration-500 p-8 h-full">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium uppercase tracking-wider">
                      {structure.level}
                    </span>
                  </div>
                  <h3
                    className="text-xl mb-4 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    {structure.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-light">
                    {structure.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
