import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sudaksha.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sudaksha — Talent Transformation & Organizational Development',
    template: '%s | Sudaksha',
  },
  description:
    'AI-powered competency assessment, organizational development, and talent transformation. Powered by Samyak™ and SCIP™.',
  keywords: [
    'talent transformation',
    'competency assessment',
    'organizational development',
    'Samyak',
    'SCIP',
    'career intelligence',
    'workforce development',
    'employee assessment',
    'HR technology India',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    siteName: 'Sudaksha',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sudaksha',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Talent transformation company specialising in competency assessment, organisational development, and career intelligence.',
  contactPoint: { '@type': 'ContactPoint', contactType: 'sales', url: `${SITE_URL}/contact` },
  sameAs: ['https://linkedin.com/company/sudaksha'],
}

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Sudaksha',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/thinking?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
