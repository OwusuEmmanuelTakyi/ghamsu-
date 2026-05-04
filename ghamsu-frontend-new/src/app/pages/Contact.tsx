import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function Contact() {
  const [selectedCategory, setSelectedCategory] = useState('Connexional Executive');

  const categories = ['Connexional Executive', 'Connexional Board Executives', 'Diocesan Executives'];

  const leaders = {
    'Connexional Executive': [
      { name: 'John Mensah', role: 'President', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', email: 'president@gmsu.org' },
      { name: 'Sarah Osei', role: 'Vice President', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', email: 'vp@gmsu.org' },
      { name: 'Michael Appiah', role: 'General Secretary', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', email: 'secretary@gmsu.org' },
      { name: 'Grace Adjei', role: 'Treasurer', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', email: 'treasurer@gmsu.org' },
    ],
    'Connexional Board Executives': [
      { name: 'Emmanuel Boateng', role: 'Board Chairman', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', email: 'chairman@gmsu.org' },
      { name: 'Abena Owusu', role: 'Board Secretary', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', email: 'boardsec@gmsu.org' },
      { name: 'Kwame Asante', role: 'Board Member', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', email: 'board1@gmsu.org' },
      { name: 'Yaa Agyeman', role: 'Board Member', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', email: 'board2@gmsu.org' },
    ],
    'Diocesan Executives': [
      { name: 'Kofi Amankwah', role: 'Diocesan President', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', email: 'diocpresident@gmsu.org' },
      { name: 'Akua Frimpong', role: 'Diocesan Secretary', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', email: 'diocsecretary@gmsu.org' },
      { name: 'Joseph Darko', role: 'Diocesan Treasurer', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', email: 'dioctreasurer@gmsu.org' },
      { name: 'Ama Nkrumah', role: 'Diocesan Organizer', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', email: 'diocorganizer@gmsu.org' },
    ],
  };

  const displayedLeaders = leaders[selectedCategory as keyof typeof leaders] || [];

  return (
    <div className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="px-6 mb-24">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="mb-6">
              <div className="h-[1px] w-12 bg-accent mx-auto mb-4" />
              <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                Get In Touch
              </p>
            </div>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Contact Us
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed font-light max-w-2xl mx-auto">
              We'd love to hear from you. Reach out with any questions or prayer requests.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="px-6 mb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <AnimatedSection>
              <div>
                <h2
                  className="text-3xl md:text-4xl mb-8 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Contact Information
                </h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 border border-border bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3
                        className="text-xl mb-2"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        Address
                      </h3>
                      <p className="text-muted-foreground">
                        Accra, Ghana<br />
                        Greater Accra Region<br />
                        Ghana
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 border border-border bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3
                        className="text-xl mb-2"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        Phone
                      </h3>
                      <p className="text-muted-foreground">
                        Main: +233 (0) 123 456 789<br />
                        Office: +233 (0) 123 456 790
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 border border-border bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3
                        className="text-xl mb-2"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        Email
                      </h3>
                      <p className="text-muted-foreground">
                        info@gmsu.org<br />
                        contact@gmsu.org
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 border border-border bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3
                        className="text-xl mb-2"
                        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                      >
                        Office Hours
                      </h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 5:00 PM<br />
                        Saturday: 10:00 AM - 2:00 PM<br />
                        Sunday: Closed (Service Days)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ghana Map */}
                <div className="mt-8 border border-border overflow-hidden shadow-lg h-64 sm:h-80 md:h-96 bg-[#0B1929] relative">
                  <ImageWithFallback
                    src="../../imports/image-1.png"
                    alt="World Map - Ghana Location"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="w-3 h-3 bg-accent rounded-full animate-pulse mb-2 mx-auto shadow-lg shadow-accent/50"></div>
                      <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 backdrop-blur-sm">Accra, Ghana</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection delay={0.2}>
              <div className="bg-card border border-border p-8">
                <h2
                  className="text-3xl md:text-4xl mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Send Us a Message
                </h2>
                <form className="space-y-6">
                  <div>
                    <label className="block mb-2 font-medium">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                      placeholder="+233 (0) 123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Subject</label>
                    <select className="w-full px-4 py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors">
                      <option>General Inquiry</option>
                      <option>Prayer Request</option>
                      <option>Event Information</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground py-4 text-sm tracking-wider uppercase font-semibold hover:bg-accent/90 transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="px-6 bg-secondary py-32">
        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <div className="mb-6">
                <div className="h-[1px] w-12 bg-accent mx-auto mb-4" />
                <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                  Meet The Team
                </p>
              </div>
              <h2
                className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Our Leadership
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl mx-auto font-light">
                Dedicated servants committed to guiding our union
              </p>
            </div>
          </AnimatedSection>

          {/* Category Filter */}
          <AnimatedSection delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 font-medium transition-all border ${
                    selectedCategory === category
                      ? 'bg-accent text-accent-foreground border-accent shadow-lg scale-105'
                      : 'bg-card border-border text-card-foreground hover:bg-accent/10 hover:border-accent/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedLeaders.map((leader, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="bg-card border border-border overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 text-center border-t-2 border-accent">
                    <h3
                      className="text-lg mb-2 tracking-tight"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      {leader.name}
                    </h3>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-4">{leader.role}</p>
                    <a
                      href={`mailto:${leader.email}`}
                      className="inline-flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                      <Mail className="w-3 h-3" strokeWidth={1.5} />
                      {leader.email}
                    </a>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
