import { Copy, Mail, Search, Trash2 } from 'lucide-react';

import type { Party } from '@/domain/entities/party';
import { guestStatuses, guestTypes } from '@/domain/constants/party.constants';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Field, Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';
import { formatBrazilPhoneInput, getGuestStatusBadgeClass, getGuestTypeLabel } from '@/shared/utils/formatters';
import { WhatsappIcon } from '@/presentation/components/icons/WhatsappIcon';
import type { GuestStatus, GuestType } from '@/domain/entities/party';

type GuestsSectionProps = {
  selectedParty: DashboardState['selectedParty'];
  selectedPartyLocked: DashboardState['selectedPartyLocked'];
  filteredGuests: DashboardState['filteredGuests'];
  guestSearch: DashboardState['guestSearch'];
  setGuestSearch: DashboardState['setGuestSearch'];
  guestFilter: DashboardState['guestFilter'];
  setGuestFilter: DashboardState['setGuestFilter'];
  guestForm: DashboardState['guestForm'];
  setGuestForm: DashboardState['setGuestForm'];
  createGuest: DashboardState['createGuest'];
  deleteGuest: DashboardState['deleteGuest'];
  onCreateGuest: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteGuest: (guest: Party['guests'][number]) => void;
  onCopyInvitationLink: (guestName: string, invitationToken: string) => void;
  getWhatsappUrl: DashboardState['getWhatsappUrl'];
  getMailtoUrl: DashboardState['getMailtoUrl'];
};

export function GuestsSection({
  selectedParty,
  selectedPartyLocked,
  filteredGuests,
  guestSearch,
  setGuestSearch,
  guestFilter,
  setGuestFilter,
  guestForm,
  setGuestForm,
  createGuest,
  deleteGuest,
  onCreateGuest,
  onDeleteGuest,
  onCopyInvitationLink,
  getWhatsappUrl,
  getMailtoUrl
}: GuestsSectionProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <CardTitle>Convidados</CardTitle>
          <CardDescription>{selectedParty ? selectedParty.name : 'Selecione uma festa para filtrar a lista.'}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-2 rounded-md border border-input bg-input px-3">
              <Search className="text-muted-foreground" size={17} />
              <Input
                className="border-0 bg-transparent px-0 focus-visible:ring-0"
                placeholder="Buscar por nome ou grupo"
                value={guestSearch}
                onChange={(event) => setGuestSearch(event.target.value)}
              />
            </div>
            <Tabs value={guestFilter} onValueChange={(value) => setGuestFilter(value as 'Todos' | GuestStatus)}>
              <TabsList>
                {['Todos', ...guestStatuses].map((status) => (
                  <TabsTrigger key={status} value={status}>
                    {status}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-3">
            {filteredGuests.map((guest) => (
              <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 md:grid-cols-[1fr_auto] md:items-center" key={guest.id}>
                <div>
                  <strong>{guest.name}</strong>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {guest.group} | {getGuestTypeLabel(guest.type)}
                  </p>
                  {guest.email || guest.phoneNumber ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[guest.email, guest.phoneNumber].filter(Boolean).join(' | ')}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Badge className={getGuestStatusBadgeClass(guest.status)}>
                    {guest.status}
                  </Badge>
                  <Button
                    onClick={() => onCopyInvitationLink(guest.name, guest.invitationToken)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Copy size={15} />
                    Copiar link
                  </Button>
                  {guest.email ? (
                    <a
                      className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-white/10"
                      href={getMailtoUrl(guest.email, guest.name, guest.invitationToken)}
                    >
                      <Mail size={15} />
                      Email
                    </a>
                  ) : null}
                  {guest.phoneNumber ? (
                    <a
                      className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-white/10"
                      href={getWhatsappUrl(guest.phoneNumber, guest.name, guest.invitationToken)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <WhatsappIcon size={15} />
                      WhatsApp
                    </a>
                  ) : null}
                  <Button
                    disabled={selectedPartyLocked || deleteGuest.isPending}
                    onClick={() => onDeleteGuest(guest)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 size={15} />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Novo convidado</CardTitle>
          <CardDescription>Entrada rápida para o evento selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedPartyLocked ? (
            <p className="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
              Evento finalizado automaticamente. Não é possível adicionar convidados.
            </p>
          ) : null}
          <form className="grid gap-3" onSubmit={onCreateGuest}>
            <Field label="Nome">
              <Input required value={guestForm.name} onChange={(event) => setGuestForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Grupo">
              <Input required value={guestForm.group} onChange={(event) => setGuestForm((current) => ({ ...current, group: event.target.value }))} />
            </Field>
            <Field label="Tipo de convidado">
              <Select value={guestForm.type} onValueChange={(value) => setGuestForm((current) => ({ ...current, type: value as GuestType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {guestTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
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
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
