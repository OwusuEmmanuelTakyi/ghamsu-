import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { HandHeart, Globe2, ArrowRight, BookOpen, Music, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StatItem {
  target: number;
  suffix: string;
  label: string;
  description: string;
}

interface MinistryCardData {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accent: "blue" | "orange";
}

interface Photo {
  src: string;
  alt: string;
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const STATS: StatItem[] = [
  { target: 100,    suffix: "+", label: "Locals",    description: "Chapters across Ghana"  },
  { target: 100000, suffix: "+", label: "Members",   description: "Students & graduates"   },
  { target: 50000,  suffix: "+", label: "Souls Won", description: "Each year for Christ"   },
];

const PILLARS: string[] = [
  "Rooted in Scripture & Methodist tradition",
  "Spirit-filled praise & worship culture",
  "Active campus evangelism through SICE",
  "Missions outreach beyond campus gates",
];

const MINISTRY_CARDS: MinistryCardData[] = [
  {
    icon: <HandHeart className="h-6 w-6" aria-hidden="true" />,
    title: "SICE",
    subtitle: "Students In Church Evangelism",
    description: "Carrying the Gospel to every corridor and campus corner.",
    accent: "blue",
  },
  {
    icon: <Globe2 className="h-6 w-6" aria-hidden="true" />,
    title: "Missions",
    subtitle: "Reaching the Unreached",
    description: "Spreading Christ's love far beyond the campus gates.",
    accent: "orange",
  },
  {
    icon: <BookOpen className="h-6 w-6" aria-hidden="true" />,
    title: "Bible Studies",
    subtitle: "Rooted in the Word",
    description: "Weekly study groups cultivating spiritual depth and growth.",
    accent: "blue",
  },
  {
    icon: <Music className="h-6 w-6" aria-hidden="true" />,
    title: "Praise & Worship",
    subtitle: "Glorifying God Together",
    description: "Dynamic worship that uplifts and transforms hearts daily.",
    accent: "orange",
  },
];

// Original images from the first component
const PHOTOS: Photo[] = [
  {
    src: "https://images.unsplash.com/photo-1775846986181-aedb2bf687fd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8NHx8fGVufDB8fHx8fA%3D%3D",
    alt: "GHAMSU fellowship gathering",
    label: "Fellowship",
  },
  {
    src: "https://images.unsplash.com/photo-1775846986098-5874276cb51a?w=600&auto=format&fit=crop&q=60",
    alt: "GHAMSU community",
    label: "Community",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────────────────────────────────────

function Counter({
  target,
  suffix = "",
  duration = 2200,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.5 }}
      className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white px-3 py-5 text-center shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <p className="mb-1 text-2xl font-bold text-blue-900 sm:text-3xl md:text-4xl">
        <Counter target={stat.target} suffix={stat.suffix} duration={2000 + index * 200} />
      </p>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-700 sm:text-sm">
        {stat.label}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-400 sm:text-xs">{stat.description}</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ministry Card
// ─────────────────────────────────────────────────────────────────────────────

function MinistryCard({ card, index }: { card: MinistryCardData; index: number }) {
  const isBlue = card.accent === "blue";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.08 + index * 0.08, duration: 0.5 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div
        className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-70 opacity-20 ${
          isBlue ? "bg-blue-100" : "bg-orange-100"
        }`}
      />
      <div className="relative z-10">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${
            isBlue ? "bg-blue-900 text-white" : "bg-orange-500 text-white"
          }`}
        >
          {card.icon}
        </div>
        <h3 className="mb-0.5 font-bold text-gray-900">{card.title}</h3>
        <p
          className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${
            isBlue ? "text-blue-700" : "text-orange-500"
          }`}
        >
          {card.subtitle}
        </p>
        <p className="text-sm leading-relaxed text-gray-500">{card.description}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Photo Panel — uses original images from the first component
// ─────────────────────────────────────────────────────────────────────────────

function PhotoPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      aria-label="GHAMSU photo gallery"
    >
      {/* Soft background blob */}
      <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-orange-50 opacity-80" />

      <div className="relative grid grid-cols-2 gap-4">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-4">
          {/* Photo 1 */}
          <div className="group relative h-52 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-[17rem]">
            <img
              src={PHOTOS[0].src}
              alt={PHOTOS[0].alt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/10 to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {PHOTOS[0].label}
            </span>
          </div>

          {/* 60 Years info card */}
          <div className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white px-4 py-4 shadow-sm">
            <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-orange-500 shadow-md">
              <span className="text-xl font-bold leading-none text-white">60</span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-orange-100">Yrs</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Six Decades Strong</p>
              <p className="text-xs leading-snug text-gray-400">Shaping student faith since 1964</p>
            </div>
          </div>
        </div>

        {/* ── Right column (offset down) ── */}
        <div className="mt-8 flex flex-col gap-4">
          {/* Photo 2 */}
          <div className="group relative h-52 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-[17rem]">
            <img
              src={PHOTOS[1].src}
              alt={PHOTOS[1].alt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/10 to-transparent" />
            <span className="absolute bottom-3 left-3 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {PHOTOS[1].label}
            </span>
          </div>

          {/* Live members badge */}
          <div className="flex items-center gap-3 rounded-2xl bg-blue-900 px-4 py-4 shadow-md">
            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
              <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">100k+ Active Members</p>
              <p className="text-xs text-blue-300">Across campuses nationwide</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

export function AboutPreview() {
  return (
    <section
      className="overflow-hidden bg-gray-50 px-4 py-20 lg:py-28"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl">

        {/* ── Hero Row: Copy + Photos ── */}
        <div className="mb-24 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow pill */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                About Us
              </span>
            </div>

            <h2
              id="about-heading"
              className="mb-5 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-[3.25rem]"
            >
              Who We Are
            </h2>

            <p className="mb-4 text-base leading-relaxed text-gray-600 md:text-lg">
              GHAMSU — the campus ministry of the Methodist Church Ghana — has
              been shaping student faith for over sixty years. Recognised across
              campuses by our distinctive colours and uniforms, we stand as a
              beacon of discipleship, fellowship, and evangelism.
            </p>
            <p className="mb-8 text-base leading-relaxed text-gray-600 md:text-lg">
              From Bible studies to missions outreach, every local chapter
              equips students to live out the Gospel — on campus and beyond.
            </p>

            {/* Pillars checklist */}
            <ul className="mb-10 space-y-2.5" role="list">
              {PILLARS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700 md:text-base">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            {/* Stats row */}
            <div className="mb-10 grid grid-cols-3 gap-3">
              {STATS.map((stat, i) => (
                <StatCard key={stat.label} stat={stat} index={i} />
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              aria-label="Learn more about GHAMSU"
            >
              Learn More About Us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Right: Photos */}
          <PhotoPanel />
        </div>

        {/* ── Ministries ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-700">
              Our Ministries
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">How We Serve</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500 md:text-base">
            Every arm of GHAMSU is designed to disciple students and impact communities for Christ.
          </p>
        </motion.div>

        <div className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MINISTRY_CARDS.map((card, i) => (
            <MinistryCard key={card.title} card={card} index={i} />
          ))}
        </div>

        {/* ── Bottom Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.55 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 shadow-2xl"
        >
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col items-center justify-between gap-8 px-8 py-12 text-center md:flex-row md:px-14 md:py-14 md:text-left">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
                Since 1964
              </p>
              <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                Sixty Years of God's Faithfulness
              </h3>
              <p className="max-w-lg text-base text-blue-200">
                Join thousands of students walking with Christ on campuses across Ghana.
                Your chapter is waiting — come grow with us.
              </p>
            </div>

            <div className="flex flex-shrink-0 flex-col items-center gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Link
                to="/join"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-blue-900"
                aria-label="Join GHAMSU today"
              >
                Join GHAMSU
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Contact a GHAMSU executive"
              >
                Contact an Exec
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}