import { CalendarDays } from 'lucide-react';
import type * as React from 'react';

import type { Party } from '@/domain/entities/party';
import { getPartyCoverImage } from '@/domain/utils/party.utils';
import { formatShortDateLabel } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';

type PartySelectorProps = {
  parties: Party[];
  selectedParty: Party | null;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onPartyClick: (partyId: string) => void;
};

export function DesktopPartySelector({
  parties,
  selectedParty,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPartyClick
}: PartySelectorProps) {
  const selectableParties = parties.filter((party) => !party.isFinalized);

  if (selectableParties.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card/70 p-3 shadow-xl backdrop-blur-xl">
      <div
        className="flex min-w-0 cursor-grab touch-pan-x select-none gap-2 overflow-x-auto pb-1 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {selectableParties.map((party) => {
          const isActive = selectedParty?.id === party.id;

          return (
            <button
              className={cn(
                'grid min-w-[230px] grid-cols-[48px_minmax(0,1fr)] items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all',
                isActive
                  ? 'border-sky-300/50 bg-sky-400/12 shadow-[0_14px_34px_rgba(14,165,233,0.14)]'
                  : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
              )}
              key={party.id}
              onClick={() => onPartyClick(party.id)}
              type="button"
            >
              <img alt="" className="h-12 w-12 rounded-md object-cover" src={getPartyCoverImage(party)} />
              <span className="min-w-0">
                <strong className="block truncate text-sm text-foreground">{party.name}</strong>
                <span className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays size={13} />
                  <span className="truncate">{formatShortDateLabel(party.date)}</span>
                  {party.time ? <span className="shrink-0">as {party.time}</span> : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function MobilePartySelector({
  parties,
  selectedParty,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPartyClick
}: PartySelectorProps) {
  const selectableParties = parties.filter((party) => !party.isFinalized);

  if (selectableParties.length === 0) {
    return null;
  }

  return (
    <section className="max-w-full overflow-hidden rounded-[18px] border border-white/10 bg-panel/88 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
      <div
        className="flex max-w-full cursor-grab touch-pan-x select-none gap-2 overflow-x-auto active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {selectableParties.map((party) => {
          const isActive = selectedParty?.id === party.id;

          return (
            <button
              className={cn(
                'grid min-w-[174px] max-w-[174px] grid-cols-[36px_minmax(0,1fr)] items-center gap-2 rounded-[13px] border px-2 py-1.5 text-left transition-all',
                isActive
                  ? 'border-sky-300/50 bg-sky-400/15 shadow-[0_10px_24px_rgba(14,165,233,0.18)]'
                  : 'border-white/10 bg-white/[0.045]'
              )}
              key={party.id}
              onClick={() => onPartyClick(party.id)}
              type="button"
            >
              <img alt="" className="h-9 w-9 rounded-[9px] object-cover" src={getPartyCoverImage(party)} />
              <span className="min-w-0">
                <strong className="block truncate text-[0.73rem] font-bold text-slate-50">{party.name}</strong>
                <span className="mt-0.5 block truncate text-[0.62rem] font-semibold text-slate-400">
                  {formatShortDateLabel(party.date)}
                  {party.time ? ` às ${party.time}` : ''}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
