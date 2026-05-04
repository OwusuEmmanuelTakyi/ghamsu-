import { Users, Globe, Calendar, Award } from 'lucide-react';

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: '5,000+',
      label: 'Active Members',
    },
    {
      icon: Globe,
      value: '30+',
      label: 'Countries Reached',
    },
    {
      icon: Calendar,
      value: '200+',
      label: 'Annual Events',
    },
    {
      icon: Award,
      value: '25',
      label: 'Years Serving',
    },
  ];

  return (
    <section className="py-32 px-6 bg-secondary">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center border-l border-accent/20 pl-6">
              <div
                className="text-5xl md:text-6xl mb-3 text-foreground tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs tracking-wider uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
