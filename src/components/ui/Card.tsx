import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
  className?: string;
  key?: React.Key;
}

export function Card({ children, className, glow = false, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 transition-all duration-300 shadow-2xl",
        glow && "card-glow neon-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h3 className={cn("text-lg font-bold text-white tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return <p className={cn("text-sm text-slate-400", className)}>{children}</p>;
}
