import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-24 text-center relative overflow-hidden" style={{ background: 'var(--ink)' }}>
      {/* Orange radial glow behind CTA */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(245,160,35,0.1) 0%, transparent 70%)',
        }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pill-tag justify-center mb-6 mx-auto w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
          Get Started Today
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight text-white">
          Ready to architect<br />
          <span className="gradient-text">real capability?</span>
        </h2>
        <p className="mt-5 text-lg leading-relaxed" style={{ color: 'var(--lt-muted)' }}>
          Book a diagnostic call and we&apos;ll map exactly where your organisation stands — and what it will take to transform it.
        </p>
        <p className="mt-2 font-mono text-sm" style={{ color: 'rgba(144,180,212,0.5)' }}>
          No commitment. Just clarity.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/contact?subject=diagnostic" className="btn-orange">
            Request a Diagnostic Call
          </Link>
          <Link href="/samyak" className="btn-glass">
            Explore Samyak™
          </Link>
        </div>
      </div>
    </section>
  )
}
