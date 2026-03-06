import type { Metadata } from 'next'
import Link from 'next/link'

// Static articles data — in production this would come from a CMS
const articles: Record<string, {
  category: string
  title: string
  date: string
  readTime: string
  content: string
}> = {
  'why-competency-frameworks-fail': {
    category: 'Talent Architecture',
    title: 'Why Most Competency Frameworks Collect Dust',
    date: 'February 2026',
    readTime: '6 min',
    content: `
Organisations spend months — sometimes years — building competency frameworks. They bring in consultants, run workshops, validate against international benchmarks, get sign-off from the CHRO, and then... nothing happens.

The framework sits in a document. Managers reference it in appraisal season. L&D builds a training catalogue loosely aligned to it. Recruiters occasionally read the job specifications derived from it. But it never becomes the operational backbone of talent decisions.

**The problem is not the framework. It is the absence of an operationalisation plan.**

A competency framework is a taxonomy — a structured vocabulary for describing capability. It is necessary but not sufficient. What makes it useful is measurement infrastructure: a way to assess where individuals actually stand against the framework, at scale, with precision.

Without measurement, a competency framework is just vocabulary. With measurement, it becomes intelligence.

**The three gaps that cause frameworks to fail:**

**1. No assessment layer.** The framework describes what good looks like. But without a validated instrument to measure how close people are to "good," the framework is decorative. Measurement turns the framework into a gap map — and gap maps create action.

**2. No integration into decisions.** Competency data must inform hiring decisions, promotion decisions, and development investment. If it lives in a separate HR system that managers never consult, it will not change behaviour.

**3. No leadership visibility.** When CEOs and CHROs can see competency data in a dashboard — by team, by department, by role — they start asking questions. Questions create accountability. Accountability drives adoption.

**The fix:**

Operationalise before you launch. Design the assessment instrument, the management dashboards, and the decision integration points before the framework is published. Make it impossible for managers to make talent decisions without referencing competency data.

That is what SudAssess™ was built to do.
    `.trim(),
  },
  'irt-vs-classical-testing': {
    category: 'Assessment Science',
    title: 'IRT vs Classical Testing: Why Adaptive Matters',
    date: 'January 2026',
    readTime: '8 min',
    content: `
In classical test theory, every participant answers the same questions. The test is built for the average — which means it is too easy for high performers and too hard for low performers. Neither group is measured accurately.

Item Response Theory (IRT) approaches this differently. Instead of modelling total scores, IRT models the probability that a person with a given ability level will answer a specific item correctly. This allows us to estimate ability from any subset of items — not just a fixed set.

Computerised Adaptive Testing (CAT) applies this in real time. After each response, the algorithm selects the next item based on the participant's estimated ability. If you answer correctly, the next item is harder. If you answer incorrectly, it is easier. The assessment converges on a precise ability estimate in approximately half the number of items required by a fixed-form test.

**Why this matters for organisations:**

Fixed-form assessments plateau in precision. After a certain number of items, additional questions add noise rather than signal. CAT eliminates this inefficiency.

More importantly, adaptive assessments feel more appropriate to the participant. Executives are not asked basic questions. Junior staff are not demoralised by items designed for senior roles. This reduces test anxiety, improves response quality, and produces more valid scores.

SudAssess™ uses a 3-parameter logistic (3PL) IRT model — accounting for item difficulty, discrimination, and guessing — combined with a Maximum a Posteriori (MAP) ability estimator. The result is measurement precision equivalent to a 100-item fixed form achieved in 40–50 adaptive items.
    `.trim(),
  },
}

// Generate static params for known slugs
export function generateStaticParams() {
  return Object.keys(articles).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]
  if (!article) return { title: 'Article | Sudaksha' }
  return {
    title: `${article.title} | Sudaksha`,
    description: article.content.slice(0, 160),
    openGraph: { title: article.title, type: 'article' },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = articles[slug]

  if (!article) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--dark)' }}>Article not found</h1>
        <Link href="/thinking" className="btn-primary mt-6 inline-block">← Back to Thinking</Link>
      </div>
    )
  }

  return (
    <>
      <section className="pt-32 pb-12" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/thinking" className="font-mono text-sm inline-flex items-center gap-2 mb-6" style={{ color: 'var(--muted)' }}>
            ← Our Thinking
          </Link>
          <span className="font-mono text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--white)', color: 'var(--royal)', border: '1px solid var(--border)' }}>
            {article.category}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-4 leading-tight" style={{ color: 'var(--dark)' }}>
            {article.title}
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{article.date}</span>
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>{article.readTime} read</span>
          </div>
        </div>
      </section>

      <article className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-body text-base leading-relaxed space-y-5" style={{ color: 'var(--muted)' }}>
            {article.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**') && !paragraph.slice(2).includes('**')) {
                return (
                  <h2 key={i} className="font-display text-xl font-bold mt-8" style={{ color: 'var(--dark)' }}>
                    {paragraph.replace(/\*\*/g, '')}
                  </h2>
                )
              }
              return (
                <p
                  key={i}
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--dark)">$1</strong>'),
                  }}
                />
              )
            })}
          </div>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <Link href="/thinking" className="font-mono text-sm" style={{ color: 'var(--royal)' }}>
              ← Back to Our Thinking
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
