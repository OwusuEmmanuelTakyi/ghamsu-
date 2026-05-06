import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { useExecutives } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'
import emailjs from '@emailjs/browser'

export default function Contact() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { data: allExecutives } = useExecutives()
  const { data: executives, loading: executivesLoading } = useExecutives({ category: selectedCategory })

  const categories = allExecutives
    ? Array.from(new Set(allExecutives.map((e) => e.category).filter(Boolean))).sort()
    : []

  const getCategoryLabel = (category: string | undefined) => {
    if (!category) return 'All'
    const labels: Record<string, string> = {
      connexional: 'Connexional Executive',
      'Connexional Boards': 'Connexional Board Executive',
      Diocese: 'Diocesan Executive',
      local: 'Local',
    }
    return labels[category] || category
  }

  const displayedExecutives = selectedCategory ? executives : allExecutives

  // Initialize EmailJS
  useState(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const templateParams = {
        to_email: 'info@gmsu.org',
        from_name: formData.fullName,
        from_email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      }

      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams
      )

      if (response.status === 200) {
        setSubmitStatus('success')
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: '',
        })
        setTimeout(() => setSubmitStatus('idle'), 5000)
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Failed to send message. Please try again later.')
      console.error('EmailJS error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <HeroSection
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach out with any questions or prayer requests."
        backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
        isHomePage={false}
      />

      <div className="pb-24">
        {/* Contact Information & Form */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 md:py-32">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
              <AnimatedSection>
                <div>
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Contact Information
                  </h2>
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 border border-border bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3
                          className="text-lg sm:text-xl mb-2 tracking-tight"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                        >
                          Address
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Accra, Ghana
                          <br />
                          Greater Accra Region
                          <br />
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
                          className="text-lg sm:text-xl mb-2 tracking-tight"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                        >
                          Phone
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Main: +233 (0) 123 456 789
                          <br />
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
                          className="text-lg sm:text-xl mb-2 tracking-tight"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                        >
                          Email
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          info@gmsu.org
                          <br />
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
                          className="text-lg sm:text-xl mb-2 tracking-tight"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                        >
                          Office Hours
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Monday - Friday: 9:00 AM - 5:00 PM
                          <br />
                          Saturday: 10:00 AM - 2:00 PM
                          <br />
                          Sunday: Closed (Service Days)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-card border border-border p-6 sm:p-8">
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl mb-6 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    Send Us a Message
                  </h2>

                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-xs sm:text-sm">
                      ✓ Message sent successfully! We'll get back to you soon.
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-xs sm:text-sm">
                      ✕ {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block mb-2 font-medium text-xs sm:text-sm">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors text-xs sm:text-sm"
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-xs sm:text-sm">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors text-xs sm:text-sm"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-xs sm:text-sm">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors text-xs sm:text-sm"
                        placeholder="+233 (0) 123 456 789"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-xs sm:text-sm">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors text-xs sm:text-sm"
                      >
                        <option>General Inquiry</option>
                        <option>Prayer Request</option>
                        <option>Event Information</option>
                        <option>Partnership</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 font-medium text-xs sm:text-sm">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-secondary border border-border focus:border-primary focus:outline-none transition-colors resize-none text-xs sm:text-sm"
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-accent text-accent-foreground py-3 sm:py-4 text-xs tracking-wider uppercase font-semibold hover:bg-accent/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Connexional Coordinator */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 md:py-32 bg-secondary">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16">
                <div className="mb-4 sm:mb-6">
                  <div className="h-[1px] w-12 bg-accent mx-auto mb-3 sm:mb-4" />
                  <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    Leadership
                  </p>
                </div>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Connexional Coordinator
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light">
                  The driving force behind GHAMSU's mission and vision
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-card border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Side */}
                <div className="relative overflow-hidden h-64 sm:h-80 lg:h-96">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=700&fit=crop"
                    alt="Connexional Coordinator"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                </div>

                {/* Content Side */}
                <div className="p-6 sm:p-8 lg:p-12 lg:pr-16 flex flex-col justify-center border-l border-accent/20">
                  <div className="mb-4 sm:mb-6">
                    <h3
                      className="text-2xl sm:text-3xl mb-2 tracking-tight"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      John Mensah
                    </h3>
                    <p className="text-accent text-xs uppercase tracking-widest font-semibold mb-3 sm:mb-4">
                      Connexional Coordinator
                    </p>
                    <div className="h-[1px] w-12 bg-accent mb-4 sm:mb-6" />
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 font-light text-xs sm:text-sm">
                    With over 15 years of dedicated service to the Methodist Church and student ministry, John brings
                    visionary leadership and pastoral excellence to GHAMSU. His commitment to spiritual development and
                    youth empowerment has transformed the lives of thousands of students across the Connexion.
                  </p>

                  <p className="text-muted-foreground leading-relaxed mb-6 sm:mb-8 font-light text-xs sm:text-sm">
                    John holds a Master's degree in Theology and has led several transformational initiatives within the
                    Methodist Church. His leadership philosophy centers on developing Ambassadors for Christ who impact
                    their communities with faith, integrity, and service.
                  </p>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div>
                      <p className="text-xs text-accent uppercase tracking-widest font-semibold mb-2">Contact</p>
                      <div className="flex flex-col gap-1 sm:gap-2 text-xs">
                        <a href="mailto:john.mensah@gmsu.org" className="text-foreground hover:text-accent transition-colors break-all">
                          john.mensah@gmsu.org
                        </a>
                        <a href="tel:+233244123456" className="text-foreground hover:text-accent transition-colors">
                          +233 (0) 244 123 456
                        </a>
                        <a
                          href="https://wa.me/233244123456"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-accent transition-colors"
                        >
                          WhatsApp: +233 244 123 456
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-8 border-t border-border">
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-accent mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        15+
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Years Service</p>
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-accent mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        5K+
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Lives Impacted</p>
                    </div>
                    <div>
                      <p className="text-lg sm:text-2xl font-bold text-accent mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        25
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Diocese Led</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 md:py-32 bg-secondary">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16">
                <div className="mb-4 sm:mb-6">
                  <div className="h-[1px] w-12 bg-accent mx-auto mb-3 sm:mb-4" />
                  <p className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    Meet The Team
                  </p>
                </div>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Our Leadership
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light">
                  Dedicated servants committed to guiding our union
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`px-3 sm:px-6 py-2 sm:py-2.5 font-medium text-xs sm:text-sm transition-all border ${
                    !selectedCategory
                      ? 'bg-accent text-accent-foreground border-accent shadow-lg scale-105'
                      : 'bg-card border-border text-card-foreground hover:bg-accent/10 hover:border-accent/50'
                  }`}
                >
                  All
                </button>
                {['connexional', 'Connexional Boards', 'Diocese'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-6 py-2 sm:py-2.5 font-medium text-xs sm:text-sm transition-all border ${
                      selectedCategory === category
                        ? 'bg-accent text-accent-foreground border-accent shadow-lg scale-105'
                        : 'bg-card border-border text-card-foreground hover:bg-accent/10 hover:border-accent/50'
                    }`}
                  >
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </AnimatedSection>

            {executivesLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-xs sm:text-sm">Loading executives...</p>
              </div>
            ) : !displayedExecutives || displayedExecutives.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-xs sm:text-sm">No executives found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {displayedExecutives.map((executive, index) => (
                  <AnimatedSection key={executive._id} delay={index * 0.1}>
                    <div className="bg-card border border-border overflow-hidden group">
                      <div className="relative overflow-hidden">
                        <img
                          src={urlFor(executive.image).width(400).height(500).url()}
                          alt={executive.name}
                          className="w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-4 sm:p-6 text-center border-t-2 border-accent">
                        <h3
                          className="text-sm sm:text-base mb-2 tracking-tight"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                        >
                          {executive.name}
                        </h3>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3 sm:mb-4">
                          {executive.position}
                        </p>

                        <div className="flex flex-col gap-1 sm:gap-2 text-xs">
                          {executive.email && (
                            <a
                              href={`mailto:${executive.email}`}
                              className="text-accent hover:text-accent/80 transition-colors break-all"
                            >
                              {executive.email}
                            </a>
                          )}
                          {executive.phone && (
                            <a
                              href={`tel:${executive.phone}`}
                              className="text-accent hover:text-accent/80 transition-colors"
                            >
                              {executive.phone}
                            </a>
                          )}
                          {executive.whatsapp && (
                            <a
                              href={`https://wa.me/${executive.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:text-accent/80 transition-colors"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}