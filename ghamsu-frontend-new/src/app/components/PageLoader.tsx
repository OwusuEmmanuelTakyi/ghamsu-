import { motion, AnimatePresence } from 'framer-motion'
import logoImage from '../../images/logo.png'
import img1 from '../../images/1.jpg'
import img2 from '../../images/3.jpg'
import img3 from '../../images/5.jpg'
import img4 from '../../images/7.jpg'
import img5 from '../../images/9.jpg'
import img6 from '../../images/12.jpg'

const ORBIT_IMAGES = [img1, img2, img3, img4, img5, img6]
const RADIUS = 64

export function PageLoader({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(0, 61, 130, 0.92)' }}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative flex flex-col items-center gap-8">
            <div className="relative" style={{ width: RADIUS * 2 + 48, height: RADIUS * 2 + 48 }}>
              {/* Orbiting images */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
              >
                {ORBIT_IMAGES.map((src, i) => {
                  const angle = (360 / ORBIT_IMAGES.length) * i
                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `rotate(${angle}deg) translate(${RADIUS}px) rotate(-${angle}deg)`,
                      }}
                    >
                      <motion.div
                        className="overflow-hidden rounded-full shadow-lg"
                        style={{
                          width: 44,
                          height: 44,
                          marginLeft: -22,
                          marginTop: -22,
                          border: '2px solid #D4AF37',
                        }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
                      >
                        <img
                          src={src}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover"
                        />
                      </motion.div>
                    </div>
                  )
                })}
              </motion.div>

              {/* Center logo */}
              <motion.div
                className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-full bg-white shadow-xl"
                style={{ width: 56, height: 56, marginLeft: -28, marginTop: -28 }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
              >
                <img src={logoImage} alt="GHAMSU" className="h-9 w-9 object-contain" />
              </motion.div>
            </div>

            <p
              className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Loading
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
