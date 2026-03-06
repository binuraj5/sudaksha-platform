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
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl p-5 flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            background: 'var(--white)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center font-display text-2xl font-bold"
              style={{ background: 'var(--sky-pale)', color: 'var(--royal)' }}
            >
              {step.letter}
            </div>
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              Stage {step.stage}
            </span>
          </div>
          <h3 className="font-display text-lg font-bold mt-auto" style={{ color: 'var(--dark)' }}>
            {step.title}
          </h3>
          <p className="font-body text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {step.short}
          </p>
          <p className="font-mono text-[10px] mt-3" style={{ color: 'var(--lt-muted)' }}>
            Click to learn more
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl p-5 flex flex-col justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--royal)',
          }}
        >
          <div className="font-mono text-xs text-white/60 mb-2">Stage {step.stage} — {step.letter}</div>
          <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
          <p className="font-body text-sm leading-relaxed text-white/85">{step.long}</p>
        </div>
      </div>
    </div>
  )
}

export function ImpactFramework() {
  return (
    <section id="impact" className="py-20" style={{ background: 'var(--sky-pale)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Methodology"
          title="The IMPACT Framework™"
          subtitle="Every Sudaksha engagement follows a six-stage proprietary methodology that moves from diagnosis to measurable transformation."
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
