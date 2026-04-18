import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Users, ArrowRight } from "lucide-react";

// ── Static board data — matches slugs in MinistriesSection exactly ─────────────
const BOARDS: Record<string, {
  name: string;
  hostLocal: string;
  description: string;
  image: string;
  fullDescription: string;
  responsibilities: string[];
  meetingSchedule?: string;
  contact?: string;
}> = {
  "publication-communication-board": {
    name: "Publication & Communication Board",
    hostLocal: "UG Local",
    description: "Managing official publications and communications across the connexion",
    image: "https://images.unsplash.com/photo-1775926766081-4b8764c05488?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Publication & Communication Board is responsible for managing all official publications, press releases, and communication channels of GHAMSU. It ensures that the voice of the connexion reaches every member accurately and promptly through print, digital, and broadcast media.",
    responsibilities: [
      "Producing and distributing GHAMSU newsletters and bulletins",
      "Managing official social media accounts and digital platforms",
      "Coordinating press releases and media interactions",
      "Designing and printing promotional materials for events",
      "Archiving connexional records and publications",
    ],
    meetingSchedule: "First Saturday of every month",
    contact: "publication@ghamsu.org",
  },
  "project-board": {
    name: "Project Board",
    hostLocal: "UCC Local",
    description: "Overseeing and coordinating connexional projects and initiatives",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Project Board plans, coordinates, and supervises all major connexional projects and development initiatives. It ensures that GHAMSU's programmes are executed with excellence, within budget, and in alignment with the union's mission.",
    responsibilities: [
      "Planning and executing connexional development projects",
      "Monitoring project timelines and budgets",
      "Liaising with external partners and sponsors",
      "Evaluating project outcomes and reporting to executives",
      "Identifying new project opportunities that advance GHAMSU's mission",
    ],
    meetingSchedule: "Second Saturday of every month",
    contact: "projects@ghamsu.org",
  },
  "audit-board": {
    name: "Audit Board",
    hostLocal: "UPSA Local",
    description: "Ensuring financial accountability and transparency in all operations",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Audit Board upholds the highest standards of financial integrity within GHAMSU. It independently reviews all financial transactions, ensures compliance with the union's financial policies, and provides transparent reports to the connexion.",
    responsibilities: [
      "Auditing connexional accounts and financial records",
      "Reviewing financial reports submitted by local executives",
      "Ensuring compliance with GHAMSU financial guidelines",
      "Presenting audit reports at connexional meetings",
      "Recommending improvements to financial processes",
    ],
    meetingSchedule: "Quarterly",
    contact: "audit@ghamsu.org",
  },
  "medical-board": {
    name: "Medical Board",
    hostLocal: "KORLE-BU Local",
    description: "Providing health guidance and welfare support for members",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Medical Board promotes the health and well-being of all GHAMSU members. It provides medical guidance, organises health outreach programmes, and ensures welfare support is available to members facing health challenges.",
    responsibilities: [
      "Organising health screening and medical outreach programmes",
      "Providing first aid and medical support at connexional events",
      "Educating members on health and wellness",
      "Supporting members facing medical emergencies",
      "Liaising with hospitals and health institutions",
    ],
    meetingSchedule: "Third Saturday of every month",
    contact: "medical@ghamsu.org",
  },
  "prayer-board": {
    name: "Prayer Board",
    hostLocal: "KNUST Local",
    description: "Coordinating intercession and spiritual covering for the connexion",
    image: "https://images.unsplash.com/photo-1438232992991-995b671e4668?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Prayer Board is the spiritual engine of GHAMSU. It coordinates intercession, organises prayer retreats, and ensures that the connexion is covered in prayer at every level. It mobilises members to pray for the union, the nation, and the world.",
    responsibilities: [
      "Organising connexional and local prayer meetings",
      "Coordinating the GHAMSU 24-hour prayer chain",
      "Planning and executing prayer retreats and vigils",
      "Producing prayer points and devotional materials",
      "Interceding for leadership, members, and national issues",
    ],
    meetingSchedule: "Every Friday evening",
    contact: "prayer@ghamsu.org",
  },
  "research-education-board": {
    name: "Research & Education Board",
    hostLocal: "UEW Local",
    description: "Driving academic excellence, research, and educational development",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Research & Education Board champions academic excellence within GHAMSU. It conducts research on issues affecting student life, produces educational resources, and creates programmes that help members excel both academically and spiritually.",
    responsibilities: [
      "Conducting research on student welfare and academic challenges",
      "Producing educational resources and study guides for members",
      "Organising seminars, workshops, and academic symposia",
      "Advocating for student rights and academic policies",
      "Collaborating with universities on educational initiatives",
    ],
    meetingSchedule: "Second and fourth Saturday of every month",
    contact: "research@ghamsu.org",
  },
};

export function BoardDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const board = slug ? BOARDS[slug] : null;

  // ── 404 state ──
  if (!board) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-gray-50">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Board Not Found</h1>
        <p className="text-gray-500 mb-8">The board you're looking for doesn't exist.</p>
        <Link
          to="/ministries"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Boards
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={board.image}
          alt={board.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-4 md:left-8">
          <Link
            to="/ministries"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Boards
          </Link>
        </div>

        {/* Title over hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-semibold">
                Host Local: {board.hostLocal}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {board.name}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Board</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {board.fullDescription}
              </p>
            </motion.div>

            {/* Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                Key Responsibilities
              </h2>
              <ul className="space-y-3">
                {board.responsibilities.map((r, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-600 leading-relaxed">{r}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right: sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            {/* Info card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="font-bold text-gray-900 text-lg">Board Info</h3>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Host Local</p>
                  <p className="text-gray-900 font-semibold">{board.hostLocal}</p>
                </div>
              </div>

              {board.meetingSchedule && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Meeting Schedule</p>
                    <p className="text-gray-900 font-semibold">{board.meetingSchedule}</p>
                  </div>
                </div>
              )}

              {board.contact && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Contact</p>
                  <a
                    href={`mailto:${board.contact}`}
                    className="text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors"
                  >
                    {board.contact}
                  </a>
                </div>
              )}
            </div>

            {/* CTA card */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Get Involved</h3>
              <p className="text-blue-100 text-sm mb-5 leading-relaxed">
                Interested in serving on this board? Reach out to us.
              </p>
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Other boards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Other Boards</h3>
              <ul className="space-y-2">
                {Object.entries(BOARDS)
                  .filter(([s]) => s !== slug)
                  .slice(0, 4)
                  .map(([s, b]) => (
                    <li key={s}>
                      <Link
                        to={`/boards/${s}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors py-1 group"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <span className="group-hover:translate-x-0.5 transition-transform">
                          {b.name}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}