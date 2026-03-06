import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeader } from '@/components/shared/SectionHeader'

export const metadata: Metadata = {
  title: 'Thinking | Sudaksha — Talent Architecture',
  description:
    'Sudaksha\'s thought leadership on talent architecture, assessment science, career intelligence, and organizational development strategy.',
  keywords: ['talent architecture', 'OD thought leadership', 'assessment science', 'career intelligence articles'],
  openGraph: {
    title: 'Thinking — Sudaksha Thought Leadership',
    description: 'Insights on talent architecture, assessment science, and organizational development from the Sudaksha team.',
    type: 'website',
  },
}

const categories = ['All', 'Talent Architecture', 'Assessment Science', 'Career Intelligence', 'OD Strategy']

const articles = [
  {
    slug: 'why-competency-frameworks-fail',
    category: 'Talent Architecture',
    title: 'Why Most Competency Frameworks Collect Dust',
    excerpt: 'Organisations spend months building competency frameworks — then never use them. The problem is not the framework. It is the absence of an operationalisation plan.',
    readTime: '6 min',
    date: 'February 2026',
  },
  {
    slug: 'irt-vs-classical-testing',
    category: 'Assessment Science',
    title: 'IRT vs Classical Testing: Why Adaptive Matters',
    excerpt: 'Fixed-form assessments treat all participants equally — which means they measure none of them accurately. Here is the science behind why adaptive testing changes everything.',
    readTime: '8 min',
    date: 'January 2026',
  },
  {
    slug: 'scip-vs-mbti-career-decisions',
    category: 'Career Intelligence',
    title: 'Why MBTI Is Not a Career Map',
    excerpt: 'Personality types describe how you behave. They do not tell you which roles you are ready for, which you can reach, or what capability gaps stand between you and your career goals.',
    readTime: '5 min',
    date: 'January 2026',
  },
  {
    slug: 'measuring-od-roi',
    category: 'OD Strategy',
    title: 'How to Measure the ROI of Organisational Development',
    excerpt: 'L&D ROI does not have to be a black box. Here is a practical framework for measuring capability lift, productivity improvement, and retention impact from OD interventions.',
    readTime: '7 min',
    date: 'December 2025',
  },
  {
    slug: 'graduate-employability-crisis',
    category: 'Talent Architecture',
    title: 'The Graduate Employability Crisis Is a Data Problem',
    excerpt: 'Employers say graduates are unprepared. Institutions say graduates are job-ready. Both might be right — because neither is using the same measurement system.',
    readTime: '6 min',
    date: 'December 2025',
  },
  {
    slug: 'building-assessment-led-culture',
    category: 'OD Strategy',
    title: 'Building an Assessment-Led Talent Culture',
    excerpt: 'The most capable organisations do not just hire well — they measure capability continuously. Here is what it takes to embed assessment into your talent operating model.',
    readTime: '9 min',
    date: 'November 2025',
  },
]

export default function ThinkingPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20" style={{ background: 'var(--ink)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label !text-orange justify-center">Thought Leadership</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 leading-tight text-white">
            The Sudaksha Thinking
          </h1>
          <p className="mt-5 text-lg" style={{ color: 'var(--lt-muted)' }}>
            Perspectives on talent architecture, assessment science, career intelligence, and the science of organisational transformation.
          </p>
        </div>
      </section>

      {/* Article grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                className="font-mono text-xs px-4 py-2 rounded-full border transition-colors duration-150"
                style={{
                  borderColor: cat === 'All' ? 'var(--royal)' : 'var(--border)',
                  color: cat === 'All' ? 'var(--royal)' : 'var(--muted)',
                  background: cat === 'All' ? 'rgba(21,101,192,0.07)' : 'transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link
                key={article.slug}
                href={`/thinking/${article.slug}`}
                className="rounded-2xl border bg-white flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Category bar */}
                <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--sky-pale)', color: 'var(--royal)' }}>
                    {article.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-lg leading-snug mb-3" style={{ color: 'var(--dark)' }}>
                    {article.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed flex-1" style={{ color: 'var(--muted)' }}>
                    {article.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-xs" style={{ color: 'var(--lt-muted)' }}>{article.date}</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{article.readTime} read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
