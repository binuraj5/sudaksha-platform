import { clsx } from 'clsx'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  light?: boolean
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={clsx(
        'mb-12',
        align === 'center' && 'text-center',
        className
      )}
    >
      {eyebrow && (
        <span className={clsx('section-label', light && '!text-orange')}>
          {eyebrow}
        </span>
      )}
      <h2
        className={clsx(
          'font-display text-3xl md:text-4xl font-bold leading-tight mt-2',
          light ? 'text-white' : 'text-dark'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={clsx(
            'mt-4 text-lg max-w-2xl leading-relaxed',
            align === 'center' && 'mx-auto',
            light ? 'text-lt-muted' : 'text-muted'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
