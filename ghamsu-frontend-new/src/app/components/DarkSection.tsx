import { Music, Heart, MessageCircle, HandHeart } from 'lucide-react';

export function DarkSection() {
  const services = [
    {
      icon: Music,
      title: 'Worship Services',
      description: 'Experience powerful worship and inspiring messages every Sunday at 9 AM and 11 AM.',
    },
    {
      icon: Heart,
      title: 'Prayer Meetings',
      description: 'Join us for weekly prayer gatherings every Wednesday at 7 PM.',
    },
    {
      icon: MessageCircle,
      title: 'Counseling',
      description: 'Professional pastoral counseling available by appointment.',
    },
    {
      icon: HandHeart,
      title: 'Outreach',
      description: 'Participate in our community service initiatives and mission trips.',
    },
  ];

  return (
    <section className="py-32 px-6 bg-[#0F3C87] dark:bg-[#1B2B3A] text-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <div className="mb-6">
            <div className="h-[1px] w-12 bg-accent mx-auto mb-4" />
            <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
              Connect
            </p>
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight text-white"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
          >
            Ways to Engage
          </h2>
          <p className="text-white/80 text-base max-w-2xl mx-auto font-light leading-relaxed">
            Discover opportunities to connect, grow, and serve
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group border border-white/10 hover:border-accent/50 transition-all duration-500 bg-white/5 backdrop-blur-sm"
              >
                <div className="h-[2px] w-full bg-accent" />
                <div className="p-8">
                  <div className="mb-8">
                    <Icon className="w-8 h-8 text-accent" strokeWidth={1.5} />
                  </div>
                  <h3
                    className="text-lg mb-4 tracking-tight text-white"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
