import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'orange' | 'sky' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'blue', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase',
        {
          'bg-royal/10 text-royal': variant === 'blue',
          'bg-orange/10 text-orange': variant === 'orange',
          'bg-sky/20 text-bright': variant === 'sky',
          'bg-muted/10 text-muted': variant === 'muted',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
