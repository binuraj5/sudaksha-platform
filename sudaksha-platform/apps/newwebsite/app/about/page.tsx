import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeader } from '@/components/shared/SectionHeader'

export const metadata: Metadata = {
  title: 'About | Sudaksha — Talent Architecture',
  description:
    'Sudaksha Education Pvt Ltd: the talent architecture company built on the belief that capability can be measured, developed, and proven. Operating across India, Africa, and Southeast Asia.',
  keywords: ['Sudaksha', 'talent architecture company', 'OD firm India', 'competency assessment company'],
  openGraph: {
    title: 'About Sudaksha — Talent Architecture & OD',
    description: 'The talent architecture company built on the belief that capability can be measured, developed, and proven.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20" style={{ background: 'var(--ink)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label !text-orange justify-center">About Us</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 leading-tight text-white">
            Built on one conviction:<br />capability can be proven.
          </h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--lt-muted)' }}>
            Sudaksha is a talent architecture and organisational development company. We use science-backed assessment to measure, develop, and prove capability — in enterprises, institutions, and individual professionals.
          </p>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Who We Are" title="The Talent Architecture Company" align="left" />
          <div className="font-body text-base leading-relaxed space-y-5" style={{ color: 'var(--muted)' }}>
            <p>
              We are not a training company. We are not an HR consultancy. We are a talent architecture firm — one that begins every engagement with measurement and ends it with documented, verifiable transformation.
            </p>
            <p>
              Our work sits at the intersection of organisational behaviour, psychometric science, and technology. We believe that capability is not an opinion — it is something you can measure. And once you can measure it, you can architect it.
            </p>
            <p>
              Sudaksha serves three audiences: enterprises that need capability at scale, institutions that need graduate employability as a measurable outcome, and individual professionals who need career intelligence that is more precise than a personality type.
            </p>
          </div>
        </div>
      </section>

      {/* Origin story */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Our Origin" title="Why We Exist" align="left" />
          <div className="font-body text-base leading-relaxed space-y-5" style={{ color: 'var(--muted)' }}>
            <p>
              Sudaksha was founded in response to a persistent frustration: organisations invest heavily in people development, yet rarely measure whether that investment produced any real change in capability.
            </p>
            <p>
              The founders came from organisational psychology, L&D leadership, and HR technology — and they shared a conviction that the industry&apos;s measurement problem was solvable. That conviction became SudAssess™.
            </p>
            <p>
              The platform was built to give practitioners what they had always needed: a rigorous, adaptive, multi-context assessment engine that could generate capability intelligence precise enough to make — and defend — real talent decisions.
            </p>
          </div>
        </div>
      </section>

      {/* The name */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-10 border text-center" style={{ borderColor: 'var(--border)', background: 'var(--sky-pale)' }}>
            <div className="font-display text-5xl font-bold mb-4" style={{ color: 'var(--royal)' }}>सुदक्ष</div>
            <h3 className="font-display text-2xl font-bold mb-3" style={{ color: 'var(--dark)' }}>The Name Sudaksha</h3>
            <p className="font-body text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
              <em>Sudaksha</em> (Sanskrit: सुदक्ष) means <strong style={{ color: 'var(--dark)' }}>highly skilled, very capable, deeply competent.</strong> It carries the sense of excellence that is earned — not assumed. The name captures exactly what we help organisations and individuals achieve: capability that is not claimed, but proven.
            </p>
          </div>
        </div>
      </section>

      {/* Where we operate */}
      <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Where We Work" title="Three Markets. One Standard." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                region: 'India',
                icon: '🇮🇳',
                desc: 'Our home market. We serve enterprises across BFSI, healthcare, manufacturing, and technology — as well as institutions across the education and professional certification sectors.',
              },
              {
                region: 'Africa',
                icon: '🌍',
                desc: 'We have active engagements in East Africa — including government agencies, financial services, and higher education institutions. Our Tanzania Revenue Authority engagement is our flagship African case.',
              },
              {
                region: 'Southeast Asia',
                icon: '🌏',
                desc: 'A growing market for us — particularly in the institutional and professional segments, where demand for validated employability intelligence is outpacing supply.',
              },
            ].map(market => (
              <div key={market.region} className="rounded-2xl p-6 bg-white border" style={{ borderColor: 'var(--border)' }}>
                <div className="text-4xl mb-4">{market.icon}</div>
                <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--dark)' }}>{market.region}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{market.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers anchor */}
      <section id="careers" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader eyebrow="Careers" title="Work at Sudaksha" />
          <p className="font-body text-base leading-relaxed mb-8" style={{ color: 'var(--muted)' }}>
            We are a small, focused team of organisational psychologists, platform builders, and OD practitioners. If you believe capability can be measured — and you want to build the tools that prove it — we want to hear from you.
          </p>
          <Link href="/contact?subject=careers" className="btn-primary">
            Get in Touch
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: 'var(--ink)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to work with us?</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--lt-muted)' }}>
            Tell us about your organisation and what you are trying to achieve.
          </p>
          <Link href="/contact" className="btn-orange">Contact Us →</Link>
        </div>
      </section>
    </>
  )
}
