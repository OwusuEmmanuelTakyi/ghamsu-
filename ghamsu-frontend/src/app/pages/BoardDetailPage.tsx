import { motion } from "motion/react";
import { useParams, Link } from "react-router";
import { ArrowLeft, MapPin, Calendar, Users, Target, BookOpen, ArrowRight } from "lucide-react";

const boardsData = {
  "project-board": {
    name: "Project Board",
    hostLocal: "UCC Local",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&h=500&fit=crop",
    founded: "2005",
    members: "12",
    mandate: "To oversee, plan, and coordinate all connexional projects across GHAMSU locals.",
    history: `The Project Board was established in 2005 during the connexional conference held at KNUST to address the growing need for structured project coordination across all GHAMSU locals. At the time, the movement was expanding rapidly and projects were being run independently without a unifying framework, leading to duplication of efforts and inconsistent outcomes.

The board was inaugurated with five founding members drawn from the most active locals, tasked with developing a coherent project management framework. In its early years, the board focused primarily on infrastructure projects such as the construction of GHAMSU secretariats and the establishment of resource centres on various campuses.

Over the years, the Project Board has evolved significantly. By 2010, it had introduced an annual project review system that evaluated the impact and sustainability of all connexional projects. This innovation became a model for other boards within the connexion.

Today, the Project Board oversees dozens of active projects spanning health, education, evangelism infrastructure, and community development. It remains one of the most active and impactful boards in the GHAMSU connexion, guided by its founding principle that every project must glorify God and serve the student community.`,
    milestones: [
      { year: "2005", event: "Board officially inaugurated at KNUST" },
      { year: "2008", event: "First connexional secretariat project completed" },
      { year: "2010", event: "Annual project review system introduced" },
      { year: "2015", event: "Expanded mandate to include community development projects" },
      { year: "2020", event: "Launched digital project tracking platform" },
      { year: "2023", event: "Oversaw 30+ active connexional projects" },
    ],
  },
  "publication-communication-board": {
    name: "Publication & Communication Board",
    hostLocal: "UG Local",
    image: "https://images.unsplash.com/photo-1775926766081-4b8764c05488?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D",
    founded: "1976",
    members: "7",
    mandate: "To manage all official GHAMSU publications and coordinate communications across the connexion.",
    history: `The Publication and Communication Board traces its roots to 2003 when GHAMSU leadership recognized the urgent need for a unified voice for the movement. Prior to its establishment, communication between locals was largely informal and inconsistent, resulting in misinformation and disengagement among student members.

Founded at the University of Ghana Local, the board initially focused on producing a quarterly newsletter that kept members across all campuses informed about connexional activities, devotionals, and news. This newsletter, affectionately known as "The Connexion Voice," quickly became a staple of student ministry life.

The board expanded its scope dramatically in the digital age. With the rise of social media and online platforms, it pioneered GHAMSU's digital communication strategy around 2012, launching official pages and developing a content calendar that kept the movement's message consistent and relevant.

Today, the board oversees all print and digital communications, manages the official website, coordinates press releases, and ensures that GHAMSU's publications reflect the values and mission of the movement. It continues to train local communication officers, ensuring excellence at every level of the connexion.`,
    milestones: [
      { year: "2003", event: "Board established at UG Local" },
      { year: "2004", event: "First edition of 'The Connexion Voice' published" },
      { year: "2009", event: "Launched GHAMSU official website" },
      { year: "2012", event: "Pioneered digital communication strategy" },
      { year: "2018", event: "Introduced local communication officers training" },
      { year: "2022", event: "Rebranded and relaunched official digital platforms" },
    ],
  },
  "audit-board": {
    name: "Audit Board",
    hostLocal: "UPSA Local",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=500&fit=crop",
    founded: "2001",
    members: "8",
    mandate: "To ensure financial accountability, transparency, and integrity in all GHAMSU operations.",
    history: `The Audit Board is one of the oldest governance structures within GHAMSU, having been established in 2001 following a connexional resolution to strengthen financial accountability across all locals. Its founding came at a critical time when the movement was experiencing significant growth in membership and financial activity.

Based at the University of Cape Coast Local, the founding members were largely students from accounting and finance backgrounds who volunteered their expertise for the good of the movement. Their inaugural audit of connexional finances revealed several areas of weakness that were promptly addressed, setting the tone for the board's reputation for integrity.

Over the decades, the Audit Board has developed a comprehensive financial framework that includes standardised reporting templates, quarterly reviews, and an annual audit report presented at the connexional conference. These tools have been credited with building donor confidence and improving financial discipline across all GHAMSU locals.

The board has also been instrumental in training local treasurers and financial officers, running annual workshops that equip them with the skills needed to manage funds responsibly. Today, the Audit Board stands as a symbol of GHAMSU's commitment to integrity and stewardship in all its operations.`,
    milestones: [
      { year: "2001", event: "Board established following connexional resolution" },
      { year: "2003", event: "First standardised financial reporting template introduced" },
      { year: "2007", event: "Annual treasurer training workshops launched" },
      { year: "2013", event: "Digital financial tracking system adopted" },
      { year: "2018", event: "Expanded oversight to all connexional boards and projects" },
      { year: "2023", event: "Achieved 100% audit compliance across all locals" },
    ],
  },
  "medical-board": {
    name: "Medical Board",
    hostLocal: "KORLE-BU Local",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=500&fit=crop",
    founded: "2008",
    members: "15",
    mandate: "To provide health guidance, medical welfare, and wellness support for GHAMSU members.",
    history: `The Medical Board was born out of a welfare crisis in 2008 when several students at different locals reported health challenges that were inadequately addressed due to lack of organised support structures. A group of medical students within GHAMSU took the initiative, presenting a proposal to the connexional conference for a dedicated medical welfare board.

Hosted at the Korle-Bu Local, the board brought together students from medicine, nursing, pharmacy, and public health disciplines. In its founding year, the board conducted the first ever GHAMSU Health Fair, providing free health screenings and health education to students across campuses.

The Medical Board has since expanded its mandate to include mental health advocacy, reproductive health education, and emergency response coordination during campus outbreaks and crises. During the COVID-19 pandemic, the board played a pivotal role in disseminating accurate health information and coordinating welfare support for affected members.

Today, the Medical Board runs several flagship programmes including the Annual Health Week, Campus Wellness Clinics, and the Mental Health Awareness Campaign. It remains committed to the holistic wellbeing of every GHAMSU student.`,
    milestones: [
      { year: "2008", event: "Board established at Korle-Bu Local" },
      { year: "2008", event: "First GHAMSU Health Fair organised" },
      { year: "2014", event: "Mental health advocacy programme launched" },
      { year: "2020", event: "Led COVID-19 health information campaign" },
      { year: "2021", event: "Campus Wellness Clinic programme introduced" },
      { year: "2023", event: "Mental Health Awareness Campaign reached 5,000+ students" },
    ],
  },
  "prayer-board": {
    name: "Prayer Board",
    hostLocal: "KNUST Local",
    image: "https://images.unsplash.com/photo-1438232992991-995b671e4668?w=1200&h=500&fit=crop",
    founded: "1998",
    members: "20",
    mandate: "To coordinate intercession, prayer initiatives, and spiritual covering for the entire GHAMSU connexion.",
    history: `The Prayer Board holds the distinction of being the oldest board in the GHAMSU connexion, established in 1998 when the founding leaders of the movement recognised that sustained growth could only come through a strong foundation of prayer. It was the first board to be formally constituted and has served as the spiritual backbone of the connexion ever since.

Hosted at the KNUST Local, the board was founded with a simple but powerful mandate: to ensure that prayer was never an afterthought in GHAMSU's activities. The founding members committed to a daily prayer chain that covered every local, every officer, and every initiative of the movement.

Through the years, the Prayer Board introduced several transformative prayer initiatives including the Annual Connexional Prayer Summit, the 21-Day Fasting and Prayer Programme, and the Midnight Prayer Chain, which links intercessors across all campuses through a coordinated schedule.

The board has also been at the forefront of training prayer leaders at the local level, equipping students with the tools and theology needed for effective intercession. Its influence extends beyond GHAMSU, with partner organisations regularly inviting the board to lead prayer events at national student gatherings.

Today, the Prayer Board continues to be the heartbeat of GHAMSU — a constant reminder that all that the movement does must be undergirded by prayer and dependence on God.`,
    milestones: [
      { year: "1998", event: "First board established in the connexion" },
      { year: "2000", event: "Annual Connexional Prayer Summit inaugurated" },
      { year: "2005", event: "21-Day Fasting and Prayer Programme launched" },
      { year: "2011", event: "Midnight Prayer Chain introduced across locals" },
      { year: "2017", event: "Prayer leaders training programme formalised" },
      { year: "2023", event: "25th Anniversary celebrated with nationwide prayer summit" },
    ],
  },
  "research-education-board": {
    name: "Research & Education Board",
    hostLocal: "UEW Local",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=500&fit=crop",
    founded: "2006",
    members: "14",
    mandate: "To drive academic excellence, theological research, and educational development within GHAMSU.",
    history: `The Research and Education Board was established in 2006 in response to a growing recognition within the connexion that GHAMSU's mission on campus must engage seriously with the academic and intellectual life of its members. The founding vision was clear: faith and scholarship are not in opposition but are deeply complementary.

Hosted at the University of Education Local, the board was intentionally placed to signal GHAMSU's commitment to educational development in every part of Ghana. The founding members included lecturers and postgraduate students who brought academic rigour and research expertise to the movement.

In its early years, the board focused on establishing study groups and academic support programmes across locals. It produced study guides integrating faith and academic subjects, helping students see their education as an expression of their calling.

By 2012, the board had launched the annual GHAMSU Research Symposium, a platform for student researchers to present papers at the intersection of faith, society, and academia. This event has grown into one of the most prestigious student academic gatherings in Ghana.

The board also oversees the GHAMSU Scholarship Fund, which supports academically gifted but financially challenged members. Today, it continues to shape GHAMSU's identity as a movement that takes both spiritual formation and intellectual development seriously.`,
    milestones: [
      { year: "2006", event: "Board established at UEW Local" },
      { year: "2008", event: "Faith and scholarship study guides published" },
      { year: "2012", event: "Annual GHAMSU Research Symposium launched" },
      { year: "2015", event: "GHAMSU Scholarship Fund established" },
      { year: "2019", event: "Research partnerships formed with 3 universities" },
      { year: "2023", event: "Symposium attracted 500+ student researchers" },
    ],
  },
};

export function BoardDetailPage() {
  const { slug } = useParams();
  const board = boardsData[slug];

  if (!board) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Board Not Found</h1>
        <p className="text-gray-500 mb-8">The board you're looking for doesn't exist.</p>
        <Link
          to="/boards"
          className="px-6 py-3 bg-orange-500 text-white rounded-md font-semibold hover:bg-orange-600 transition"
        >
          Back to Boards
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={board.image}
          alt={board.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link
            to="/boards"
            className="flex items-center gap-2 text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 transition px-4 py-2 rounded-full text-sm font-medium border border-white/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Boards
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {board.hostLocal}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {board.name}
            </h1>
            <p className="text-blue-100 text-lg">Est. {board.founded}</p>
          </motion.div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Calendar, label: "Founded", value: board.founded },
            { icon: MapPin, label: "Host Local", value: board.hostLocal },
            { icon: Users, label: "Board Members", value: board.members },
            { icon: Target, label: "Years Active", value: `${new Date().getFullYear() - parseInt(board.founded)}+` },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <stat.icon className="w-5 h-5 text-orange-400 mb-1" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-blue-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* History */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Our History</h2>
            </div>
            <div className="space-y-4">
              {board.history.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-gray-600 leading-relaxed text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Mandate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-blue-50 border-l-4 border-blue-900 rounded-r-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-900" />
              <h3 className="text-lg font-bold text-blue-900">Board Mandate</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{board.mandate}</p>
          </motion.div>
        </div>

        {/* Milestones Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Milestones</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {board.milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="relative pl-10"
                  >
                    {/* Dot */}
                    <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow" />
                    <p className="text-orange-500 font-bold text-sm mb-0.5">{milestone.year}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{milestone.event}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── CONTACT BUTTON ── */}
            <div className="mt-10 bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                Have questions about the{" "}
                <span className="font-semibold text-blue-900">{board.name}</span>?
                Reach out and we'll be happy to help.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold text-sm transition-all shadow hover:shadow-md"
              >
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}