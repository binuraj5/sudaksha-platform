import type { Metadata } from 'next'
import Link from 'next/link'
import { portalLinks } from '@/lib/portal-links'
import { SectionHeader } from '@/components/shared/SectionHeader'

export const metadata: Metadata = {
  title: 'Institutions | Sudaksha — Talent Architecture',
  description:
    'Sudaksha for institutions: graduate employability as a measurable outcome. Samyak™ student assessment, employability grading, and recruiter-ready reports.',
  keywords: ['graduate employability', 'student assessment', 'institution talent', 'Samyak education'],
  openGraph: {
    title: 'Graduate Employability Architecture for Institutions',
    description: 'Your students deserve to be hired — not just graduated. Sudaksha makes employability measurable.',
    type: 'website',
  },
}

const pipeline = [
  { step: '01', title: 'Campus Onboarding', desc: 'Institution registered. Student cohorts mapped. Assessment parameters set.' },
  { step: '02', title: 'Baseline Assessment', desc: 'All students complete the Samyak™ employability diagnostic across competency domains.' },
  { step: '03', title: 'Employability Grading', desc: 'Each student receives an Employability Readiness Score (ERS) and a detailed competency breakdown.' },
  { step: '04', title: 'Gap-Based Development', desc: 'Targeted workshops, online modules, and coaching prescribed based on individual gap profiles.' },
  { step: '05', title: 'Post-Intervention Remeasurement', desc: 'Students reassessed. Score improvement documented. Institution gets aggregate analytics.' },
  { step: '06', title: 'Recruiter-Ready Reports', desc: 'Employers receive verified competency reports — replacing subjective interviews with data.' },
  { step: '07', title: 'Placement Tracking', desc: 'Placements tracked against student ERS. Institution reports demonstrate employability ROI.' },
]

export default function InstitutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(245,160,35,0.15) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 75% 20%, rgba(33,150,243,0.1) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="pill-tag justify-center mb-6 mx-auto w-fit">For Institutions</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-tight text-white">
            Your students deserve to be hired —<br /><span className="gradient-text">not just graduated.</span>
          </h1>
          <p className="mt-6 text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--lt-muted)' }}>
            Employability is not an outcome you can claim. It is one you must prove. Sudaksha makes graduate readiness measurable — for students, institutions, and recruiters.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link href="/contact?subject=institution-demo" className="btn-orange">
              Book a Campus Assessment
            </Link>
            <a href={portalLinks.institution} className="btn-glass">
              Start a Student Assessment
            </a>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="The Challenge" title="The Graduate Employability Problem" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { stat: '72%', label: 'of graduates are considered unprepared by employers in emerging markets' },
              { stat: '3× ', label: 'more time wasted in interviews that could be resolved by verified assessments' },
              { stat: '0', label: 'standardised employability data shared between institutions and recruiters in most markets' },
              { stat: '₹ ?', label: 'the actual ROI of your institution\'s L&D investment — unmeasured' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-6 border" style={{ borderColor: 'var(--border)', background: 'var(--sky-pale)' }}>
                <div className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--royal)' }}>{item.stat}</div>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="The Process"
            title="The Graduate Employability Pipeline™"
            subtitle="Seven steps from enrolment to verified placement — with measurement at every stage."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.slice(0, 4).map(s => (
              <div key={s.step} className="rounded-xl p-5 bg-white border" style={{ borderColor: 'var(--border)' }}>
                <div className="font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>Step {s.step}</div>
                <h4 className="font-display font-bold text-base mb-2" style={{ color: 'var(--dark)' }}>{s.title}</h4>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {pipeline.slice(4).map(s => (
              <div key={s.step} className="rounded-xl p-5 bg-white border" style={{ borderColor: 'var(--border)' }}>
                <div className="font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>Step {s.step}</div>
                <h4 className="font-display font-bold text-base mb-2" style={{ color: 'var(--dark)' }}>{s.title}</h4>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three-way value triangle */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="The Value" title="Three Winners. One Platform." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                who: 'Institution',
                icon: '🏫',
                color: 'var(--royal)',
                points: [
                  'Prove graduate employability with data',
                  'Differentiate in accreditation & ranking',
                  'Track cohort competency improvement year-on-year',
                  'Report L&D ROI to governing boards',
                ],
              },
              {
                who: 'Student',
                icon: '👩‍🎓',
                color: 'var(--orange)',
                points: [
                  'Know your real employability score',
                  'Receive a personalised gap-based development plan',
                  'Walk into interviews with a verified competency report',
                  'Track your career readiness progress',
                ],
              },
              {
                who: 'Recruiter',
                icon: '🤝',
                color: 'var(--bright)',
                points: [
                  'Access verified student competency profiles',
                  'Replace guesswork with data-driven shortlisting',
                  'Compare candidates across institutions',
                  'Reduce time-to-hire with pre-assessed talent',
                ],
              },
            ].map(card => (
              <div key={card.who} className="rounded-2xl p-6 border" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{card.icon}</span>
                  <h3 className="font-display text-xl font-bold" style={{ color: 'var(--dark)' }}>{card.who}</h3>
                </div>
                <ul className="space-y-2">
                  {card.points.map(p => (
                    <li key={p} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: card.color }} />
                      <span className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement timeline */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Engagement Model" title="Typical Campus Engagement Timeline" />
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: 'var(--border)' }} />
            {[
              { week: 'Week 1–2', label: 'Scoping & Setup', desc: 'Institution briefing, cohort definition, platform configuration, student onboarding.' },
              { week: 'Week 3–4', label: 'Diagnostic Assessment', desc: 'All students complete Samyak™. Results processed. ERS generated per student.' },
              { week: 'Week 5–8', label: 'Gap-Based Intervention', desc: 'Workshops and coaching deployed based on cohort and individual gap profiles.' },
              { week: 'Week 9–10', label: 'Remeasurement', desc: 'Post-intervention Samyak™. Score comparison. Institution analytics report.' },
              { week: 'Ongoing', label: 'Placement & Tracking', desc: 'Recruiter access, placement tracking, year-on-year benchmark reporting.' },
            ].map(t => (
              <div key={t.week} className="relative flex gap-6 mb-6 pl-16">
                <div className="absolute left-5 top-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center" style={{ background: 'var(--royal)' }}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div>
                  <div className="font-mono text-xs mb-0.5" style={{ color: 'var(--orange)' }}>{t.week}</div>
                  <div className="font-display font-bold text-base mb-1" style={{ color: 'var(--dark)' }}>{t.label}</div>
                  <div className="font-body text-sm" style={{ color: 'var(--muted)' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: 'var(--ink)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Make employability your institution&apos;s strongest claim.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--lt-muted)' }}>
            Book a campus assessment consultation — we will design a programme specific to your institution&apos;s cohort size and context.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact?subject=institution-demo" className="btn-orange">
              Book a Campus Assessment
            </Link>
            <a href={portalLinks.institution} className="btn-glass">
              Start a Student Assessment
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
