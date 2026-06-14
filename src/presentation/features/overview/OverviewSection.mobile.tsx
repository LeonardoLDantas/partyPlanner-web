import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Gift,
  PartyPopper,
  Plus,
  Users
} from 'lucide-react';
import type * as React from 'react';

import type { Party } from '@/domain/entities/party';
import { isUpcomingParty, getPartyCoverImage, getDaysLeftLabel, getMobileCountdownDays, getPartyProgress } from '@/domain/utils/party.utils';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  CountdownUnit,
  MobileMetricCard,
  PartyInsightsChart
} from '@/presentation/components/dashboard/DashboardShared';
import { MobileBrandHeader } from '@/presentation/layout/MobileBrandHeader';
import type { DashboardState, Section } from '@/presentation/hooks/useDashboardState';
import { getInitials } from '@/presentation/hooks/useDashboardState';
import { formatCompactCurrency, formatDateLabel } from '@/shared/utils/formatters';
import { normalizeTaskStatus } from '@/domain/utils/party.utils';
import { CalendarDays, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/shared/utils/cn';

type MobileHomeProps = {
  filteredParties: DashboardState['filteredParties'];
  selectedParty: DashboardState['selectedParty'];
  mobileCarouselRef: DashboardState['mobileCarouselRef'];
  unreadNotifications: DashboardState['unreadNotifications'];
  session: { user: { name: string } };
  onCarouselScroll: () => void;
  onSelectParty: (partyId: string) => void;
  onCreateParty: () => void;
  onSetSection: (section: Section) => void;
  onOpenMobileNotifications: () => void;
};

export function MobileOverviewSection({
  filteredParties,
  selectedParty,
  mobileCarouselRef,
  unreadNotifications,
  session,
  onCarouselScroll,
  onSelectParty,
  onCreateParty,
  onSetSection,
  onOpenMobileNotifications
}: MobileHomeProps) {
  const mobileUpcomingParties = filteredParties.filter(isUpcomingParty);
  const activeMobileParty =
    (selectedParty && isUpcomingParty(selectedParty) ? selectedParty : null) ??
    mobileUpcomingParties[0] ??
    null;
  const party = activeMobileParty;
  const confirmed = party?.guests.filter((guest) => guest.status === 'Confirmado').length ?? 0;
  const expected = Math.max(party?.expectedGuests || 0, party?.guests.length || 0);
  const guestProgress = expected > 0 ? Math.min(100, Math.round((confirmed / expected) * 100)) : 0;
  const budgetProgress =
    party && party.budget.estimated !== null && party.budget.estimated > 0
      ? Math.min(100, Math.round((party.budget.spent / party.budget.estimated) * 100))
      : 0;
  const tasks = party?.tasks.slice(0, 3) ?? [];

  const headerAction = (
    <div className="flex items-center gap-4">
      <button
        className="relative grid h-11 w-11 place-items-center rounded-full text-white"
        onClick={onOpenMobileNotifications}
        type="button"
      >
        <Bell size={25} />
        {unreadNotifications > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#0ea5e9] px-1 text-xs font-bold text-white">
            {unreadNotifications}
          </span>
        ) : null}
      </button>
      <div className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-brand bg-panel text-xs font-bold text-slate-50">
        {getInitials(session.user.name)}
      </div>
    </div>
  );

  return (
    <div className="celebra-mobile-background min-h-dvh w-full min-w-0 max-w-full overflow-x-clip px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 text-slate-50 sm:px-4 sm:pt-5">
      <header className="mb-4 min-w-0 overflow-hidden sm:mb-5">
        <MobileBrandHeader headerAction={headerAction} />
      </header>
      {mobileUpcomingParties.length > 0 ? (
        <div
          className="flex w-full max-w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={onCarouselScroll}
          ref={mobileCarouselRef}
        >
          {mobileUpcomingParties.map((carouselParty, index) => (
            <MobilePartySlide
              index={index}
              isActive={selectedParty?.id === carouselParty.id}
              key={carouselParty.id}
              party={carouselParty}
              onSelect={onSelectParty}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-[#101a2d] p-6 text-center shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
          <h2 className="text-2xl font-bold">Nenhuma festa cadastrada</h2>
          <p className="mt-2 text-slate-400">Crie sua primeira festa para ver o painel mobile.</p>
          <Button className="mt-5" onClick={onCreateParty} variant="premium">
            <Plus size={18} />
            Criar festa
          </Button>
        </div>
      )}

      {party ? (
        <div className="grid gap-3">
          <section className="celebra-panel-surface rounded-[20px] border p-3.5">
            <h3 className="text-[1.08rem] font-bold tracking-[-0.01em]">Contagem regressiva</h3>
            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)_1px_minmax(0,1fr)_1px_minmax(0,1fr)_32px] items-center gap-2">
              <CountdownUnit label="dias" value={getMobileCountdownDays(party.date)} />
              <span className="h-11 bg-white/10" />
              <CountdownUnit label="horas" value="00" />
              <span className="h-11 bg-white/10" />
              <CountdownUnit label="min" value="00" />
              <span className="h-11 bg-white/10" />
              <CountdownUnit label="seg" value="00" />
              <PartyPopper className="text-brand" size={32} />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <MobileMetricCard
              icon={<Users size={22} />}
              label="Convidados confirmados"
              progress={guestProgress}
              tint="cyan"
              value={String(confirmed)}
              detail={`de ${expected} convidados`}
            />
            <MobileMetricCard
              icon={<CircleDollarSign size={22} />}
              label="Orçamento"
              progress={budgetProgress}
              tint="blue"
              value={formatCompactCurrency(party.budget.spent)}
              detail={party.budget.estimated === null ? 'sem teto' : `de ${formatCompactCurrency(party.budget.estimated)}`}
              progressLabel={party.budget.estimated === null ? undefined : `${budgetProgress}%`}
            />
          </div>

          <PartyInsightsChart party={party} compact />

          <section className="celebra-panel-surface rounded-[20px] border p-3.5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[1.18rem] font-bold">Tarefas</h3>
              <button
                className="flex items-center gap-1 rounded-full border border-[#1b2942] bg-[#061123] px-3.5 py-1.5 text-sm font-bold text-[#8b5cf6]"
                onClick={() => onSetSection('Tarefas')}
                type="button"
              >
                Ver todas
                <ChevronRight size={17} />
              </button>
            </div>
            <div className="grid gap-1">
              {tasks.map((task, index) => (
                <div
                  className="grid grid-cols-[50px_1fr] items-center gap-3 border-b border-[#14233b] py-3 last:border-b-0"
                  key={task.id}
                >
                  <div
                    className={cn(
                      'grid h-11 w-11 place-items-center rounded-full text-white',
                      index === 0 && 'celebra-brand-mark',
                      index === 1 && 'bg-brand text-brand-foreground',
                      index >= 2 && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {index === 1 ? <Gift size={23} /> : <ClipboardCheck size={23} />}
                  </div>
                  <div className="min-w-0">
                    <strong className="block truncate text-[1rem]">{task.title}</strong>
                    <span className="text-sm text-[#8588a6]">{normalizeTaskStatus(task.status, task.done)}</span>
                  </div>
                </div>
              ))}
              {tasks.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#8588a6]">Nenhuma tarefa cadastrada.</p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function MobilePartySlide({
  party,
  index,
  isActive,
  onSelect
}: {
  party: Party;
  index: number;
  isActive: boolean;
  onSelect: (partyId: string) => void;
}) {
  return (
    <motion.button
      animate={{ opacity: 1, scale: isActive ? 1 : 0.98 }}
      className="relative h-[244px] w-full min-w-full max-w-full shrink-0 snap-center overflow-hidden rounded-[22px] border border-panel-border bg-panel p-4 text-left text-white shadow-[0_22px_48px_rgba(0,0,0,0.34)]"
      data-party-card
      initial={{ opacity: 0, scale: 0.98 }}
      key={party.id}
      onClick={() => onSelect(party.id)}
      transition={{ delay: index * 0.035, duration: 0.18 }}
      type="button"
    >
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-95"
        src={getPartyCoverImage(party)}
      />
      <div className="celebra-cover-overlay absolute inset-0" />

      <div className="relative z-10">
        <Badge className="max-w-fit border-white/10 bg-white/18 px-3.5 py-1.5 text-[0.78rem] font-bold text-white backdrop-blur-md">
          <Sparkles size={15} />
          Evento em destaque
        </Badge>

        <h2 className="mt-6 max-w-[16rem] text-[1.55rem] font-bold leading-[1.08] tracking-[-0.02em]">{party.name}</h2>
        <span className="mt-3 block h-1 w-12 rounded-full bg-white" />

        <div className="mt-5 grid max-w-[16.5rem] gap-3 text-[0.86rem] font-semibold">
          <div className="flex items-center gap-3">
            <CalendarDays className="shrink-0" size={19} />
            <span>{formatDateLabel(party.date)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="shrink-0" size={19} />
            <span>{party.time || '--:--'}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
