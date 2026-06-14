import { CheckCheck, Edit3, Trash2 } from 'lucide-react';
import type * as React from 'react';

import type { Party } from '@/domain/entities/party';
import { expenseCategories } from '@/domain/constants/party.constants';
import { Button } from '@/presentation/components/ui/button';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { MetricMini } from '@/presentation/components/dashboard/DashboardShared';
import { MobilePage } from '@/presentation/layout/MobilePage';
import { MobilePartySelector } from '@/presentation/features/events/PartySelector';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';
import { currencyFormatter, formatCurrencyInput, getExpenseCategoryLabel } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';

type MobileExpensesSectionProps = {
  selectedParty: DashboardState['selectedParty'];
  selectedPartyLocked: DashboardState['selectedPartyLocked'];
  parties: DashboardState['parties'];
  budgetForm: DashboardState['budgetForm'];
  setBudgetForm: DashboardState['setBudgetForm'];
  editingBudgetItemId: DashboardState['editingBudgetItemId'];
  editingBudgetAmount: DashboardState['editingBudgetAmount'];
  setEditingBudgetAmount: DashboardState['setEditingBudgetAmount'];
  createBudgetItem: DashboardState['createBudgetItem'];
  updateBudgetItem: DashboardState['updateBudgetItem'];
  deleteBudgetItem: DashboardState['deleteBudgetItem'];
  headerAction: React.ReactNode;
  partySelectorProps: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: () => void;
    onPartyClick: (partyId: string) => void;
  };
  onCreateBudgetItem: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateBudgetItem: (item: Party['budget']['items'][number]) => void;
  onDeleteBudgetItem: (item: Party['budget']['items'][number]) => void;
  onToggleBudgetItemPaid: (item: Party['budget']['items'][number]) => void;
  onStartBudgetItemEdit: (item: Party['budget']['items'][number]) => void;
};

export function MobileExpensesSection({
  selectedParty,
  selectedPartyLocked,
  parties,
  budgetForm,
  setBudgetForm,
  editingBudgetItemId,
  editingBudgetAmount,
  setEditingBudgetAmount,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  headerAction,
  partySelectorProps,
  onCreateBudgetItem,
  onUpdateBudgetItem,
  onDeleteBudgetItem,
  onToggleBudgetItemPaid,
  onStartBudgetItemEdit
}: MobileExpensesSectionProps) {
  const hasBudgetCeiling = selectedParty?.budget.estimated !== null && (selectedParty?.budget.estimated ?? 0) > 0;
  const budgetProgress =
    selectedParty && hasBudgetCeiling
      ? Math.min(100, Math.round((selectedParty.budget.spent / (selectedParty.budget.estimated ?? 1)) * 100))
      : 0;

  return (
    <MobilePage title="Despesas" action={null} headerAction={headerAction}>
      <MobilePartySelector
        parties={parties}
        selectedParty={selectedParty}
        {...partySelectorProps}
      />

      {selectedParty ? (
        <>
          {selectedPartyLocked ? (
            <p className="rounded-[18px] border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
              Evento finalizado automaticamente. Despesas não podem mais ser criadas ou alteradas.
            </p>
          ) : null}
          <section className="celebra-panel-surface rounded-[20px] border p-3.5">
            <h2 className="text-lg font-bold text-white">{selectedParty.name}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricMini label="Gasto" value={currencyFormatter.format(selectedParty.budget.spent)} />
              <MetricMini label="Orçamento" value={hasBudgetCeiling ? currencyFormatter.format(selectedParty.budget.estimated ?? 0) : 'Sem teto'} />
            </div>
            {hasBudgetCeiling ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Uso</span>
                  <span>{budgetProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#172235]">
                  <div className="celebra-progress-fill h-full rounded-full" style={{ width: `${budgetProgress}%` }} />
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-[14px] border border-sky-300/20 bg-sky-400/10 p-3 text-sm text-sky-100">
                Sem teto definido para as despesas.
              </p>
            )}
          </section>

          <section className="celebra-panel-surface rounded-[20px] border p-3.5">
            <h3 className="text-lg font-bold text-white">Nova despesa</h3>
            <form className="mt-3 grid gap-3" onSubmit={onCreateBudgetItem}>
              <Input placeholder="Descrição" required value={budgetForm.label} onChange={(event) => setBudgetForm((current) => ({ ...current, label: event.target.value }))} />
              <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm((current) => ({ ...current, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                inputMode="decimal"
                placeholder="R$ 0,00"
                required
                value={budgetForm.amount}
                onChange={(event) => setBudgetForm((current) => ({ ...current, amount: formatCurrencyInput(event.target.value) }))}
              />
              <label className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200">
                <Checkbox checked={budgetForm.isPaid} onCheckedChange={(checked) => setBudgetForm((current) => ({ ...current, isPaid: checked === true }))} />
                Marcar como paga
              </label>
              <Button disabled={selectedPartyLocked || createBudgetItem.isPending} type="submit" variant="premium">
                Salvar despesa
              </Button>
            </form>
          </section>

          <section className="grid gap-2.5">
            {selectedParty.budget.items.length > 0 ? (
              selectedParty.budget.items.map((item) => (
                <div className="grid gap-3 rounded-[18px] border border-white/10 bg-[#101a2d] p-3.5" key={item.id}>
                  <div className="min-w-0">
                    <strong className="block truncate text-slate-50">{item.label}</strong>
                    <span className="text-sm text-slate-400">{getExpenseCategoryLabel(item.category)}</span>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
                    {editingBudgetItemId === item.id ? (
                      <Input
                        className="h-10"
                        inputMode="decimal"
                        value={editingBudgetAmount}
                        onChange={(event) => setEditingBudgetAmount(formatCurrencyInput(event.target.value))}
                      />
                    ) : (
                      <strong className="text-slate-50">{currencyFormatter.format(item.amount)}</strong>
                    )}
                    <button
                      className={cn(
                        'h-10 rounded-full border px-3 text-xs font-bold transition-colors',
                        item.isPaid
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                          : 'border-amber-300/25 bg-amber-300/10 text-amber-100'
                      )}
                      disabled={selectedPartyLocked || updateBudgetItem.isPending}
                      onClick={() => onToggleBudgetItemPaid(item)}
                      type="button"
                    >
                      {item.isPaid ? 'Paga' : 'Pendente'}
                    </button>
                    {editingBudgetItemId === item.id ? (
                      <button
                        className="grid h-10 w-10 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        disabled={selectedPartyLocked}
                        onClick={() => onUpdateBudgetItem(item)}
                        type="button"
                      >
                        <CheckCheck size={17} />
                      </button>
                    ) : (
                      <button
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-200"
                        disabled={selectedPartyLocked}
                        onClick={() => onStartBudgetItemEdit(item)}
                        type="button"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                    <button
                      className="grid h-10 w-10 place-items-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-200"
                      disabled={selectedPartyLocked}
                      onClick={() => onDeleteBudgetItem(item)}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-[18px] border border-white/10 bg-[#101a2d] p-4 text-center text-sm text-slate-400">
                Nenhuma despesa registrada.
              </p>
            )}
          </section>
        </>
      ) : null}
    </MobilePage>
  );
}
