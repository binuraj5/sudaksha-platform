import Link from 'next/link'
import { portalLinks } from '@/lib/portal-links'

function ButterflyLogo() {
  return (
    <svg width="38" height="34" viewBox="0 0 38 34" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="14" rx="12" ry="10" fill="#2196F3" opacity="0.9" transform="rotate(-20 12 14)" />
      <ellipse cx="26" cy="10" rx="10" ry="7" fill="#F5A023" opacity="0.95" transform="rotate(15 26 10)" />
      <ellipse cx="10" cy="22" rx="9" ry="7" fill="#1565C0" opacity="0.7" transform="rotate(10 10 22)" />
      <ellipse cx="24" cy="20" rx="7" ry="5" fill="#FF9800" opacity="0.7" transform="rotate(-10 24 20)" />
      <ellipse cx="18" cy="17" rx="2" ry="9" fill="#1A1A2E" opacity="0.6" />
      <line x1="18" y1="8" x2="13" y2="2" stroke="#1A1A2E" strokeWidth="1.2" opacity="0.5" />
      <line x1="18" y1="8" x2="23" y2="2" stroke="#1A1A2E" strokeWidth="1.2" opacity="0.5" />
      <circle cx="13" cy="2" r="1.2" fill="#1A1A2E" opacity="0.5" />
      <circle cx="23" cy="2" r="1.2" fill="#1A1A2E" opacity="0.5" />
    </svg>
  )
}

const footerLinks = {
  services: [
    { label: 'What We Do', href: '/what-we-do' },
    { label: 'Enterprise', href: '/enterprise' },
    { label: 'Institutions', href: '/institutions' },
    { label: 'Professionals', href: '/professionals' },
    { label: 'IMPACT Framework™', href: '/what-we-do#impact' },
  ],
  platform: [
    { label: 'SudAssess™', href: '/sudassess', internal: true },
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
              <ButterflyLogo />
              <div>
                <div className="font-display font-bold text-lg tracking-tight text-white">SUDAKSHA</div>
                <div className="font-mono text-[9px] tracking-widest uppercase footer-link-muted">
                  Talent Transformation
                </div>
              </div>
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
