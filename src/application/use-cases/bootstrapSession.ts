import type { AuthRepository } from '@/domain/ports/authRepository';
import type { SessionRepository } from '@/domain/ports/sessionRepository';

export async function bootstrapSession(
  authRepository: AuthRepository,
  sessionRepository: SessionRepository
) {
  const storedSession = await sessionRepository.load();
  if (!storedSession) {
    return null;
  }

  try {
    const user = await authRepository.me(storedSession.accessToken);
    const session = { ...storedSession, user };
    await sessionRepository.save(session);
    return session;
  } catch {
    await sessionRepository.clear();
    return null;
  }
}
