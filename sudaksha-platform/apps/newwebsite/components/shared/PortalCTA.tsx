import { portalLinks } from '@/lib/portal-links'
import { clsx } from 'clsx'

interface PortalCTAProps {
  variant: 'corporate' | 'institution' | 'individual' | 'demo' | 'login'
  label?: string
  size?: 'sm' | 'md' | 'lg'
  style?: 'filled' | 'ghost' | 'outline'
  source?: string
  className?: string
}

const defaultLabels: Record<PortalCTAProps['variant'], string> = {
  corporate:   'Start for Enterprise',
  institution: 'Start for Institutions',
  individual:  'Start Your Career Profile',
  demo:        'Start Free Assessment',
  login:       'Login to Portal',
}

const urls: Record<PortalCTAProps['variant'], string> = {
  corporate:   portalLinks.corporate,
  institution: portalLinks.institution,
  individual:  portalLinks.individual,
  demo:        portalLinks.demo,
  login:       portalLinks.login,
}

export function PortalCTA({
  variant,
  label,
  size = 'md',
  style = 'filled',
  source,
  className,
}: PortalCTAProps) {
  const rawUrl = urls[variant]
  const href = source ? portalLinks.withSource(rawUrl, source) : rawUrl
  const text = label ?? defaultLabels[variant]

  return (
    <a
      href={href}
      className={clsx(
        'inline-flex items-center gap-2 font-semibold rounded-md transition-all duration-200 font-body',
        {
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-[0.9375rem]': size === 'md',
          'px-8 py-4 text-base': size === 'lg',
          'bg-royal text-white hover:bg-mid-blue hover:-translate-y-px': style === 'filled',
          'border-[1.5px] border-royal text-royal hover:bg-royal/10': style === 'ghost',
          'border-[1.5px] border-muted text-dark hover:border-royal hover:text-royal': style === 'outline',
        },
        className
      )}
    >
      {text} →
    </a>
  )
}
