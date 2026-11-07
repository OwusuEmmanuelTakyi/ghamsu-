// Shown instead of a blank page when the site is built without its database
// settings (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY). Deliberately has no
// data or router dependencies, so it renders even when everything else fails.
import logoImage from '../../images/logo.png'

export function SiteUnavailable() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: '#003D82' }}
    >
      <div className="max-w-md">
        <img src={logoImage} alt="GHAMSU logo" className="mx-auto mb-8 h-20 w-auto" />
        <div className="mx-auto mb-6 h-px w-12" style={{ backgroundColor: '#D4AF37' }} aria-hidden="true" />
        <h1
          className="mb-4 text-2xl sm:text-3xl text-white"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          The site is temporarily unavailable
        </h1>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
          We're sorry for the inconvenience. Please check back shortly.
        </p>
        <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Need to reach us?{' '}
          <a href="mailto:ghamsupcb@gmail.com" className="underline underline-offset-2" style={{ color: '#D4AF37' }}>
            ghamsupcb@gmail.com
          </a>
        </p>
      </div>
    </main>
  )
}
