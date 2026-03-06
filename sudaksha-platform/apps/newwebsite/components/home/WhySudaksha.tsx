import { SectionHeader } from '@/components/shared/SectionHeader'

const usps = [
  {
    icon: '🔬',
    title: 'Science-First',
    desc: 'Every assessment is built on validated psychometric frameworks — IRT, CAT, and behavioural science — not opinion.',
  },
  {
    icon: '📐',
    title: 'Methodology Before Tools',
    desc: "We don't sell software. We architect capability. The platform serves the methodology, not the other way around.",
  },
  {
    icon: '📊',
    title: 'Proven ROI',
    desc: 'We measure what we claim. Every engagement has defined KPIs and post-intervention measurement built in.',
  },
  {
    icon: '🌍',
    title: 'Cross-Context Expertise',
    desc: 'From Tanzanian government agencies to Indian institutions to Southeast Asian corporates — we adapt without losing precision.',
  },
  {
    icon: '🤝',
    title: 'Long-Term Partners',
    desc: "We don't do one-shot training. We stay until capability is embedded in systems, not just in people's heads.",
  },
  {
    icon: '🏆',
    title: 'Multi-Tenant Platform',
    desc: 'One platform built for three contexts. Enterprise, institutional, and individual users get purpose-built experiences — not a one-size-fits-all product.',
  },
]

export function WhySudaksha() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why Sudaksha"
          title="Built Different. For Good Reason."
          subtitle="Most training organisations measure activity. We measure outcomes. Here is what sets us apart."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {usps.map(usp => (
            <div
              key={usp.title}
              className="card-hover rounded-2xl p-6"
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: 'var(--sky-pale)' }}>
                {usp.icon}
              </div>
              <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--dark)' }}>
                {usp.title}
              </h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {usp.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
