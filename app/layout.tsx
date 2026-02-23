import '@/src/styles/globals.css'
import type { Metadata } from 'next'
import { Providers } from '../components/providers'
import { ThemeProvider } from '../contexts/theme-context'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Sudaksha - Bridging Academic Output & Industry Demand | IT Training & Placement',
  description: "Transform your career with Sudaksha's outcome-driven training programs. 85%+ placement rate, 6 LPA+ starting salaries. Finishing school for freshers, upskilling for professionals.",
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
        {/* Fonts loaded at browser runtime — avoids build-time Google Fonts network fetch */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lato:wght@100;300;400;700;900&family=Montserrat:wght@100..900&display=swap"
        />
      </head>
      <body
        className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans"
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
