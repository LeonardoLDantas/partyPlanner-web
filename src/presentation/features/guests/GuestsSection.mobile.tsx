import { Copy, Mail, Plus, Search, Trash2 } from 'lucide-react';
import type { GuestStatus, GuestGroup, GuestType, Party } from '@/domain/entities/party';
import { guestStatuses, guestGroups, guestTypes } from '@/domain/constants/party.constants';
import { Button } from '@/presentation/components/ui/button';
import { Field, Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/presentation/components/ui/dialog';
import { MobilePage } from '@/presentation/layout/MobilePage';
import { MobilePartySelector } from '@/presentation/features/events/PartySelector';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';
import { formatBrazilPhoneInput, getGuestStatusBadgeClass, getGuestTypeLabel } from '@/shared/utils/formatters';
import { WhatsappIcon } from '@/presentation/components/icons/WhatsappIcon';
import { cn } from '@/shared/utils/cn';
import type * as React from 'react';

type MobileGuestsSectionProps = {
  selectedParty: DashboardState['selectedParty'];
  selectedPartyLocked: DashboardState['selectedPartyLocked'];
  filteredGuests: DashboardState['filteredGuests'];
  guestSearch: DashboardState['guestSearch'];
  setGuestSearch: DashboardState['setGuestSearch'];
  guestFilter: DashboardState['guestFilter'];
  setGuestFilter: DashboardState['setGuestFilter'];
  guestDialogOpen: DashboardState['guestDialogOpen'];
  setGuestDialogOpen: DashboardState['setGuestDialogOpen'];
  guestForm: DashboardState['guestForm'];
  setGuestForm: DashboardState['setGuestForm'];
  parties: DashboardState['parties'];
  createGuest: DashboardState['createGuest'];
  deleteGuest: DashboardState['deleteGuest'];
  headerAction: React.ReactNode;
  partySelectorProps: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: () => void;
    onPartyClick: (partyId: string) => void;
  };
  onCreateGuest: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteGuest: (guest: Party['guests'][number]) => void;
  onCopyInvitationLink: (guestName: string, invitationToken: string) => void;
  getWhatsappUrl: DashboardState['getWhatsappUrl'];
  getMailtoUrl: DashboardState['getMailtoUrl'];
};

export function MobileGuestsSection({
  selectedParty,
  selectedPartyLocked,
  filteredGuests,
  guestSearch,
  setGuestSearch,
  guestFilter,
  setGuestFilter,
  guestDialogOpen,
  setGuestDialogOpen,
  guestForm,
  setGuestForm,
  parties,
  createGuest,
  deleteGuest,
  headerAction,
  partySelectorProps,
  onCreateGuest,
  onDeleteGuest,
  onCopyInvitationLink,
  getWhatsappUrl,
  getMailtoUrl
}: MobileGuestsSectionProps) {
  return (
    <MobilePage
      title="Convidados"
      action={
        <button
          className="celebra-action-fill flex h-9 items-center gap-2 rounded-[10px] px-4 text-sm font-bold text-white disabled:opacity-50"
          disabled={!selectedParty || selectedPartyLocked}
          onClick={() => setGuestDialogOpen(true)}
          type="button"
        >
          <Plus size={16} />
          Novo convidado
        </button>
      }
      headerAction={headerAction}
    >
      <MobilePartySelector
        parties={parties}
        selectedParty={selectedParty}
        {...partySelectorProps}
      />

      <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
        <DialogContent className="bottom-0 top-auto max-h-[86vh] w-full max-w-none translate-y-0 rounded-b-none rounded-t-[26px] border-white/10 bg-panel p-5 text-slate-50 sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:rounded-[22px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Novo convidado</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedParty ? `Convite para ${selectedParty.name}` : 'Selecione uma festa para continuar.'}
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={onCreateGuest}>
            <Field label="Nome">
              <Input required value={guestForm.name} onChange={(event) => setGuestForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Grupo">
              <Select value={guestForm.group} onValueChange={(value) => setGuestForm((current) => ({ ...current, group: value as GuestGroup }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {guestGroups.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tipo de convidado">
              <Select value={guestForm.type} onValueChange={(value) => setGuestForm((current) => ({ ...current, type: value as GuestType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {guestTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Email">
              <Input inputMode="email" placeholder="nome@email.com" value={guestForm.email} onChange={(event) => setGuestForm((current) => ({ ...current, email: event.target.value }))} />
            </Field>
            <Field label="Celular">
              <Input
                inputMode="tel"
                placeholder="+55 (11) 99999-9999"
                value={guestForm.phoneNumber}
                onChange={(event) => setGuestForm((current) => ({ ...current, phoneNumber: formatBrazilPhoneInput(event.target.value) }))}
              />
            </Field>
            <Button disabled={!selectedParty || selectedPartyLocked || createGuest.isPending} type="submit" variant="premium">
              <Plus size={18} />
              Adicionar convidado
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-[20px] border border-white/10 bg-[#101a2d] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-2 rounded-[16px] bg-white/5 px-3">
          <Search className="text-slate-400" size={18} />
          <input
            className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-50 outline-none placeholder:text-slate-500"
            placeholder="Buscar convidado"
            value={guestSearch}
            onChange={(event) => setGuestSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {['Todos', ...guestStatuses].map((status) => (
          <button
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-bold',
              guestFilter === status ? 'bg-[#0f6edb] text-white' : 'border border-white/10 bg-white/10 text-slate-300'
            )}
            key={status}
            onClick={() => setGuestFilter(status as 'Todos' | GuestStatus)}
            type="button"
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-2.5">
        {filteredGuests.map((guest) => (
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[18px] border border-white/10 bg-[#101a2d] p-3 shadow-[0_10px_26px_rgba(0,0,0,0.22)]" key={guest.id}>
            <div className="min-w-0">
              <strong className="block truncate text-slate-50">{guest.name}</strong>
              <span className="text-sm text-slate-400">
                {guestGroups.find((g) => g.value === guest.group)?.label ?? guest.group} | {getGuestTypeLabel(guest.type)}
              </span>
              {guest.email || guest.phoneNumber ? (
                <span className="mt-1 block truncate text-xs text-slate-500">
                  {[guest.email, guest.phoneNumber].filter(Boolean).join(' | ')}
                </span>
              ) : null}
            </div>
            <div className="grid shrink-0 justify-items-end gap-1.5">
              <span className={cn('rounded-full border px-3 py-1.5 text-xs font-bold', getGuestStatusBadgeClass(guest.status))}>
                {guest.status}
              </span>
              <button
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200"
                onClick={() => onCopyInvitationLink(guest.name, guest.invitationToken)}
                type="button"
              >
                <Copy size={13} />
                Link
              </button>
              <div className="flex gap-1">
                {guest.email ? (
                  <a
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-200"
                    href={getMailtoUrl(guest.email, guest.name, guest.invitationToken)}
                  >
                    <Mail size={14} />
                  </a>
                ) : null}
                {guest.phoneNumber ? (
                  <a
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-200"
                    href={getWhatsappUrl(guest.phoneNumber, guest.name, guest.invitationToken)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <WhatsappIcon size={14} />
                  </a>
                ) : null}
                <button
                  className="grid h-8 w-8 place-items-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={selectedPartyLocked || deleteGuest.isPending}
                  onClick={() => onDeleteGuest(guest)}
                  type="button"
                  title="Excluir convidado"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MobilePage>
  );
}
