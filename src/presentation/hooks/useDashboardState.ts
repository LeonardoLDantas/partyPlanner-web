import { useEffect, useMemo, useRef, useState } from 'react';

import type { GuestStatus, GuestType, Party } from '@/domain/entities/party';
import type { ToastMessage } from '@/presentation/components/ui/toast';
import { maximumExpectedGuests, maximumPartyLocationLength, partyCategories } from '@/domain/constants/party.constants';
import { isUpcomingParty, normalizeTaskStatus } from '@/domain/utils/party.utils';
import { currencyFormatter, parseCurrencyInput } from '@/shared/utils/formatters';
import { useDashboardData } from '@/presentation/hooks/useDashboardData';

export type Section = 'Painel' | 'Eventos' | 'Convidados' | 'Tarefas' | 'Despesas' | 'Ajustes';
export type PartyCategoryFilter = (typeof partyCategories)[number];
export type TaskItem = Party['tasks'][number];

export type PartyFormState = {
  name: string;
  category: string;
  date: string;
  time: string;
  location: string;
  coverImageUrl: string;
  expectedGuests: string;
  estimatedBudget: string;
  skipEstimatedBudget: boolean;
  isFinalized: boolean;
};

export function createEmptyPartyForm(): PartyFormState {
  return {
    name: '',
    category: 'Aniversario',
    date: '',
    time: '19:00',
    location: '',
    coverImageUrl: '',
    expectedGuests: '60',
    estimatedBudget: '',
    skipEstimatedBudget: false,
    isFinalized: false
  };
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function isPastPartySchedule(date: string, time: string) {
  if (!date || !time) {
    return false;
  }

  const scheduledAt = new Date(`${date}T${time}`);
  return !Number.isNaN(scheduledAt.getTime()) && scheduledAt.getTime() < Date.now();
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX_SIDE = 1200;
      let { naturalWidth: w, naturalHeight: h } = img;

      if (w > MAX_SIDE || h > MAX_SIDE) {
        if (w >= h) {
          h = Math.round((h * MAX_SIDE) / w);
          w = MAX_SIDE;
        } else {
          w = Math.round((w * MAX_SIDE) / h);
          h = MAX_SIDE;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Não foi possível processar a imagem.'));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível ler a imagem.'));
    };

    img.src = objectUrl;
  });
}

export function useDashboardState() {
  const [activeSection, setActiveSection] = useState<Section>('Painel');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PartyCategoryFilter>('Todos');
  const [guestFilter, setGuestFilter] = useState<'Todos' | GuestStatus>('Todos');
  const [guestSearch, setGuestSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [guestDialogOpen, setGuestDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [actionError, setActionError] = useState('');
  const [partyForm, setPartyForm] = useState<PartyFormState>(createEmptyPartyForm);
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', description: '' });
  const [editingTaskId, setEditingTaskId] = useState('');
  const [editingTaskForm, setEditingTaskForm] = useState({ title: '', assignee: '', description: '' });
  const [viewingTask, setViewingTask] = useState<TaskItem | null>(null);
  const [guestForm, setGuestForm] = useState<{ name: string; group: string; type: GuestType; email: string; phoneNumber: string }>({
    name: '',
    group: '',
    type: 'Adulto',
    email: '',
    phoneNumber: '+55 '
  });
  const [budgetForm, setBudgetForm] = useState({ label: '', category: 'Outros', amount: '', isPaid: false });
  const [editingBudgetItemId, setEditingBudgetItemId] = useState('');
  const [editingBudgetAmount, setEditingBudgetAmount] = useState('');
  const [draggingTaskId, setDraggingTaskId] = useState('');

  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const notificationsInitializedRef = useRef(false);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const partySelectorDragRef = useRef({ isDragging: false, moved: false, startX: 0, scrollLeft: 0 });

  const {
    dashboardQuery,
    createParty,
    updateParty,
    deleteParty,
    createTask,
    updateTask,
    deleteTask,
    createGuest,
    deleteGuest,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    markAllAsRead,
    clearAllNotifications
  } = useDashboardData(true);

  const parties = dashboardQuery.data?.parties ?? [];
  const notifications = dashboardQuery.data?.notifications ?? [];
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const filteredParties = useMemo(
    () =>
      categoryFilter === 'Todos'
        ? parties
        : parties.filter((party) => party.category === categoryFilter),
    [categoryFilter, parties]
  );

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === selectedPartyId) ?? filteredParties[0] ?? parties[0] ?? null,
    [filteredParties, parties, selectedPartyId]
  );

  const selectedPartyLocked = Boolean(selectedParty && (selectedParty.isFinalized || !selectedParty.canEdit));

  const featuredParty = useMemo(() => {
    return [...parties].filter(isUpcomingParty).sort((first, second) => {
      const firstTime = new Date(`${first.date}T${first.time || '00:00'}`).getTime();
      const secondTime = new Date(`${second.date}T${second.time || '00:00'}`).getTime();
      return firstTime - secondTime;
    })[0] ?? null;
  }, [parties]);

  const totalBudget = parties.reduce((sum, party) => sum + (party.budget?.spent ?? 0), 0);
  const confirmedGuests = parties.reduce(
    (sum, party) => sum + party.guests.filter((guest) => guest.status === 'Confirmado').length,
    0
  );
  const completedTasks = parties.reduce(
    (sum, party) => sum + party.tasks.filter((task) => task.done).length,
    0
  );
  const totalTasks = parties.reduce((sum, party) => sum + party.tasks.length, 0);

  const selectedGuests = selectedParty?.guests ?? [];
  const filteredGuests = selectedGuests.filter((guest) => {
    const search = guestSearch.trim().toLowerCase();
    const matchesStatus = guestFilter === 'Todos' || guest.status === guestFilter;
    const matchesSearch =
      search.length === 0 ||
      guest.name.toLowerCase().includes(search) ||
      guest.group.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    if (!selectedPartyId && parties[0]) {
      setSelectedPartyId(parties[0].id);
    }
  }, [parties, selectedPartyId]);

  useEffect(() => {
    if (!dashboardQuery.data) {
      return;
    }

    if (!notificationsInitializedRef.current) {
      notifications.forEach((n) => seenNotificationIdsRef.current.add(n.id));
      notificationsInitializedRef.current = true;
      return;
    }

    const freshNotifications = notifications.filter(
      (n) =>
        !seenNotificationIdsRef.current.has(n.id) &&
        n.title.trim().toLowerCase() !== 'login realizado'
    );

    freshNotifications.forEach((n) => {
      seenNotificationIdsRef.current.add(n.id);
      pushToast(n.title, n.message);
    });
  }, [dashboardQuery.data, notifications]);

  function pushToast(title: string, message: string) {
    const toast = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, title, message };
    setToasts((current) => [...current, toast].slice(-3));
    window.setTimeout(() => dismissToast(toast.id), 4200);
  }

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function handleMobileCarouselScroll() {
    const carousel = mobileCarouselRef.current;
    const mobileUpcomingParties = filteredParties.filter(isUpcomingParty);

    if (!carousel || mobileUpcomingParties.length === 0) {
      return;
    }

    const firstCard = carousel.querySelector<HTMLElement>('[data-party-card]');

    if (!firstCard) {
      return;
    }

    const gap = 16;
    const itemWidth = firstCard.offsetWidth + gap;
    const index = Math.round(carousel.scrollLeft / itemWidth);
    const party = mobileUpcomingParties[Math.max(0, Math.min(index, mobileUpcomingParties.length - 1))];

    if (party && party.id !== selectedPartyId) {
      setSelectedPartyId(party.id);
    }
  }

  async function handleCreateParty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPastPartySchedule(partyForm.date, partyForm.time)) {
      setActionError('Informe uma data e um horário atuais ou futuros para a festa.');
      return;
    }

    const expectedGuests = Number(partyForm.expectedGuests) || 0;
    if (expectedGuests > maximumExpectedGuests) {
      setActionError('Informe no máximo 1.000.000 de convidados esperados.');
      return;
    }

    if (partyForm.location.trim().length > maximumPartyLocationLength) {
      setActionError('Informe um local com no máximo 150 caracteres.');
      return;
    }

    const estimatedBudget = parseCurrencyInput(partyForm.estimatedBudget);

    try {
      setActionError('');
      const payload = {
        name: partyForm.name.trim(),
        category: partyForm.category,
        date: partyForm.date,
        time: partyForm.time,
        location: partyForm.location.trim(),
        coverImageUrl: partyForm.coverImageUrl,
        expectedGuests,
        estimatedBudget: partyForm.skipEstimatedBudget ? null : estimatedBudget,
        isFinalized: partyForm.isFinalized
      };
      const saved = editingPartyId
        ? await updateParty.mutateAsync({ partyId: editingPartyId, ...payload })
        : await createParty.mutateAsync(payload);

      setPartyForm(createEmptyPartyForm());
      setEditingPartyId('');
      setSelectedPartyId(saved.id);
      setActiveSection('Eventos');
      setCreateOpen(false);
      pushToast(editingPartyId ? 'Festa atualizada' : 'Festa criada', `A festa "${saved.name}" foi salva.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível criar a festa.');
    }
  }

  function openCreatePartyDialog() {
    setActionError('');
    setEditingPartyId('');
    setPartyForm(createEmptyPartyForm());
    setCreateOpen(true);
  }

  function openEditPartyDialog(party: Party) {
    setActionError('');
    setEditingPartyId(party.id);
    setPartyForm({
      name: party.name,
      category: party.category,
      date: party.date,
      time: party.time || '19:00',
      location: party.location,
      coverImageUrl: party.coverImageUrl,
      expectedGuests: String(party.expectedGuests || ''),
      estimatedBudget: party.budget?.estimated == null ? '' : currencyFormatter.format(party.budget.estimated),
      skipEstimatedBudget: party.budget?.estimated == null,
      isFinalized: party.isFinalized
    });
    setCreateOpen(true);
  }

  async function handleDeleteParty() {
    if (!editingPartyId) {
      return;
    }

    try {
      setActionError('');
      await deleteParty.mutateAsync(editingPartyId);
      setSelectedPartyId('');
      setEditingPartyId('');
      setPartyForm(createEmptyPartyForm());
      setCreateOpen(false);
      setActiveSection('Eventos');
      pushToast('Festa excluída', 'O evento foi removido do planner.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível excluir a festa.');
    }
  }

  async function handleCoverImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readImageAsDataUrl(file);
      setPartyForm((current) => ({ ...current, coverImageUrl: dataUrl }));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível carregar a imagem.');
    }
  }

  async function handleTogglePartyFinalized(party: Party) {
    try {
      setActionError('');
      const updated = await updateParty.mutateAsync({
        partyId: party.id,
        name: party.name,
        category: party.category,
        date: party.date,
        time: party.time,
        location: party.location,
        coverImageUrl: party.coverImageUrl,
        expectedGuests: party.expectedGuests,
        estimatedBudget: party.budget.estimated,
        isFinalized: !party.isFinalized
      });
      pushToast(
        updated.isFinalized ? 'Evento finalizado' : 'Evento reaberto',
        updated.isFinalized ? `"${updated.name}" saiu da home.` : `"${updated.name}" voltou para a home.`
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível atualizar o evento.');
    }
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível adicionar novas tarefas.');
      return;
    }

    try {
      setActionError('');
      await createTask.mutateAsync({ partyId: selectedParty.id, ...taskForm, status: 'Pendente' });
      setTaskForm({ title: '', assignee: '', description: '' });
      setTaskDialogOpen(false);
      pushToast('Tarefa criada', 'A nova etapa foi adicionada ao evento.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível criar a tarefa.');
    }
  }

  async function handleMoveTask(taskId: string, status: string) {
    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível mover tarefas.');
      return;
    }

    try {
      setActionError('');
      await updateTask.mutateAsync({ partyId: selectedParty.id, taskId, status });
      pushToast('Tarefa movida', `A tarefa foi movida para ${status}.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível mover a tarefa.');
    }
  }

  function startTaskEdit(task: TaskItem) {
    setEditingTaskId(task.id);
    setEditingTaskForm({
      title: task.title,
      assignee: task.assignee,
      description: task.description ?? ''
    });
  }

  async function handleSaveTask(task: TaskItem) {
    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível editar tarefas.');
      return;
    }

    try {
      setActionError('');
      await updateTask.mutateAsync({
        partyId: selectedParty.id,
        taskId: task.id,
        title: editingTaskForm.title.trim(),
        assignee: editingTaskForm.assignee.trim(),
        description: editingTaskForm.description.trim(),
        status: normalizeTaskStatus(task.status, task.done)
      });
      setEditingTaskId('');
      pushToast('Tarefa atualizada', 'O card foi salvo com a descrição.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível salvar a tarefa.');
    }
  }

  async function handleDeleteTask(task: TaskItem) {
    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível excluir tarefas.');
      return;
    }

    try {
      setActionError('');
      await deleteTask.mutateAsync({ partyId: selectedParty.id, taskId: task.id });
      if (editingTaskId === task.id) {
        cancelTaskEdit();
      }
      pushToast('Tarefa removida', `"${task.title}" saiu do Kanban.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível excluir a tarefa.');
    }
  }

  function cancelTaskEdit() {
    setEditingTaskId('');
    setEditingTaskForm({ title: '', assignee: '', description: '' });
  }

  function handleTaskDragStart(event: React.DragEvent<HTMLElement>, taskId: string) {
    setDraggingTaskId(taskId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', taskId);
  }

  function handleTaskDragOver(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function handleTaskDrop(event: React.DragEvent<HTMLElement>, status: string) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain') || draggingTaskId;
    setDraggingTaskId('');

    if (!taskId) {
      return;
    }

    const currentTask = selectedParty?.tasks.find((task) => task.id === taskId);
    if (currentTask && normalizeTaskStatus(currentTask.status, currentTask.done) !== status) {
      void handleMoveTask(taskId, status);
    }
  }

  async function handleCreateGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível adicionar convidados.');
      return;
    }

    try {
      setActionError('');
      await createGuest.mutateAsync({ partyId: selectedParty.id, ...guestForm });
      setGuestForm({ name: '', group: '', type: 'Adulto', email: '', phoneNumber: '+55 ' });
      setGuestDialogOpen(false);
      pushToast('Convidado adicionado', 'A lista de presença foi atualizada.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível adicionar o convidado.');
    }
  }

  async function handleDeleteGuest(guest: Party['guests'][number]) {
    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível excluir convidados.');
      return;
    }

    try {
      setActionError('');
      await deleteGuest.mutateAsync({ partyId: selectedParty.id, guestId: guest.id });
      pushToast('Convidado removido', `"${guest.name}" saiu da lista.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível excluir o convidado.');
    }
  }

  async function handleCopyInvitationLink(guestName: string, invitationToken: string) {
    const invitationUrl = `${window.location.origin}/convite/${invitationToken}`;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      pushToast('Link copiado', `Convite de ${guestName} pronto para enviar.`);
    } catch {
      setActionError(`Link do convite: ${invitationUrl}`);
    }
  }

  function getInvitationUrl(invitationToken: string) {
    return `${window.location.origin}/convite/${invitationToken}`;
  }

  function getInvitationMessage(guestName: string, invitationToken: string) {
    return `Oi, ${guestName}! Você recebeu um convite pelo Celebra. Confirme sua presença aqui: ${getInvitationUrl(invitationToken)}`;
  }

  function getWhatsappUrl(phoneNumber: string, guestName: string, invitationToken: string) {
    const digits = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${digits}?text=${encodeURIComponent(getInvitationMessage(guestName, invitationToken))}`;
  }

  function getMailtoUrl(email: string, guestName: string, invitationToken: string) {
    return `mailto:${email}?subject=${encodeURIComponent('Convite para festa')}&body=${encodeURIComponent(getInvitationMessage(guestName, invitationToken))}`;
  }

  function handlePartySelectorPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    partySelectorDragRef.current = {
      isDragging: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft
    };
  }

  function handlePartySelectorPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!partySelectorDragRef.current.isDragging) {
      return;
    }

    const delta = event.clientX - partySelectorDragRef.current.startX;
    if (Math.abs(delta) > 6) {
      partySelectorDragRef.current.moved = true;
    }

    event.currentTarget.scrollLeft = partySelectorDragRef.current.scrollLeft - delta;
  }

  function handlePartySelectorPointerUp() {
    partySelectorDragRef.current.isDragging = false;
  }

  function handlePartySelectorClick(partyId: string) {
    if (partySelectorDragRef.current.moved) {
      partySelectorDragRef.current.moved = false;
      return;
    }

    setSelectedPartyId(partyId);
  }

  async function handleMarkAllNotificationsRead() {
    await markAllAsRead.mutateAsync();
  }

  async function handleClearNotifications() {
    await clearAllNotifications.mutateAsync();
    setNotificationsOpen(false);
    setMobileNotificationsOpen(false);
  }

  function startBudgetItemEdit(item: Party['budget']['items'][number]) {
    setEditingBudgetItemId(item.id);
    setEditingBudgetAmount(currencyFormatter.format(item.amount));
  }

  async function handleCreateBudgetItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível adicionar despesas.');
      return;
    }

    try {
      setActionError('');
      await createBudgetItem.mutateAsync({
        partyId: selectedParty.id,
        label: budgetForm.label,
        category: budgetForm.category,
        amount: parseCurrencyInput(budgetForm.amount),
        isPaid: budgetForm.isPaid
      });
      setBudgetForm({ label: '', category: 'Outros', amount: '', isPaid: false });
      pushToast('Despesa registrada', 'O financeiro do evento foi atualizado.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível registrar a despesa.');
    }
  }

  async function handleUpdateBudgetItem(item: Party['budget']['items'][number]) {
    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível editar despesas.');
      return;
    }

    try {
      setActionError('');
      await updateBudgetItem.mutateAsync({
        partyId: selectedParty.id,
        budgetItemId: item.id,
        label: item.label,
        category: item.category,
        amount: parseCurrencyInput(editingBudgetAmount),
        isPaid: item.isPaid
      });
      setEditingBudgetItemId('');
      setEditingBudgetAmount('');
      pushToast('Despesa atualizada', 'O valor foi recalculado no orçamento.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível atualizar a despesa.');
    }
  }

  async function handleDeleteBudgetItem(item: Party['budget']['items'][number]) {
    if (!selectedParty) {
      return;
    }

    if (selectedPartyLocked) {
      setActionError('Este evento já foi finalizado. Não é possível excluir despesas.');
      return;
    }

    try {
      setActionError('');
      await deleteBudgetItem.mutateAsync({
        partyId: selectedParty.id,
        budgetItemId: item.id
      });
      if (editingBudgetItemId === item.id) {
        setEditingBudgetItemId('');
        setEditingBudgetAmount('');
      }
      pushToast('Despesa removida', 'O total do orçamento foi atualizado.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível excluir a despesa.');
    }
  }

  async function handleToggleBudgetItemPaid(item: Party['budget']['items'][number]) {
    if (!selectedParty || selectedPartyLocked) {
      return;
    }

    try {
      setActionError('');
      await updateBudgetItem.mutateAsync({
        partyId: selectedParty.id,
        budgetItemId: item.id,
        label: item.label,
        category: item.category,
        amount: item.amount,
        isPaid: !item.isPaid
      });
      pushToast(item.isPaid ? 'Despesa pendente' : 'Despesa paga', `"${item.label}" foi atualizada.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível atualizar o pagamento da despesa.');
    }
  }

  return {
    // state
    activeSection,
    setActiveSection,
    selectedPartyId,
    setSelectedPartyId,
    categoryFilter,
    setCategoryFilter,
    guestFilter,
    setGuestFilter,
    guestSearch,
    setGuestSearch,
    createOpen,
    setCreateOpen,
    editingPartyId,
    setEditingPartyId,
    taskDialogOpen,
    setTaskDialogOpen,
    guestDialogOpen,
    setGuestDialogOpen,
    notificationsOpen,
    setNotificationsOpen,
    mobileNotificationsOpen,
    setMobileNotificationsOpen,
    toasts,
    actionError,
    setActionError,
    partyForm,
    setPartyForm,
    taskForm,
    setTaskForm,
    editingTaskId,
    editingTaskForm,
    setEditingTaskForm,
    viewingTask,
    setViewingTask,
    guestForm,
    setGuestForm,
    budgetForm,
    setBudgetForm,
    editingBudgetItemId,
    editingBudgetAmount,
    setEditingBudgetAmount,
    draggingTaskId,
    setDraggingTaskId,
    // refs
    mobileCarouselRef,
    partySelectorDragRef,
    // derived
    parties,
    notifications,
    unreadNotifications,
    filteredParties,
    selectedParty,
    selectedPartyLocked,
    featuredParty,
    totalBudget,
    confirmedGuests,
    completedTasks,
    totalTasks,
    filteredGuests,
    // mutations (for isPending checks in UI)
    createParty,
    updateParty,
    deleteParty,
    createTask,
    updateTask,
    deleteTask,
    createGuest,
    deleteGuest,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    markAllAsRead,
    clearAllNotifications,
    // handlers
    pushToast,
    dismissToast,
    handleMobileCarouselScroll,
    handleCreateParty,
    openCreatePartyDialog,
    openEditPartyDialog,
    handleDeleteParty,
    handleCoverImageChange,
    handleTogglePartyFinalized,
    handleCreateTask,
    handleMoveTask,
    startTaskEdit,
    handleSaveTask,
    handleDeleteTask,
    cancelTaskEdit,
    handleTaskDragStart,
    handleTaskDragOver,
    handleTaskDrop,
    handleCreateGuest,
    handleDeleteGuest,
    handleCopyInvitationLink,
    getWhatsappUrl,
    getMailtoUrl,
    handlePartySelectorPointerDown,
    handlePartySelectorPointerMove,
    handlePartySelectorPointerUp,
    handlePartySelectorClick,
    handleMarkAllNotificationsRead,
    handleClearNotifications,
    startBudgetItemEdit,
    handleCreateBudgetItem,
    handleUpdateBudgetItem,
    handleDeleteBudgetItem,
    handleToggleBudgetItemPaid
  };
}

export type DashboardState = ReturnType<typeof useDashboardState>;
