import { Camera, Plus, Trash2 } from 'lucide-react';
import type * as React from 'react';

import { GradientButton } from '@/presentation/components/nurui/gradient-button';

import { partyCategories, maximumCurrencyAmount, maximumExpectedGuests, maximumPartyLocationLength } from '@/domain/constants/party.constants';
import { getPartyCoverImage, getPartyCategoryLabel } from '@/domain/utils/party.utils';
import { Button } from '@/presentation/components/ui/button';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/presentation/components/ui/dialog';
import { Field, Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';
import { currencyFormatter, formatCurrencyInput, formatDateInputValue, formatExpectedGuestsInput, formatTimeInputValue } from '@/shared/utils/formatters';

type CreatePartyDialogProps = {
  createOpen: DashboardState['createOpen'];
  setCreateOpen: DashboardState['setCreateOpen'];
  editingPartyId: DashboardState['editingPartyId'];
  partyForm: DashboardState['partyForm'];
  setPartyForm: DashboardState['setPartyForm'];
  actionError: DashboardState['actionError'];
  createParty: DashboardState['createParty'];
  updateParty: DashboardState['updateParty'];
  deleteParty: DashboardState['deleteParty'];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
  onCoverImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpen: () => void;
  hiddenTrigger?: boolean;
};

export function CreatePartyDialog({
  createOpen,
  setCreateOpen,
  editingPartyId,
  partyForm,
  setPartyForm,
  actionError,
  createParty,
  updateParty,
  deleteParty,
  onSubmit,
  onDelete,
  onCoverImageChange,
  onOpen,
  hiddenTrigger = false
}: CreatePartyDialogProps) {
  const currentSchedule = new Date();
  const minimumPartyDate = formatDateInputValue(currentSchedule);
  const minimumPartyTime = partyForm.date === minimumPartyDate ? formatTimeInputValue(currentSchedule) : undefined;

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogTrigger asChild>
        {hiddenTrigger ? (
          <button className="hidden" onClick={() => onOpen()} type="button" />
        ) : (
          <GradientButton onClick={() => onOpen()}>
            <Plus size={18} />
            {editingPartyId ? 'Editar festa' : 'Nova festa'}
          </GradientButton>
        )}
      </DialogTrigger>
      <DialogContent className="md:top-1/2 max-md:bottom-0 max-md:top-auto max-md:translate-y-0 max-md:rounded-b-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{editingPartyId ? 'Editar festa' : 'Criar nova festa'}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            {editingPartyId ? 'Atualize os dados principais do evento.' : 'Defina os dados principais para o Celebra montar o card do evento.'}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="relative overflow-hidden rounded-lg border border-white/10">
            <img
              alt="Capa do evento"
              className="h-40 w-full object-cover"
              src={partyForm.coverImageUrl || getPartyCoverImage({ coverImageUrl: '', category: partyForm.category })}
            />
            <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/50 bg-black/35 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md">
              <Camera size={16} />
              Alterar capa
              <input accept="image/*" className="sr-only" type="file" onChange={onCoverImageChange} />
            </label>
          </div>

          <Field label="Nome da festa">
            <Input
              placeholder="Ex.: Aniversário da Sofia"
              required
              value={partyForm.name}
              onChange={(event) => setPartyForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Categoria">
              <Select
                value={partyForm.category}
                onValueChange={(value) => setPartyForm((current) => ({ ...current, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {partyCategories.filter((category) => category !== 'Todos').map((category) => (
                    <SelectItem key={category} value={category}>
                      {getPartyCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Horário">
              <Input
                min={minimumPartyTime}
                required
                type="time"
                value={partyForm.time}
                onChange={(event) => setPartyForm((current) => ({ ...current, time: event.target.value }))}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Data">
              <Input
                min={minimumPartyDate}
                required
                type="date"
                value={partyForm.date}
                onChange={(event) => setPartyForm((current) => ({ ...current, date: event.target.value }))}
              />
            </Field>

            <Field label="Convidados esperados">
              <Input
                inputMode="numeric"
                maxLength={String(maximumExpectedGuests).length}
                pattern="[0-9]*"
                title="Máximo de 1.000.000 convidados esperados"
                value={partyForm.expectedGuests}
                onChange={(event) => setPartyForm((current) => ({ ...current, expectedGuests: formatExpectedGuestsInput(event.target.value) }))}
              />
            </Field>
          </div>

          <Field label="Local">
            <Input
              maxLength={maximumPartyLocationLength}
              placeholder="Rua, número, bairro"
              title="Máximo de 150 caracteres"
              value={partyForm.location}
              onChange={(event) => setPartyForm((current) => ({ ...current, location: event.target.value }))}
            />
          </Field>

          <Field label="Orçamento estimado">
            <Input
              disabled={partyForm.skipEstimatedBudget}
              inputMode="decimal"
              maxLength={currencyFormatter.format(maximumCurrencyAmount).length}
              placeholder="R$ 0,00"
              title="Informe um valor de até R$ 999.999.999.999,00"
              value={partyForm.estimatedBudget}
              onChange={(event) => setPartyForm((current) => ({ ...current, estimatedBudget: formatCurrencyInput(event.target.value) }))}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200">
            <Checkbox
              checked={partyForm.skipEstimatedBudget}
              onCheckedChange={(checked) =>
                setPartyForm((current) => ({
                  ...current,
                  estimatedBudget: checked ? '' : current.estimatedBudget,
                  skipEstimatedBudget: checked === true
                }))
              }
            />
            <span>Sem orçamento / Não definir orçamento agora</span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200">
            <Checkbox
              checked={partyForm.isFinalized}
              onCheckedChange={(checked) => setPartyForm((current) => ({ ...current, isFinalized: checked === true }))}
            />
            <span>Evento finalizado</span>
          </label>

          {actionError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {actionError}
            </div>
          ) : null}

          <GradientButton
            className="w-full"
            disabled={createParty.isPending || updateParty.isPending}
            type="submit"
          >
            {editingPartyId ? 'Salvar alterações' : createParty.isPending ? 'Criando...' : 'Criar festa'}
          </GradientButton>
          {editingPartyId ? (
            <Button
              className="border border-rose-400/30 text-rose-200 hover:bg-rose-400/10 hover:text-rose-100"
              disabled={deleteParty.isPending}
              onClick={onDelete}
              size="lg"
              type="button"
              variant="ghost"
            >
              <Trash2 size={17} />
              {deleteParty.isPending ? 'Excluindo...' : 'Excluir evento'}
            </Button>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
