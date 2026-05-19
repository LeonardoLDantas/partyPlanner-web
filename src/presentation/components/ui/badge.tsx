import * as React from 'react';

import { cn } from '@/shared/utils/cn';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-foreground',
        className
      )}
      {...props}
    />
  );
}
