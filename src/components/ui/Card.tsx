import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-slate-100 shadow-sm p-6 ${className} `}
    >
      {children}
    </div>
  );
}
