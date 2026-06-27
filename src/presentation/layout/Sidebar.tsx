import {
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Home,
  LogOut,
  UserRound,
  Users
} from 'lucide-react';

import { Button } from '@/presentation/components/ui/button';
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

export function Sidebar({
  activeSection,
  collapsed,
  onSectionChange,
  onToggle,
  onLogout
}: {
  activeSection: Section;
  collapsed: boolean;
  onSectionChange: (section: Section) => void;
  onToggle: () => void;
  onLogout: () => void;
}) {
  return (
    <aside
      className={cn(
        'fixed left-4 top-4 hidden h-[calc(100vh-2rem)] rounded-lg border border-border bg-card/80 p-3 shadow-2xl backdrop-blur-xl lg:grid lg:content-between',
        'transition-[width] duration-[280ms] ease-[ease]',
        collapsed ? 'w-16' : 'w-[260px]'
      )}
    >
      <div className="overflow-hidden">
        {/* Header: logo + (title) + toggle */}
        <div className={cn('mb-7 flex items-center gap-3', collapsed ? 'justify-center' : 'px-1')}>
          <img
            alt="Celebra"
            className="h-10 w-10 shrink-0 rounded-full"
            src="/brand/celebra-mark-white.png"
          />
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1 overflow-hidden">
                <strong className="block truncate text-lg">Celebra</strong>
                <p className="truncate text-xs text-muted-foreground">Party planner</p>
              </div>
              <button
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                onClick={onToggle}
                title="Recolher menu"
                type="button"
              >
                <ChevronLeft size={15} />
              </button>
            </>
          ) : (
            <button
              className="absolute right-[-12px] top-[18px] grid h-6 w-6 place-items-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-md transition-colors hover:bg-white/10 hover:text-foreground"
              onClick={onToggle}
              title="Expandir menu"
              type="button"
            >
              <ChevronRight size={13} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="grid gap-1">
          {sections.map((section) => (
            <button
              className={cn(
                'flex items-center rounded-md py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground',
                activeSection === section.id &&
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                collapsed ? 'justify-center px-2' : 'gap-3 px-3'
              )}
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              title={collapsed ? section.label : undefined}
              type="button"
            >
              <section.icon className="shrink-0" size={18} />
              {!collapsed ? <span className="truncate">{section.label}</span> : null}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <Button
        className={cn('w-full', collapsed && 'px-0')}
        onClick={onLogout}
        title={collapsed ? 'Sair' : undefined}
        variant="outline"
      >
        <LogOut size={17} />
        {!collapsed ? 'Sair' : null}
      </Button>
    </aside>
  );
}
