import { SECTORS } from '@/lib/constants'

export function SectorsStrip() {
  return (
    <section className="py-16" style={{ background: 'var(--royal)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-xs text-center tracking-widest uppercase text-white/50 mb-8">
          Sectors We Architect Capability In
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
          {SECTORS.map(sector => (
            <div key={sector.label} className="flex flex-col items-center gap-2 text-center group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-200 group-hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                {sector.icon}
              </div>
              <span className="font-mono text-[10px] text-white/70 leading-tight">{sector.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
