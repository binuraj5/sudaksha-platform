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
      className="rounded-2xl bg-white flex flex-col overflow-hidden"
      style={{
        boxShadow: 'var(--shadow-card)',
        borderTop: `3px solid ${audience.color}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease-out ${index * 0.15}s, transform 0.6s ease-out ${index * 0.15}s, box-shadow 0.3s`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card-hover)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${audience.color}18` }}>
            {audience.icon}
          </div>
          <h3 className="font-display text-xl font-bold" style={{ color: 'var(--dark)' }}>
            {audience.title}
          </h3>
        </div>
        <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{audience.tagline}</p>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px" style={{ background: 'var(--border)' }} />

      {/* Journey — vertical timeline */}
      <div className="p-6 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-wider mb-4" style={{ color: audience.color }}>
          Typical Journey
        </p>
        <div className="flex flex-col gap-0">
          {audience.journey.map((step, i) => (
            <div key={step} className="flex items-start gap-3 relative">
              {i < audience.journey.length - 1 && (
                <div className="absolute left-[9px] top-5 w-px" style={{ bottom: 0, background: 'var(--border)' }} />
              )}
              <div
                className="w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center font-mono text-[9px] font-bold text-white mt-0.5 z-10"
                style={{ background: audience.color }}
              >
                {i + 1}
              </div>
              <span className="font-body text-sm pb-3.5 leading-snug" style={{ color: 'var(--dark)' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="p-6 pt-2 flex flex-col gap-2">
        <Link
          href={audience.page}
          className="btn-primary text-sm text-center justify-center"
          style={{ background: audience.color, boxShadow: `0 4px 16px ${audience.color}40` }}
        >
          {audience.ctaLabel} →
        </Link>
        <a
          href={audience.portalHref}
          className="btn-ghost text-sm text-center justify-center"
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
    <section className="py-24" style={{ background: 'var(--sky-pale)' }}>
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
