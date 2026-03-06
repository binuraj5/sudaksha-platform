import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="py-24 text-center" style={{ background: 'var(--ink)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="section-label !text-orange justify-center">Get Started</span>
        <h2
          className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight"
          style={{ color: 'var(--white)' }}
        >
          Ready to architect real capability?
        </h2>
        <p className="mt-5 text-lg" style={{ color: 'var(--lt-muted)' }}>
          Book a diagnostic call and we&apos;ll map exactly where your organisation stands — and what it will take to transform it.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/contact?subject=diagnostic" className="btn-orange">
            Request a Diagnostic Call
          </Link>
          <Link href="/sudassess" className="btn-ghost-white">
            Explore SudAssess™
          </Link>
        </div>
      </div>
    </section>
  )
}
