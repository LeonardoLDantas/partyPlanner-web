export type GuestStatus = 'Confirmado' | 'Pendente' | 'Recusou';
export type GuestType = 'Adulto' | 'Crianca';
export type GuestGroup = 'Familia' | 'Amigos' | 'Trabalho' | 'Escola' | 'Vizinhos' | 'Outros';
export type InviteType = 'Familia' | 'Amigos' | 'Trabalho' | 'Outro';

export type Task = {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  description: string;
  status: string;
  done: boolean;
};

export type Guest = {
  id: string;
  name: string;
  group: GuestGroup;
  type: GuestType;
  status: GuestStatus;
  invitationToken: string;
  email: string;
  phoneNumber: string;
};

export type ConviteSenha = {
  id: string;
  codigo: string;
};

export type Convite = {
  id: string;
  nome: string;
  observacao: string;
  tipo: InviteType;
  senhaPresente: string;
  senhas: ConviteSenha[];
  guests: Guest[];
};

export type Invitation = {
  token: string;
  guestName: string;
  guestStatus: GuestStatus;
  partyName: string;
  partyDate: string;
  partyTime: string;
  partyLocation: string;
  partyCoverImageUrl: string;
};

export type BudgetItem = {
  id: string;
  label: string;
  category: string;
  amount: number;
  isPaid: boolean;
};

export type Party = {
  id: string;
  ownerUserId: string;
  name: string;
  category: string;
  date: string;
  time: string;
  location: string;
  coverImageUrl: string;
  expectedGuests: number;
  isFinalized: boolean;
  canEdit: boolean;
  tasks: Task[];
  convites: Convite[];
  budget: {
    estimated: number | null;
    spent: number;
    items: BudgetItem[];
  };
};
