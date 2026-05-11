import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Home, ArrowLeft, Heart, BookOpen } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Quick Links
// ─────────────────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Home',     path: '/'        },
  { label: 'About Us', path: '/about'   },
  { label: 'Events',   path: '/events'  },
  { label: 'Blog',     path: '/blogs'   },
  { label: 'Sermons',  path: '/sermons' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function NotFound() {
  return (
    <>
      <style>{`
        .nf-wrap {
          min-height: 100vh;
          background-color: #003D82;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }

        /* Gold dot grid */
        .nf-grid {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(rgba(212,175,55,0.18) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        /* Centre glow */
        .nf-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 65%);
          pointer-events: none;
        }

        /* Corner brackets */
        .nf-corner { position: absolute; width: 56px; height: 56px; pointer-events: none; }
        .nf-tl { top: 20px; left: 20px; border-top: 2px solid rgba(212,175,55,0.55); border-left: 2px solid rgba(212,175,55,0.55); border-radius: 4px 0 0 0; }
        .nf-tr { top: 20px; right: 20px; border-top: 2px solid rgba(212,175,55,0.55); border-right: 2px solid rgba(212,175,55,0.55); border-radius: 0 4px 0 0; }
        .nf-bl { bottom: 20px; left: 20px; border-bottom: 2px solid rgba(212,175,55,0.55); border-left: 2px solid rgba(212,175,55,0.55); border-radius: 0 0 0 4px; }
        .nf-br { bottom: 20px; right: 20px; border-bottom: 2px solid rgba(212,175,55,0.55); border-right: 2px solid rgba(212,175,55,0.55); border-radius: 0 0 4px 0; }

        /* Giant 404 */
        .nf-404 {
          font-size: clamp(6rem, 22vw, 13rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.05em;
          background: linear-gradient(160deg, #D4AF37 0%, rgba(212,175,55,0.35) 55%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          user-select: none;
          pointer-events: none;
        }

        /* Evangelism card */
        .nf-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 20px;
          backdrop-filter: blur(8px);
        }

        /* Accept Christ button */
        .nf-accept-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #D4AF37, #c9a227);
          color: #003D82;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 14px 32px;
          border-radius: 6px;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(212,175,55,0.25);
        }
        .nf-accept-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(212,175,55,0.4);
        }

        /* Secondary nav button */
        .nf-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1.5px solid rgba(212,175,55,0.45);
          color: rgba(255,255,255,0.8);
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.05em;
          padding: 12px 24px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .nf-back-btn:hover {
          border-color: #D4AF37;
          color: #D4AF37;
          background: rgba(212,175,55,0.07);
        }

        /* Quick links */
        .nf-link {
          padding: 8px 16px;
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 6px;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
          background: rgba(255,255,255,0.03);
        }
        .nf-link:hover {
          border-color: rgba(212,175,55,0.55);
          color: #D4AF37;
          background: rgba(212,175,55,0.07);
        }

        /* Salvation prayer popup */
        .nf-prayer-box {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 14px;
          padding: 24px;
          margin-top: 24px;
          text-align: left;
        }

        /* Dark mode */
        .dark .nf-wrap          { background-color: var(--background); }
        .dark .nf-tl, .dark .nf-tr,
        .dark .nf-bl, .dark .nf-br { border-color: rgba(var(--accent-rgb), 0.4); }
        .dark .nf-card          { background: var(--card); border-color: var(--border); }
        .dark .nf-back-btn      { border-color: var(--border); color: var(--muted-foreground); }
        .dark .nf-back-btn:hover { border-color: var(--accent); color: var(--accent); }
        .dark .nf-link          { border-color: var(--border); color: var(--muted-foreground); }
        .dark .nf-link:hover    { border-color: var(--accent); color: var(--accent); }
      `}</style>

      <div className="nf-wrap">
        {/* BG decorations */}
        <div className="nf-grid" aria-hidden="true" />
        <div className="nf-glow"  aria-hidden="true" />
        <div className="nf-corner nf-tl" aria-hidden="true" />
        <div className="nf-corner nf-tr" aria-hidden="true" />
        <div className="nf-corner nf-bl" aria-hidden="true" />
        <div className="nf-corner nf-br" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-2xl text-center">

          {/* 404 */}
          <motion.p
            className="nf-404"
            aria-hidden="true"
            style={{ fontFamily: 'var(--font-heading)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            404
          </motion.p>

          {/* Gold rule */}
          <motion.div
            className="mx-auto mb-6 h-px w-20"
            style={{ backgroundColor: '#D4AF37' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            aria-hidden="true"
          />

          {/* Main heading — light and evangelistic */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.55 }}
          >
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: '#D4AF37' }}
            >
              Oops — Page not found
            </p>
            <h1
              className="mb-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl"
              style={{ fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}
            >
              Looks like you're a little lost 😅
            </h1>
            <p className="text-base font-medium sm:text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              But hey — even lost pages have a purpose.
            </p>
          </motion.div>

          {/* ── Evangelism Card ── */}
          <motion.div
            className="nf-card mx-auto mt-8 max-w-xl px-6 py-8 sm:px-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.55 }}
          >
            {/* Cross icon */}
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1.5px solid rgba(212,175,55,0.4)' }}
              aria-hidden="true"
            >
              <span className="text-2xl">✝️</span>
            </div>

            <h2
              className="mb-3 text-xl font-bold text-white sm:text-2xl"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              This page can't be found —<br />
              but <span style={{ color: '#D4AF37' }}>Christ</span> can be found right here.
            </h2>

            <p className="mb-2 text-sm leading-relaxed sm:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
              You searched for a page that doesn't exist — but the One who{' '}
              <em>does</em> exist found <em>you</em> first. No matter how lost
              you are, Jesus says:
            </p>

            <blockquote
              className="my-4 border-l-2 pl-4 text-sm italic sm:text-base"
              style={{ borderColor: '#D4AF37', color: 'rgba(255,255,255,0.8)' }}
            >
              "I am the way, the truth, and the life. No one comes to the Father
              except through me."
              <footer
                className="mt-1 not-italic text-xs font-semibold"
                style={{ color: '#D4AF37' }}
              >
                — John 14:6
              </footer>
            </blockquote>

            <p className="mb-6 text-sm leading-relaxed sm:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
              The page error is 404. But God's grace?{' '}
              <strong className="text-white">That never errors out.</strong>{' '}
              If you've never given your life to Christ, this might just be the
              best "wrong turn" you've ever taken. 🙏
            </p>

            {/* Salvation CTA */}
            <SalvationButton />
          </motion.div>

          {/* Nav buttons */}
          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
          >
            <Link to="/" className="nf-accept-btn" style={{ background: 'transparent', border: '2px solid rgba(212,175,55,0.5)', color: '#D4AF37' }}>
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
            <button onClick={() => window.history.back()} className="nf-back-btn">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go Back
            </button>
          </motion.div>

          {/* Quick links */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.6)' }}>
              Or explore
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_LINKS.map(({ label, path }) => (
                <Link key={path} to={path} className="nf-link">{label}</Link>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Salvation Button — toggles a simple sinner's prayer
// ─────────────────────────────────────────────────────────────────────────────

function SalvationButton() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen((p: boolean) => !p)}
        className="nf-accept-btn w-full justify-center"
      >
        <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
        {open ? 'I prayed this prayer 🙌' : 'Accept Christ Now'}
      </button>

      {open && (
        <motion.div
          className="nf-prayer-box"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 flex-shrink-0" style={{ color: '#D4AF37' }} aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>
              A Simple Prayer of Salvation
            </p>
          </div>

          <p className="text-sm leading-relaxed italic text-white/80 sm:text-base">
            "Lord Jesus, I know I am a sinner. I believe You died for my sins and
            rose again. I turn from my sins and invite You into my heart as my
            Lord and Saviour. Thank You for saving me. Amen."
          </p>

          <div
            className="mt-4 rounded-lg p-3 text-center text-xs leading-relaxed"
            style={{ background: 'rgba(212,175,55,0.12)', color: 'rgba(255,255,255,0.75)' }}
          >
            🎉 <strong className="text-white">Welcome to the family of God!</strong><br />
            We'd love to walk this journey with you.{' '}
            <Link
              to="/contact"
              className="underline underline-offset-2 font-semibold"
              style={{ color: '#D4AF37' }}
            >
              Connect with us
            </Link>{' '}
            and we'll guide your next steps. 💛
          </div>
        </motion.div>
      )}
    </div>
  )
}