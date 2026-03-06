import type { Metadata } from 'next'
import Link from 'next/link'
import { portalLinks } from '@/lib/portal-links'
import { SectionHeader } from '@/components/shared/SectionHeader'

export const metadata: Metadata = {
  title: 'Enterprise | Sudaksha — Talent Architecture',
  description:
    'Sudaksha for Enterprise: competency-based capability architecture for corporates. Samyak™ multi-tenant platform with role-level ROI measurement across 18+ sectors.',
  keywords: ['enterprise talent development', 'competency assessment', 'corporate OD', 'Samyak enterprise'],
  openGraph: {
    title: 'Enterprise Talent Architecture — Stop Training. Start Transforming.',
    description: 'Sudaksha architects measurable capability for enterprises. From C-suite to frontline — diagnostic to ROI.',
    type: 'website',
  },
}

const painPoints = [
  { icon: '❌', title: 'Training spend with no measurable outcome', desc: 'Budgets spent on programmes that cannot prove impact. Boards ask why — L&D cannot answer.' },
  { icon: '❌', title: 'Competency frameworks that collect dust', desc: 'Frameworks built, validated, approved — and never operationalised into hiring or development decisions.' },
  { icon: '❌', title: 'No single talent intelligence layer', desc: 'Assessment data, performance data, and L&D data live in three different systems. No integrated picture of capability.' },
  { icon: '❌', title: 'Generic programmes for heterogeneous teams', desc: 'One training programme for 50 people with 50 different gap profiles. Inefficient by design.' },
]

const features = [
  'Role-level competency benchmarking',
  'Department and team gap dashboards',
  'AI-generated, validated question banks',
  'Adaptive CAT — precise in fewer questions',
  'Multi-rater (360°) assessment capability',
  'Branded white-label reports',
  'HRIS / LMS API integration',
  'Real-time analytics for CHRO / L&D',
]

const roleHierarchy = [
  { role: 'Super Admin', scope: 'Full platform oversight' },
  { role: 'Tenant Admin', scope: 'Organisation-wide control' },
  { role: 'Department Head', scope: 'Department-level management' },
  { role: 'Team Leader', scope: 'Team-level assignment & tracking' },
  { role: 'Employee', scope: 'Assessment & personal dashboard' },
]

export default function EnterprisePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(33,150,243,0.18) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 80% 20%, rgba(245,160,35,0.08) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill-tag justify-center mb-6 mx-auto w-fit">For Enterprise</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-tight text-white">
            Stop training people.<br /><span className="gradient-text">Start transforming.</span>
          </h1>
          <p className="mt-6 text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--lt-muted)' }}>
            Sudaksha delivers assessment-led organisational development for enterprises that need capability they can measure, defend, and scale.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/contact?subject=enterprise-demo" className="btn-orange">
              Request Enterprise Demo
            </Link>
            <a href={portalLinks.corporate} className="btn-glass">
              Start with an Assessment
            </a>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The Problem"
            title="The Corporate Talent Problem"
            subtitle="We have heard these four times. In every sector. In every market. They are not training problems — they are measurement problems."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {painPoints.map(p => (
              <div key={p.title} className="rounded-xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--dark)' }}>{p.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Sudaksha serves Enterprise */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="How We Work"
            title="The Sudaksha Enterprise Engagement"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stage: '01', title: 'Organisational Diagnostic',
                desc: 'We deploy a full-scope competency diagnostic across your selected population — assessing behavioural, cognitive, and role-specific capability against validated benchmarks.',
              },
              {
                stage: '02', title: 'Competency Gap Analysis',
                desc: 'Samyak™ generates individual, team, and department-level gap maps. You see exactly where capability falls short of role requirements — by person, by level, by function.',
              },
              {
                stage: '03', title: 'Prescribed Interventions',
                desc: 'We prescribe targeted interventions based on the gaps identified — not a generic curriculum. Each cohort gets a different development prescription.',
              },
              {
                stage: '04', title: 'Deployment & Adoption',
                desc: 'We manage end-to-end deployment: briefing leaders, running the assessments, managing adoption, and resolving resistance in real time.',
              },
              {
                stage: '05', title: 'Embedding Capability',
                desc: 'We train your internal team to sustain the capability change — through manager coaching, system embedding, and feedback loop design.',
              },
              {
                stage: '06', title: 'ROI Measurement',
                desc: 'Post-intervention, we run a remeasurement using Samyak™. We compare against the baseline diagnostic and calculate the documented capability lift.',
              },
            ].map(step => (
              <div key={step.stage} className="rounded-xl p-6 bg-white border" style={{ borderColor: 'var(--border)' }}>
                <div className="font-mono text-xs mb-3" style={{ color: 'var(--muted)' }}>Stage {step.stage}</div>
                <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--dark)' }}>{step.title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Samyak features */}
      <section className="py-20" style={{ background: 'var(--navy)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The Platform"
            title="Samyak™ for Enterprise"
            light
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(f => (
              <div key={f} className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'var(--orange)' }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-body text-sm" style={{ color: 'var(--lt-muted)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role hierarchy */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Platform Hierarchy"
            title="Role Levels We Serve"
            subtitle="Samyak™ Enterprise gives each level the access and intelligence they need — nothing more, nothing less."
          />
          <div className="relative flex flex-col items-center gap-0">
            {roleHierarchy.map((r, i) => (
              <div key={r.role} className="relative w-full max-w-lg">
                <div
                  className="rounded-xl px-6 py-4 text-white text-center"
                  style={{
                    background: `hsl(${220 - i * 12}, ${70 - i * 5}%, ${25 + i * 8}%)`,
                    marginLeft: `${i * 24}px`,
                    marginRight: `${i * 24}px`,
                  }}
                >
                  <div className="font-display font-bold text-base">{r.role}</div>
                  <div className="font-mono text-xs mt-0.5 text-white/70">{r.scope}</div>
                </div>
                {i < roleHierarchy.length - 1 && (
                  <div className="flex justify-center">
                    <div className="w-0.5 h-3" style={{ background: 'var(--border)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case study teaser */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-8 md:p-12 bg-white border" style={{ borderColor: 'var(--border)' }}>
            <span className="section-label">Case Study</span>
            <h3 className="font-display text-2xl font-bold mt-2 mb-4" style={{ color: 'var(--dark)' }}>
              Tanzania Revenue Authority — ICT Department
            </h3>
            <p className="font-body text-base leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
              A government agency with 120+ ICT professionals needed a structured approach to technical competency development across multiple grade levels. The department faced growing complexity in digital infrastructure with no clear competency baseline to guide hiring, promotion, or development decisions.
            </p>
            <p className="font-body text-base leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
              Sudaksha deployed the IMPACT Framework™: a full competency diagnostic across all ICT roles, a custom competency framework built to government standards, and a Samyak™ deployment that assessed the entire department within a 3-week window.
            </p>
            <p className="font-body text-base leading-relaxed font-semibold" style={{ color: 'var(--dark)' }}>
              Outcome: The agency now has a documented competency baseline, a promotion-readiness matrix, and a structured L&D roadmap — all grounded in measurement, not manager opinion.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: 'var(--ink)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to prove your capability investment?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--lt-muted)' }}>
            Book a 30-minute enterprise diagnostic call. We will show you exactly where your capability stands and what it will take to move it.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact?subject=enterprise-demo" className="btn-orange">
              Request Enterprise Demo
            </Link>
            <a href={portalLinks.corporate} className="btn-ghost-white">
              Start with an Assessment
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
