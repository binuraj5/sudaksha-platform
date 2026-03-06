import type { Metadata } from 'next'
import Link from 'next/link'
import { portalLinks } from '@/lib/portal-links'
import { IMPACT_STEPS } from '@/lib/constants'
import { SectionHeader } from '@/components/shared/SectionHeader'

export const metadata: Metadata = {
  title: 'What We Do | Sudaksha — Talent Architecture',
  description:
    'Sudaksha\'s IMPACT Framework™: a six-stage methodology from diagnostic assessment to measurable transformation. Methodology-first. Outcomes-always.',
  keywords: ['IMPACT Framework', 'talent methodology', 'organizational development', 'competency assessment'],
  openGraph: {
    title: 'What We Do — Methodology-first. Outcomes-always.',
    description: 'The IMPACT Framework™: six stages from diagnostic to transformation. Sudaksha\'s proprietary methodology for capability architecture.',
    type: 'website',
  },
}

export default function WhatWeDoPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 25% 50%, rgba(33,150,243,0.18) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 75% 20%, rgba(245,160,35,0.08) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill-tag justify-center mb-6 mx-auto w-fit">Our Approach</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-tight text-white">
            Methodology-first.<br /><span className="gradient-text">Outcomes-always.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--lt-muted)' }}>
            Most organisations buy training. We architect capability. The difference is not semantic — it is the reason 94% of our engagements deliver measurable ROI.
          </p>
        </div>
      </section>

      {/* IMPACT Framework — expanded */}
      <section id="impact" className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The Framework"
            title="The IMPACT Framework™"
            subtitle="A six-stage proprietary methodology that transforms how organisations think about capability."
          />
          <div className="space-y-6">
            {IMPACT_STEPS.map((step, i) => (
              <div
                key={step.letter}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 items-start rounded-2xl p-8 bg-white border"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center font-display text-3xl font-bold text-white"
                  style={{ background: 'var(--royal)' }}
                >
                  {step.letter}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-2xl font-bold" style={{ color: 'var(--dark)' }}>
                      {step.title}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: 'var(--sky-pale)', color: 'var(--royal)' }}>
                      Stage {step.stage}
                    </span>
                  </div>
                  <p className="font-body text-base font-semibold mb-2" style={{ color: 'var(--dark)' }}>
                    {step.short}
                  </p>
                  <p className="font-body text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {step.long}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why methodology matters */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The Case for Methodology"
            title="Why methodology matters more than content"
          />
          <div className="prose prose-lg max-w-none font-body" style={{ color: 'var(--muted)' }}>
            <p className="text-lg leading-relaxed mb-5">
              Training budgets are consumed. Competency gaps remain. This is not a training problem — it is a methodology problem.
            </p>
            <p className="leading-relaxed mb-5">
              When you start with a diagnostic, you know what you are actually solving. When you map competencies precisely, you build the right prescription. When you measure outcomes with the same rigor you applied to the diagnosis, you prove the investment was real.
            </p>
            <p className="leading-relaxed mb-5">
              The IMPACT Framework™ was designed for clients who are done with activity-based training. It is built for decision-makers who want to see capability measured before, during, and after every engagement — and who need to defend that investment to a board.
            </p>
            <p className="leading-relaxed">
              This is assessment-led, data-informed, outcome-measured organisational development. Not content delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Three audiences */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Who We Serve"
            title="The IMPACT Framework™ in Every Context"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Enterprise', href: '/enterprise', desc: 'Organisational capability at scale — from diagnostic to measurable ROI.', color: 'var(--royal)' },
              { title: 'Institutions', href: '/institutions', desc: 'Graduate employability as a measurable outcome, not an assumption.', color: 'var(--orange)' },
              { title: 'Professionals', href: '/professionals', desc: 'Career intelligence that maps where you are to where you should be.', color: 'var(--bright)' },
            ].map(card => (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-2xl p-8 text-white block transition-transform duration-200 hover:-translate-y-1"
                style={{ background: card.color }}
              >
                <h3 className="font-display text-2xl font-bold mb-3">{card.title}</h3>
                <p className="font-body text-sm leading-relaxed text-white/85">{card.desc}</p>
                <div className="mt-5 font-mono text-sm font-medium">Explore →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: 'var(--ink)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to start with assessment, not assumptions?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--lt-muted)' }}>
            Begin with a free diagnostic assessment and see exactly where your capability stands.
          </p>
          <a href={portalLinks.demo} className="btn-orange">
            Start Free Assessment →
          </a>
        </div>
      </section>
    </>
  )
}
