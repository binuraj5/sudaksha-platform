import type { Metadata } from 'next'
import { portalLinks } from '@/lib/portal-links'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Sudaksha — Talent Architecture',
  description:
    'Get in touch with Sudaksha. Book a demo, request a diagnostic call, or ask about enterprise assessment — we respond within one business day.',
  keywords: ['contact Sudaksha', 'book demo', 'enterprise assessment inquiry'],
  openGraph: {
    title: 'Contact Sudaksha',
    description: 'Book a demo, request a diagnostic call, or talk to us about capability architecture for your organisation.',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 25% 50%, rgba(33,150,243,0.18) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 75% 20%, rgba(245,160,35,0.08) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill-tag justify-center mb-6 mx-auto w-fit">Get In Touch</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 leading-tight text-white">
            Let&apos;s talk <span className="gradient-text">capability.</span>
          </h1>
          <p className="mt-5 text-lg" style={{ color: 'var(--lt-muted)' }}>
            Whether you are ready to start an engagement or just want to understand what assessment-led OD looks like — we want to hear from you.
          </p>
        </div>
      </section>

      {/* Form + details */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
            {/* Form */}
            <div>
              <ContactForm />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="rounded-2xl p-6 border" style={{ borderColor: 'var(--border)', background: 'var(--sky-pale)' }}>
                <h4 className="font-display font-bold text-base mb-4" style={{ color: 'var(--dark)' }}>Contact Details</h4>
                <div className="space-y-3">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Email</div>
                    <a href="mailto:hello@sudaksha.com" className="font-body text-sm" style={{ color: 'var(--royal)' }}>
                      hello@sudaksha.com
                    </a>
                  </div>
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Response Time</div>
                    <p className="font-body text-sm" style={{ color: 'var(--dark)' }}>Within 1 business day</p>
                  </div>
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Operating Markets</div>
                    <p className="font-body text-sm" style={{ color: 'var(--dark)' }}>India · East Africa · Southeast Asia</p>
                  </div>
                </div>
              </div>

              {/* Portal notice */}
              <div className="rounded-xl p-5 border" style={{ borderColor: 'rgba(21,101,192,0.2)', background: 'rgba(21,101,192,0.04)' }}>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Looking to log in or access your assessments?{' '}
                  <a href={portalLinks.login} className="font-semibold" style={{ color: 'var(--royal)' }}>
                    Go to the Assessment Portal →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
