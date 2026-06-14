import { ArrowUpDown, CalendarDays, CheckCheck, Edit3, MapPinned, Plus, Search, SlidersHorizontal, Users } from 'lucide-react';

import type { Party } from '@/domain/entities/party';
import { partyCategories } from '@/domain/constants/party.constants';
import { getPartyCoverImage, getPartyCategoryLabel, getShortLocation } from '@/domain/utils/party.utils';
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
  return (
    <MobilePage
      title="Eventos"
      subtitle="Gerencie e acompanhe suas celebrações"
      action={null}
      headerAction={headerAction}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_46px_46px] gap-2">
        <div className="flex h-12 min-w-0 items-center gap-2 rounded-[14px] border border-panel-border bg-panel px-3">
          <Search className="shrink-0 text-slate-300" size={22} />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-400"
            placeholder="Buscar evento"
          />
        </div>
        <button className="grid h-12 place-items-center rounded-[14px] border border-panel-border bg-panel text-slate-200" type="button">
          <SlidersHorizontal size={21} />
        </button>
        <button className="grid h-12 place-items-center rounded-[14px] border border-panel-border bg-panel text-slate-200" type="button">
          <ArrowUpDown size={21} />
        </button>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {partyCategories.map((category) => (
          <button
            className={cn(
              'shrink-0 rounded-full px-3.5 py-2 text-sm font-bold shadow-sm',
              categoryFilter === category ? 'bg-[#0f6edb] text-white' : 'border border-white/10 bg-white/10 text-slate-300'
            )}
            key={category}
            onClick={() => setCategoryFilter(category as PartyCategoryFilter)}
            type="button"
          >
            {getPartyCategoryLabel(category)}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filteredParties.map((party) => (
          <article
            className="relative grid h-[132px] grid-cols-[112px_minmax(0,1fr)] gap-3 overflow-hidden rounded-[18px] border border-panel-border bg-panel p-2.5 pr-12 text-left shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
            key={party.id}
            onClick={() => onSelectParty(party.id)}
          >
            <img
              alt=""
              className="h-[112px] w-[112px] rounded-[14px] border border-sky-300/45 object-cover"
              src={getPartyCoverImage(party)}
            />
            <div className="min-w-0 py-1">
              <div className="flex min-w-0 items-start gap-2">
                <h2 className="line-clamp-1 flex-1 text-base font-bold text-slate-50">{party.name}</h2>
                {party.isFinalized ? (
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[0.58rem] font-bold text-slate-200">
                    Finalizada
                  </span>
                ) : null}
              </div>
              <div className="mt-2 grid gap-1.5 text-[0.78rem] text-slate-200">
                <span className="flex items-center gap-2">
                  <CalendarDays className="shrink-0" size={16} />
                  <span className="truncate">{formatShortDateLabel(party.date)} - {party.time || '--:--'}</span>
                </span>
                <span className="line-clamp-1 flex items-center gap-2">
                  <MapPinned className="shrink-0" size={16} />
                  <span className="truncate">{getShortLocation(party.location)}</span>
                </span>
                <span className="flex items-center gap-2"><Users size={16} />{party.expectedGuests} convidados</span>
              </div>
            </div>
            <div className="absolute right-2.5 top-2.5 grid gap-2">
              <button
                className="grid h-9 w-9 place-items-center rounded-lg border border-brand/35 bg-brand/10 text-brand"
                onClick={(event) => {
                  event.stopPropagation();
                  onEditParty(party);
                }}
                type="button"
                title="Editar evento"
              >
                <Edit3 size={18} />
              </button>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#1f2c45] bg-[#061123]/90 text-slate-300"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFinalized(party);
                }}
                type="button"
                title={party.isFinalized ? 'Reabrir evento' : 'Finalizar evento'}
              >
                <CheckCheck size={18} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <button
        className="celebra-action-fill mt-1 flex h-14 w-full items-center justify-center gap-3 rounded-[14px] text-xl font-bold text-white"
        type="button"
        onClick={onCreateParty}
      >
        <Plus size={24} />
        Novo evento
      </button>
      <CreatePartyDialog
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        editingPartyId={editingPartyId}
        partyForm={partyForm}
        setPartyForm={setPartyForm}
        actionError={actionError}
        createParty={createParty}
        updateParty={updateParty}
        deleteParty={deleteParty}
        onSubmit={onCreatePartySubmit}
        onDelete={onDeleteParty}
        onCoverImageChange={onCoverImageChange}
        onOpen={onCreateParty}
        hiddenTrigger
      />
    </MobilePage>
  );
}
