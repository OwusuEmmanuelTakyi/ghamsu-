import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Events', path: '/events' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Sermons', path: '/sermons' },
    { label: 'Boards & Major Activities', path: '/boards' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Contact', path: '/contact' },
    { label: 'Partner With Us', path: '/partner' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="bg-[#0F3C87] dark:bg-[#0B1929] text-white pt-20 pb-10 px-6 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* About column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border-2 border-white flex items-center justify-center">
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>G</span>
              </div>
              <h3
                className="text-sm tracking-wide leading-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.08em' }}
              >
                GHANA METHODIST<br />STUDENT'S UNION
              </h3>
            </div>
            <p className="text-white/70 mb-8 leading-relaxed text-sm font-light">
              A community where faith, hope, and love come together to make a difference in the world.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 border border-white/20 hover:border-accent flex items-center justify-center transition-all duration-300 hover:bg-accent/10"
                  >
                    <Icon className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links column */}
          <div>
            <h4
              className="text-xs mb-6 tracking-[0.2em] uppercase text-white/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.slice(0, 5).map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/70 hover:text-accent transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4
              className="text-xs mb-6 tracking-[0.2em] uppercase text-white/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-accent" strokeWidth={1.5} />
                <span className="text-sm text-white/70 font-light">
                  123 Church Street<br />City, State 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 flex-shrink-0 text-accent" strokeWidth={1.5} />
                <a
                  href="tel:+1234567890"
                  className="text-sm text-white/70 hover:text-accent transition-colors font-light"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0 text-accent" strokeWidth={1.5} />
                <a
                  href="mailto:info@church.com"
                  className="text-sm text-white/70 hover:text-accent transition-colors font-light"
                >
                  info@gmsu.org
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter column */}
          <div>
            <h4
              className="text-xs mb-6 tracking-[0.2em] uppercase text-white/60"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Newsletter
            </h4>
            <p className="text-sm text-white/70 mb-6 font-light">
              Stay connected with our community.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-accent focus:outline-none text-white placeholder:text-white/40 text-sm"
              />
              <button className="w-full bg-accent text-accent-foreground px-6 py-3 text-sm tracking-wider uppercase font-medium hover:bg-accent/90 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50 font-light">&copy; 2026 Ghana Methodist Student's Union. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-white/50 hover:text-accent transition-colors font-light">Privacy Policy</a>
            <a href="#" className="text-sm text-white/50 hover:text-accent transition-colors font-light">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
