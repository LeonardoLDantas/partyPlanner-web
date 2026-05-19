import type {
  CreateBudgetItemInput,
  CreateGuestInput,
  CreatePartyInput,
  CreateTaskInput,
  PartyRepository,
  UpdateTaskInput,
  UpdatePartyInput
} from '@/domain/ports/partyRepository';
import type { Party } from '@/domain/entities/party';
import type { HttpClient } from '@/infrastructure/http/httpClient';

export class HttpPartyRepository implements PartyRepository {
  constructor(private readonly httpClient: HttpClient) {}

  getParties() {
    return this.httpClient.request<Party[]>('/api/parties');
  }

  createParty(input: CreatePartyInput) {
    return this.httpClient.request<Party>('/api/parties', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  updateParty(partyId: string, input: UpdatePartyInput) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
  }

  createTask(partyId: string, input: CreateTaskInput) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  updateTask(partyId: string, taskId: string, input: UpdateTaskInput) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
  }

  createGuest(partyId: string, input: CreateGuestInput) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}/guests`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  createBudgetItem(partyId: string, input: CreateBudgetItemInput) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}/budget-items`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  updateBudgetItem(partyId: string, budgetItemId: string, input: CreateBudgetItemInput) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}/budget-items/${budgetItemId}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
  }

  deleteBudgetItem(partyId: string, budgetItemId: string) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}/budget-items/${budgetItemId}`, {
      method: 'DELETE'
    });
  }

  toggleTask(partyId: string, taskId: string) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}/tasks/${taskId}/toggle`, {
      method: 'PATCH'
    });
  }

  getInvitation(token: string) {
    return this.httpClient.request<import('@/domain/entities/party').Invitation>(`/api/invitations/${token}`);
  }

  respondInvitation(token: string, status: 'Confirmado' | 'Recusou') {
    return this.httpClient.request<import('@/domain/entities/party').Invitation>(`/api/invitations/${token}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }
}
