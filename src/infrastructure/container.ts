import { bootstrapSession } from '@/application/use-cases/bootstrapSession';
import { loadPlannerDashboard } from '@/application/use-cases/loadPlannerDashboard';
import { HttpClient } from '@/infrastructure/http/httpClient';
import { HttpAuthRepository } from '@/infrastructure/repositories/httpAuthRepository';
import { HttpNotificationRepository } from '@/infrastructure/repositories/httpNotificationRepository';
import { HttpPartyRepository } from '@/infrastructure/repositories/httpPartyRepository';
import { LocalNotificationSettingsRepository } from '@/infrastructure/repositories/localNotificationSettingsRepository';
import { LocalSessionRepository } from '@/infrastructure/repositories/localSessionRepository';

const sessionRepository = new LocalSessionRepository();
const httpClient = new HttpClient(() => sessionRepository.getAccessToken());

const authRepository = new HttpAuthRepository(httpClient);
const partyRepository = new HttpPartyRepository(httpClient);
const notificationRepository = new HttpNotificationRepository(httpClient);
const notificationSettingsRepository = new LocalNotificationSettingsRepository();

export const container = {
  authRepository,
  partyRepository,
  notificationRepository,
  notificationSettingsRepository,
  sessionRepository,
  bootstrapSession: () => bootstrapSession(authRepository, sessionRepository),
  loadPlannerDashboard: () => loadPlannerDashboard(partyRepository, notificationRepository)
};
