import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Heart, Users, HandHeart, Globe2, ArrowRight } from "lucide-react";
import { Link } from "react-router";

// ── Animated counter ───────────────────────────────────────────────────────────
function Counter({
  target,
  suffix = "",
  duration = 7000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <div ref={ref} className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mb-1">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export function AboutPreview() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: Text + Stats ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-orange-500 font-semibold uppercase tracking-wide mb-3">
              About Us
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Who We Are
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              GHAMSU as the campus ministry department of the church has been in
              existence for the past sixty years. As a youth organization in the
              Youth Development Ministry of the Methodist Church Ghana, GHAMSU is
              extinguished on the various campuses by our colors and our uniforms.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
              {[
                { target: 100,    suffix: "+", label: "Locals" },
                { target: 100000, suffix: "+", label: "Members" },
                { target: 50000,  suffix: "+", label: "Souls Won/Year" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
                  className="text-center p-2 sm:p-4 bg-white rounded-lg shadow-sm"
                >
                  <Counter
                    target={stat.target}
                    suffix={stat.suffix}
                    duration={2000 + i * 200}
                  />
                  <div className="text-[10px] sm:text-sm text-gray-600 leading-tight">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold transition-all shadow-md"
            >
              Learn More About Us
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* ── Right: Cards ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            {/* Left column */}
            <div className="space-y-4">
              {/* SICE card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover-lift"
              >
                <HandHeart className="w-10 h-10 text-blue-900 mb-4" />
                <h3 className="font-bold text-gray-900 mb-1">S.I.C.E</h3>
                <p className="text-xs text-orange-500 font-semibold mb-2">
                  Students In Church Evangelism
                </p>
                <p className="text-sm text-gray-600">
                  Taking the Gospel to every corner of campus
                </p>
              </motion.div>

              {/* GHAMSU Missions card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm hover-lift"
              >
                <Globe2 className="w-10 h-10 text-orange-500 mb-4" />
                <h3 className="font-bold text-gray-900 mb-1">GHAMSU Missions</h3>
                <p className="text-xs text-blue-900 font-semibold mb-2">
                  Reaching the Unreached
                </p>
                <p className="text-sm text-gray-600">
                  Spreading Christ's love beyond the campus gates
                </p>
              </motion.div>
            </div>

            {/* Right column — offset down */}
            <div className="space-y-4 mt-8">
              {/* Fellowship image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="h-44 rounded-xl overflow-hidden shadow-sm relative group"
              >
                <img
                  src="https://images.unsplash.com/photo-1775846986181-aedb2bf687fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Fellowship"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent flex items-end p-4">
                  <span className="text-white font-semibold text-sm">Fellowship</span>
                </div>
              </motion.div>

              {/* Community image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="h-44 rounded-xl overflow-hidden shadow-sm relative group"
              >
                <img
                  src="https://images.unsplash.com/photo-1775846986098-5874276cb51a?w=600&auto=format&fit=crop&q=60"
                  alt="GHAMSU Community"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent flex items-end p-4">
                  <span className="text-white font-semibold text-sm">GHAMSU Community</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}