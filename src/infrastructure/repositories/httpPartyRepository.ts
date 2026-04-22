import type {
  CreateBudgetItemInput,
  CreateGuestInput,
  CreatePartyInput,
  CreateTaskInput,
  PartyRepository,
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

  toggleTask(partyId: string, taskId: string) {
    return this.httpClient.request<Party>(`/api/parties/${partyId}/tasks/${taskId}/toggle`, {
      method: 'PATCH'
    });
  }
}
