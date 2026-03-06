const KEYWORDS = [
  'Competency Mapping',
  'Organizational Development',
  'AI-Driven Assessment',
  'Behavioral Science',
  'Talent Architecture',
  'OB Interventions',
  'Workforce Intelligence',
  'Career Intelligence',
]

export function MarqueeStrip() {
  const repeated = [...KEYWORDS, ...KEYWORDS]

  return (
    <div
      className="py-4 overflow-hidden"
      style={{ background: 'linear-gradient(90deg, #f5a023 0%, #e05e10 100%)' }}
    >
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: 'marquee 30s linear infinite' }}
      >
        {repeated.map((kw, i) => (
          <span
            key={`${kw}-${i}`}
            className="inline-flex items-center font-mono text-sm font-medium tracking-wide text-white px-6"
          >
            {kw}
            <span className="mx-6 opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
