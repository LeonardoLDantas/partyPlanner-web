import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Party } from '@/domain/entities/party';
import type {
  CreateBudgetItemInput,
  CreateConviteInput,
  CreateGuestInput,
  CreatePartyInput,
  CreateTaskInput,
  UpdateConviteInput,
  UpdateGuestInput,
  UpdateTaskInput,
  UpdatePartyInput
} from '@/domain/ports/partyRepository';
import { container } from '@/infrastructure/container';

const dashboardKey = ['dashboard'];

function syncPartyIntoDashboard(existing: DashboardData | undefined, updatedParty: Party) {
  if (!existing) return existing;
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
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: dashboardKey }); }
  });

  const clearAllNotifications = useMutation({
    mutationFn: () => container.notificationRepository.clearAll(),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: dashboardKey }); }
  });

  const createParty = useMutation({
    mutationFn: (variables: CreatePartyInput) => container.partyRepository.createParty(variables),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const updateParty = useMutation({
    mutationFn: (variables: { partyId: string } & UpdatePartyInput) =>
      container.partyRepository.updateParty(variables.partyId, { name: variables.name, category: variables.category, date: variables.date, time: variables.time, location: variables.location, coverImageUrl: variables.coverImageUrl, expectedGuests: variables.expectedGuests, estimatedBudget: variables.estimatedBudget, isFinalized: variables.isFinalized }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const deleteParty = useMutation({
    mutationFn: (partyId: string) => container.partyRepository.deleteParty(partyId),
    onSuccess: (_, deletedPartyId) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) =>
        current ? { ...current, parties: current.parties.filter((party) => party.id !== deletedPartyId) } : current
      );
    }
  });

  const createTask = useMutation({
    mutationFn: (variables: { partyId: string } & CreateTaskInput) =>
      container.partyRepository.createTask(variables.partyId, { title: variables.title, assignee: variables.assignee, description: variables.description, status: variables.status }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const updateTask = useMutation({
    mutationFn: (variables: { partyId: string; taskId: string } & UpdateTaskInput) =>
      container.partyRepository.updateTask(variables.partyId, variables.taskId, { title: variables.title, assignee: variables.assignee, description: variables.description, status: variables.status }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const deleteTask = useMutation({
    mutationFn: (variables: { partyId: string; taskId: string }) =>
      container.partyRepository.deleteTask(variables.partyId, variables.taskId),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const toggleTask = useMutation({
    mutationFn: (variables: { partyId: string; taskId: string }) =>
      container.partyRepository.toggleTask(variables.partyId, variables.taskId),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const createConvite = useMutation({
    mutationFn: (variables: { partyId: string } & CreateConviteInput) =>
      container.partyRepository.createConvite(variables.partyId, { nome: variables.nome, observacao: variables.observacao, tipo: variables.tipo, quantidadeSenhas: variables.quantidadeSenhas, senhaPresente: variables.senhaPresente }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const updateConvite = useMutation({
    mutationFn: (variables: { partyId: string; conviteId: string } & UpdateConviteInput) =>
      container.partyRepository.updateConvite(variables.partyId, variables.conviteId, { nome: variables.nome, observacao: variables.observacao, tipo: variables.tipo, senhaPresente: variables.senhaPresente }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const deleteConvite = useMutation({
    mutationFn: (variables: { partyId: string; conviteId: string }) =>
      container.partyRepository.deleteConvite(variables.partyId, variables.conviteId),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const addGuestToConvite = useMutation({
    mutationFn: (variables: { partyId: string; conviteId: string } & CreateGuestInput) =>
      container.partyRepository.addGuestToConvite(variables.partyId, variables.conviteId, { name: variables.name, group: variables.group, type: variables.type, email: variables.email, phoneNumber: variables.phoneNumber }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const updateGuestInConvite = useMutation({
    mutationFn: (variables: { partyId: string; conviteId: string; guestId: string } & UpdateGuestInput) =>
      container.partyRepository.updateGuestInConvite(variables.partyId, variables.conviteId, variables.guestId, { name: variables.name, group: variables.group, type: variables.type, email: variables.email, phoneNumber: variables.phoneNumber }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const deleteGuestFromConvite = useMutation({
    mutationFn: (variables: { partyId: string; conviteId: string; guestId: string }) =>
      container.partyRepository.deleteGuestFromConvite(variables.partyId, variables.conviteId, variables.guestId),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const createBudgetItem = useMutation({
    mutationFn: (variables: { partyId: string } & CreateBudgetItemInput) =>
      container.partyRepository.createBudgetItem(variables.partyId, { label: variables.label, category: variables.category, amount: variables.amount, isPaid: variables.isPaid }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const updateBudgetItem = useMutation({
    mutationFn: (variables: { partyId: string; budgetItemId: string } & CreateBudgetItemInput) =>
      container.partyRepository.updateBudgetItem(variables.partyId, variables.budgetItemId, { label: variables.label, category: variables.category, amount: variables.amount, isPaid: variables.isPaid }),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  const deleteBudgetItem = useMutation({
    mutationFn: (variables: { partyId: string; budgetItemId: string }) =>
      container.partyRepository.deleteBudgetItem(variables.partyId, variables.budgetItemId),
    onSuccess: (updatedParty) => {
      queryClient.setQueryData<DashboardData | undefined>(dashboardKey, (current) => syncPartyIntoDashboard(current, updatedParty));
    }
  });

  return {
    dashboardQuery,
    createParty, updateParty, deleteParty,
    createTask, updateTask, deleteTask, toggleTask,
    createConvite, updateConvite, deleteConvite,
    addGuestToConvite, updateGuestInConvite, deleteGuestFromConvite,
    createBudgetItem, updateBudgetItem, deleteBudgetItem,
    markAllAsRead, clearAllNotifications
  };
}
