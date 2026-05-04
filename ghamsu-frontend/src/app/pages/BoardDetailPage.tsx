import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Users, ArrowRight } from "lucide-react";

// ── Board data drawn from the GHAMSU Constitution (Articles 19–29) ────────────
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
  "prayer-board": {
    name: "Prayer Board",
    hostLocal: "KNUST Local",
    description: "Constituting the prayer force of the Union and coordinating intercession at all levels",
    image: "https://images.unsplash.com/photo-1438232992991-995b671e4668?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Prayer Board constitutes the prayer force of GHAMSU, interceding for all activities and progress of the Union as well as outside bodies — particularly the Methodist Church. It arranges prayer teams for every Methodist Conference, steps up the prayer life of individual members, and organises the National Prayer Conference open to all members of the Union. The Board receives prayer requests from all organs of the Union, issues prayer bulletins, and maintains a vibrant prayer culture across all levels of the connexion.",
    responsibilities: [
      "Constituting the prayer force of the Union for all activities and progress",
      "Sending a prayer team to every Methodist Conference",
      "Suggesting and implementing methods to continually strengthen the prayer life of individual members",
      "Receiving prayer requests from all organs of the Union and issuing prayer bulletins",
      "Organising the National Prayer Conference open to all members of the Union",
      "Taking interest in and supporting the various Student Interest and Community Evangelism (SICE) groups at all levels",
    ],
    meetingSchedule: "As determined by the Board executive",
    contact: "prayer@ghamsu.org",
  },

  "publication-communication-board": {
    name: "Publication & Communication Board",
    hostLocal: "UG Local",
    description: "Managing official publications, communications, and digital platforms of the Union",
    image: "https://images.unsplash.com/photo-1775926766081-4b8764c05488?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Publication & Communication Board (PCB) serves as the official voice of GHAMSU. It publishes the Wesleyan Student newsletter at least twice a year and produces The Wesleyan Ambassador magazine for the National Biennial Conference. The PCB is the sole publisher of all of the Union's educational materials, the official reporter for all connexional activities, and the manager of the Union's website. It actively motivates members to develop the habit of writing Christian articles and literature.",
    responsibilities: [
      "Publishing the Wesleyan Student newsletter at least twice a year",
      "Producing The Wesleyan Ambassador magazine for the National Biennial Conference",
      "Serving as the sole publisher of all Union educational materials",
      "Acting as the official reporter for all activities of the Union and taking minutes at NEC Meetings",
      "Managing the Union's official website and digital platforms",
      "Calling for and editing articles from members and outsiders before publication",
      "Evolving methods to motivate members to write Christian articles and literature",
      "Serving as proof readers for the Church or any other body when called upon",
    ],
    meetingSchedule: "As determined by the Editor-in-Chief",
    contact: "publication@ghamsu.org",
  },

  "audit-board": {
    name: "Audit Board",
    hostLocal: "UPSA Local",
    description: "Ensuring financial accountability, transparency, and compliance across the connexion",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Audit Board upholds the highest standards of financial integrity within GHAMSU. It advises the National Executive Group (NEG) on all matters of finance, audits the accounts of the NEG, DEG, and Major Locals annually and before every handover, and coordinates the activities of Diocesan Audit Committees. The Board itself is subject to audit by an auditor appointed by NEC, ensuring independent oversight at every level.",
    responsibilities: [
      "Advising NEG on all matters of finance",
      "Auditing annually and before handover the accounts of NEG, DEG, and Major Locals",
      "Offering explanation of accounting policies and guidance to Financial Secretaries at all levels",
      "Ensuring all Locals and Dioceses adhere to GHAMSU accounting policies",
      "Coordinating the activities of Diocesan Audit Committees",
      "Reporting non-compliance to DEC and NEC and offering recommendations",
      "Presenting audit reports at connexional meetings",
    ],
    meetingSchedule: "Quarterly and before every handover",
    contact: "audit@ghamsu.org",
  },

  "project-board": {
    name: "Project Board",
    hostLocal: "UCC Local",
    description: "Undertaking viable income-generating projects and producing official Union souvenirs",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Project Board undertakes viable income-generating projects to financially support the Union and its programmes. It is the sole authorised producer of all GHAMSU souvenirs and branded items — no Diocese, Local, or individual may produce any GHAMSU item without its express approval in consultation with NEG. The Board channels financial support to NEC and ensures all products meet consistent quality standards.",
    responsibilities: [
      "Undertaking viable income-generating projects to support the Union",
      "Serving as the sole producer of all official GHAMSU souvenirs and branded items",
      "Supporting NEC financially through project proceeds",
      "Approving or declining requests from Dioceses and Locals to produce GHAMSU items",
      "Purchasing, stocking, and controlling the quality of all Board products",
      "Supervising the sales and distribution of all Union products",
    ],
    meetingSchedule: "As determined by the Chairperson",
    contact: "projects@ghamsu.org",
  },

  "research-education-board": {
    name: "Research & Education Board",
    hostLocal: "UEW Local",
    description: "Educating the Union on Methodist doctrine, history, and contemporary issues",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Research & Education Board (REB) is the intellectual backbone of GHAMSU. It educates the Union on the doctrines, practices, history, and hymns of the Methodist Church, and researches past and present issues confronting the Church and the Union. The REB also examines the Union's relationship with other Christian bodies, addresses social and political issues in relation to the Church, and makes its research findings available for publication through the PCB. It undertakes research work on behalf of NEG and educates NEG and NEC on relevant issues.",
    responsibilities: [
      "Educating the Union on the doctrines, practices, and history of the Methodist Church",
      "Educating members on the history and use of Methodist hymns and liturgy",
      "Researching past and present issues confronting the Methodist Church and the Union",
      "Researching the Union's relationship with other Christian bodies",
      "Researching social and political issues in relation to the Church",
      "Making research findings available for publication to the PCB",
      "Undertaking research work for and on behalf of NEG and educating NEG and NEC on relevant issues",
    ],
    meetingSchedule: "As determined by the Board executive",
    contact: "research@ghamsu.org",
  },

  "medical-board": {
    name: "Medical Board",
    hostLocal: "KORLE-BU Local",
    description: "Promoting the health, welfare, and well-being of members across the connexion",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=80",
    fullDescription:
      "The Medical Board promotes the physical and holistic well-being of all GHAMSU members in fulfilment of the Union's commitment to the total development of its members — spirit, soul, and body. Rooted in the belief that a healthy member is a more effective ambassador for Christ, the Board organises health outreach programmes, provides medical support at connexional events, and ensures that members facing health challenges receive timely guidance and welfare support. Operating under the authority of the National Executive Council (NEC), the Board works in collaboration with medical institutions and health professionals to serve the connexion.",
    responsibilities: [
      "Organising health screening and medical outreach programmes for members and communities",
      "Providing first aid and medical support at all connexional events and conferences",
      "Educating members on health, wellness, and disease prevention",
      "Supporting members and their families facing medical emergencies or health challenges",
      "Liaising with hospitals, clinics, and health institutions on behalf of the Union",
      "Advising NEG and NEC on health-related matters affecting members",
      "Promoting the holistic well-being of members in line with GHAMSU's mission",
    ],
    meetingSchedule: "As determined by the Board executive",
    contact: "medical@ghamsu.org",
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