import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import {
  CalendarDays,
  CheckCheck,
  CircleDollarSign,
  Edit3,
  MapPinned,
  Sparkles,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';

import type { Party } from '@/domain/entities/party';
import { getDaysLeftLabel, getMapsUrl, getPartyProgress } from '@/domain/utils/party.utils';
import { GradientText } from '@/presentation/components/nurui/gradient-text';
import { ProgressBar } from '@/presentation/components/nurui/progress-bar';
import { TextShimmer } from '@/presentation/components/react-bits/text-shimmer';
import { EmptyState, HeroChip, MetricPanel, PartyInsightsChart, StatCard } from '@/presentation/components/dashboard/DashboardShared';
import type { DashboardState } from '@/presentation/hooks/useDashboardState';
import { currencyFormatter, formatDateLabel, formatOptionalBudget } from '@/shared/utils/formatters';

type OverviewSectionProps = {
  featuredParty: Party | null;
  selectedParty: Party | null;
  parties: DashboardState['parties'];
  confirmedGuests: DashboardState['confirmedGuests'];
  completedTasks: DashboardState['completedTasks'];
  totalTasks: DashboardState['totalTasks'];
  totalBudget: DashboardState['totalBudget'];
  updateParty: DashboardState['updateParty'];
  onCreateParty: () => void;
  onEditParty: (party: Party) => void;
  onToggleFinalized: (party: Party) => void;
};

export function OverviewSection({
  featuredParty,
  selectedParty,
  parties,
  confirmedGuests,
  completedTasks,
  totalTasks,
  totalBudget,
  updateParty,
  onCreateParty,
  onEditParty,
  onToggleFinalized
}: OverviewSectionProps) {
  const overviewParty = selectedParty ?? featuredParty;

  return (
    <div className="grid gap-5">
      {featuredParty ? (
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="celebra-featured-surface relative overflow-hidden rounded-lg border border-white/10 p-6 shadow-2xl md:p-8"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22 }}
        >
          <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Badge className="border-white/15 bg-white/12 text-white">Proximo evento</Badge>
              <GradientText
                animationSpeed={5}
                className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl"
                colors={['#ffffff', '#c4b5fd', '#fb7185', '#ffffff']}
              >
                {featuredParty.name}
              </GradientText>
              <p className="mt-3 text-slate-100/80">
                {formatDateLabel(featuredParty.date)} às {featuredParty.time} - {featuredParty.location || 'Local a definir'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <HeroChip label="faltam" value={getDaysLeftLabel(featuredParty.date)} />
              <HeroChip label="convidados" value={String(featuredParty.expectedGuests)} />
              <ProgressBar
                className="size-20 text-base"
                gaugePrimaryColor="#a78bfa"
                gaugeSecondaryColor="#a78bfa33"
                max={100}
                min={0}
                value={getPartyProgress(featuredParty)}
              />
            </div>
          </div>
          <Sparkles className="absolute right-8 top-7 text-white/20" size={92} />
        </motion.section>
      ) : (
        <EmptyState onCreate={onCreateParty} />
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={CalendarDays} label="Festas" value={String(parties.length)} />
        <StatCard icon={Users} label="Confirmados" value={String(confirmedGuests)} />
        <StatCard icon={CheckCheck} label="Tarefas feitas" value={`${completedTasks}/${totalTasks}`} />
        <StatCard icon={CircleDollarSign} label="Gasto total" value={currencyFormatter.format(totalBudget)} />
      </div>

      {overviewParty ? (
        <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <SelectedPartySummary
            party={overviewParty}
            updateParty={updateParty}
            onEdit={onEditParty}
            onToggleFinalized={onToggleFinalized}
          />
          <PartyInsightsChart party={overviewParty} />
        </div>
      ) : null}
    </div>
  );
}

function SelectedPartySummary({
  party,
  updateParty,
  onEdit,
  onToggleFinalized
}: {
  party: Party;
  updateParty: DashboardState['updateParty'];
  onEdit: (party: Party) => void;
  onToggleFinalized: (party: Party) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{party.name}</CardTitle>
        <CardDescription className="break-words">
          {formatDateLabel(party.date)} às {party.time} - {party.location || 'Local a definir'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <MetricPanel label="Orçamento" value={formatOptionalBudget(party.budget.estimated)} />
          <MetricPanel label="Gasto atual" value={currencyFormatter.format(party.budget.spent)} />
          <MetricPanel label="Convidados" value={`${party.guests.length}/${party.expectedGuests}`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="w-full md:w-fit" onClick={() => onEdit(party)} type="button" variant="outline">
            <Edit3 size={17} />
            Editar evento
          </Button>
          <Button
            className="w-full md:w-fit"
            disabled={updateParty.isPending}
            onClick={() => onToggleFinalized(party)}
            type="button"
            variant={party.isFinalized ? 'outline' : 'premium'}
          >
            <CheckCheck size={17} />
            {party.isFinalized ? 'Reabrir evento' : 'Marcar como finalizado'}
          </Button>
        </div>
        {party.location ? (
          <a
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold transition-colors hover:bg-white/10 md:w-fit"
            href={getMapsUrl(party.location)}
            rel="noreferrer"
            target="_blank"
          >
            <MapPinned size={17} />
            Ver local no Maps
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}
