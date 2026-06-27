import { Copy, Edit2, Key, Mail, Plus, Ticket, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import type { Convite, Party } from '@/domain/entities/party';
import { inviteTypes, guestGroups, guestStatuses, guestTypes } from '@/domain/constants/party.constants';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Field, Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';
import { formatBrazilPhoneInput, getGuestStatusBadgeClass, getGuestTypeLabel } from '@/shared/utils/formatters';
import { WhatsappIcon } from '@/presentation/components/icons/WhatsappIcon';
import type { GuestGroup, GuestStatus, GuestType, InviteType } from '@/domain/entities/party';

const inviteTypeColors: Record<InviteType, string> = {
  Familia:  'border-violet-400/30 bg-violet-400/10 text-violet-200',
  Amigos:   'border-sky-400/30 bg-sky-400/10 text-sky-200',
  Trabalho: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  Outro:    'border-slate-400/30 bg-slate-400/10 text-slate-200'
};

type GuestsSectionProps = {
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
  createConvite: DashboardState['createConvite'];
  updateConvite: DashboardState['updateConvite'];
  deleteConvite: DashboardState['deleteConvite'];
  addGuestToConvite: DashboardState['addGuestToConvite'];
  updateGuestInConvite: DashboardState['updateGuestInConvite'];
  deleteGuestFromConvite: DashboardState['deleteGuestFromConvite'];
  openCreateConviteDialog: DashboardState['openCreateConviteDialog'];
  openEditConviteDialog: DashboardState['openEditConviteDialog'];
  handleSaveConvite: DashboardState['handleSaveConvite'];
  handleDeleteConvite: DashboardState['handleDeleteConvite'];
  handleCreateGuest: DashboardState['handleCreateGuest'];
  startGuestEdit: DashboardState['startGuestEdit'];
  handleDeleteGuest: DashboardState['handleDeleteGuest'];
  handleCopyInvitationLink: DashboardState['handleCopyInvitationLink'];
  getWhatsappUrl: DashboardState['getWhatsappUrl'];
  getMailtoUrl: DashboardState['getMailtoUrl'];
};

export function GuestsSection({
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
  createConvite,
  updateConvite,
  handleSaveConvite,
  handleDeleteConvite,
  openCreateConviteDialog,
  openEditConviteDialog,
  handleCreateGuest,
  startGuestEdit,
  handleDeleteGuest,
  handleCopyInvitationLink,
  getWhatsappUrl,
  getMailtoUrl
}: GuestsSectionProps) {
  const convites = selectedParty?.convites ?? [];
  const totalGuests = convites.flatMap((c) => c.guests).length;
  const confirmedGuests = convites.flatMap((c) => c.guests).filter((g) => g.status === 'Confirmado').length;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      {/* ── Left: invite cards + guest list ── */}
      <div className="grid gap-4">
        {/* Convites header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Convites</h2>
            <p className="text-sm text-muted-foreground">
              {selectedParty ? selectedParty.name : 'Selecione um evento'} · {totalGuests} convidado{totalGuests !== 1 ? 's' : ''} · {confirmedGuests} confirmado{confirmedGuests !== 1 ? 's' : ''}
            </p>
          </div>
          <Button disabled={!selectedParty || selectedPartyLocked} onClick={openCreateConviteDialog} size="sm" variant="premium">
            <Plus size={15} />
            Novo convite
          </Button>
        </div>

        {/* Convite cards */}
        {convites.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
            <Ticket className="text-muted-foreground" size={36} />
            <p className="text-sm text-muted-foreground">Nenhum convite criado ainda.</p>
            {selectedParty && !selectedPartyLocked ? (
              <Button onClick={openCreateConviteDialog} size="sm" variant="outline">
                <Plus size={15} /> Criar primeiro convite
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {convites.map((convite) => {
              const isSelected = convite.id === (selectedConviteId || convites[0]?.id);
              const typeLabel = inviteTypes.find((t) => t.value === convite.tipo)?.label ?? convite.tipo;
              return (
                <button
                  className={`group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all hover:border-brand/40 hover:bg-brand/5 ${isSelected ? 'border-brand/50 bg-brand/8 ring-1 ring-brand/30' : 'border-border bg-muted/30'}`}
                  key={convite.id}
                  onClick={() => setSelectedConviteId(convite.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{convite.nome}</p>
                      {convite.observacao ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{convite.observacao}</p> : null}
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
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); openEditConviteDialog(convite.id); }}
                      type="button"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); void handleDeleteConvite(convite.id); }}
                      type="button"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected convite: senha codes */}
        {selectedConvite ? (
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="mb-3 text-sm font-semibold">Códigos de acesso — {selectedConvite.nome}</p>
            <div className="flex flex-wrap gap-2">
              {selectedConvite.senhas.map((s) => (
                <span
                  className="cursor-pointer rounded-md border border-white/10 bg-white/8 px-3 py-1 font-mono text-sm tracking-widest text-sky-300 hover:bg-white/14"
                  key={s.id}
                  onClick={() => navigator.clipboard.writeText(s.codigo)}
                  title="Clique para copiar"
                >
                  {s.codigo}
                </span>
              ))}
            </div>
            {selectedConvite.senhaPresente ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Senha presente: <span className="font-mono text-emerald-300">{selectedConvite.senhaPresente}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Guest list for selected convite */}
        {selectedConvite ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Convidados — {selectedConvite.nome}</CardTitle>
                  <CardDescription>{selectedConvite.guests.length} pessoa{selectedConvite.guests.length !== 1 ? 's' : ''} neste convite</CardDescription>
                </div>
                <Button disabled={selectedPartyLocked} onClick={() => { setGuestDialogOpen(true); }} size="sm" variant="outline">
                  <Plus size={14} /> Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                <Input
                  className="h-9 border-border bg-input placeholder:text-muted-foreground"
                  placeholder="Buscar convidado"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                />
                <Tabs value={guestFilter} onValueChange={(v) => setGuestFilter(v as 'Todos' | GuestStatus)}>
                  <TabsList>
                    {['Todos', ...guestStatuses].map((s) => (
                      <TabsTrigger key={s} value={s}>{s}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              {filteredGuests.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Nenhum convidado encontrado.</p>
              ) : (
                filteredGuests.map((guest) => (
                  <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 md:grid-cols-[1fr_auto] md:items-center" key={guest.id}>
                    <div>
                      <strong>{guest.name}</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {guestGroups.find((g) => g.value === guest.group)?.label ?? guest.group} · {getGuestTypeLabel(guest.type)}
                      </p>
                      {guest.email || guest.phoneNumber ? (
                        <p className="mt-1 text-xs text-muted-foreground">{[guest.email, guest.phoneNumber].filter(Boolean).join(' · ')}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <Badge className={getGuestStatusBadgeClass(guest.status)}>{guest.status}</Badge>
                      <Button onClick={() => handleCopyInvitationLink(guest.name, guest.invitationToken)} size="sm" type="button" variant="outline">
                        <Copy size={14} /> Link
                      </Button>
                      {guest.email ? (
                        <a className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-semibold hover:bg-white/10" href={getMailtoUrl(guest.email, guest.name, guest.invitationToken)}>
                          <Mail size={14} /> Email
                        </a>
                      ) : null}
                      {guest.phoneNumber ? (
                        <a className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-semibold hover:bg-white/10" href={getWhatsappUrl(guest.phoneNumber, guest.name, guest.invitationToken)} rel="noreferrer" target="_blank">
                          <WhatsappIcon size={14} /> WhatsApp
                        </a>
                      ) : null}
                      <Button disabled={selectedPartyLocked} onClick={() => startGuestEdit(guest)} size="sm" type="button" variant="ghost">
                        <Edit2 size={14} />
                      </Button>
                      <Button disabled={selectedPartyLocked} onClick={() => void handleDeleteGuest(guest)} size="sm" type="button" variant="ghost">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* ── Right: forms ── */}
      <div className="grid gap-4 self-start">
        {/* Convite form */}
        {conviteDialogOpen ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingConviteId ? 'Editar convite' : 'Novo convite'}</CardTitle>
              <CardDescription>Preencha os dados do convite para o evento.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ) : null}

        {/* Guest form */}
        {guestDialogOpen ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingGuestId ? 'Editar convidado' : 'Novo convidado'}</CardTitle>
              <CardDescription>Convite: {selectedConvite?.nome ?? '—'}</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ) : null}

        {!conviteDialogOpen && !guestDialogOpen ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            <Ticket size={28} className="text-muted-foreground" />
            <p>Selecione um convite para ver os convidados<br />ou crie um novo convite.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
