import Link from 'next/link'
import { DashboardMockup } from '@/components/shared/DashboardMockup'
import { SectionHeader } from '@/components/shared/SectionHeader'

const features = [
  'Adaptive IRT-based assessment engine',
  'Multi-tenant: Corporate, Institution, Individual',
  'AI question generation & validation',
  'SCIP™ psychometric profiling built-in',
  'Real-time competency gap analytics',
  'Branded reports & PDF export',
]

export function PlatformSection() {
  return (
    <section className="py-20" style={{ background: 'var(--navy)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <SectionHeader
            eyebrow="The Platform"
            title="Samyak™"
            subtitle="The engine that proves capability — not just measures it."
            align="left"
            light
          />
          <ul className="space-y-2.5 mt-8">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--gradient-orange)' }}
                >
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-body text-sm leading-relaxed" style={{ color: 'var(--lt-muted)' }}>{f}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact?subject=demo" className="btn-orange">
              Request Demo
            </Link>
            <Link href="/samyak" className="btn-ghost-white">
              Learn More
            </Link>
          </div>
        </div>

        {/* Right — mockup with glow */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl" style={{ background: 'radial-gradient(ellipse at center, rgba(33,150,243,0.12) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="relative" style={{ filter: 'drop-shadow(0 0 40px rgba(33,150,243,0.2))' }}>
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
