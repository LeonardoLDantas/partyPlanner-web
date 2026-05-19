import type { Invitation, Party } from '@/domain/entities/party';

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

export type CreateGuestInput = {
  name: string;
  group: string;
  email?: string;
  phoneNumber?: string;
};

export type CreateBudgetItemInput = {
  label: string;
  category: string;
  amount: number;
};

export interface PartyRepository {
  getParties(): Promise<Party[]>;
  createParty(input: CreatePartyInput): Promise<Party>;
  updateParty(partyId: string, input: UpdatePartyInput): Promise<Party>;
  createTask(partyId: string, input: CreateTaskInput): Promise<Party>;
  updateTask(partyId: string, taskId: string, input: UpdateTaskInput): Promise<Party>;
  createGuest(partyId: string, input: CreateGuestInput): Promise<Party>;
  createBudgetItem(partyId: string, input: CreateBudgetItemInput): Promise<Party>;
  updateBudgetItem(partyId: string, budgetItemId: string, input: CreateBudgetItemInput): Promise<Party>;
  deleteBudgetItem(partyId: string, budgetItemId: string): Promise<Party>;
  toggleTask(partyId: string, taskId: string): Promise<Party>;
  getInvitation(token: string): Promise<Invitation>;
  respondInvitation(token: string, status: 'Confirmado' | 'Recusou'): Promise<Invitation>;
}
