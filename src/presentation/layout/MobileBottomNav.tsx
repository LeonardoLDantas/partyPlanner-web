import {
  CalendarDays,
  CheckCheck,
  CircleDollarSign,
  Home,
  UserRound,
  Users
} from 'lucide-react';

import type { Section } from '@/presentation/hooks/useDashboardState';
import { cn } from '@/shared/utils/cn';

const sections = [
  { id: 'Painel' as Section, label: 'Início', icon: Home },
  { id: 'Eventos' as Section, label: 'Eventos', icon: CalendarDays },
  { id: 'Convidados' as Section, label: 'Convidados', icon: Users },
  { id: 'Tarefas' as Section, label: 'Tarefas', icon: CheckCheck },
  { id: 'Despesas' as Section, label: 'Despesas', icon: CircleDollarSign },
  { id: 'Ajustes' as Section, label: 'Perfil', icon: UserRound }
];

export function MobileBottomNavigation({
  activeSection,
  onSectionChange
}: {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}) {
  return (
    <nav className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-[9999] grid h-14 w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 grid-cols-6 overflow-hidden rounded-[18px] border border-white/12 bg-panel/72 px-2 py-1 shadow-[0_18px_42px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl supports-[backdrop-filter]:bg-panel/58 lg:hidden">
      {sections.map((section) => (
        <button
          aria-label={section.label}
          className={cn(
            'relative grid h-12 min-h-0 min-w-0 place-items-center rounded-[16px] text-slate-300/80 transition-colors',
            activeSection === section.id && 'bg-transparent text-brand'
          )}
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          title={section.label}
          type="button"
        >
          <section.icon className="h-[22px] w-[22px] shrink-0" strokeWidth={activeSection === section.id ? 2.8 : 2.2} />
          <span className={cn('absolute bottom-1 h-0.5 w-5 rounded-full', activeSection === section.id ? 'bg-brand' : 'bg-transparent')} />
        </button>
      ))}
    </nav>
  );
}
