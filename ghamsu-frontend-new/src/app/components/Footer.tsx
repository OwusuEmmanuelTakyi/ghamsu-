import { Link } from 'react-router'
import { Facebook, Instagram, Twitter, Youtube, Linkedin, MessageCircle, Music2 } from 'lucide-react'
import logoImage from '../../images/logo.png'

export function Footer() {
  const exploreLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Events', path: '/events' },
    { label: 'Sermons', path: '/sermons' },
  ]

  const resourcesLinks = [
    { label: 'Blogs', path: '/blogs' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Boards', path: '/boards' },
    { label: 'Contact', path: '/contact' },
  ]

  const socialLinks = [
    {
      icon: Facebook,
      href: 'https://www.facebook.com/ghamsuofficial',
      label: 'Facebook',
      color: 'hover:text-[#1877F2]',
    },
    {
      icon: Instagram,
      href: 'https://www.instagram.com/ghamsuofficial?igsh=bW9ud254NGZqYXkw',
      label: 'Instagram',
      color: 'hover:text-[#E4405F]',
    },
    {
      icon: Twitter,
      href: 'https://x.com/ghamsuofficial',
      label: 'Twitter',
      color: 'hover:text-[#1DA1F2]',
    },
    {
      icon: Youtube,
      href: 'https://www.youtube.com/@ghamsuofficial',
      label: 'YouTube',
      color: 'hover:text-[#FF0000]',
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/company/ghamsu',
      label: 'LinkedIn',
      color: 'hover:text-[#0A66C2]',
    },
    {
      icon: MessageCircle,
      href: ' https://whatsapp.com/channel/0029Vb59wTx3bbV3r68rku2l',
      label: 'WhatsApp',
      color: 'hover:text-[#25D366]',
    },
    {
      icon: Music2,
      href: 'https://www.tiktok.com/@ghamsuofficial1?is_from_webapp=1&sender_device=pc',
      label: 'TikTok',
      color: 'hover:text-[#000000] dark:hover:text-[#FFFFFF]',
    },
    {
      icon: MessageCircle,
      href: 'https://t.me/ghamsuofficial',
      label: 'Telegram',
      color: 'hover:text-[#0088cc]',
    },
  ]

  return (
    <footer className="bg-card border-t border-border text-foreground px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto">
        {/* Yearly Theme Section */}
        <div className="mb-12 sm:mb-16 pb-8 sm:pb-12 border-b border-border">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-semibold mb-2 sm:mb-3">
              {new Date().getFullYear()} Theme
            </p>
            <h3
              className="text-2xl sm:text-3xl text-accent mb-2 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Walking in the Word: Equipped for Every Good Work
            </h3>
            <p className="text-sm text-muted-foreground font-light">
              2 Timothy 3:16–17 - "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work."
            </p>
          </div>
        </div>

        {/* Footer Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-10 sm:mb-12">
          {/* Logo Area */}
          <div className="md:col-span-5 lg:col-span-6">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img
                src={logoImage}
                alt="GHAMSU Logo"
                className="h-14 sm:h-16 w-auto"
              />

              <div>
                <h3
                  className="text-sm sm:text-base tracking-wider leading-tight"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  GHANA METHODIST
                  <br />
                  STUDENT&apos;S UNION
                </h3>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              2 Corinthians 5:20 - "We are therefore Christ's ambassadors, as though God were making his appeal through us. We implore you on Christ's behalf: Be reconciled to God."
            </p>
          </div>

          {/* Links Area */}
          <div className="md:col-span-7 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">
                Explore
              </h4>
              <ul className="space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">
                Resources
              </h4>
              <ul className="space-y-3">
                {resourcesLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">
                Join Us
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Become part of our vibrant community of faith and fellowship.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-semibold text-sm whitespace-nowrap"
              >
                Join Now →
              </Link>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="py-8 sm:py-10 border-t border-b border-border mb-10 sm:mb-12">
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-6">
              FOLLOW GHAMSU OFFICIAL ON
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-11 h-11 flex items-center justify-center rounded-lg border border-border transition-all duration-300 ${social.color} hover:border-accent/50`}
                    title={social.label}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ghana Methodist Student&apos;s Union. All rights reserved.
          </p>

          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <span className="text-accent font-semibold">
              Publications & Communications Board
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}