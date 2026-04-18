import type { Party, GuestStatus } from '@/domain/entities/party';

export type CreatePartyInput = {
  name: string;
  category: string;
  date: string;
  location: string;
  estimatedBudget: number;
};

export type CreateTaskInput = {
  title: string;
  assignee: string;
};

export type CreateGuestInput = {
  name: string;
  group: string;
  status: GuestStatus;
};

export type CreateBudgetItemInput = {
  label: string;
  category: string;
  amount: number;
};

export interface PartyRepository {
  getParties(): Promise<Party[]>;
  createParty(input: CreatePartyInput): Promise<Party>;
  createTask(partyId: string, input: CreateTaskInput): Promise<Party>;
  createGuest(partyId: string, input: CreateGuestInput): Promise<Party>;
  createBudgetItem(partyId: string, input: CreateBudgetItemInput): Promise<Party>;
  toggleTask(partyId: string, taskId: string): Promise<Party>;
}
