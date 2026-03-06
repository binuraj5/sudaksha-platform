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
          <ul className="space-y-3 mt-8">
            {features.map(f => (
              <li key={f} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--orange)' }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

        {/* Right */}
        <div>
          <DashboardMockup />
        </div>
      </div>
    </section>
  )
}
