import type { GuestGroup, GuestStatus, GuestType, InviteType } from '@/domain/entities/party';

export const sections = [
  { id: 'Painel', label: 'Início', icon: 'Home' },
  { id: 'Eventos', label: 'Eventos', icon: 'CalendarDays' },
  { id: 'Convidados', label: 'Convidados', icon: 'Users' },
  { id: 'Tarefas', label: 'Tarefas', icon: 'CheckCheck' },
  { id: 'Despesas', label: 'Despesas', icon: 'CircleDollarSign' },
  { id: 'Ajustes', label: 'Perfil', icon: 'UserRound' }
] as const;

export const partyCategories = ['Todos', 'Aniversario', 'Festa', 'Formatura', 'Casamento', 'Noivado', 'Outros'] as const;

export const guestStatuses: GuestStatus[] = ['Confirmado', 'Pendente', 'Recusou'];

export const guestTypes: { value: GuestType; label: string }[] = [
  { value: 'Adulto', label: 'Adulto' },
  { value: 'Crianca', label: 'Criança' }
];

export const inviteTypes: { value: InviteType; label: string }[] = [
  { value: 'Familia',  label: 'Família' },
  { value: 'Amigos',   label: 'Amigos' },
  { value: 'Trabalho', label: 'Trabalho' },
  { value: 'Outro',    label: 'Outro' }
];

export const guestGroups: { value: GuestGroup; label: string }[] = [
  { value: 'Familia',  label: 'Família' },
  { value: 'Amigos',   label: 'Amigos' },
  { value: 'Trabalho', label: 'Trabalho' },
  { value: 'Escola',   label: 'Escola / Faculdade' },
  { value: 'Vizinhos', label: 'Vizinhos' },
  { value: 'Outros',   label: 'Outros' }
];

export const taskColumns = [
  { id: 'Pendente', label: 'Pendente', tone: 'border-blue-400/25 bg-blue-400/10 text-blue-100' },
  { id: 'Em andamento', label: 'Em andamento', tone: 'border-sky-400/25 bg-sky-400/10 text-sky-100' },
  { id: 'Concluída', label: 'Concluída', tone: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' }
] as const;

export const expenseCategories = [
  { value: 'Alimentacao', label: 'Alimentação' },
  { value: 'Decoracao', label: 'Decoração' },
  { value: 'Local', label: 'Local' },
  { value: 'Musica', label: 'Música' },
  { value: 'FotoVideo', label: 'Foto e vídeo' },
  { value: 'Lembrancas', label: 'Lembranças' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Equipe', label: 'Equipe' },
  { value: 'Outros', label: 'Outros' }
] as const;

export const maximumExpectedGuests = 1_000_000;
export const maximumPartyLocationLength = 150;
export const maximumCurrencyAmount = 999_999_999_999;
