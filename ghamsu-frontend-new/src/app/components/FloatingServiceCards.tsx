import { BookOpen, FileText, Calendar, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export function FloatingServiceCards() {
  const cards = [
    {
      icon: BookOpen,
      title: 'Scripture of the Day',
      description: '"For God so loved the world..." - John 3:16',
      link: '/sermons',
      active: true,
    },
    {
      icon: FileText,
      title: 'Blog of the Day',
      description: 'Finding Hope in Difficult Times',
      link: '/blogs',
      active: false,
    },
    {
      icon: Calendar,
      title: 'Upcoming Program',
      description: 'Youth Night - May 10, 6:00 PM',
      link: '/events',
      active: false,
    },
    {
      icon: Heart,
      title: 'Prayer Request',
      description: 'Submit your prayer needs',
      link: '/contact',
      active: false,
    },
  ];

  return (
    <div className="relative -mt-24 md:-mt-32 z-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link key={index} to={card.link}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`group relative overflow-hidden transition-all duration-500 h-full cursor-pointer ${
                    card.active
                      ? 'bg-accent text-accent-foreground shadow-xl'
                      : 'bg-card text-card-foreground border border-border hover:border-accent/50 hover:shadow-lg'
                  }`}
                >
                  {/* Accent top line */}
                  <div className={`h-[2px] w-full ${card.active ? 'bg-accent-foreground/20' : 'bg-accent'}`} />

                  <div className="p-8">
                    <div className="mb-6">
                      <div
                        className={`w-12 h-12 flex items-center justify-center transition-all ${
                          card.active
                            ? 'text-accent-foreground/80'
                            : 'text-foreground/60 group-hover:text-accent'
                        }`}
                      >
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                    </div>

                    <h3
                      className={`text-lg mb-3 tracking-tight ${card.active ? 'font-semibold' : 'font-medium'}`}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {card.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${card.active ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
