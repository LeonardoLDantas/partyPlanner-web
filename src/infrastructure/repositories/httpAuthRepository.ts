import type {
  AuthRepository,
  LoginInput,
  RegisterInput
} from '@/domain/ports/authRepository';
import type { AuthenticatedUser, AuthSession } from '@/domain/entities/auth';
import type { HttpClient } from '@/infrastructure/http/httpClient';

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly httpClient: HttpClient) {}

  login(input: LoginInput) {
    return this.httpClient.request<AuthSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  register(input: RegisterInput) {
    return this.httpClient.request<AuthSession>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  me(accessToken: string) {
    return this.httpClient.request<AuthenticatedUser>('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }
}
