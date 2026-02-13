import '@/src/styles/globals.css'
import type { Metadata } from 'next'
import { Inter, Montserrat, Lato } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const lato = Lato({
  weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
})

const inter = Inter({ subsets: ['latin'] })

import { Providers } from '../components/providers'
import { ThemeProvider } from '../contexts/theme-context'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Sudaksha - Bridging Academic Output & Industry Demand | IT Training & Placement',
  description: 'Transform your career with Sudaksha\'s outcome-driven training programs. 85%+ placement rate, 6 LPA+ starting salaries. Finishing school for freshers, upskilling for professionals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${lato.className} ${lato.variable} ${montserrat.variable} min-h-screen bg-background text-foreground overflow-x-hidden font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Providers>
            {children}
            <Toaster position="top-right" expand={false} richColors />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
