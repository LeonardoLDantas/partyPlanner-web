import { CalendarDays, CheckCheck, Edit3, MapPinned } from 'lucide-react';
import { motion } from 'motion/react';

import { partyCategories } from '@/domain/constants/party.constants';
import {
  getDaysLeftLabel,
  getPartyCategoryLabel,
  getPartyCoverImage,
  getPartyProgress,
  getMapsUrl,
  isEventDateUpcoming,
  isUpcomingParty
} from '@/domain/utils/party.utils';
import { Button } from '@/presentation/components/ui/button';
import { MetricMini } from '@/presentation/components/dashboard/DashboardShared';
import type { DashboardState, PartyCategoryFilter } from '@/presentation/hooks/useDashboardState';
import type { Party } from '@/domain/entities/party';
import { currencyFormatter, formatDateLabel, formatOptionalBudget } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';

type EventsSectionProps = {
  filteredParties: DashboardState['filteredParties'];
  selectedParty: DashboardState['selectedParty'];
  categoryFilter: DashboardState['categoryFilter'];
  onCategoryChange: (category: PartyCategoryFilter) => void;
  onSelectParty: (partyId: string) => void;
  onEditParty: (party: Party) => void;
  onToggleFinalized: (party: Party) => void;
};

export function EventsSection({
  filteredParties,
  selectedParty,
  categoryFilter,
  onCategoryChange,
  onSelectParty,
  onEditParty,
  onToggleFinalized
}: EventsSectionProps) {
  // Ativos primeiro, finalizados depois
  const sortedParties = [...filteredParties].sort((a, b) => {
    const aActive = isUpcomingParty(a) ? 0 : 1;
    const bActive = isUpcomingParty(b) ? 0 : 1;
    return aActive - bActive;
  });

  const detailParty = selectedParty ?? sortedParties[0] ?? null;

  return (
    <div className="grid gap-0 xl:grid-cols-[280px_1fr] xl:h-full">
      {/* Master: compact party list */}
      <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card/80 xl:rounded-r-none xl:border-r-0">
        {/* Category filter pills */}
        <div className="border-b border-border p-3">
          <div className="flex flex-wrap gap-1.5">
            {partyCategories.map((category) => (
              <button
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  categoryFilter === category
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:bg-white/10 hover:text-foreground'
                )}
                key={category}
                onClick={() => onCategoryChange(category as PartyCategoryFilter)}
                type="button"
              >
                {getPartyCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Party rows */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
          {sortedParties.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Nenhum evento encontrado.</p>
          ) : (
            sortedParties.map((party, index) => {
              const upcoming = isUpcomingParty(party);
              const prevUpcoming = index > 0 ? isUpcomingParty(sortedParties[index - 1]) : null;
              const showActiveLabel = index === 0 && upcoming;
              const showFinalizedLabel = !upcoming && (index === 0 || prevUpcoming === true);

              return (
                <div key={party.id}>
                  {showActiveLabel ? (
                    <p className="px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Ativos
                    </p>
                  ) : null}
                  {showFinalizedLabel ? (
                    <p className="px-3 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Finalizados
                    </p>
                  ) : null}
                  <motion.button
                    animate={{ opacity: 1 }}
                    className={cn(
                      'flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors last:border-b-0 hover:bg-white/5',
                      detailParty?.id === party.id &&
                        'border-l-2 border-l-sky-400 bg-sky-400/8 hover:bg-sky-400/10'
                    )}
                    initial={{ opacity: 0 }}
                    onClick={() => onSelectParty(party.id)}
                    transition={{ delay: index * 0.03, duration: 0.15 }}
                    type="button"
                  >
                    <div className="relative shrink-0">
                      <img
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                        src={getPartyCoverImage(party)}
                      />
                      {upcoming ? (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{party.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{formatDateLabel(party.date)}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                        upcoming
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-white/10 text-slate-400'
                      )}
                    >
                      {upcoming ? getDaysLeftLabel(party.date) : 'Finalizado'}
                    </span>
                  </motion.button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail panel */}
      {detailParty ? (
        <EventDetailPanel
          party={detailParty}
          onEdit={onEditParty}
          onToggleFinalized={onToggleFinalized}
        />
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-12 xl:rounded-l-none">
          <p className="text-sm text-muted-foreground">Selecione um evento para ver os detalhes.</p>
        </div>
      )}
    </div>
  );
}

function EventDetailPanel({
  party,
  onEdit,
  onToggleFinalized
}: {
  party: Party;
  onEdit: (party: Party) => void;
  onToggleFinalized: (party: Party) => void;
}) {
  const confirmed = party.guests.filter((g) => g.status === 'Confirmado').length;
  const progress = getPartyProgress(party);
  const doneTasks = party.tasks.filter((t) => t.done).length;

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="grid content-start gap-5 overflow-hidden rounded-lg border border-border bg-card/80 p-6 xl:rounded-l-none"
      initial={{ opacity: 0, x: 10 }}
      key={party.id}
      transition={{ duration: 0.18 }}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <img
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
          src={getPartyCoverImage(party)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100">
              {getPartyCategoryLabel(party.category)}
            </span>
            {party.isFinalized ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-400">
                Finalizado
              </span>
            ) : (
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                {getDaysLeftLabel(party.date)}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">{party.name}</h2>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              {formatDateLabel(party.date)} às {party.time || '--:--'}
            </span>
            {party.location ? (
              <a
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                href={getMapsUrl(party.location)}
                rel="noreferrer"
                target="_blank"
              >
                <MapPinned size={14} />
                {party.location}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricMini label="Confirmados" value={`${confirmed}/${party.expectedGuests}`} />
        <MetricMini label="Tarefas" value={`${doneTasks}/${party.tasks.length}`} />
        <MetricMini label="Orçamento" value={formatOptionalBudget(party.budget.estimated)} />
        <MetricMini label="Gasto" value={currencyFormatter.format(party.budget.spent)} />
      </div>

      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso geral</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="celebra-progress-fill h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      {isEventDateUpcoming(party) ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onEdit(party)} type="button" variant="outline">
            <Edit3 size={16} />
            Editar evento
          </Button>
          <Button
            onClick={() => onToggleFinalized(party)}
            type="button"
            variant={party.isFinalized ? 'outline' : 'premium'}
          >
            <CheckCheck size={16} />
            {party.isFinalized ? 'Reabrir evento' : 'Finalizar evento'}
          </Button>
        </div>
      ) : null}

      {/* Guest list preview */}
      {party.guests.length > 0 ? (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Convidados ({party.guests.length})
          </h3>
          <div className="grid max-h-48 gap-2 overflow-y-auto [scrollbar-width:thin]">
            {party.guests.slice(0, 10).map((guest) => (
              <div className="flex items-center gap-2.5 text-sm" key={guest.id}>
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {guest.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="min-w-0 flex-1 truncate font-medium">{guest.name}</span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    guest.status === 'Confirmado'
                      ? 'bg-emerald-400/15 text-emerald-300'
                      : 'bg-white/10 text-slate-400'
                  )}
                >
                  {guest.status}
                </span>
              </div>
            ))}
            {party.guests.length > 10 ? (
              <p className="text-center text-xs text-muted-foreground">
                +{party.guests.length - 10} convidados
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
