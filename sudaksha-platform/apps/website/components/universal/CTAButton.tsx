'use client';

import { useCTAModalContext } from '@/context/CTAModalContext';
import { CTAContext } from '@/types/cta';

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ctx: CTAContext;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'custom';
}

export function CTAButton({ ctx, children, className = '', variant = 'primary', ...props }: CTAButtonProps) {
  const { openModal } = useCTAModalContext();
  
  return (
    <button
      {...props}
      className={variant === 'custom' ? className : `cta-btn cta-btn--${variant} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        if (props.onClick) props.onClick(e);
        openModal(ctx);
      }}
    >
      {children}
    </button>
  );
}
