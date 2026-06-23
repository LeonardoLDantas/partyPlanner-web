import { CalendarDays, CheckCheck, Edit3, Plus } from 'lucide-react';

import type { Party } from '@/domain/entities/party';
import { isUpcomingParty, isEventDateUpcoming, getDaysLeftLabel, getPartyCategoryLabel, getPartyCoverImage } from '@/domain/utils/party.utils';
import { MobilePage } from '@/presentation/layout/MobilePage';
import { CreatePartyDialog } from '@/presentation/features/events/CreatePartyDialog';
import type { DashboardState, PartyCategoryFilter } from '@/presentation/hooks/useDashboardState';
import { formatShortDateLabel } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';

type MobileEventsSectionProps = {
  filteredParties: DashboardState['filteredParties'];
  categoryFilter: DashboardState['categoryFilter'];
  setCategoryFilter: DashboardState['setCategoryFilter'];
  createOpen: DashboardState['createOpen'];
  setCreateOpen: DashboardState['setCreateOpen'];
  editingPartyId: DashboardState['editingPartyId'];
  partyForm: DashboardState['partyForm'];
  setPartyForm: DashboardState['setPartyForm'];
  actionError: DashboardState['actionError'];
  createParty: DashboardState['createParty'];
  updateParty: DashboardState['updateParty'];
  deleteParty: DashboardState['deleteParty'];
  headerAction: React.ReactNode;
  onSelectParty: (partyId: string) => void;
  onEditParty: (party: Party) => void;
  onToggleFinalized: (party: Party) => void;
  onCreateParty: () => void;
  onCreatePartySubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteParty: () => void;
  onCoverImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function PartyRow({
  party,
  onSelect,
  onEdit,
  onToggleFinalized
}: {
  party: Party;
  onSelect: (id: string) => void;
  onEdit: (p: Party) => void;
  onToggleFinalized: (p: Party) => void;
}) {
  const coverImage = getPartyCoverImage(party);

  return (
    <div
      className="flex items-center gap-3 rounded-[14px] border border-panel-border bg-panel p-3 text-left"
      onClick={() => onSelect(party.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(party.id); }}
    >
      <img
        alt=""
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
        src={coverImage}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-50">{party.name}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[0.72rem] text-slate-400">
          <CalendarDays className="shrink-0" size={12} />
          <span className="truncate">{formatShortDateLabel(party.date)}</span>
          <span className="text-slate-600">·</span>
          <span>{getPartyCategoryLabel(party.category)}</span>
        </div>
      </div>
      {party.isFinalized ? (
        <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-bold text-slate-400">
          Finalizado
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-sky-400/15 px-2.5 py-1 text-[0.65rem] font-bold text-sky-300">
          {getDaysLeftLabel(party.date)}
        </span>
      )}
      {isEventDateUpcoming(party) ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-brand/30 bg-brand/10 text-brand"
            onClick={(e) => { e.stopPropagation(); onEdit(party); }}
            title="Editar"
            type="button"
          >
            <Edit3 size={15} />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#1f2c45] bg-[#061123]/90 text-slate-300"
            onClick={(e) => { e.stopPropagation(); onToggleFinalized(party); }}
            title={party.isFinalized ? 'Reabrir' : 'Finalizar'}
            type="button"
          >
            <CheckCheck size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MobileEventsSection({
  filteredParties,
  categoryFilter,
  setCategoryFilter,
  createOpen,
  setCreateOpen,
  editingPartyId,
  partyForm,
  setPartyForm,
  actionError,
  createParty,
  updateParty,
  deleteParty,
  headerAction,
  onSelectParty,
  onEditParty,
  onToggleFinalized,
  onCreateParty,
  onCreatePartySubmit,
  onDeleteParty,
  onCoverImageChange
}: MobileEventsSectionProps) {
  const upcomingParties = filteredParties.filter(isUpcomingParty);
  const finalizedParties = filteredParties.filter((p) => !isUpcomingParty(p));

  return (
    <MobilePage
      action={
        <button
          className="celebra-action-fill flex h-9 items-center gap-2 rounded-[10px] px-4 text-sm font-bold text-white"
          onClick={onCreateParty}
          type="button"
        >
          <Plus size={16} />
          Novo evento
        </button>
      }
      headerAction={headerAction}
      subtitle="Gerencie suas celebrações"
      title="Eventos"
    >
      {/* Category filter pills */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(['Todos', 'Aniversario', 'Festa', 'Formatura', 'Casamento', 'Noivado', 'Outros'] as const).map((category) => (
          <button
            className={cn(
              'shrink-0 rounded-full px-3.5 py-2 text-sm font-bold shadow-sm',
              categoryFilter === category
                ? 'bg-[#0f6edb] text-white'
                : 'border border-white/10 bg-white/10 text-slate-300'
            )}
            key={category}
            onClick={() => setCategoryFilter(category as PartyCategoryFilter)}
            type="button"
          >
            {getPartyCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Upcoming */}
      {upcomingParties.length > 0 ? (
        <div>
          <p className="mb-2.5 text-[0.68rem] font-bold uppercase tracking-widest text-slate-400">Próximos</p>
          <div className="grid gap-2.5">
            {upcomingParties.map((party) => (
              <PartyRow
                key={party.id}
                onEdit={onEditParty}
                onSelect={onSelectParty}
                onToggleFinalized={onToggleFinalized}
                party={party}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Finalized */}
      {finalizedParties.length > 0 ? (
        <div>
          <p className="mb-2.5 text-[0.68rem] font-bold uppercase tracking-widest text-slate-400">Finalizados</p>
          <div className="grid gap-2.5">
            {finalizedParties.map((party) => (
              <PartyRow
                key={party.id}
                onEdit={onEditParty}
                onSelect={onSelectParty}
                onToggleFinalized={onToggleFinalized}
                party={party}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Empty state */}
      {filteredParties.length === 0 ? (
        <div className="rounded-[18px] border border-panel-border bg-panel p-6 text-center">
          <p className="text-sm text-slate-400">Nenhum evento encontrado.</p>
        </div>
      ) : null}

      <CreatePartyDialog
        actionError={actionError}
        createOpen={createOpen}
        createParty={createParty}
        deleteParty={deleteParty}
        editingPartyId={editingPartyId}
        hiddenTrigger
        onCoverImageChange={onCoverImageChange}
        onDelete={onDeleteParty}
        onOpen={onCreateParty}
        onSubmit={onCreatePartySubmit}
        partyForm={partyForm}
        setCreateOpen={setCreateOpen}
        setPartyForm={setPartyForm}
        updateParty={updateParty}
      />
    </MobilePage>
  );
}
