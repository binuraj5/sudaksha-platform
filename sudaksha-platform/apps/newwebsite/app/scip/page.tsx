import type { Metadata } from 'next'
import Link from 'next/link'
import { portalLinks } from '@/lib/portal-links'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { SCIP_DIMENSIONS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'SCIP™ Career Intelligence Profile | Sudaksha',
  description:
    'The SCIP™ Career Intelligence Profile: four validated dimensions — Self-Concept, Competency, Interest Alignment, and Personality — integrated into one precise career architecture.',
  keywords: ['SCIP', 'career intelligence', 'psychometric profile', 'career assessment', 'competency profile'],
  openGraph: {
    title: 'SCIP™ — Know Yourself. Design Your Career.',
    description: 'The SCIP™ Career Intelligence Profile maps who you are to where you should be. Science-backed. Precision-delivered.',
    type: 'website',
  },
}

const comparisons = [
  {
    tool: 'MBTI',
    purpose: 'Personality typing',
    measuresCompetency: false,
    careerPrescription: false,
    longitudinalTracking: false,
    adaptiveTesting: false,
  },
  {
    tool: 'Thomas PPA',
    purpose: 'Behavioural styles',
    measuresCompetency: false,
    careerPrescription: false,
    longitudinalTracking: false,
    adaptiveTesting: false,
  },
  {
    tool: 'Hogan',
    purpose: 'Leadership risk',
    measuresCompetency: true,
    careerPrescription: false,
    longitudinalTracking: false,
    adaptiveTesting: false,
  },
  {
    tool: 'SCIP™',
    purpose: 'Career intelligence',
    measuresCompetency: true,
    careerPrescription: true,
    longitudinalTracking: true,
    adaptiveTesting: true,
    highlight: true,
  },
]

export default function ScipPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 25% 50%, rgba(33,150,243,0.18) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 75% 20%, rgba(245,160,35,0.08) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill-tag justify-center mb-6 mx-auto w-fit">Psychometric Profile</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-tight text-white">
            Know yourself.<br /><span className="gradient-text">Design your career.</span>
          </h1>
          <p className="mt-6 text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--lt-muted)' }}>
            The SCIP™ Career Intelligence Profile is not a personality type. It is a four-dimensional map of who you are, how you work, what drives you, and where you should go — backed by validated psychometric science.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a href={portalLinks.individual} className="btn-orange">
              Get Your SCIP™ Profile →
            </a>
            <Link href="/professionals" className="btn-glass">
              For Professionals →
            </Link>
          </div>
        </div>
      </section>

      {/* Five dimensions */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="The Framework" title="The Four Dimensions of SCIP™" subtitle="Each dimension is independently validated and psychometrically scored. Together they produce integrated career intelligence." />
          <div className="space-y-5">
            {SCIP_DIMENSIONS.slice(0, 4).map((dim, i) => (
              <div
                key={dim.code}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 items-start rounded-2xl p-8 bg-white border"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center font-mono text-2xl font-bold text-white"
                  style={{ background: dim.color }}
                >
                  {dim.code}
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--dark)' }}>
                    {i + 1}. {dim.title}
                  </h3>
                  <p className="font-body text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {dim.desc}
                  </p>
                  <p className="font-body text-sm mt-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {i === 0 && 'This dimension surfaces the unconscious career assumptions that drive your choices — often before you can articulate them. Understanding your Self-Concept prevents misalignment between who you are and the roles you pursue.'}
                    {i === 1 && 'Unlike self-reported skill lists, SCIP™ Competency scores are derived from adaptive psychometric items — not what you claim, but what you demonstrate. This is the dimension recruiters and managers find most actionable.'}
                    {i === 2 && 'Holland Occupational Codes (RIASEC) and work-value inventories are integrated into this dimension. Your interest alignment score shows you not just what you are good at — but what you will sustain engagement with over a long career.'}
                    {i === 3 && 'The Big Five personality dimensions, adapted for occupational contexts, underpin this score. It shows how you perform under pressure, how you lead and follow, and what environments allow you to do your best work.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report outputs */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Sample Report"
            title="What Your SCIP™ Report Contains"
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: 'Overall Career Readiness Score', desc: 'A composite score benchmarked against role and industry norms.' },
              { label: 'Four-Dimension Breakdown', desc: 'Individual scores per dimension with visual radar chart.' },
              { label: 'Career Path Recommendations', desc: '3–5 recommended career paths with readiness percentages.' },
              { label: 'Top Competency Strengths', desc: 'The 5 competencies where you score highest, with role implications.' },
              { label: 'Priority Development Gaps', desc: 'The 3 gaps that, if closed, most expand your career options.' },
              { label: 'Work Environment Fit', desc: 'The environments, teams, and leadership styles where you will thrive.' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <h4 className="font-display font-bold text-base text-white mb-2">{item.label}</h4>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--lt-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="How We Compare" title="SCIP™ vs Other Psychometric Tools" />
          <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--sky-pale)' }}>
                  <th className="text-left px-5 py-4 font-mono text-xs tracking-wider text-muted">Tool</th>
                  <th className="text-left px-5 py-4 font-mono text-xs tracking-wider text-muted">Purpose</th>
                  <th className="px-5 py-4 font-mono text-xs tracking-wider text-muted text-center">Competency</th>
                  <th className="px-5 py-4 font-mono text-xs tracking-wider text-muted text-center">Career Prescription</th>
                  <th className="px-5 py-4 font-mono text-xs tracking-wider text-muted text-center">Longitudinal</th>
                  <th className="px-5 py-4 font-mono text-xs tracking-wider text-muted text-center">Adaptive</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map(row => (
                  <tr
                    key={row.tool}
                    style={{
                      background: row.highlight ? 'rgba(21,101,192,0.05)' : undefined,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <td className="px-5 py-4">
                      <span
                        className="font-display font-bold text-base"
                        style={{ color: row.highlight ? 'var(--royal)' : 'var(--dark)' }}
                      >
                        {row.tool}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-body text-sm" style={{ color: 'var(--muted)' }}>{row.purpose}</td>
                    {[row.measuresCompetency, row.careerPrescription, row.longitudinalTracking, row.adaptiveTesting].map((val, i) => (
                      <td key={i} className="px-5 py-4 text-center">
                        {val ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span style={{ color: 'var(--lt-muted)' }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: 'var(--ink)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Your career deserves more than a personality type.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--lt-muted)' }}>
            Get your SCIP™ Career Intelligence Profile — 45 minutes. Validated science. Career clarity that lasts.
          </p>
          <a href={portalLinks.individual} className="btn-orange">
            Get Your SCIP™ Profile →
          </a>
        </div>
      </section>
    </>
  )
}
