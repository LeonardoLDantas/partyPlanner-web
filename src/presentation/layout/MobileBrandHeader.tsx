import { PartyPopper } from 'lucide-react';
import type * as React from 'react';

export function MobileBrandHeader({ headerAction }: { headerAction?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="celebra-brand-mark grid h-10 w-10 shrink-0 place-items-center rounded-[13px] shadow-[0_14px_30px_rgba(14,165,233,0.28)] sm:h-11 sm:w-11 sm:rounded-[14px]">
          <PartyPopper size={23} />
        </div>
        <strong className="celebra-brand-text min-w-0 truncate text-[1.55rem] font-extrabold leading-none sm:text-[1.78rem]">
          Celebra
        </strong>
      </div>
      <div className="shrink-0">{headerAction}</div>
    </div>
  );
}
