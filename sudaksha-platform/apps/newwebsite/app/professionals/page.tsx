import type { Metadata } from 'next'
import Link from 'next/link'
import { portalLinks } from '@/lib/portal-links'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { SCIP_DIMENSIONS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Professionals | Sudaksha — Talent Architecture',
  description:
    'Sudaksha for professionals: the SCIP™ Career Intelligence Profile maps your competencies, personality, and interests to a precise career architecture. Get your profile today.',
  keywords: ['career intelligence', 'SCIP profile', 'competency self-assessment', 'career planning'],
  openGraph: {
    title: 'Career Intelligence for Professionals — Know Where. Go Faster.',
    description: 'You know where you are. Sudaksha helps you get where you want to be — faster. The SCIP™ Career Intelligence Profile.',
    type: 'website',
  },
}

const journey = [
  {
    step: '01',
    title: 'Take the SCIP™ Assessment',
    desc: 'Complete a validated 45-minute adaptive assessment covering all four SCIP™ dimensions — from your own device, at your own time.',
  },
  {
    step: '02',
    title: 'Receive Your Intelligence Report',
    desc: 'Within 24 hours, get a detailed report: your competency scores, personality profile, interest alignment, and integrated career intelligence.',
  },
  {
    step: '03',
    title: 'Understand Your Career Map',
    desc: 'Your report includes a career path analysis — which roles you are ready for now, which you could reach with focused development, and what that development looks like.',
  },
  {
    step: '04',
    title: 'Track Your Progress',
    desc: 'Reassess at 6 and 12 months. See your capability growth quantified. Build a documented development story that employers can verify.',
  },
]

const reportOutputs = [
  { title: 'Competency Baseline Score', desc: 'Your overall capability score across behavioural and cognitive domains, benchmarked against role-level norms.' },
  { title: 'Four-Dimension SCIP™ Breakdown', desc: 'Detailed scores across Self-Concept, Competency, Interest Alignment, and Personality.' },
  { title: 'Career Path Recommendations', desc: '3–5 specific career paths recommended based on your full profile — with readiness scores for each.' },
  { title: 'Development Priorities', desc: 'The top 3 competencies that, if developed, would most significantly expand your career options.' },
  { title: 'Role Readiness Indicators', desc: 'Honest readiness ratings for current vs. aspirational roles — with gap size and development time estimates.' },
]

export default function ProfessionalsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20" style={{ background: 'var(--ink)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label !text-orange justify-center">For Professionals</span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-tight text-white">
            You know where you are.<br />We help you get where<br />you want to be — faster.
          </h1>
          <p className="mt-6 text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--lt-muted)' }}>
            Career decisions made on guesswork cost years. The SCIP™ Career Intelligence Profile replaces guesswork with a validated psychometric map of your capability and your potential.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a href={portalLinks.individual} className="btn-orange">
              Start Your Career Profile →
            </a>
            <Link href="/scip" className="btn-ghost-white">
              Learn About SCIP™
            </Link>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="The Problem" title="The Career Clarity Problem" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '🔎', title: 'You do not know your actual competency level', desc: 'You have a sense of your strengths — but no validated, structured data on where you actually stand relative to the roles you want.' },
              { icon: '🗺️', title: 'No map from current to ideal', desc: 'You know where you are and where you want to go — but no one has shown you the specific gaps between those two states.' },
              { icon: '⏳', title: 'Wasted development time', desc: 'You invest in skills because everyone else does — not because your specific profile tells you those skills will move you forward.' },
              { icon: '📄', title: 'Unverifiable claims in interviews', desc: 'Every candidate claims competence. You need something that makes your capability verifiable — not just assertable.' },
            ].map(p => (
              <div key={p.title} className="rounded-xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3 className="font-display font-bold text-base mb-2" style={{ color: 'var(--dark)' }}>{p.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="The Process" title="How It Works for You" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {journey.map(j => (
              <div key={j.step} className="rounded-xl p-6 bg-white border" style={{ borderColor: 'var(--border)' }}>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm font-bold text-white mb-4"
                  style={{ background: 'var(--royal)' }}
                >
                  {j.step}
                </div>
                <h4 className="font-display font-bold text-base mb-2" style={{ color: 'var(--dark)' }}>{j.title}</h4>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{j.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCIP breakdown */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The Framework"
            title="The SCIP™ Career Intelligence Profile"
            subtitle="Four validated dimensions. One integrated career intelligence."
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCIP_DIMENSIONS.slice(0, 4).map(dim => (
              <div key={dim.code} className="rounded-xl p-5 text-white" style={{ background: dim.color }}>
                <div className="font-mono text-3xl font-bold mb-3 opacity-80">{dim.code}</div>
                <h4 className="font-display font-bold text-lg mb-2">{dim.title}</h4>
                <p className="font-body text-sm leading-relaxed text-white/80">{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report outputs */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="What You Get" title="Your SCIP™ Report — What Is Inside" />
          <div className="space-y-4">
            {reportOutputs.map((r, i) => (
              <div key={r.title} className="flex gap-5 rounded-xl p-5 border" style={{ borderColor: 'var(--border)' }}>
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-mono text-sm font-bold text-white"
                  style={{ background: 'var(--royal)' }}
                >
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-display font-bold text-base mb-1" style={{ color: 'var(--dark)' }}>{r.title}</h4>
                  <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: 'var(--ink)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Stop guessing. Start architecting.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--lt-muted)' }}>
            Your SCIP™ profile takes 45 minutes. The clarity it gives you lasts years.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={portalLinks.individual} className="btn-orange">
              Start Your Career Profile →
            </a>
            <Link href="/scip" className="btn-ghost-white">
              Learn About SCIP™
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
