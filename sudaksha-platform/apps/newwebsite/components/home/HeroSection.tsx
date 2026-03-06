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
      className="min-h-screen flex items-center pt-16 relative overflow-hidden"
      style={{ background: 'var(--ink)' }}
    >
      {/* Animated mesh gradient layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 15% 40%, rgba(33,150,243,0.22) 0%, transparent 65%)',
          animation: 'meshDrift 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 85% 15%, rgba(245,160,35,0.1) 0%, transparent 65%)',
          animation: 'meshDrift 20s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 50% 70% at 65% 85%, rgba(21,101,192,0.14) 0%, transparent 65%)',
          animation: 'meshDrift 17s ease-in-out infinite 4s',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          {/* Pill badge */}
          <div className="pill-tag mb-6 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
            Talent Transformation Platform
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            <span style={{ color: 'var(--white)' }}>We Transform</span>
            <br />
            <span className="gradient-text">Careers.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-xl" style={{ color: 'var(--lt-muted)' }}>
            Science-backed competency assessment, precise talent mapping, and organisational development that proves ROI — for enterprises, institutions, and individual professionals.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#impact" className="btn-orange">
              Explore Our Approach →
            </a>
            <a href={portalLinks.demo} className="btn-glass">
              Start Free Assessment
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-8 sm:gap-12">
            {[
              { value: 500, suffix: '+', label: 'Organizations' },
              { value: 94, suffix: '%', label: 'Measured ROI' },
              { value: 18, suffix: '+', label: 'Sectors' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="w-8 h-0.5 mb-2 rounded-full" style={{ background: 'var(--gradient-orange)' }} />
                <div className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--white)' }}>
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
