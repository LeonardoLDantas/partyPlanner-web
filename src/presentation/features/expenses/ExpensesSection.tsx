import { CheckCheck, CircleDollarSign, Edit3, Trash2 } from 'lucide-react';
import type * as React from 'react';

import type { Party } from '@/domain/entities/party';
import { expenseCategories } from '@/domain/constants/party.constants';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { Field, Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { EmptyState, MetricPanel } from '@/presentation/components/dashboard/DashboardShared';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';
import { currencyFormatter, formatCurrencyInput, getExpenseCategoryLabel } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';

type ExpensesSectionProps = {
  selectedParty: DashboardState['selectedParty'];
  selectedPartyLocked: DashboardState['selectedPartyLocked'];
  budgetForm: DashboardState['budgetForm'];
  setBudgetForm: DashboardState['setBudgetForm'];
  editingBudgetItemId: DashboardState['editingBudgetItemId'];
  editingBudgetAmount: DashboardState['editingBudgetAmount'];
  setEditingBudgetAmount: DashboardState['setEditingBudgetAmount'];
  createBudgetItem: DashboardState['createBudgetItem'];
  updateBudgetItem: DashboardState['updateBudgetItem'];
  deleteBudgetItem: DashboardState['deleteBudgetItem'];
  onCreateBudgetItem: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateBudgetItem: (item: Party['budget']['items'][number]) => void;
  onDeleteBudgetItem: (item: Party['budget']['items'][number]) => void;
  onToggleBudgetItemPaid: (item: Party['budget']['items'][number]) => void;
  onStartBudgetItemEdit: (item: Party['budget']['items'][number]) => void;
  onCreateParty: () => void;
};

export function ExpensesSection({
  selectedParty,
  selectedPartyLocked,
  budgetForm,
  setBudgetForm,
  editingBudgetItemId,
  editingBudgetAmount,
  setEditingBudgetAmount,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  onCreateBudgetItem,
  onUpdateBudgetItem,
  onDeleteBudgetItem,
  onToggleBudgetItemPaid,
  onStartBudgetItemEdit,
  onCreateParty
}: ExpensesSectionProps) {
  if (!selectedParty) {
    return <EmptyState onCreate={onCreateParty} />;
  }

  const hasBudgetCeiling = selectedParty.budget.estimated !== null && selectedParty.budget.estimated > 0;
  const budgetProgress = hasBudgetCeiling
    ? Math.min(100, Math.round((selectedParty.budget.spent / (selectedParty.budget.estimated ?? 1)) * 100))
    : 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <CardTitle>Despesas</CardTitle>
          <CardDescription>{selectedParty.name}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {selectedPartyLocked ? (
            <p className="rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
              Evento finalizado automaticamente. Despesas não podem mais ser criadas ou alteradas.
            </p>
          ) : null}
          <div className="grid gap-3 md:grid-cols-3">
            <MetricPanel label="Orçamento" value={hasBudgetCeiling ? currencyFormatter.format(selectedParty.budget.estimated ?? 0) : 'Sem teto'} />
            <MetricPanel label="Gasto atual" value={currencyFormatter.format(selectedParty.budget.spent)} />
            <MetricPanel
              label={hasBudgetCeiling ? 'Saldo' : 'Limite'}
              value={hasBudgetCeiling ? currencyFormatter.format(Math.max((selectedParty.budget.estimated ?? 0) - selectedParty.budget.spent, 0)) : 'Livre'}
            />
          </div>

          {hasBudgetCeiling ? (
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Uso do orçamento</span>
                <span>{budgetProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="celebra-progress-fill h-full rounded-full" style={{ width: `${budgetProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-sky-300/20 bg-sky-400/10 p-4 text-sm text-sky-100">
              Este evento não tem orçamento definido. As despesas ficam sem teto até você definir um valor.
            </div>
          )}

          <div className="grid gap-3">
            {selectedParty.budget.items.length > 0 ? (
              selectedParty.budget.items.map((item) => (
                <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 md:grid-cols-[1fr_auto] md:items-center" key={item.id}>
                  <div>
                    <strong>{item.label}</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{getExpenseCategoryLabel(item.category)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {editingBudgetItemId === item.id ? (
                      <Input
                        className="h-9 w-36"
                        inputMode="decimal"
                        value={editingBudgetAmount}
                        onChange={(event) => setEditingBudgetAmount(formatCurrencyInput(event.target.value))}
                      />
                    ) : (
                      <strong className="min-w-28 text-right">{currencyFormatter.format(item.amount)}</strong>
                    )}
                    <Button
                      className={cn(
                        item.isPaid
                          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20'
                          : 'border-amber-300/25 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20'
                      )}
                      disabled={selectedPartyLocked || updateBudgetItem.isPending}
                      onClick={() => onToggleBudgetItemPaid(item)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {item.isPaid ? 'Paga' : 'Pendente'}
                    </Button>
                    {editingBudgetItemId === item.id ? (
                      <Button
                        disabled={selectedPartyLocked || updateBudgetItem.isPending}
                        onClick={() => onUpdateBudgetItem(item)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <CheckCheck size={15} />
                        Salvar
                      </Button>
                    ) : (
                      <Button disabled={selectedPartyLocked} onClick={() => onStartBudgetItemEdit(item)} size="sm" type="button" variant="outline">
                        <Edit3 size={15} />
                        Editar
                      </Button>
                    )}
                    <Button
                      disabled={selectedPartyLocked || deleteBudgetItem.isPending}
                      onClick={() => onDeleteBudgetItem(item)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 size={15} />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                Nenhuma despesa registrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nova despesa</CardTitle>
          <CardDescription>{hasBudgetCeiling ? 'Controle o consumo do orçamento.' : 'Evento sem teto de orçamento.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedPartyLocked ? (
            <p className="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
              Evento finalizado. Não é possível adicionar despesas.
            </p>
          ) : null}
          <form className="grid gap-3" onSubmit={onCreateBudgetItem}>
            <Field label="Descrição">
              <Input required value={budgetForm.label} onChange={(event) => setBudgetForm((current) => ({ ...current, label: event.target.value }))} />
            </Field>
            <Field label="Categoria">
              <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm((current) => ({ ...current, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Valor">
              <Input
                inputMode="decimal"
                placeholder="R$ 0,00"
                required
                value={budgetForm.amount}
                onChange={(event) => setBudgetForm((current) => ({ ...current, amount: formatCurrencyInput(event.target.value) }))}
              />
            </Field>
            <label className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-semibold">
              <Checkbox checked={budgetForm.isPaid} onCheckedChange={(checked) => setBudgetForm((current) => ({ ...current, isPaid: checked === true }))} />
              Marcar como paga
            </label>
            <Button disabled={selectedPartyLocked || createBudgetItem.isPending} type="submit" variant="premium">
              <CircleDollarSign size={17} />
              Salvar despesa
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
