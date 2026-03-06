import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { MarqueeStrip } from '@/components/home/MarqueeStrip'
import { ImpactFramework } from '@/components/home/ImpactFramework'
import { AudienceCards } from '@/components/home/AudienceCards'
import { SectorsStrip } from '@/components/home/SectorsStrip'
import { PlatformSection } from '@/components/home/PlatformSection'
import { ScipSection } from '@/components/home/ScipSection'
import { WhySudaksha } from '@/components/home/WhySudaksha'
import { CtaSection } from '@/components/home/CtaSection'

export const metadata: Metadata = {
  title: 'Sudaksha — Talent Architecture & Organizational Development',
  description:
    'AI-powered competency assessment, organizational development, and talent architecture for enterprises, institutions, and professionals. Powered by Samyak™ and SCIP™.',
  keywords: ['talent architecture', 'competency mapping', 'OD', 'Samyak', 'SCIP', 'organizational development'],
  openGraph: {
    title: 'Sudaksha — Talent Architecture & Organizational Development',
    description: 'We don\'t train people. We transform organizations. Science-backed capability architecture powered by Samyak™.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeStrip />
      <ImpactFramework />
      <AudienceCards />
      <SectorsStrip />
      <PlatformSection />
      <ScipSection />
      <WhySudaksha />
      <CtaSection />
    </>
  )
}
