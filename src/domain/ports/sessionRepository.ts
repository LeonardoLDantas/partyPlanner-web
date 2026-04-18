import type { AuthSession } from '@/domain/entities/auth';

export interface SessionRepository {
  load(): Promise<AuthSession | null>;
  save(session: AuthSession): Promise<void>;
  clear(): Promise<void>;
  getAccessToken(): string;
}
