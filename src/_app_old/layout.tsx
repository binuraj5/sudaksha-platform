import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Providers } from '../../components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sudaksha - Professional IT Training Platform',
  description: 'Professional IT training and education platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-50 overflow-x-hidden">
        <Providers>
          <Header />
          <main className="w-full">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
