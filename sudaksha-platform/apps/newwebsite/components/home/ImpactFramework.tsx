'use client'

import { useEffect, useRef, useState } from 'react'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { IMPACT_STEPS } from '@/lib/constants'

function ImpactCard({ step, index }: { step: typeof IMPACT_STEPS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative cursor-pointer"
      style={{
        perspective: '1000px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease-out ${index * 0.08}s, transform 0.5s ease-out ${index * 0.08}s`,
      }}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease',
          height: '220px',
        }}
      >
        {/* Front — glass card */}
        <div
          className="glass-card absolute inset-0 p-5 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center font-display text-2xl font-bold text-white"
              style={{ background: 'var(--gradient-brand)' }}
            >
              {step.letter}
            </div>
            <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {step.stage}
            </span>
          </div>
          <h3 className="font-display text-base font-bold mt-auto text-white">
            {step.title}
          </h3>
          <p className="font-body text-sm mt-1" style={{ color: 'rgba(144,180,212,0.85)' }}>
            {step.short}
          </p>
          <p className="font-mono text-[9px] mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Tap to learn more
          </p>
        </div>

        {/* Back — gradient */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--gradient-brand)',
          }}
        >
          <div className="font-mono text-[10px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Stage {step.stage} — {step.letter}
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-3">{step.title}</h3>
          <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {step.long}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ImpactFramework() {
  return (
    <section id="impact" className="py-20 relative" style={{ background: 'var(--navy)' }}>
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(33,150,243,0.4), rgba(245,160,35,0.25), transparent)' }} aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Methodology"
          title="The IMPACT Framework™"
          subtitle="Every Sudaksha engagement follows a six-stage proprietary methodology that moves from diagnosis to measurable transformation."
          light
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {IMPACT_STEPS.map((step, i) => (
            <ImpactCard key={step.letter} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
