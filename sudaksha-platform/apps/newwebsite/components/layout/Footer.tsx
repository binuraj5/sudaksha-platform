import Link from 'next/link'
import Image from 'next/image'
import { portalLinks } from '@/lib/portal-links'

const footerLinks = {
  services: [
    { label: 'What We Do', href: '/what-we-do' },
    { label: 'Enterprise', href: '/enterprise' },
    { label: 'Institutions', href: '/institutions' },
    { label: 'Professionals', href: '/professionals' },
    { label: 'IMPACT Framework™', href: '/what-we-do#impact' },
  ],
  platform: [
    { label: 'Samyak™', href: '/samyak', internal: true },
    { label: 'SCIP™ Profile', href: '/scip', internal: true },
    { label: 'Start Free Assessment', href: portalLinks.demo, internal: false },
    { label: 'Login to Portal', href: portalLinks.login, internal: false },
    { label: 'Request Demo', href: '/contact?subject=demo', internal: true },
  ],
  company: [
    { label: 'About Us', href: '/about', internal: true },
    { label: 'Our Thinking', href: '/thinking', internal: true },
    { label: 'Case Studies', href: '/thinking#case-studies', internal: true },
    { label: 'Careers', href: '/about#careers', internal: true },
    { label: 'Contact', href: '/contact', internal: true },
  ],
}

export function Footer() {
  return (
    <footer style={{ background: 'var(--navy)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="Sudaksha"
                width={140}
                height={42}
                style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <p className="font-body text-sm leading-relaxed footer-link-muted">
              Talent by Design. Performance by Science.
            </p>
            <p className="font-body text-sm leading-relaxed mt-3 footer-link-dim">
              Serving corporates, institutions, and professionals across India, Africa, and Southeast Asia.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase mb-5 footer-link-sky">
              Services
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link font-body text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase mb-5 footer-link-sky">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map(link => (
                <li key={link.label}>
                  {link.internal ? (
                    <Link href={link.href} className="footer-link font-body text-sm">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="footer-link font-body text-sm">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase mb-5 footer-link-sky">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link font-body text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(21,101,192,0.2)' }}
        >
          <p className="font-mono text-xs footer-link-dim">
            © {new Date().getFullYear()} Sudaksha Education (P) Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="footer-link-subtle font-mono text-xs">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link-subtle font-mono text-xs">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
