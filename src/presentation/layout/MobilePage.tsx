import type * as React from 'react';

import { MobileBrandHeader } from '@/presentation/layout/MobileBrandHeader';

export function MobilePage({
  action,
  children,
  headerAction,
  subtitle,
  title
}: {
  action: React.ReactNode;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="celebra-mobile-background min-h-dvh w-full min-w-0 max-w-full overflow-x-clip px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 text-slate-50 sm:px-4 sm:pt-5">
      <header className="mb-4 grid min-w-0 gap-4 overflow-hidden sm:mb-5 sm:gap-5">
        <MobileBrandHeader headerAction={headerAction} />
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-[2rem] font-bold leading-tight sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-base text-slate-300 sm:text-lg">{subtitle}</p> : null}
          </div>
          {action ? <div className="mt-1 shrink-0">{action}</div> : null}
        </div>
      </header>
      <div className="grid min-w-0 max-w-full gap-4 overflow-x-clip">{children}</div>
    </div>
  );
}
