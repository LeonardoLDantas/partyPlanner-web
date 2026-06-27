import { Plus, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type * as React from 'react';

import type { Party } from '@/domain/entities/party';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { currencyFormatter } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';

export function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-white/7 p-3">
      <strong className="block truncate text-sm">{value}</strong>
      <span className="mt-1 block truncate text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function HeroChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
      <strong className="block text-xl">{value}</strong>
      <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-slate-100/70">{label}</span>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-sky-400/12 text-sky-200">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-xl">{value}</strong>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className="mt-2 block text-xl">{value}</strong>
    </div>
  );
}

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card>
      <CardContent className="grid place-items-center gap-4 p-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-sky-400/12 text-sky-200">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Nenhuma festa cadastrada</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Crie a primeira festa para liberar cards, filtros, convidados e tarefas.
          </p>
        </div>
        <Button onClick={onCreate} variant="premium">
          <Plus size={18} />
          Criar festa
        </Button>
      </CardContent>
    </Card>
  );
}

export function CountdownUnit({ label, value }: { label: string; value: string }) {
  const normalizedValue = value === 'Hoje' || value === 'Encerrada' || value === '--' ? value : value.padStart(2, '0');

  return (
    <div className="min-w-0 text-center">
      <strong className="celebra-brand-text block truncate text-[1.55rem] font-extrabold leading-none">
        {normalizedValue}
      </strong>
      <span className="mt-1 block text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}

export function MobileMetricCard({
  detail,
  icon,
  label,
  progress,
  progressLabel,
  tint,
  value
}: {
  detail: string;
  icon: React.ReactNode;
  label: string;
  progress: number;
  progressLabel?: string;
  tint: 'blue' | 'cyan';
  value: string;
}) {
  return (
    <section className="celebra-panel-surface min-h-[168px] min-w-0 overflow-hidden rounded-[20px] border p-3.5">
      <h3 className="line-clamp-2 min-h-9 text-[0.78rem] font-bold leading-[1.15] text-white">{label}</h3>
      <div className="mt-4 grid min-h-[54px] grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
        <div
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-full',
            tint === 'cyan' ? 'bg-brand/15 text-brand' : 'bg-primary/15 text-brand-soft'
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <strong className="block whitespace-nowrap text-[1.28rem] font-extrabold leading-tight text-white">{value}</strong>
          <span className="mt-1 block truncate text-[0.72rem] text-slate-400">{detail}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-2">
        <div className="h-2 overflow-hidden rounded-full bg-[#172235]">
          <div
            className="celebra-progress-fill h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progressLabel ? (
          <span className="max-w-14 truncate whitespace-nowrap text-right text-[0.72rem] font-bold text-brand">{progressLabel}</span>
        ) : null}
      </div>
    </section>
  );
}

export function PartyInsightsChart({ compact = false, party }: { compact?: boolean; party: Party }) {
  const allGuests = party.convites.flatMap((c) => c.guests);
  const confirmedGuests = allGuests.filter((guest) => guest.status === 'Confirmado').length;
  const guestTarget = Math.max(party.expectedGuests, allGuests.length, 1);
  const completedPartyTasks = party.tasks.filter((task) => task.done).length;
  const taskTarget = Math.max(party.tasks.length, 1);
  const hasBudgetCeiling = party.budget.estimated !== null && party.budget.estimated > 0;
  const budgetProgress = hasBudgetCeiling
    ? Math.min(100, Math.round((party.budget.spent / (party.budget.estimated ?? 1)) * 100))
    : 0;
  const chartRows = [
    {
      label: 'Convidados confirmados',
      progress: Math.min(100, Math.round((confirmedGuests / guestTarget) * 100)),
      value: `${confirmedGuests}/${party.expectedGuests || allGuests.length || 0}`
    },
    {
      label: 'Tarefas concluídas',
      progress: Math.min(100, Math.round((completedPartyTasks / taskTarget) * 100)),
      value: `${completedPartyTasks}/${party.tasks.length}`
    },
    {
      label: hasBudgetCeiling ? 'Uso do orçamento' : 'Gasto registrado',
      progress: budgetProgress,
      value: hasBudgetCeiling ? `${budgetProgress}%` : currencyFormatter.format(party.budget.spent)
    }
  ];

  return (
    <Card className={cn(compact && 'celebra-panel-surface border rounded-[20px] bg-transparent text-slate-50')}>
      <CardHeader className={cn(compact && 'p-3.5 pb-2')}>
        <CardTitle className={cn(compact ? 'text-[1.08rem] font-bold' : 'text-xl')}>Indicadores do evento</CardTitle>
        <CardDescription className={cn(compact && 'text-slate-400')}>
          {party.name}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn('grid gap-4', compact && 'p-3.5 pt-2')}>
        {chartRows.map((row, index) => (
          <div className="grid gap-2" key={row.label}>
            <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
              <span className="truncate text-muted-foreground">{row.label}</span>
              <strong className="shrink-0 text-foreground">{row.value}</strong>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-white/8">
              <motion.div
                animate={{ width: `${row.progress}%` }}
                className={cn(
                  'h-full min-w-0 rounded-full',
                  index === 0 && 'celebra-action-fill shadow-none',
                  index === 1 && 'bg-[linear-gradient(90deg,hsl(var(--brand-soft)),hsl(var(--brand)))]',
                  index === 2 && 'celebra-progress-fill'
                )}
                initial={{ width: 0 }}
                transition={{ delay: index * 0.05, duration: 0.26, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
        {!hasBudgetCeiling ? (
          <p className="rounded-md border border-brand/15 bg-brand/8 px-3 py-2 text-xs leading-5 text-muted-foreground">
            Esta festa está sem teto de orçamento; o gráfico mostra o gasto registrado sem limitar novas despesas.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
