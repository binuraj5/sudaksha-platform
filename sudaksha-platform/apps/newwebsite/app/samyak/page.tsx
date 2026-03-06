import type { Metadata } from 'next'
import Link from 'next/link'
import { DashboardMockup } from '@/components/shared/DashboardMockup'
import { SectionHeader } from '@/components/shared/SectionHeader'

export const metadata: Metadata = {
  title: 'Samyak™ | Sudaksha — Talent Architecture',
  description:
    'Samyak™: the AI-powered adaptive assessment engine built for enterprise, institutional, and individual capability measurement. IRT-based, multi-tenant, SCIP™-integrated.',
  keywords: ['Samyak', 'adaptive assessment', 'IRT', 'CAT', 'competency platform', 'talent assessment software'],
  openGraph: {
    title: 'Samyak™ — The Engine That Proves Capability',
    description: 'AI-powered adaptive assessment. Multi-tenant. IRT-based. Integrated with SCIP™. Built for enterprises, institutions, and professionals.',
    type: 'website',
  },
}

const howItWorks = [
  { step: '01', title: 'Configure Your Assessment', desc: 'Set up competency frameworks, role benchmarks, and question banks through an intuitive admin interface.' },
  { step: '02', title: 'Deploy to Your Cohort', desc: 'Invite participants via email or SSO. Multi-tenant isolation ensures each organisation\'s data stays separate.' },
  { step: '03', title: 'Adaptive Assessment Engine', desc: 'IRT-based CAT adjusts question difficulty in real time based on participant responses. Fewer questions, more precision.' },
  { step: '04', title: 'AI-Powered Scoring', desc: 'Results processed by validated scoring algorithms. Competency levels calculated against role benchmarks.' },
  { step: '05', title: 'Reports & Analytics', desc: 'Individual, team, and organisational reports generated instantly. PDF export, recruiter views, and HRIS-ready data.' },
]

const featureGrid = [
  { icon: '🧠', title: 'Adaptive CAT Engine', desc: 'Item Response Theory (IRT) adaptive testing — precision in 50% fewer questions than fixed-form assessments.' },
  { icon: '🤖', title: 'AI Question Generation', desc: 'GPT-powered question generation validated against your competency framework. Never run out of items.' },
  { icon: '🏢', title: 'Multi-Tenant Architecture', desc: 'Enterprise, Institution, and Individual tenants — each with isolated data, custom branding, and role-level access.' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'Live dashboards for CHROs, L&D heads, and department managers. Competency gap maps at every level.' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'SSO integration, role-based access control, and data residency options. ISO-aligned security architecture.' },
  { icon: '📄', title: 'Branded Reports', desc: 'White-label PDF reports with your institution\'s branding. Recruiter-ready, board-ready, candidate-ready.' },
  { icon: '🔗', title: 'API-First Integration', desc: 'REST API for HRIS, LMS, and ATS integration. Push assessment data into your existing talent tech stack.' },
  { icon: '🌍', title: 'Multi-Language Ready', desc: 'Assessment interface and reports deployable in multiple languages for cross-market engagements.' },
  { icon: '📈', title: 'Longitudinal Tracking', desc: 'Track individual and cohort capability over time. Before vs. after. Cohort vs. cohort. Year vs. year.' },
]

const tenants = [
  {
    name: 'Enterprise',
    icon: '🏢',
    color: 'var(--royal)',
    features: ['Department hierarchy management', 'Team-level gap dashboards', 'Role benchmarking by grade', 'CHRO/L&D reporting suite'],
  },
  {
    name: 'Institution',
    icon: '🎓',
    color: 'var(--orange)',
    features: ['Student cohort management', 'Employability Readiness Score', 'Recruiter portal access', 'Campus-to-placement analytics'],
  },
  {
    name: 'Individual',
    icon: '👤',
    color: 'var(--bright)',
    features: ['SCIP™ Career Intelligence Profile', 'Personal competency dashboard', 'Career path recommendations', 'Progress tracking over time'],
  },
]

const pricingTiers = [
  {
    name: 'Starter',
    price: 'Contact Us',
    desc: 'For institutions or SMEs beginning with capability assessment.',
    features: ['Up to 100 participants', 'Core competency framework', 'Basic reporting', 'Email support'],
    highlight: false,
  },
  {
    name: 'Professional',
    price: 'Contact Us',
    desc: 'For enterprises and institutions scaling across departments.',
    features: ['Up to 1,000 participants', 'Custom competency frameworks', 'Full analytics suite', 'SCIP™ integration', 'Dedicated success manager'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    desc: 'For large-scale, multi-site, or multi-country deployments.',
    features: ['Unlimited participants', 'Custom branding & white-label', 'API access & HRIS integration', 'SLA-backed uptime', 'On-site deployment support'],
    highlight: false,
  },
]

export default function SamyakPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 15% 50%, rgba(33,150,243,0.18) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 80% 20%, rgba(245,160,35,0.1) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="pill-tag mb-6 w-fit">The Platform</div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 leading-tight text-white">
              The Engine That<br />
              <span className="gradient-text">Proves Capability</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: 'var(--lt-muted)' }}>
              Samyak™ is an AI-powered, adaptive assessment platform built for enterprises, institutions, and individual professionals. Not another quiz tool — a capability intelligence engine.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact?subject=samyak-demo" className="btn-orange">
                Book a 30-Min Demo
              </Link>
              <Link href="/scip" className="btn-glass">
                Explore SCIP™ Integration
              </Link>
            </div>
          </div>
          <div>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="How It Works" title="Five Steps from Setup to Insight" />
          <div className="flex flex-col md:flex-row gap-0">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="flex-1 relative">
                <div className="p-6 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-mono text-sm font-bold text-white mx-auto mb-4"
                    style={{ background: 'var(--royal)' }}
                  >
                    {step.step}
                  </div>
                  <h4 className="font-display font-bold text-base mb-2" style={{ color: 'var(--dark)' }}>{step.title}</h4>
                  <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{step.desc}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 text-muted text-lg">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Full Feature Set" title="Everything You Need to Measure Capability" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureGrid.map(f => (
              <div key={f.title} className="rounded-xl p-6 border transition-all duration-300 hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h4 className="font-display font-bold text-base mb-2" style={{ color: 'var(--dark)' }}>{f.title}</h4>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three-tenant architecture */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Architecture"
            title="Built for Three Contexts"
            subtitle="One platform. Three purpose-built tenant environments. Every user gets exactly the experience their context demands."
            light
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tenants.map(t => (
              <div key={t.name} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="text-3xl mb-3">{t.icon}</div>
                <h4 className="font-display font-bold text-xl mb-4 text-white">{t.name}</h4>
                <ul className="space-y-2">
                  {t.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: t.color }} />
                      <span className="font-body text-sm" style={{ color: 'var(--lt-muted)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IRT / CAT explainer */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Assessment Science" title="Why IRT + Adaptive CAT?" />
          <div className="prose prose-lg max-w-none font-body" style={{ color: 'var(--muted)' }}>
            <p className="text-lg leading-relaxed mb-4">
              Classical fixed-form assessments give every participant the same questions — regardless of their ability level. This means high performers are bored by easy items, and low performers are demoralised by impossible ones. Neither gets an accurate score.
            </p>
            <p className="leading-relaxed mb-4">
              Item Response Theory (IRT) models the probability of a correct response based on a person&apos;s latent ability and item difficulty. Computerised Adaptive Testing (CAT) uses this model in real time — selecting the next question based on your performance on the last one.
            </p>
            <p className="leading-relaxed">
              The result: Samyak™ achieves the same measurement precision as a 100-item fixed form in 40–50 items. Faster for participants. More accurate for decision-makers.
            </p>
          </div>
        </div>
      </section>

      {/* SCIP callout */}
      <section className="py-16" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-2xl p-10 bg-white border" style={{ borderColor: 'var(--border)' }}>
            <span className="section-label justify-center">Built-In Integration</span>
            <h3 className="font-display text-2xl font-bold mt-2 mb-3" style={{ color: 'var(--dark)' }}>
              SCIP™ is native to Samyak™
            </h3>
            <p className="font-body text-base leading-relaxed mb-6 max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
              The SCIP™ Career Intelligence Profile is not a third-party add-on. It is built into the Samyak™ engine — individual users get SCIP™ intelligence automatically as part of their assessment experience.
            </p>
            <Link href="/scip" className="btn-primary">
              Learn About SCIP™ →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Pricing" title="Plans Built for Your Scale" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map(tier => (
              <div
                key={tier.name}
                className="rounded-2xl p-6 border flex flex-col"
                style={{
                  borderColor: tier.highlight ? 'var(--royal)' : 'var(--border)',
                  boxShadow: tier.highlight ? '0 0 0 2px var(--royal)' : undefined,
                }}
              >
                {tier.highlight && (
                  <div className="font-mono text-xs text-center py-1 px-3 rounded-full mb-4 self-start" style={{ background: 'var(--royal)', color: 'white' }}>
                    Most Popular
                  </div>
                )}
                <h4 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--dark)' }}>{tier.name}</h4>
                <p className="font-body text-sm mb-4" style={{ color: 'var(--muted)' }}>{tier.desc}</p>
                <ul className="space-y-2 flex-1 mb-6">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'var(--royal)' }}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="font-body text-sm" style={{ color: 'var(--muted)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact?subject=samyak-demo"
                  className={tier.highlight ? 'btn-primary text-center' : 'btn-ghost text-center'}
                >
                  Get a Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: 'var(--ink)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to see Samyak™ in action?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--lt-muted)' }}>
            Book a 30-minute live demo with a Sudaksha platform consultant.
          </p>
          <Link href="/contact?subject=samyak-demo" className="btn-orange">
            Book a 30-Min Demo
          </Link>
        </div>
      </section>
    </>
  )
}
