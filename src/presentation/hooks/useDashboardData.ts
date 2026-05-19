import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Party } from '@/domain/entities/party';
import type {
  CreateBudgetItemInput,
  CreatePartyInput,
  CreateTaskInput,
  UpdateTaskInput,
  UpdatePartyInput
} from '@/domain/ports/partyRepository';
import { container } from '@/infrastructure/container';

const dashboardKey = ['dashboard'];

function syncPartyIntoDashboard(existing: DashboardData | undefined, updatedParty: Party) {
  if (!existing) {
    return existing;
  }

  const nextParties = existing.parties.some((party) => party.id === updatedParty.id)
    ? existing.parties.map((party) => (party.id === updatedParty.id ? updatedParty : party))
    : [updatedParty, ...existing.parties];

  return { ...existing, parties: nextParties };
}

export type DashboardData = Awaited<ReturnType<typeof container.loadPlannerDashboard>>;

export function useDashboardData(enabled: boolean) {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: dashboardKey,
    queryFn: () => container.loadPlannerDashboard(),
    enabled
  });

  const markAllAsRead = useMutation({
    mutationFn: () => container.notificationRepository.markAllAsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    }
  });

  const clearAllNotifications = useMutation({
    mutationFn: () => container.notificationRepository.clearAll(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKey });
    }
  });

  const createParty = useMutation({
    mutationFn: async (variables: CreatePartyInput) =>
      container.partyRepository.createParty(variables),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  const updateParty = useMutation({
    mutationFn: async (variables: { partyId: string } & UpdatePartyInput) =>
      container.partyRepository.updateParty(variables.partyId, {
        name: variables.name,
        category: variables.category,
        date: variables.date,
        time: variables.time,
        location: variables.location,
        coverImageUrl: variables.coverImageUrl,
        expectedGuests: variables.expectedGuests,
        estimatedBudget: variables.estimatedBudget,
        isFinalized: variables.isFinalized
      }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  const createTask = useMutation({
    mutationFn: async (variables: { partyId: string } & CreateTaskInput) =>
      container.partyRepository.createTask(variables.partyId, {
        title: variables.title,
        assignee: variables.assignee,
        description: variables.description,
        status: variables.status
      }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  const updateTask = useMutation({
    mutationFn: async (variables: { partyId: string; taskId: string } & UpdateTaskInput) =>
      container.partyRepository.updateTask(variables.partyId, variables.taskId, {
        title: variables.title,
        assignee: variables.assignee,
        description: variables.description,
        status: variables.status
      }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  const createGuest = useMutation({
    mutationFn: async (variables: { partyId: string; name: string; group: string; email?: string; phoneNumber?: string }) =>
      container.partyRepository.createGuest(variables.partyId, {
        name: variables.name,
        group: variables.group,
        email: variables.email,
        phoneNumber: variables.phoneNumber
      }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  const createBudgetItem = useMutation({
    mutationFn: async (variables: { partyId: string } & CreateBudgetItemInput) =>
      container.partyRepository.createBudgetItem(variables.partyId, {
        label: variables.label,
        category: variables.category,
        amount: variables.amount
      }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  const updateBudgetItem = useMutation({
    mutationFn: async (variables: { partyId: string; budgetItemId: string } & CreateBudgetItemInput) =>
      container.partyRepository.updateBudgetItem(variables.partyId, variables.budgetItemId, {
        label: variables.label,
        category: variables.category,
        amount: variables.amount
      }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  const deleteBudgetItem = useMutation({
    mutationFn: async (variables: { partyId: string; budgetItemId: string }) =>
      container.partyRepository.deleteBudgetItem(variables.partyId, variables.budgetItemId),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  const toggleTask = useMutation({
    mutationFn: async (variables: { partyId: string; taskId: string }) =>
      container.partyRepository.toggleTask(variables.partyId, variables.taskId),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        syncPartyIntoDashboard(current, updatedParty)
      );
    }
  });

  return {
    dashboardQuery,
    createParty,
    updateParty,
    createTask,
    updateTask,
    createGuest,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    toggleTask,
    markAllAsRead,
    clearAllNotifications
  };
}
