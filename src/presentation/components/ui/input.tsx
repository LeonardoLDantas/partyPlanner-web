import * as React from 'react';

import { cn } from '@/shared/utils/cn';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-input px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export function Field({
  label,
  error,
  className,
  children
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('grid gap-2 text-sm font-medium text-foreground', className)}>
      <span>{label}</span>
      {children}
      {error ? <small className="text-xs font-medium text-destructive">{error}</small> : null}
    </label>
  );
}
