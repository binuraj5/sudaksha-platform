import Link from 'next/link'
import { portalLinks } from '@/lib/portal-links'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { SCIP_DIMENSIONS } from '@/lib/constants'

export function ScipSection() {
  return (
    <section className="py-20" style={{ background: 'var(--sky-pale)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Psychometric Profile"
          title="The SCIP™ Career Intelligence Profile"
          subtitle="A four-dimensional psychometric profile that maps who you are to where you should be — backed by validated behavioural science."
        />

        {/* SCIP wheel + cards layout */}
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Wheel */}
          <div className="flex-shrink-0">
            <div className="relative w-56 h-56 mx-auto">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {SCIP_DIMENSIONS.map((dim, i) => {
                  const angle = (i / SCIP_DIMENSIONS.length) * 2 * Math.PI - Math.PI / 2
                  const r = 72
                  const x = 100 + r * Math.cos(angle)
                  const y = 100 + r * Math.sin(angle)
                  return (
                    <g key={dim.code}>
                      <circle cx={x} cy={y} r="22" fill={dim.color} opacity={0.85} />
                      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                        fill="white" fontSize="11" fontWeight="700" fontFamily="monospace">
                        {dim.code}
                      </text>
                    </g>
                  )
                })}
                <circle cx="100" cy="100" r="30" fill="var(--royal)" />
                <text x="100" y="100" textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="10" fontWeight="700" fontFamily="monospace">
                  SCIP™
                </text>
              </svg>
            </div>
          </div>

          {/* Dimension cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCIP_DIMENSIONS.map(dim => (
              <div
                key={dim.code}
                className="rounded-xl p-4 bg-white border"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold text-white"
                    style={{ background: dim.color }}
                  >
                    {dim.code}
                  </div>
                  <h4 className="font-display font-semibold text-sm" style={{ color: 'var(--dark)' }}>
                    {dim.title}
                  </h4>
                </div>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {dim.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center flex flex-wrap gap-4 justify-center">
          <a href={portalLinks.individual} className="btn-primary">
            Get Your SCIP™ Profile →
          </a>
          <Link href="/scip" className="btn-ghost">
            Learn About SCIP™
          </Link>
        </div>
      </div>
    </section>
  )
}
