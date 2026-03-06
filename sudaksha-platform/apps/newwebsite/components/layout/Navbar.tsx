'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Sudaksha"
            width={160}
            height={48}
            priority
            style={{ height: '38px', width: 'auto' }}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const isHighlight = 'highlight' in link && link.highlight
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-2 text-sm font-semibold font-body transition-colors duration-150"
                style={{
                  color: isHighlight ? 'var(--orange)' : isActive ? 'var(--royal)' : 'var(--dark)',
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: 'var(--orange)' }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-md"
          style={{ color: 'var(--dark)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t px-4 pb-4 pt-2 space-y-1"
          style={{ background: 'rgba(255,255,255,0.97)', borderColor: 'var(--border)' }}
        >
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href
            const isHighlight = 'highlight' in link && link.highlight
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold font-body"
                style={{
                  color: isHighlight ? 'var(--orange)' : isActive ? 'var(--royal)' : 'var(--dark)',
                  background: isActive ? 'rgba(21,101,192,0.06)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
