import { Heart, Globe, Church, Users } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export function WhyChooseUs() {
  const features = [
    {
      icon: Heart,
      title: 'Ambassadors in Unity',
      description: 'To develop Ambassadors in unity and love for Christ',
    },
    {
      icon: Globe,
      title: 'Witness to Nations',
      description: 'To witness Him to the nations',
    },
    {
      icon: Church,
      title: 'Strong Foundation',
      description: 'To build on the strong foundation of the church',
    },
    {
      icon: Users,
      title: 'Contributing to Society',
      description: 'To be responsible contributors to society',
    },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-[1400px] mx-auto">
        <AnimatedSection>
          <div className="text-center mb-20">
            <div className="mb-6">
              <div className="h-[1px] w-12 bg-accent mx-auto mb-4" />
              <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                Our Purpose
              </p>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Our Vision
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-light leading-relaxed">
              Four foundational pillars guiding our mission and commitment
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="group">
                  <div className="border-t border-accent/20 pt-8">
                    <div className="mb-8">
                      <Icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                    </div>
                    <h3
                      className="text-xl mb-4 tracking-tight"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
