export type GuestStatus = 'Confirmado' | 'Pendente' | 'Recusou';

export type Task = {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: string;
  done: boolean;
};

export type Guest = {
  id: string;
  name: string;
  group: string;
  status: GuestStatus;
};

export type BudgetItem = {
  id: string;
  label: string;
  category: string;
  amount: number;
};

export type Party = {
  id: string;
  ownerUserId: string;
  name: string;
  category: string;
  date: string;
  time: string;
  location: string;
  expectedGuests: number;
  canEdit: boolean;
  tasks: Task[];
  guests: Guest[];
  budget: {
    estimated: number;
    spent: number;
    items: BudgetItem[];
  };
};
