import type { AuthSession } from '@/domain/entities/auth';
import type { SessionRepository } from '@/domain/ports/sessionRepository';

const sessionKey = 'party-planner-web-session';

export class LocalSessionRepository implements SessionRepository {
  private accessToken = '';

  async load() {
    const raw = localStorage.getItem(sessionKey);
    if (!raw) {
      this.accessToken = '';
      return null;
    }

    const session = JSON.parse(raw) as AuthSession;
    this.accessToken = session.accessToken;
    return session;
  }

  async save(session: AuthSession) {
    this.accessToken = session.accessToken;
    localStorage.setItem(sessionKey, JSON.stringify(session));
  }

  async clear() {
    this.accessToken = '';
    localStorage.removeItem(sessionKey);
  }

  getAccessToken() {
    return this.accessToken;
  }
}
