'use client'

import { portalLinks } from '@/lib/portal-links'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'

function OrbitVisual() {
  return (
    <div className="relative w-full max-w-md mx-auto h-80 flex items-center justify-center">
      {/* Outer orbit ring */}
      <div
        className="absolute w-72 h-72 rounded-full border"
        style={{
          borderColor: 'rgba(33,150,243,0.15)',
          animation: 'orbitSpin 30s linear infinite',
        }}
      />
      {/* Middle orbit ring */}
      <div
        className="absolute w-52 h-52 rounded-full border"
        style={{
          borderColor: 'rgba(245,160,35,0.2)',
          animation: 'orbitSpin 20s linear infinite reverse',
        }}
      />

      {/* Center node */}
      <div
        className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--royal), var(--bright))',
          boxShadow: '0 0 40px rgba(21,101,192,0.4)',
          animation: 'float 6s ease-in-out infinite',
        }}
      >
        <svg width="38" height="34" viewBox="0 0 38 34" fill="none">
          <ellipse cx="12" cy="14" rx="12" ry="10" fill="#fff" opacity="0.9" transform="rotate(-20 12 14)" />
          <ellipse cx="26" cy="10" rx="10" ry="7" fill="#F5A023" opacity="0.95" transform="rotate(15 26 10)" />
          <ellipse cx="10" cy="22" rx="9" ry="7" fill="#fff" opacity="0.5" transform="rotate(10 10 22)" />
          <ellipse cx="24" cy="20" rx="7" ry="5" fill="#FF9800" opacity="0.7" transform="rotate(-10 24 20)" />
          <ellipse cx="18" cy="17" rx="2" ry="9" fill="#0d1b3e" opacity="0.6" />
        </svg>
      </div>

      {/* Orbit nodes */}
      {[
        { label: 'Assess', angle: 0, color: '#1565c0' },
        { label: 'Map', angle: 72, color: '#f5a023' },
        { label: 'Prescribe', angle: 144, color: '#2196f3' },
        { label: 'Transform', angle: 216, color: '#64b5f6' },
        { label: 'Commit', angle: 288, color: '#1976d2' },
      ].map((node, i) => {
        const rad = (node.angle - 90) * (Math.PI / 180)
        const r = 136
        const x = 50 + (r / 2.88) * Math.cos(rad)
        const y = 50 + (r / 2.88) * Math.sin(rad)
        return (
          <div
            key={node.label}
            className="absolute flex flex-col items-center"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-mono text-[9px] font-medium shadow-lg"
              style={{ background: node.color }}
            >
              {node.label.slice(0, 3)}
            </div>
          </div>
        )
      })}

      {/* Floating metric cards */}
      <div
        className="absolute -right-4 top-6 bg-white rounded-xl px-3 py-2 shadow-xl border text-center"
        style={{ borderColor: 'var(--border)', animation: 'float 5s ease-in-out infinite 1s' }}
      >
        <div className="font-display font-bold text-2xl" style={{ color: 'var(--royal)' }}>94%</div>
        <div className="font-mono text-[9px] text-muted">ROI Measured</div>
      </div>
      <div
        className="absolute -left-4 bottom-10 bg-white rounded-xl px-3 py-2 shadow-xl border text-center"
        style={{ borderColor: 'var(--border)', animation: 'float 7s ease-in-out infinite 0.5s' }}
      >
        <div className="font-display font-bold text-2xl" style={{ color: 'var(--orange)' }}>500+</div>
        <div className="font-mono text-[9px] text-muted">Organisations</div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section
      className="min-h-screen flex items-center pt-16"
      style={{ background: 'var(--ink)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <span className="section-label !text-orange">Talent Architecture Platform</span>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mt-4"
            style={{ color: 'var(--white)' }}
          >
            We Transform
            <span style={{ color: 'var(--orange)' }}> Careers.</span>
          </h1>
          <p
            className="mt-6 text-lg leading-relaxed max-w-xl"
            style={{ color: 'var(--lt-muted)' }}
          >
            Sudaksha architects measurable capability — through science-backed assessment, precise competency mapping, and organizational development that proves ROI.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#impact" className="btn-orange">
              Explore Our Approach →
            </a>
            <a href={portalLinks.demo} className="btn-ghost-white">
              Start Free Assessment
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-8">
            {[
              { value: 500, suffix: '+', label: 'Organizations' },
              { value: 94, suffix: '%', label: 'Measured ROI' },
              { value: 18, suffix: '+', label: 'Sectors' },
            ].map(stat => (
              <div key={stat.label}>
                <div
                  className="font-display text-3xl font-bold"
                  style={{ color: 'var(--orange)' }}
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="font-mono text-xs mt-1" style={{ color: 'var(--lt-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex justify-center lg:justify-end">
          <OrbitVisual />
        </div>
      </div>
    </section>
  )
}
