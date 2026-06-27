import type { GuestGroup, GuestType, InviteType, Invitation, Party } from '@/domain/entities/party';

export type CreatePartyInput = {
  name: string;
  category: string;
  date: string;
  time?: string;
  location: string;
  coverImageUrl?: string;
  expectedGuests?: number;
  estimatedBudget: number | null;
  isFinalized?: boolean;
};

export type UpdatePartyInput = CreatePartyInput;

export type CreateTaskInput = {
  title: string;
  assignee: string;
  dueDate?: string;
  description?: string;
  status?: string;
};

export type UpdateTaskInput = {
  title?: string;
  assignee?: string;
  description?: string;
  status?: string;
};

export type CreateConviteInput = {
  nome: string;
  observacao?: string;
  tipo: InviteType;
  quantidadeSenhas: number;
  senhaPresente?: string;
};

export type UpdateConviteInput = {
  nome: string;
  observacao?: string;
  tipo: InviteType;
  senhaPresente?: string;
};

export type CreateGuestInput = {
  name: string;
  group: GuestGroup;
  type: GuestType;
  email?: string;
  phoneNumber?: string;
};

export type UpdateGuestInput = CreateGuestInput;

export type CreateBudgetItemInput = {
  label: string;
  category: string;
  amount: number;
  isPaid: boolean;
};

export interface PartyRepository {
  getParties(): Promise<Party[]>;
  createParty(input: CreatePartyInput): Promise<Party>;
  updateParty(partyId: string, input: UpdatePartyInput): Promise<Party>;
  deleteParty(partyId: string): Promise<void>;
  createTask(partyId: string, input: CreateTaskInput): Promise<Party>;
  updateTask(partyId: string, taskId: string, input: UpdateTaskInput): Promise<Party>;
  deleteTask(partyId: string, taskId: string): Promise<Party>;
  toggleTask(partyId: string, taskId: string): Promise<Party>;
  createConvite(partyId: string, input: CreateConviteInput): Promise<Party>;
  updateConvite(partyId: string, conviteId: string, input: UpdateConviteInput): Promise<Party>;
  deleteConvite(partyId: string, conviteId: string): Promise<Party>;
  addGuestToConvite(partyId: string, conviteId: string, input: CreateGuestInput): Promise<Party>;
  updateGuestInConvite(partyId: string, conviteId: string, guestId: string, input: UpdateGuestInput): Promise<Party>;
  deleteGuestFromConvite(partyId: string, conviteId: string, guestId: string): Promise<Party>;
  createBudgetItem(partyId: string, input: CreateBudgetItemInput): Promise<Party>;
  updateBudgetItem(partyId: string, budgetItemId: string, input: CreateBudgetItemInput): Promise<Party>;
  deleteBudgetItem(partyId: string, budgetItemId: string): Promise<Party>;
  getInvitation(token: string): Promise<Invitation>;
  respondInvitation(token: string, status: 'Confirmado' | 'Recusou'): Promise<Invitation>;
}
