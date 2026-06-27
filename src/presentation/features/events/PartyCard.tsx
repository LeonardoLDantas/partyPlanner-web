import { Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

import type { Party } from '@/domain/entities/party';
import { getDaysLeftLabel, getPartyCategoryLabel, getPartyProgress, isEventDateUpcoming } from '@/domain/utils/party.utils';
import { Badge } from '@/presentation/components/ui/badge';
import { MetricMini } from '@/presentation/components/dashboard/DashboardShared';
import { formatDateLabel } from '@/shared/utils/formatters';
import { currencyFormatter } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';

type PartyCardProps = {
  party: Party;
  index: number;
  isActive: boolean;
  onSelect: (partyId: string) => void;
  onEdit: (party: Party) => void;
  onToggleFinalized: (party: Party) => void;
};

export function PartyCard({ party, index, isActive, onSelect, onEdit, onToggleFinalized }: PartyCardProps) {
  const allGuests = party.convites.flatMap((c) => c.guests);
  const confirmed = allGuests.filter((guest) => guest.status === 'Confirmado').length;
  const progress = getPartyProgress(party);

  return (
    <motion.button
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group grid min-h-72 gap-5 rounded-lg border p-5 text-left transition-all duration-200',
        isActive
          ? 'celebra-selected-surface border-sky-300/70'
          : 'border-border bg-card hover:-translate-y-1 hover:border-sky-300/40'
      )}
      initial={{ opacity: 0, y: 14 }}
      key={party.id}
      onClick={() => onSelect(party.id)}
      transition={{ delay: index * 0.035, duration: 0.18 }}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge className="border-sky-300/20 bg-sky-400/10 text-sky-100">{getPartyCategoryLabel(party.category)}</Badge>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
          {party.isFinalized ? 'Finalizada' : getDaysLeftLabel(party.date)}
        </span>
      </div>

      <div>
        <h3 className="text-2xl font-semibold leading-tight text-foreground">{party.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {formatDateLabel(party.date)} às {party.time || '--:--'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricMini label="Confirmados" value={String(confirmed)} />
        <MetricMini label="Tarefas" value={`${progress}%`} />
        <MetricMini label="Gasto" value={currencyFormatter.format(party.budget.spent)} />
      </div>

      <div className="mt-auto">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="celebra-progress-fill h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isEventDateUpcoming(party) ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <span
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(party);
            }}
            role="button"
            tabIndex={0}
          >
            <Edit3 size={15} />
            Editar
          </span>
          <span
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFinalized(party);
            }}
            role="button"
            tabIndex={0}
          >
            {party.isFinalized ? 'Reabrir evento' : 'Finalizar evento'}
          </span>
        </div>
      ) : null}
    </motion.button>
  );
}
