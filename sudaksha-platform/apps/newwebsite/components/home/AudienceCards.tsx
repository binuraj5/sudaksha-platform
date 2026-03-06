'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { portalLinks } from '@/lib/portal-links'
import { SectionHeader } from '@/components/shared/SectionHeader'

const audiences = [
  {
    title: 'Enterprise',
    icon: '🏢',
    color: 'var(--royal)',
    tagline: 'Organisational capability at scale.',
    journey: ['Org Diagnostic', 'Competency Mapping', 'Gap Analysis', 'IMPACT Deployment', 'ROI Measurement'],
    page: '/enterprise',
    portalHref: portalLinks.corporate,
    ctaLabel: 'Explore Enterprise',
    portalLabel: 'Start Enterprise Assessment',
  },
  {
    title: 'Institutions',
    icon: '🎓',
    color: 'var(--orange)',
    tagline: 'Graduate employability as a measurable outcome.',
    journey: ['Student Assessment', 'Employability Grading', 'Competency Report', 'Industry Alignment', 'Placement Ready'],
    page: '/institutions',
    portalHref: portalLinks.institution,
    ctaLabel: 'Explore Institutions',
    portalLabel: 'Start Student Assessment',
  },
  {
    title: 'Professionals',
    icon: '👤',
    color: 'var(--bright)',
    tagline: 'Career intelligence that gets you where you want to be.',
    journey: ['SCIP™ Profile', 'Competency Baseline', 'Career Path Map', 'Gap Prescription', 'Track Progress'],
    page: '/professionals',
    portalHref: portalLinks.individual,
    ctaLabel: 'Explore for Professionals',
    portalLabel: 'Get Your Career Profile',
  },
]

function AudienceCard({ audience, index }: { audience: typeof audiences[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="rounded-2xl border bg-white flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{
        borderColor: 'var(--border)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.6s ease-out ${index * 0.15}s, transform 0.6s ease-out ${index * 0.15}s, box-shadow 0.3s, translate 0.3s`,
      }}
    >
      {/* Header */}
      <div className="p-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{audience.icon}</span>
          <h3 className="font-display text-xl font-bold" style={{ color: 'var(--dark)' }}>
            {audience.title}
          </h3>
        </div>
        <p className="font-body text-sm" style={{ color: 'var(--muted)' }}>{audience.tagline}</p>
      </div>

      {/* Journey flow */}
      <div className="p-6 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-wider mb-3" style={{ color: audience.color }}>
          Typical Journey
        </p>
        <div className="flex flex-col gap-2">
          {audience.journey.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center font-mono text-[9px] font-bold text-white"
                style={{ background: audience.color }}
              >
                {i + 1}
              </div>
              <span className="font-body text-sm" style={{ color: 'var(--dark)' }}>{step}</span>
              {i < audience.journey.length - 1 && (
                <div className="w-px h-4 ml-2" style={{ background: 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="p-6 pt-0 flex flex-col gap-2">
        <Link
          href={audience.page}
          className="btn-primary text-sm text-center"
          style={{ background: audience.color }}
        >
          {audience.ctaLabel} →
        </Link>
        <a
          href={audience.portalHref}
          className="btn-ghost text-sm text-center"
          style={{ borderColor: audience.color, color: audience.color }}
        >
          {audience.portalLabel}
        </a>
      </div>
    </div>
  )
}

export function AudienceCards() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Who We Serve"
          title="Built for Every Talent Context"
          subtitle="Whether you're an enterprise building capability at scale, an institution measuring graduate readiness, or a professional architecting your career — Sudaksha is built for you."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((audience, i) => (
            <AudienceCard key={audience.title} audience={audience} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
