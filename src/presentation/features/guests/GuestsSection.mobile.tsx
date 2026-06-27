import { Copy, Edit2, Key, Mail, Plus, Ticket, Trash2, Users } from 'lucide-react';
import type * as React from 'react';

import type { GuestGroup, GuestStatus, GuestType, InviteType, Party } from '@/domain/entities/party';
import { inviteTypes, guestGroups, guestStatuses, guestTypes } from '@/domain/constants/party.constants';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/presentation/components/ui/dialog';
import { Field, Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { MobilePage } from '@/presentation/layout/MobilePage';
import { MobilePartySelector } from '@/presentation/features/events/PartySelector';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';
import { formatBrazilPhoneInput, getGuestStatusBadgeClass, getGuestTypeLabel } from '@/shared/utils/formatters';
import { WhatsappIcon } from '@/presentation/components/icons/WhatsappIcon';

const inviteTypeColors: Record<InviteType, string> = {
  Familia:  'border-violet-400/30 bg-violet-400/10 text-violet-200',
  Amigos:   'border-sky-400/30 bg-sky-400/10 text-sky-200',
  Trabalho: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  Outro:    'border-slate-400/30 bg-slate-400/10 text-slate-200'
};

type MobileGuestsSectionProps = {
  selectedParty: DashboardState['selectedParty'];
  selectedPartyLocked: DashboardState['selectedPartyLocked'];
  selectedConvite: DashboardState['selectedConvite'];
  selectedConviteId: DashboardState['selectedConviteId'];
  setSelectedConviteId: DashboardState['setSelectedConviteId'];
  conviteDialogOpen: DashboardState['conviteDialogOpen'];
  setConviteDialogOpen: DashboardState['setConviteDialogOpen'];
  editingConviteId: DashboardState['editingConviteId'];
  conviteForm: DashboardState['conviteForm'];
  setConviteForm: DashboardState['setConviteForm'];
  filteredGuests: DashboardState['filteredGuests'];
  guestSearch: DashboardState['guestSearch'];
  setGuestSearch: DashboardState['setGuestSearch'];
  guestFilter: DashboardState['guestFilter'];
  setGuestFilter: DashboardState['setGuestFilter'];
  guestDialogOpen: DashboardState['guestDialogOpen'];
  setGuestDialogOpen: DashboardState['setGuestDialogOpen'];
  editingGuestId: DashboardState['editingGuestId'];
  guestForm: DashboardState['guestForm'];
  setGuestForm: DashboardState['setGuestForm'];
  parties: DashboardState['parties'];
  createConvite: DashboardState['createConvite'];
  updateConvite: DashboardState['updateConvite'];
  deleteConvite: DashboardState['deleteConvite'];
  addGuestToConvite: DashboardState['addGuestToConvite'];
  updateGuestInConvite: DashboardState['updateGuestInConvite'];
  deleteGuestFromConvite: DashboardState['deleteGuestFromConvite'];
  headerAction: React.ReactNode;
  partySelectorProps: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: () => void;
    onPartyClick: (partyId: string) => void;
  };
  openCreateConviteDialog: DashboardState['openCreateConviteDialog'];
  openEditConviteDialog: DashboardState['openEditConviteDialog'];
  handleSaveConvite: DashboardState['handleSaveConvite'];
  handleDeleteConvite: (id: string) => void;
  handleCreateGuest: DashboardState['handleCreateGuest'];
  startGuestEdit: DashboardState['startGuestEdit'];
  handleDeleteGuest: (guest: Party['convites'][number]['guests'][number]) => void;
  handleCopyInvitationLink: (name: string, token: string) => void;
  getWhatsappUrl: DashboardState['getWhatsappUrl'];
  getMailtoUrl: DashboardState['getMailtoUrl'];
};

export function MobileGuestsSection({
  selectedParty,
  selectedPartyLocked,
  selectedConvite,
  selectedConviteId,
  setSelectedConviteId,
  conviteDialogOpen,
  setConviteDialogOpen,
  editingConviteId,
  conviteForm,
  setConviteForm,
  filteredGuests,
  guestSearch,
  setGuestSearch,
  guestFilter,
  setGuestFilter,
  guestDialogOpen,
  setGuestDialogOpen,
  editingGuestId,
  guestForm,
  setGuestForm,
  parties,
  createConvite,
  updateConvite,
  openCreateConviteDialog,
  openEditConviteDialog,
  handleSaveConvite,
  handleDeleteConvite,
  handleCreateGuest,
  startGuestEdit,
  handleDeleteGuest,
  handleCopyInvitationLink,
  getWhatsappUrl,
  getMailtoUrl,
  headerAction,
  partySelectorProps
}: MobileGuestsSectionProps) {
  const convites = selectedParty?.convites ?? [];

  return (
    <MobilePage
      headerAction={headerAction}
      title="Convidados"
      actions={
        selectedParty && !selectedPartyLocked ? (
          <Button onClick={openCreateConviteDialog} size="sm" variant="premium">
            <Plus size={15} /> Novo convite
          </Button>
        ) : null
      }
    >
      {/* Party selector */}
      <MobilePartySelector
        parties={parties}
        selectedPartyId={selectedParty?.id ?? ''}
        onPointerDown={partySelectorProps.onPointerDown}
        onPointerMove={partySelectorProps.onPointerMove}
        onPointerUp={partySelectorProps.onPointerUp}
        onPartyClick={partySelectorProps.onPartyClick}
      />

      <div className="px-4 pb-24">
        {/* Summary */}
        {selectedParty ? (
          <p className="mb-3 text-sm text-muted-foreground">
            {convites.length} convite{convites.length !== 1 ? 's' : ''} · {convites.flatMap((c) => c.guests).length} convidado{convites.flatMap((c) => c.guests).length !== 1 ? 's' : ''} · {convites.flatMap((c) => c.guests).filter((g) => g.status === 'Confirmado').length} confirmado{convites.flatMap((c) => c.guests).filter((g) => g.status === 'Confirmado').length !== 1 ? 's' : ''}
          </p>
        ) : null}

        {/* Convite cards */}
        {convites.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
            <Ticket className="text-muted-foreground" size={32} />
            <p className="text-sm text-muted-foreground">Nenhum convite criado ainda.</p>
            {selectedParty && !selectedPartyLocked ? (
              <Button onClick={openCreateConviteDialog} size="sm" variant="outline">
                <Plus size={14} /> Criar convite
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mb-4 grid gap-3">
            {convites.map((convite) => {
              const isSelected = convite.id === (selectedConviteId || convites[0]?.id);
              const typeLabel = inviteTypes.find((t) => t.value === convite.tipo)?.label ?? convite.tipo;
              return (
                <button
                  className={`flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-all ${isSelected ? 'border-brand/50 bg-brand/8 ring-1 ring-brand/30' : 'border-border bg-muted/30'}`}
                  key={convite.id}
                  onClick={() => setSelectedConviteId(convite.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{convite.nome}</p>
                      {convite.observacao ? (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{convite.observacao}</p>
                      ) : null}
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${inviteTypeColors[convite.tipo]}`}>
                      {typeLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={12} /> {convite.guests.length} convidado{convite.guests.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Key size={12} /> {convite.senhas.length} senha{convite.senhas.length !== 1 ? 's' : ''}
                    </span>
                    {convite.senhaPresente ? (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[0.65rem] text-emerald-300">
                        Senha presente
                      </span>
                    ) : null}
                  </div>
                  {!selectedPartyLocked ? (
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); openEditConviteDialog(convite.id); }}
                        type="button"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteConvite(convite.id); }}
                        type="button"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {/* Selected convite — access codes */}
        {selectedConvite ? (
          <div className="mb-4 rounded-xl border border-border bg-muted/20 p-4">
            <p className="mb-2 text-sm font-semibold">Códigos de acesso</p>
            <div className="flex flex-wrap gap-2">
              {selectedConvite.senhas.map((s) => (
                <span
                  className="cursor-pointer rounded-md border border-white/10 bg-white/8 px-3 py-1 font-mono text-sm tracking-widest text-sky-300"
                  key={s.id}
                  onClick={() => navigator.clipboard.writeText(s.codigo)}
                  title="Toque para copiar"
                >
                  {s.codigo}
                </span>
              ))}
            </div>
            {selectedConvite.senhaPresente ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Senha presente: <span className="font-mono text-emerald-300">{selectedConvite.senhaPresente}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Guest list for selected convite */}
        {selectedConvite ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Convidados — {selectedConvite.nome}</p>
              {!selectedPartyLocked ? (
                <Button onClick={() => setGuestDialogOpen(true)} size="sm" variant="outline">
                  <Plus size={13} /> Adicionar
                </Button>
              ) : null}
            </div>

            {/* Search + filter */}
            <div className="mb-3 grid gap-2">
              <Input
                className="h-9"
                placeholder="Buscar convidado"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5">
                {(['Todos', ...guestStatuses] as const).map((s) => (
                  <button
                    className={`rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors ${guestFilter === s ? 'border-brand bg-brand/20 text-brand' : 'border-border text-muted-foreground hover:border-white/30'}`}
                    key={s}
                    onClick={() => setGuestFilter(s as 'Todos' | GuestStatus)}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filteredGuests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum convidado encontrado.</p>
            ) : (
              <div className="grid gap-3">
                {filteredGuests.map((guest) => (
                  <div className="rounded-xl border border-border bg-muted/40 p-4" key={guest.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-sm">{guest.name}</strong>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {guestGroups.find((g) => g.value === guest.group)?.label ?? guest.group} · {getGuestTypeLabel(guest.type)}
                        </p>
                        {guest.email || guest.phoneNumber ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">{[guest.email, guest.phoneNumber].filter(Boolean).join(' · ')}</p>
                        ) : null}
                      </div>
                      <Badge className={getGuestStatusBadgeClass(guest.status)}>{guest.status}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold hover:bg-white/10"
                        onClick={() => handleCopyInvitationLink(guest.name, guest.invitationToken)}
                        type="button"
                      >
                        <Copy size={12} /> Link
                      </button>
                      {guest.phoneNumber ? (
                        <a
                          className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold hover:bg-white/10"
                          href={getWhatsappUrl(guest.phoneNumber, guest.name, guest.invitationToken)}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <WhatsappIcon size={12} /> WhatsApp
                        </a>
                      ) : null}
                      {guest.email ? (
                        <a
                          className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold hover:bg-white/10"
                          href={getMailtoUrl(guest.email, guest.name, guest.invitationToken)}
                        >
                          <Mail size={12} /> Email
                        </a>
                      ) : null}
                      {!selectedPartyLocked ? (
                        <>
                          <button
                            className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold hover:bg-white/10"
                            onClick={() => startGuestEdit(guest)}
                            type="button"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="flex h-8 items-center gap-1.5 rounded-md border border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteGuest(guest)}
                            type="button"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Convite dialog */}
      <Dialog open={conviteDialogOpen} onOpenChange={setConviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingConviteId ? 'Editar convite' : 'Novo convite'}</DialogTitle>
            <DialogDescription>Preencha os dados do convite.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={handleSaveConvite}>
            <Field label="Nome do convite">
              <Input required value={conviteForm.nome} onChange={(e) => setConviteForm((cur) => ({ ...cur, nome: e.target.value }))} placeholder="Ex: Família Silva" />
            </Field>
            <Field label="Observação">
              <Input value={conviteForm.observacao} onChange={(e) => setConviteForm((cur) => ({ ...cur, observacao: e.target.value }))} placeholder="Opcional" />
            </Field>
            <Field label="Tipo">
              <Select value={conviteForm.tipo} onValueChange={(v) => setConviteForm((cur) => ({ ...cur, tipo: v as InviteType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {inviteTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            {!editingConviteId ? (
              <Field label="Quantidade de senhas">
                <Input min="1" max="100" type="number" value={conviteForm.quantidadeSenhas} onChange={(e) => setConviteForm((cur) => ({ ...cur, quantidadeSenhas: e.target.value }))} />
              </Field>
            ) : null}
            <Field label="Senha presente (opcional)">
              <Input value={conviteForm.senhaPresente} onChange={(e) => setConviteForm((cur) => ({ ...cur, senhaPresente: e.target.value }))} placeholder="Ex: PRESENTE2026" />
            </Field>
            <div className="flex gap-2">
              <Button className="flex-1" disabled={createConvite.isPending || updateConvite.isPending} type="submit" variant="premium">
                {editingConviteId ? 'Salvar' : 'Criar convite'}
              </Button>
              <Button onClick={() => setConviteDialogOpen(false)} type="button" variant="outline">Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Guest dialog */}
      <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGuestId ? 'Editar convidado' : 'Novo convidado'}</DialogTitle>
            <DialogDescription>Convite: {selectedConvite?.nome ?? '—'}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={handleCreateGuest}>
            <Field label="Nome">
              <Input required value={guestForm.name} onChange={(e) => setGuestForm((cur) => ({ ...cur, name: e.target.value }))} />
            </Field>
            <Field label="Grupo">
              <Select value={guestForm.group} onValueChange={(v) => setGuestForm((cur) => ({ ...cur, group: v as GuestGroup }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{guestGroups.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Tipo">
              <Select value={guestForm.type} onValueChange={(v) => setGuestForm((cur) => ({ ...cur, type: v as GuestType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{guestTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Email">
              <Input inputMode="email" placeholder="nome@email.com" value={guestForm.email} onChange={(e) => setGuestForm((cur) => ({ ...cur, email: e.target.value }))} />
            </Field>
            <Field label="Celular">
              <Input inputMode="tel" placeholder="+55 (11) 99999-9999" value={guestForm.phoneNumber} onChange={(e) => setGuestForm((cur) => ({ ...cur, phoneNumber: formatBrazilPhoneInput(e.target.value) }))} />
            </Field>
            <div className="flex gap-2">
              <Button className="flex-1" type="submit" variant="premium">
                {editingGuestId ? 'Salvar' : 'Adicionar'}
              </Button>
              <Button onClick={() => setGuestDialogOpen(false)} type="button" variant="outline">Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MobilePage>
  );
}
