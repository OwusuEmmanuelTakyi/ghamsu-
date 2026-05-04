import { Users, Baby, Calendar, Heart } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export function MinistriesSection() {
  const ministries = [
    {
      icon: Users,
      title: 'Youth Ministry',
      description: 'Engaging programs for teens and young adults to grow in faith.',
      image: 'https://images.unsplash.com/photo-1594913421979-b9399c0cd4f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHx5b3V0aCUyMGdyb3VwJTIwbWluaXN0cnl8ZW58MXx8fHwxNzc3ODU1NzcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Baby,
      title: 'Children Ministry',
      description: 'Fun and educational programs for kids of all ages.',
      image: 'https://images.unsplash.com/photo-1713012633197-1426a345ca99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGNodXJjaCUyMHN1bmRheSUyMHNjaG9vbHxlbnwxfHx8fDE3Nzc4NTU3NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Regular gatherings, workshops, and special celebrations.',
      image: 'https://images.unsplash.com/photo-1662151820001-0c8d949304a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwY3Jvd2R8ZW58MXx8fHwxNzc3ODU1NzcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Heart,
      title: 'Outreach',
      description: 'Community service and mission trips to make a difference.',
      image: 'https://images.unsplash.com/photo-1594913495702-0872744c6968?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3V0aCUyMGdyb3VwJTIwbWluaXN0cnl8ZW58MXx8fHwxNzc3ODU1NzcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
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
                Get Involved
              </p>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Our Ministries
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-light leading-relaxed">
              Programs designed to serve every age and stage of life
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ministries.map((ministry, index) => {
            const Icon = ministry.icon;
            return (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="group relative overflow-hidden bg-card border border-border hover:border-accent/30 transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={ministry.image}
                      alt={ministry.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>
                  <div className="p-8">
                    <div className="mb-4">
                      <Icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    </div>
                    <h3
                      className="text-lg mb-3 tracking-tight"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      {ministry.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-light">
                      {ministry.description}
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
