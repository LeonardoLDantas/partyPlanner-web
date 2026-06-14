import {
  CalendarDays,
  CheckCheck,
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
  onSectionChange,
  onLogout
}: {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="fixed left-4 top-4 hidden h-[calc(100vh-2rem)] w-[260px] rounded-lg border border-border bg-card/80 p-4 shadow-2xl backdrop-blur-xl lg:grid lg:content-between">
      <div>
        <div className="mb-8 flex items-center gap-3 px-2">
          <img alt="Celebra" className="h-12 w-12 rounded-full" src="/brand/celebra-mark-white.png" />
          <div>
            <strong className="text-lg">Celebra</strong>
            <p className="text-xs text-muted-foreground">Party planner</p>
          </div>
        </div>
        <nav className="grid gap-2">
          {sections.map((section) => (
            <button
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground',
                activeSection === section.id && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
              )}
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              type="button"
            >
              <section.icon size={18} />
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      <Button onClick={onLogout} variant="outline">
        <LogOut size={17} />
        Sair
      </Button>
    </aside>
  );
}
