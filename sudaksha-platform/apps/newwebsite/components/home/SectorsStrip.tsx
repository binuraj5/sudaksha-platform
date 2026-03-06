import { SECTORS } from '@/lib/constants'

export function SectorsStrip() {
  return (
    <section className="py-14 relative overflow-hidden" style={{ background: 'var(--navy)' }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(21,101,192,0.15) 0%, transparent 50%, rgba(245,160,35,0.06) 100%)' }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-[10px] text-center tracking-widest uppercase mb-8" style={{ color: 'rgba(144,180,212,0.5)' }}>
          Sectors We Architect Capability In
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-5">
          {SECTORS.map(sector => (
            <div key={sector.label} className="flex flex-col items-center gap-2 text-center group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 group-hover:scale-110 group-hover:-translate-y-1"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {sector.icon}
              </div>
              <span className="font-mono text-[9px] leading-tight" style={{ color: 'rgba(144,180,212,0.65)' }}>{sector.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
