import { useEffect, useState } from 'react'
import { MapPin, Phone, Mail } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { AnimatedSection } from '../components/AnimatedSection'
import { useExecutives } from '../../../src/lib/hooks'
import { urlFor } from '../../../src/lib/sanity'
import emailjs from '@emailjs/browser'
import revImage from '../../images/rev.png'

export default function Contact() {
  const [selectedCategory, setSelectedCategory] = useState<string>('connexional')
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

  const { data: executives, loading: executivesLoading } = useExecutives({ category: selectedCategory })

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      connexional: 'Connexional Executive',
      'Connexional Boards': 'Connexional Board Executive',
      Diocese: 'Diocesan Executive',
    }
    return labels[category] || category
  }

  useEffect(() => {
    emailjs.init((import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        setFormData({ fullName: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
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
        backgroundImage="https://lh3.googleusercontent.com/pw/AP1GczPLWM9K4uwBhNvM9giX94dinXuCmGShUkXnryhkifXnJD41vT5X5yEx_FVG97uM1J5ID7JJPE_5gMKJXldF-oW1Ij3-PU6Hjs27juHdXc9R3B-AkiO5WyFD_4auGACsQH41qZpR1BRBgtzcEzRT_8Rv=w1445-h963-s-no-gm"
        isHomePage={false}
      />

      <div className="pb-24">
        {/* Contact Information & Form */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-8 xl:gap-10 items-start">
      
      {/* Contact Information */}
      <AnimatedSection>
        <div className="w-full h-full">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
          >
            Get in Touch
          </h2>

          <div className="space-y-5 sm:space-y-6">
            {[
              {
                icon: MapPin,
                title: 'Address',
                content: (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    c/o The Methodist Church Ghana<br />
                    P.O Box 403 Wesley House, Liberia Road, <br />
                    Greater Accra Region, Ghana 
                    
                  </p>
                ),
              },
              {
                icon: Phone,
                title: 'Phone',
                content: (
                  <div className="flex flex-col gap-2">
                    <a
                      href="tel:+233244123456"
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      CGC: +233 (0) 241 240 907
                    </a>
                    <a
                      href="tel:+233244123457"
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      Office: +233 (0) 000 000 000
                    </a>
                  </div>
                ),
              },
              {
                icon: Mail,
                title: 'Email',
                content: (
                  <div className="flex flex-col gap-2">
                    <a
                      href="mailto:ghamsunationalsec@gmail.com"
                      className="text-sm text-muted-foreground hover:text-accent transition-colors break-all"
                    >
                      ghamsunationalsec@gmail.com
                    </a>
                    <a
                      href="mailto:ghamsupcb@gmail.com"
                      className="text-sm text-muted-foreground hover:text-accent transition-colors break-all"
                    >
                      ghamsupcb@gmail.com
                    </a>
                  </div>
                ),
              },
            ].map(({ icon: Icon, title, content }, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg border border-border bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg sm:text-xl mb-1.5 tracking-tight"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                  >
                    {title}
                  </h3>
                  {content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Contact Form */}
      <AnimatedSection delay={0.2}>
        <div className="w-full bg-card border border-border p-5 sm:p-7 lg:p-8 rounded-lg">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
          >
            Send Message
          </h2>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-sm">
              ✓ Message sent successfully! We'll get back to you soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm">
              ✕ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'Your name' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'your@email.com' },
              { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+233 (0) 123 456 789' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block mb-2 font-medium text-sm">
                  {label}
                </label>

                <input
                  type={type}
                  name={name}
                  value={formData[name as keyof typeof formData]}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 sm:py-3 bg-secondary border border-border rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
                  placeholder={placeholder}
                  required={name !== 'phone'}
                />
              </div>
            ))}

            <div>
              <label className="block mb-2 font-medium text-sm">
                Subject
              </label>

              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 sm:py-3 bg-secondary border border-border rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
              >
                <option>General Inquiry</option>
                <option>Prayer Request</option>
                <option>Event Information</option>
                <option>Membership Inquiry</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-sm">
                Message
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2.5 sm:py-3 bg-secondary border border-border rounded-lg focus:border-primary focus:outline-none transition-colors resize-none text-sm"
                placeholder="How can we help you?"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground py-3 sm:py-4 text-sm tracking-wider uppercase font-semibold hover:bg-accent/90 transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-32 bg-[#003D82] dark:bg-[#0a1628]">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16">
                <div className="mb-4 sm:mb-6">
                  <div className="h-[1px] w-12 bg-[#D4AF37] mx-auto mb-3 sm:mb-4" />
                  <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    Leadership
                  </p>
                </div>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Connexional Coordinator
                </h2>
                <p className="text-white/70 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light">
                  The driving force behind GHAMSU's mission and vision
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-white/10 dark:bg-[#0d1f3c] border border-white/20 dark:border-white/10 backdrop-blur-sm overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-0">
                <div className="relative overflow-hidden h-72 sm:h-96 lg:h-full lg:col-span-2">
                  <img
                    src={revImage}
                    alt="Connexional Coordinator"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003D82]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#003D82]/40 dark:lg:to-[#0d1f3c]/60" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 lg:hidden bg-gradient-to-t from-[#003D82] to-transparent">
                    <h3 className="text-xl font-semibold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                      REV. YAW ANOKYE KYEI BAFFOUR
                    </h3>
                    <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold mt-1">
                      Connexional Ghamsu Coordinator
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-3 p-6 sm:p-8 lg:p-12 flex flex-col justify-between border-l border-[#D4AF37]/20">
                  <div className="hidden lg:block mb-6">
                    <h3
                      className="text-2xl sm:text-3xl mb-1 tracking-tight text-white"
                      style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                    >
                      REV. YAW ANOKYE KYEI BAFFOUR
                    </h3>
                    <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold mb-4">
                      Connexional Ghamsu Coordinator
                    </p>
                    <div className="h-[1px] w-12 bg-[#D4AF37]" />
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <p className="text-white/70 leading-relaxed font-light text-sm">
                      With over 15 years of dedicated service to the Methodist Church and student ministry, Rev. Anokye brings
                      visionary leadership and pastoral excellence to GHAMSU. His commitment to spiritual development and
                      youth empowerment has transformed the lives of thousands of students across the Connexion.
                    </p>
                    <p className="text-white/70 leading-relaxed font-light text-sm">
                      Rev. Anokye holds a Master's degree in Theology and has led several transformational initiatives within the
                      Methodist Church. His leadership philosophy centers on developing Ambassadors for Christ who impact
                      their communities with faith, integrity, and service.
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold mb-3">Contact</p>
                    <div className="flex flex-col gap-2 text-sm">
                      <a href="mailto:john.mensah@gmsu.org" className="text-white/80 hover:text-[#D4AF37] transition-colors break-all">
                        anokyeyaw13@gmail.com
                      </a>
                      <a href="tel:+233244123456" className="text-white/80 hover:text-[#D4AF37] transition-colors">
                        +233 (0) 241 240 907
                      </a>
                      <a href="https://wa.me/233244123456" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#D4AF37] transition-colors">
                        WhatsApp: +233 241 240 907
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-white/15">
                    {[
                      { value: '15+', label: 'Years in Service' },
                      { value: 'MANY', label: 'Lives Impacted' },
                      { value: '8+ ', label: 'As Cordinator' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center sm:text-left">
                        <p className="text-xl sm:text-2xl font-bold text-[#D4AF37] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                          {stat.value}
                        </p>
                        <p className="text-xs text-white/55 uppercase tracking-wider">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32 bg-[#003D82] dark:bg-[#0a1628]">
          <div className="max-w-[1400px] mx-auto">
            <AnimatedSection>
              <div className="text-center mb-12 sm:mb-16">
                <div className="mb-4 sm:mb-6">
                  <div className="h-[1px] w-12 bg-[#D4AF37] mx-auto mb-3 sm:mb-4" />
                  <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>
                    Meet The Team
                  </p>
                </div>
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                >
                  Our Leadership
                </h2>
                <p className="text-white/70 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light">
                  Dedicated servants committed to guiding our union
                </p>
              </div>
            </AnimatedSection>

            {/* Category Filter — 3 categories only, no "All" */}
            <AnimatedSection delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
                {['connexional', 'Connexional Boards', 'Diocese'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 font-medium text-xs sm:text-sm transition-all duration-300 border rounded-lg ${
                      selectedCategory === category
                        ? 'bg-[#D4AF37] text-[#003D82] border-[#D4AF37] shadow-lg scale-105'
                        : 'bg-white/10 border-white/20 text-white hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {getCategoryLabel(category)}
                  </button>
                ))}
              </div>
            </AnimatedSection>

            {executivesLoading ? (
              <div className="text-center py-12">
                <p className="text-white/60 text-sm">Loading executives...</p>
              </div>
            ) : !executives || executives.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 text-sm">No executives found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {executives.map((executive, index) => (
                  <AnimatedSection key={executive._id} delay={index * 0.1}>
                    <div className="bg-white/10 dark:bg-[#0d1f3c] border border-white/20 dark:border-white/10 hover:border-[#D4AF37] backdrop-blur-sm overflow-hidden group transition-all duration-500 rounded-lg">
                      <div className="relative overflow-hidden">
                        <img
                          src={urlFor(executive.image).width(400).height(500).url()}
                          alt={executive.name}
                          className="w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-4 sm:p-6 text-center border-t-2 border-[#D4AF37]">
                        <h3
                          className="text-sm sm:text-base mb-2 tracking-tight text-white"
                          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
                        >
                          {executive.name}
                        </h3>
                        <p className="text-white/55 text-xs uppercase tracking-wider mb-3 sm:mb-4">
                          {executive.position}
                        </p>
                        <div className="flex flex-col gap-1 sm:gap-2 text-xs">
                          {executive.email && (
                            <a href={`mailto:${executive.email}`} className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors break-all">
                              {executive.email}
                            </a>
                          )}
                          {executive.phone && (
                            <a href={`tel:${executive.phone}`} className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors">
                              {executive.phone}
                            </a>
                          )}
                          {executive.whatsapp && (
                            <a href={`https://wa.me/${executive.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors">
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