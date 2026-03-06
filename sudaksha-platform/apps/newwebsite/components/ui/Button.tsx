'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-body',
  {
    variants: {
      variant: {
        primary:  'bg-royal text-white hover:bg-mid-blue hover:-translate-y-px focus-visible:ring-royal',
        orange:   'bg-orange text-white hover:bg-orange-lt hover:-translate-y-px focus-visible:ring-orange',
        ghost:    'border-[1.5px] border-royal text-royal hover:bg-royal/10',
        ghostWhite: 'border-[1.5px] border-white/50 text-white hover:bg-white/10 hover:border-white/80',
        outline:  'border-[1.5px] border-muted text-dark hover:border-royal hover:text-royal',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-[0.9375rem]',
        lg: 'px-8 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
