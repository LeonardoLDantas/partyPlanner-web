import type { NotificationRepository } from '@/domain/ports/notificationRepository';
import type { PartyRepository } from '@/domain/ports/partyRepository';

export async function loadPlannerDashboard(
  partyRepository: PartyRepository,
  notificationRepository: NotificationRepository
) {
  const [parties, notifications] = await Promise.all([
    partyRepository.getParties(),
    notificationRepository.getAll().catch(() => [])
  ]);

  return { parties, notifications };
}
