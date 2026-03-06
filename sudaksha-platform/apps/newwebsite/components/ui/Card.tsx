import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border bg-white p-6',
        hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
      style={{ borderColor: 'var(--border)' }}
    >
      {children}
    </div>
  )
}
