import { Users, ArrowLeft, Heart, BookOpen, TrendingUp, Globe, Music } from 'lucide-react'
import { AnimatedSection } from '../components/AnimatedSection'
import { useNavigate, useParams } from 'react-router'

export default function BoardDetail() {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()

  const boardDetails: Record<string, any> = {
    'prayer-board': {
      title: 'Prayer Board',
      icon: Heart,
      members: 8,
      color: 'bg-red-500/10',
      accentColor: 'text-red-500',
      description: 'Coordinating prayer initiatives, intercession ministries, and spiritual warfare strategies for the church.',
      responsibilities: [
        'Organize regular prayer meetings and intercession sessions',
        'Coordinate prayer chains for church members in need',
        'Develop prayer strategies for church goals and missions',
        'Lead corporate prayer during major church events',
        'Train members in prayer disciplines and spiritual warfare',
        'Maintain prayer request hotline and communication',
      ],
      vision:
        'To create a culture of prayer that permeates every aspect of church life, empowering believers to intercede effectively for the church and community.',
      activities: [
        'Weekly Prayer Meetings - Tuesdays 7:00 PM',
        'Monthly Fasting & Prayer Sessions',
        'Annual Prayer Retreat',
        'Prayer Walk for Community',
      ],
    },
    'publications-board': {
      title: 'Publications & Communications Board',
      icon: BookOpen,
      members: 10,
      color: 'bg-blue-500/10',
      accentColor: 'text-blue-500',
      description: 'Managing all church communications, publications, media outreach, and digital presence.',
      responsibilities: [
        'Manage church website and social media platforms',
        'Produce newsletters and church bulletins',
        'Coordinate multimedia content creation',
        'Manage church photography and videography',
        'Handle press releases and media relations',
        'Oversee digital advertising and outreach campaigns',
      ],
      vision:
        'To effectively communicate the Gospel message through multiple channels, ensuring our story reaches both members and the broader community.',
      activities: [
        'Weekly Newsletter Distribution',
        'Social Media Engagement Daily',
        'Monthly Video Content Production',
        'Annual Communications Strategy Review',
      ],
    },
    'audit-board': {
      title: 'Audit Board',
      icon: TrendingUp,
      members: 6,
      color: 'bg-green-500/10',
      accentColor: 'text-green-500',
      description: 'Ensuring financial accountability, transparency, and proper stewardship of church resources.',
      responsibilities: [
        'Review and audit financial records quarterly',
        'Ensure compliance with Connexional financial policies',
        'Recommend financial controls and procedures',
        'Present audit reports to congregation',
        'Investigate financial irregularities',
        'Provide financial education to leadership',
      ],
      vision:
        'To maintain the highest standards of financial integrity and stewardship, building trust through transparency and accountability.',
      activities: [
        'Quarterly Financial Audits',
        'Annual Financial Report',
        'Budget Review Sessions',
        'Financial Stewardship Workshops',
      ],
    },
    'project-board': {
      title: 'Project Board',
      icon: Users,
      members: 9,
      color: 'bg-purple-500/10',
      accentColor: 'text-purple-500',
      description: 'Overseeing church development projects, infrastructure improvements, and facility management.',
      responsibilities: [
        'Plan and oversee church facility projects',
        'Manage building maintenance and repairs',
        'Coordinate facility improvement initiatives',
        'Prepare budget proposals for projects',
        'Supervise construction and renovation work',
        'Ensure health and safety compliance',
      ],
      vision:
        'To maintain and develop church facilities that serve as welcoming spaces for worship, ministry, and community engagement.',
      activities: [
        'Monthly Facility Inspections',
        'Annual Maintenance Planning',
        'Capital Projects Management',
        'Volunteer Work Days',
      ],
    },
    'research-board': {
      title: 'Research & Education Board',
      icon: Globe,
      members: 12,
      color: 'bg-yellow-500/10',
      accentColor: 'text-yellow-500',
      description: 'Advancing theological research, educational programs, and training initiatives for ministry development.',
      responsibilities: [
        'Develop educational programs for members',
        'Conduct theological research on relevant topics',
        'Coordinate adult education classes',
        'Provide leadership training programs',
        'Partner with educational institutions',
        'Publish research findings and insights',
      ],
      vision:
        'To foster intellectual growth and theological understanding that strengthens faith and equips leaders for effective ministry.',
      activities: [
        'Weekly Bible Study Classes',
        'Annual Theology Conference',
        'Leadership Training Programs',
        'Research Publication Series',
      ],
    },
    'medical-board': {
      title: 'Medical Board',
      icon: Music,
      members: 11,
      color: 'bg-pink-500/10',
      accentColor: 'text-pink-500',
      description: 'Providing healthcare ministry, wellness initiatives, and medical outreach to the community.',
      responsibilities: [
        'Coordinate health screening programs',
        'Provide health education and awareness',
        'Organize medical outreach missions',
        'Support sick and elderly members',
        'Partner with healthcare organizations',
        'Develop wellness programs for church',
      ],
      vision:
        'To demonstrate Christ\'s love through compassionate medical care and health services that promote wholeness in body, mind, and spirit.',
      activities: [
        'Monthly Health Seminars',
        'Quarterly Medical Outreach Clinics',
        'Annual Health Fair',
        'Community Medical Mission Trips',
      ],
    },
  }

  const board = boardDetails[slug || '']

  if (!slug || !board) {
    return (
      <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/boards')}
            className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Boards
          </button>
          <div className="text-center">
            <h1 className="text-4xl mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              Board Not Found
            </h1>
            <p className="text-muted-foreground">The board you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const Icon = board.icon

  return (
    <div className="pt-32 pb-24">
      {/* Back Button */}
      <section className="px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <button
              onClick={() => navigate('/boards')}
              className="flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Boards
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* Hero Section */}
      <section className="px-6 mb-24">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="mb-8">
              <div className={`w-16 h-16 ${board.color} rounded-lg flex items-center justify-center mb-6`}>
                <Icon className={`w-8 h-8 ${board.accentColor}`} strokeWidth={1.5} />
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl mb-6 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                {board.title}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed font-light max-w-2xl">
                {board.description}
              </p>
            </div>

            <div className="flex items-center gap-4 py-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <span className="text-lg font-semibold">{board.members}</span>
                <span className="text-muted-foreground">Members</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Vision Section */}
      <section className="px-6 mb-24 bg-secondary py-24">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2
              className="text-3xl md:text-4xl mb-8 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Our Vision
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed font-light">{board.vision}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Responsibilities Section */}
      <section className="px-6 mb-24">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2
              className="text-3xl md:text-4xl mb-12 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Key Responsibilities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {board.responsibilities.map((responsibility: string, index: number) => (
                <AnimatedSection key={index} delay={index * 0.05}>
                  <div className="bg-card border border-border p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-2 ${board.accentColor} mt-2 flex-shrink-0`} />
                      <p className="text-base text-muted-foreground leading-relaxed">{responsibility}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Activities Section */}
      <section className="px-6 mb-24 bg-secondary py-24">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2
              className="text-3xl md:text-4xl mb-12 tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
            >
              Activities & Schedule
            </h2>

            <div className="space-y-4">
              {board.activities.map((activity: string, index: number) => (
                <AnimatedSection key={index} delay={index * 0.05}>
                  <div className="bg-card border border-border p-6 rounded-lg">
                    <p className="text-base leading-relaxed">{activity}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-12 text-center">
              <h2
                className="text-2xl md:text-3xl mb-4 tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
              >
                Interested in Serving?
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                If you have a passion for this ministry and would like to join the {board.title}, we'd love to hear from you!
              </p>
              <button className="border-2 border-primary text-primary px-10 py-4 text-sm tracking-wider uppercase font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                Get Involved
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}