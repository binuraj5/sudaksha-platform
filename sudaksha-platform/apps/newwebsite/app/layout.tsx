import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sudaksha.com'),
  title: {
    default: 'Sudaksha — Talent Transformation & Organizational Development',
    template: '%s | Sudaksha',
  },
  description:
    'AI-powered competency assessment, organizational development, and talent transformation. Powered by Samyak™.',
  keywords: [
    'talent transformation',
    'competency assessment',
    'organizational development',
    'Samyak',
    'SCIP',
    'career intelligence',
    'workforce development',
  ],
  openGraph: {
    siteName: 'Sudaksha',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
