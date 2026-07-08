import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-void disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-beacon text-void hover:brightness-110 focus:ring-beacon',
    secondary:
      'border border-mist/30 text-paper hover:bg-panel focus:ring-beacon',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
