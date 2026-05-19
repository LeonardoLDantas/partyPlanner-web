import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  Clock,
  ClipboardCheck,
  Copy,
  Gift,
  Home,
  Eye,
  LogOut,
  Mail,
  MapPinned,
  Moon,
  PartyPopper,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Camera,
  Edit3,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  Users,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { AuthSession } from '@/domain/entities/auth';
import type { ThemeMode } from '@/domain/entities/notification';
import type { GuestStatus, Party } from '@/domain/entities/party';
import { useDashboardData } from '@/presentation/hooks/useDashboardData';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/presentation/components/ui/dialog';
import { Field, Input } from '@/presentation/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { Switch } from '@/presentation/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { ToastProvider, ToastStack, type ToastMessage } from '@/presentation/components/ui/toast';
import { cn } from '@/shared/utils/cn';
import { currencyFormatter } from '@/shared/utils/formatters';

const sections = [
  { id: 'Painel', label: 'Início', icon: Home },
  { id: 'Eventos', label: 'Eventos', icon: CalendarDays },
  { id: 'Convidados', label: 'Convidados', icon: Users },
  { id: 'Tarefas', label: 'Tarefas', icon: CheckCheck },
  { id: 'Despesas', label: 'Despesas', icon: CircleDollarSign },
  { id: 'Ajustes', label: 'Perfil', icon: UserRound }
] as const;

const partyCategories = ['Todos', 'Aniversario', 'Festa', 'Formatura', 'Casamento', 'Noivado', 'Outros'] as const;
const guestStatuses: GuestStatus[] = ['Confirmado', 'Pendente', 'Recusou'];
const taskColumns = [
  { id: 'Pendente', label: 'Pendente', tone: 'border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-100' },
  { id: 'Em andamento', label: 'Em andamento', tone: 'border-sky-400/25 bg-sky-400/10 text-sky-100' },
  { id: 'Concluída', label: 'Concluída', tone: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' }
] as const;
const expenseCategories = [
  { value: 'Alimentacao', label: 'Alimentação' },
  { value: 'Decoracao', label: 'Decoração' },
  { value: 'Local', label: 'Local' },
  { value: 'Musica', label: 'Música' },
  { value: 'FotoVideo', label: 'Foto e vídeo' },
  { value: 'Lembrancas', label: 'Lembranças' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Equipe', label: 'Equipe' },
  { value: 'Outros', label: 'Outros' }
] as const;

function WhatsappIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M12.04 2C6.58 2 2.13 6.35 2.13 11.7c0 1.7.46 3.36 1.32 4.81L2 22l5.64-1.43a10.1 10.1 0 0 0 4.4.99c5.46 0 9.91-4.35 9.91-9.7S17.5 2 12.04 2Zm0 17.94a8.37 8.37 0 0 1-4.1-1.08l-.3-.18-3.34.85.88-3.18-.2-.32a7.95 7.95 0 0 1-1.23-4.26c0-4.46 3.72-8.09 8.29-8.09s8.29 3.63 8.29 8.09-3.72 8.17-8.29 8.17Zm4.55-6.09c-.25-.12-1.47-.71-1.7-.79-.23-.08-.4-.12-.57.12-.17.25-.65.79-.8.95-.15.17-.3.19-.55.06-.25-.12-1.06-.38-2.02-1.21-.75-.65-1.25-1.45-1.4-1.69-.15-.25-.02-.38.11-.5.12-.11.25-.29.38-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.57-1.34-.78-1.83-.2-.48-.41-.41-.57-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.88.85-.88 2.06s.9 2.39 1.03 2.55c.13.17 1.78 2.66 4.32 3.73.6.25 1.07.4 1.44.51.61.19 1.16.16 1.59.1.49-.07 1.47-.59 1.68-1.16.21-.57.21-1.06.15-1.16-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

type Section = (typeof sections)[number]['id'];
type PartyCategoryFilter = (typeof partyCategories)[number];
type TaskItem = Party['tasks'][number];

type PartyFormState = {
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

function createEmptyPartyForm(): PartyFormState {
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

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value || 'Data a definir';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function formatShortDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value || '--/--/----';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function getShortLocation(value: string) {
  return value
    .split('|')[0]
    .split(',')
    .slice(0, 2)
    .join(',')
    .trim() || 'Local a definir';
}

function getDaysLeftLabel(value: string) {
  const today = new Date();
  const eventDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(eventDate.getTime())) {
    return '--';
  }

  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const days = Math.ceil((eventDate.getTime() - today.getTime()) / 86400000);

  if (days < 0) {
    return 'Encerrada';
  }

  if (days === 0) {
    return 'Hoje';
  }

  return `${days} dias`;
}

function getMobileCountdownDays(value: string) {
  const label = getDaysLeftLabel(value);

  if (label === 'Hoje' || label === 'Encerrada' || label === '--') {
    return '00';
  }

  return label.replace(' dias', '');
}

function isUpcomingParty(party: Party) {
  if (party.isFinalized) {
    return false;
  }

  const eventDate = new Date(`${party.date}T${party.time || '00:00'}`);

  if (Number.isNaN(eventDate.getTime())) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate.getTime() >= today.getTime();
}

function getPartyProgress(party: Party) {
  if (party.tasks.length === 0) {
    return 0;
  }

  return Math.round((party.tasks.filter((task) => task.done).length / party.tasks.length) * 100);
}

function normalizeTaskStatus(status: string, done: boolean) {
  if (done || status === 'Concluída' || status === 'Concluida') {
    return 'Concluída';
  }

  if (status === 'Em andamento') {
    return 'Em andamento';
  }

  return 'Pendente';
}

function getMapsUrl(location: string) {
  return location.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : '';
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
}

function formatCurrencyInput(value: string) {
  return currencyFormatter.format(parseCurrencyInput(value));
}

function getExpenseCategoryLabel(value: string) {
  return expenseCategories.find((category) => category.value === value)?.label ?? value;
}

function getPartyCategoryLabel(value: string) {
  return value === 'Aniversario' ? 'Aniversário' : value;
}

function formatOptionalBudget(value: number | null) {
  return value === null ? 'Não definido' : currencyFormatter.format(value);
}

function getPartyCoverImage(party?: Pick<Party, 'coverImageUrl' | 'category'> | null) {
  if (party?.coverImageUrl?.trim()) {
    return party.coverImageUrl;
  }

  if (party?.category === 'Casamento') {
    return '/illustrations/wedding-hero.svg';
  }

  if (party?.category === 'Formatura') {
    return '/illustrations/graduation-hero.svg';
  }

  return '/illustrations/birthday-hero.svg';
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

type PlannerDashboardProps = {
  session: AuthSession;
  notificationsEnabled: boolean;
  theme: ThemeMode;
  onNotificationsChange: (enabled: boolean) => Promise<void>;
  onThemeChange: (theme: ThemeMode) => Promise<void>;
  onLogout: () => Promise<void>;
};

export function PlannerDashboard({
  session,
  notificationsEnabled,
  theme,
  onNotificationsChange,
  onThemeChange,
  onLogout
}: PlannerDashboardProps) {
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
  const [guestForm, setGuestForm] = useState({ name: '', group: '', email: '', phoneNumber: '+55 ' });
  const [budgetForm, setBudgetForm] = useState({ label: '', category: 'Outros', amount: '' });
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
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

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

  const totalBudget = parties.reduce((sum, party) => sum + party.budget.spent, 0);
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
      notifications.forEach((notification) => seenNotificationIdsRef.current.add(notification.id));
      notificationsInitializedRef.current = true;
      return;
    }

    const freshNotifications = notifications.filter(
      (notification) =>
        !seenNotificationIdsRef.current.has(notification.id) &&
        notification.title.trim().toLowerCase() !== 'login realizado'
    );

    freshNotifications.forEach((notification) => {
      seenNotificationIdsRef.current.add(notification.id);
      pushToast(notification.title, notification.message);
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

    try {
      setActionError('');
      const payload = {
        name: partyForm.name.trim(),
        category: partyForm.category,
        date: partyForm.date,
        time: partyForm.time,
        location: partyForm.location.trim(),
        coverImageUrl: partyForm.coverImageUrl,
        expectedGuests: Number(partyForm.expectedGuests) || 0,
        estimatedBudget: partyForm.skipEstimatedBudget ? null : Number(partyForm.estimatedBudget) || 0,
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
      estimatedBudget: party.budget.estimated === null ? '' : String(party.budget.estimated),
      skipEstimatedBudget: party.budget.estimated === null,
      isFinalized: party.isFinalized
    });
    setCreateOpen(true);
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
      setGuestForm({ name: '', group: '', email: '', phoneNumber: '+55 ' });
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

  function formatBrazilPhoneInput(value: string) {
    const digits = value.replace(/\D/g, '').replace(/^55/, '').slice(0, 11);
    const area = digits.slice(0, 2);
    const first = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
    const second = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);

    let formatted = '+55';
    if (area) {
      formatted += ` (${area}`;
    }
    if (area.length === 2) {
      formatted += ')';
    }
    if (first) {
      formatted += ` ${first}`;
    }
    if (second) {
      formatted += `-${second}`;
    }

    return formatted.length > 3 ? formatted : '+55 ';
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
        amount: parseCurrencyInput(budgetForm.amount)
      });
      setBudgetForm({ label: '', category: 'Outros', amount: '' });
      pushToast('Despesa registrada', 'O financeiro do evento foi atualizado.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Não foi possível registrar a despesa.');
    }
  }

  function startBudgetItemEdit(item: Party['budget']['items'][number]) {
    setEditingBudgetItemId(item.id);
    setEditingBudgetAmount(currencyFormatter.format(item.amount));
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
        amount: parseCurrencyInput(editingBudgetAmount)
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

  function renderCreatePartyDialog(hiddenTrigger = false) {
    return (
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className={hiddenTrigger ? 'hidden' : undefined} onClick={() => !hiddenTrigger && openCreatePartyDialog()} variant="premium">
            <Plus size={18} />
            {editingPartyId ? 'Editar festa' : 'Nova festa'}
          </Button>
        </DialogTrigger>
        <DialogContent className="md:top-1/2 max-md:bottom-0 max-md:top-auto max-md:translate-y-0 max-md:rounded-b-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">{editingPartyId ? 'Editar festa' : 'Criar nova festa'}</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              {editingPartyId ? 'Atualize os dados principais do evento.' : 'Defina os dados principais para o Celebra montar o card do evento.'}
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleCreateParty}>
            <div className="relative overflow-hidden rounded-lg border border-white/10">
              <img
                alt="Capa do evento"
                className="h-40 w-full object-cover"
                src={partyForm.coverImageUrl || getPartyCoverImage({ coverImageUrl: '', category: partyForm.category })}
              />
              <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/50 bg-black/35 px-3 py-2 text-sm font-semibold text-white backdrop-blur-md">
                <Camera size={16} />
                Alterar capa
                <input accept="image/*" className="sr-only" type="file" onChange={handleCoverImageChange} />
              </label>
            </div>

            <Field label="Nome da festa">
              <Input
                placeholder="Ex.: Aniversário da Sofia"
                required
                value={partyForm.name}
                onChange={(event) => setPartyForm((current) => ({ ...current, name: event.target.value }))}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Categoria">
                <Select
                  value={partyForm.category}
                  onValueChange={(value) => setPartyForm((current) => ({ ...current, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {partyCategories.filter((category) => category !== 'Todos').map((category) => (
                      <SelectItem key={category} value={category}>
                        {getPartyCategoryLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Horário">
                <Input
                  required
                  type="time"
                  value={partyForm.time}
                  onChange={(event) => setPartyForm((current) => ({ ...current, time: event.target.value }))}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Data">
                <Input
                  required
                  type="date"
                  value={partyForm.date}
                  onChange={(event) => setPartyForm((current) => ({ ...current, date: event.target.value }))}
                />
              </Field>

              <Field label="Convidados esperados">
                <Input
                  inputMode="numeric"
                  value={partyForm.expectedGuests}
                  onChange={(event) => setPartyForm((current) => ({ ...current, expectedGuests: event.target.value }))}
                />
              </Field>
            </div>

            <Field label="Local">
              <Input
                placeholder="Rua, número, bairro"
                value={partyForm.location}
                onChange={(event) => setPartyForm((current) => ({ ...current, location: event.target.value }))}
              />
            </Field>

            <Field label="Orçamento estimado">
              <Input
                disabled={partyForm.skipEstimatedBudget}
                inputMode="decimal"
                placeholder="0"
                value={partyForm.estimatedBudget}
                onChange={(event) => setPartyForm((current) => ({ ...current, estimatedBudget: event.target.value }))}
              />
            </Field>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200">
              <Checkbox
                checked={partyForm.skipEstimatedBudget}
                onCheckedChange={(checked) =>
                  setPartyForm((current) => ({
                    ...current,
                    estimatedBudget: checked ? '' : current.estimatedBudget,
                    skipEstimatedBudget: checked === true
                  }))
                }
              />
              <span>Sem orçamento / Não definir orçamento agora</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-200">
              <Checkbox
                checked={partyForm.isFinalized}
                onCheckedChange={(checked) => setPartyForm((current) => ({ ...current, isFinalized: checked === true }))}
              />
              <span>Evento finalizado</span>
            </label>

            {actionError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {actionError}
              </div>
            ) : null}

            <Button disabled={createParty.isPending || updateParty.isPending} size="lg" type="submit" variant="premium">
              {editingPartyId ? 'Salvar alterações' : createParty.isPending ? 'Criando...' : 'Criar festa'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  function renderPartyCard(party: Party, index: number) {
    const isActive = selectedParty?.id === party.id;
    const confirmed = party.guests.filter((guest) => guest.status === 'Confirmado').length;
    const progress = getPartyProgress(party);

    return (
      <motion.button
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'group grid min-h-72 gap-5 rounded-lg border p-5 text-left transition-all duration-200',
          isActive
            ? 'border-sky-300/70 bg-[linear-gradient(145deg,rgba(14,165,233,0.24),rgba(30,41,59,0.92)_48%,rgba(217,70,239,0.22))] shadow-[0_22px_70px_rgba(14,165,233,0.14)]'
            : 'border-border bg-card hover:-translate-y-1 hover:border-sky-300/40'
        )}
        initial={{ opacity: 0, y: 14 }}
        key={party.id}
        onClick={() => setSelectedPartyId(party.id)}
        transition={{ delay: index * 0.035, duration: 0.18 }}
        type="button"
      >
        <div className="flex items-start justify-between gap-3">
          <Badge className="border-sky-300/20 bg-sky-400/10 text-sky-100">{getPartyCategoryLabel(party.category)}</Badge>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
            {party.isFinalized ? 'Finalizada' : getDaysLeftLabel(party.date)}
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-semibold leading-tight text-foreground">{party.name}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {formatDateLabel(party.date)} às {party.time || '--:--'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MetricMini label="Confirmados" value={String(confirmed)} />
          <MetricMini label="Tarefas" value={`${progress}%`} />
          <MetricMini label="Gasto" value={currencyFormatter.format(party.budget.spent)} />
        </div>

        <div className="mt-auto">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-300 to-fuchsia-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <span
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              openEditPartyDialog(party);
            }}
            role="button"
            tabIndex={0}
          >
            <Edit3 size={15} />
            Editar
          </span>
          <span
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/10"
            onClick={(event) => {
              event.stopPropagation();
              void handleTogglePartyFinalized(party);
            }}
            role="button"
            tabIndex={0}
          >
            {party.isFinalized ? 'Reabrir evento' : 'Finalizar evento'}
          </span>
        </div>
      </motion.button>
    );
  }

  function renderOverview() {
    return (
      <div className="grid gap-5">
        {featuredParty ? (
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(14,116,144,0.84),rgba(15,23,42,0.96)_52%,rgba(168,85,247,0.72))] p-6 shadow-2xl md:p-8"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
          >
            <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <Badge className="border-white/15 bg-white/12 text-white">Proximo evento</Badge>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-white md:text-5xl">
                  {featuredParty.name}
                </h2>
                <p className="mt-3 text-slate-100/80">
                  {formatDateLabel(featuredParty.date)} às {featuredParty.time} - {featuredParty.location || 'Local a definir'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <HeroChip label="faltam" value={getDaysLeftLabel(featuredParty.date)} />
                <HeroChip label="convidados" value={String(featuredParty.expectedGuests)} />
                <HeroChip label="progresso" value={`${getPartyProgress(featuredParty)}%`} />
              </div>
            </div>
            <Sparkles className="absolute right-8 top-7 text-white/20" size={92} />
          </motion.section>
        ) : (
          <EmptyState onCreate={openCreatePartyDialog} />
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={CalendarDays} label="Festas" value={String(parties.length)} />
          <StatCard icon={Users} label="Confirmados" value={String(confirmedGuests)} />
          <StatCard icon={CheckCheck} label="Tarefas feitas" value={`${completedTasks}/${totalTasks}`} />
          <StatCard icon={CircleDollarSign} label="Gasto total" value={currencyFormatter.format(totalBudget)} />
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Festas em destaque</CardTitle>
              <CardDescription>Cards grandes para comparar os próximos eventos.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as PartyCategoryFilter)}>
              <TabsList className="mb-5 flex max-w-full overflow-x-auto">
                {partyCategories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {getPartyCategoryLabel(category)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="grid gap-4 lg:grid-cols-3">
              <AnimatePresence>
                {filteredParties.map((party, index) => renderPartyCard(party, index))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderMobilePartySlide(party: Party, index: number) {
    const isActive = selectedParty?.id === party.id;

    return (
      <motion.button
        animate={{ opacity: 1, scale: isActive ? 1 : 0.98 }}
        className="relative h-[244px] w-full min-w-full max-w-full shrink-0 snap-center overflow-hidden rounded-[22px] border border-[#27365d] bg-[#071128] p-4 text-left text-white shadow-[0_22px_48px_rgba(0,0,0,0.34)]"
        data-party-card
        initial={{ opacity: 0, scale: 0.98 }}
        key={party.id}
        onClick={() => setSelectedPartyId(party.id)}
        transition={{ delay: index * 0.035, duration: 0.18 }}
        type="button"
      >
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-95"
          src={getPartyCoverImage(party)}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,10,40,0.96)_0%,rgba(24,16,91,0.78)_42%,rgba(122,17,94,0.18)_100%)]" />
        <div className="hidden absolute -right-10 -top-8 h-44 w-44 rounded-full bg-white/16 blur-sm" />
        <div className="hidden absolute -bottom-8 right-0 h-36 w-36 place-items-center rounded-full bg-pink-200/30 text-transparent shadow-2xl">
          <PartyPopper className="absolute text-white/80" size={54} />
          🎂
        </div>
        <div className="hidden absolute bottom-8 right-6 gap-2 opacity-75">
          <span className="h-16 w-10 rounded-full bg-purple-300/40 blur-[1px]" />
          <span className="h-20 w-12 rounded-full bg-fuchsia-200/45 blur-[1px]" />
        </div>

        <div className="relative z-10">
          <Badge className="max-w-fit border-white/10 bg-white/18 px-3.5 py-1.5 text-[0.78rem] font-bold text-white backdrop-blur-md">
            <Sparkles size={15} />
            Evento em destaque
          </Badge>

          <h2 className="mt-6 max-w-[16rem] text-[1.55rem] font-bold leading-[1.08] tracking-[-0.02em]">{party.name}</h2>
          <span className="mt-3 block h-1 w-12 rounded-full bg-white" />

          <div className="mt-5 grid max-w-[16.5rem] gap-3 text-[0.86rem] font-semibold">
            <div className="flex items-center gap-3">
              <CalendarDays className="shrink-0" size={19} />
              <span>{formatDateLabel(party.date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="shrink-0" size={19} />
              <span>{party.time || '--:--'}</span>
            </div>
          </div>
        </div>
      </motion.button>
    );
  }

  function renderMobileHome() {
    const mobileUpcomingParties = filteredParties.filter(isUpcomingParty);
    const activeMobileParty =
      (selectedParty && isUpcomingParty(selectedParty) ? selectedParty : null) ??
      mobileUpcomingParties[0] ??
      null;
    const party = activeMobileParty;
    const confirmed = party?.guests.filter((guest) => guest.status === 'Confirmado').length ?? 0;
    const expected = Math.max(party?.expectedGuests || 0, party?.guests.length || 0);
    const guestProgress = expected > 0 ? Math.min(100, Math.round((confirmed / expected) * 100)) : 0;
    const budgetProgress =
      party && party.budget.estimated !== null && party.budget.estimated > 0
        ? Math.min(100, Math.round((party.budget.spent / party.budget.estimated) * 100))
        : 0;
    const tasks = party?.tasks.slice(0, 3) ?? [];

    return (
      <div className="min-h-dvh w-full min-w-0 max-w-full overflow-x-clip bg-[radial-gradient(circle_at_50%_-12%,rgba(37,99,235,0.16),transparent_32%),#020914] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3 text-slate-50 sm:px-4">
        <header className="mb-5 flex min-w-0 items-center justify-between gap-3 overflow-hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[linear-gradient(135deg,#5128ff,#f1329d)] text-white shadow-[0_14px_30px_rgba(127,34,230,0.32)]">
              <PartyPopper size={25} />
            </div>
            <h1 className="min-w-0 truncate bg-[linear-gradient(135deg,#5b35ff_8%,#f1329d_92%)] bg-clip-text text-[1.55rem] font-extrabold leading-none text-transparent sm:text-[1.78rem]">
              Celebra
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="relative grid h-10 w-10 place-items-center rounded-full bg-transparent text-white"
              onClick={() => setMobileNotificationsOpen(true)}
              type="button"
            >
              <Bell size={22} />
              {unreadNotifications > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#ef3f98] px-1 text-xs font-bold text-white">
                  {unreadNotifications}
                </span>
              ) : null}
            </button>
            <div className="grid h-11 w-11 place-items-center rounded-full border-[3px] border-fuchsia-400 bg-[#0f172a] text-xs font-bold text-slate-50 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
              {getInitials(session.user.name)}
            </div>
          </div>
        </header>
        {mobileUpcomingParties.length > 0 ? (
          <>
            <div
              className="flex w-full max-w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={handleMobileCarouselScroll}
              ref={mobileCarouselRef}
            >
              {mobileUpcomingParties.map((carouselParty, index) => renderMobilePartySlide(carouselParty, index))}
            </div>

            <div className="hidden mb-5 justify-center gap-2">
              {mobileUpcomingParties.map((carouselParty) => (
                <button
                  className={cn(
                    'h-2.5 rounded-full transition-all',
                    selectedParty?.id === carouselParty.id ? 'w-8 bg-fuchsia-400' : 'w-2.5 bg-slate-700'
                  )}
                  key={carouselParty.id}
                  onClick={() => setSelectedPartyId(carouselParty.id)}
                  type="button"
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-[#101a2d] p-6 text-center shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
            <h2 className="text-2xl font-bold">Nenhuma festa cadastrada</h2>
            <p className="mt-2 text-slate-400">Crie sua primeira festa para ver o painel mobile.</p>
            <Button className="mt-5" onClick={openCreatePartyDialog} variant="premium">
              <Plus size={18} />
              Criar festa
            </Button>
          </div>
        )}

        {party ? (
          <div className="grid gap-3">
            <section className="rounded-[20px] border border-[#14233b] bg-[linear-gradient(145deg,rgba(10,22,39,0.96),rgba(5,13,28,0.98))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_34px_rgba(0,0,0,0.28)]">
              <h3 className="text-[1.08rem] font-bold tracking-[-0.01em]">Contagem regressiva</h3>
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)_1px_minmax(0,1fr)_1px_minmax(0,1fr)_32px] items-center gap-2">
                <CountdownUnit label="dias" value={getMobileCountdownDays(party.date)} />
                <span className="h-11 bg-white/10" />
                <CountdownUnit label="horas" value="00" />
                <span className="h-11 bg-white/10" />
                <CountdownUnit label="min" value="00" />
                <span className="h-11 bg-white/10" />
                <CountdownUnit label="seg" value="00" />
                <PartyPopper className="text-[#ef3f98]" size={32} />
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <MobileMetricCard
                icon={<Users size={22} />}
                label="Convidados confirmados"
                progress={guestProgress}
                tint="purple"
                value={String(confirmed)}
                detail={`de ${expected} convidados`}
              />
              <MobileMetricCard
                icon={<CircleDollarSign size={22} />}
                label="Orçamento"
                progress={budgetProgress}
                tint="pink"
                value={formatCompactCurrency(party.budget.spent)}
                detail={party.budget.estimated === null ? 'sem teto' : `de ${formatCompactCurrency(party.budget.estimated)}`}
                progressLabel={party.budget.estimated === null ? undefined : `${budgetProgress}%`}
              />
            </div>

            <section className="rounded-[20px] border border-[#14233b] bg-[linear-gradient(145deg,rgba(10,22,39,0.96),rgba(5,13,28,0.98))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_34px_rgba(0,0,0,0.28)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[1.18rem] font-bold">Tarefas</h3>
                <button
                  className="flex items-center gap-1 rounded-full border border-[#1b2942] bg-[#061123] px-3.5 py-1.5 text-sm font-bold text-[#8b5cf6]"
                  onClick={() => setActiveSection('Tarefas')}
                  type="button"
                >
                  Ver todas
                  <ChevronRight size={17} />
                </button>
              </div>
              <div className="grid gap-1">
                {tasks.map((task, index) => (
                  <div
                    className="grid grid-cols-[50px_1fr] items-center gap-3 border-b border-[#14233b] py-3 last:border-b-0"
                    key={task.id}
                  >
                    <div
                      className={cn(
                        'grid h-11 w-11 place-items-center rounded-full text-white',
                        index === 0 && 'bg-[linear-gradient(135deg,#5128ff,#7a26e6)]',
                        index === 1 && 'bg-[linear-gradient(135deg,#ff2b8a,#ef3f98)]',
                        index >= 2 && 'bg-[linear-gradient(135deg,#9a2fe0,#c729d3)]'
                      )}
                    >
                      {index === 1 ? <Gift size={23} /> : <ClipboardCheck size={23} />}
                    </div>
                    <div className="min-w-0">
                      <strong className="block truncate text-[1rem]">{task.title}</strong>
                      <span className="text-sm text-[#8588a6]">{normalizeTaskStatus(task.status, task.done)}</span>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[#8588a6]">Nenhuma tarefa cadastrada.</p>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    );
  }

  function renderMobileEvents() {
    return (
      <MobilePage
        title="Eventos"
        subtitle="Gerencie e acompanhe suas celebrações"
        action={null}
        headerAction={renderMobileHeaderActions()}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_46px_46px] gap-2">
          <div className="flex h-12 min-w-0 items-center gap-2 rounded-[14px] border border-[#1f2c45] bg-[#071225] px-3">
            <Search className="shrink-0 text-slate-300" size={22} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-400"
              placeholder="Buscar evento"
            />
          </div>
          <button className="grid h-12 place-items-center rounded-[14px] border border-[#1f2c45] bg-[#071225] text-slate-200" type="button">
            <SlidersHorizontal size={21} />
          </button>
          <button className="grid h-12 place-items-center rounded-[14px] border border-[#1f2c45] bg-[#071225] text-slate-200" type="button">
            <ArrowUpDown size={21} />
          </button>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {partyCategories.map((category) => (
            <button
              className={cn(
                'shrink-0 rounded-full px-3.5 py-2 text-sm font-bold shadow-sm',
                categoryFilter === category ? 'bg-[#5128ff] text-white' : 'border border-white/10 bg-white/10 text-slate-300'
              )}
              key={category}
              onClick={() => setCategoryFilter(category)}
              type="button"
            >
              {getPartyCategoryLabel(category)}
            </button>
          ))}
        </div>

        <div className="grid gap-3">
          {filteredParties.map((party) => (
            <article
              className="relative grid h-[132px] grid-cols-[112px_minmax(0,1fr)] gap-3 overflow-hidden rounded-[18px] border border-[#1f2c45] bg-[#071225] p-2.5 pr-12 text-left shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
              key={party.id}
              onClick={() => setSelectedPartyId(party.id)}
            >
              <img
                alt=""
                className="h-[112px] w-[112px] rounded-[14px] border border-[#7c3cff]/50 object-cover"
                src={getPartyCoverImage(party)}
              />
              <div className="min-w-0 py-1">
                <div className="flex min-w-0 items-start gap-2">
                  <h2 className="line-clamp-1 flex-1 text-base font-bold text-slate-50">{party.name}</h2>
                  {party.isFinalized ? (
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[0.58rem] font-bold text-slate-200">
                      Finalizada
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 grid gap-1.5 text-[0.78rem] text-slate-200">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="shrink-0" size={16} />
                    <span className="truncate">{formatShortDateLabel(party.date)} - {party.time || '--:--'}</span>
                  </span>
                  <span className="line-clamp-1 flex items-center gap-2">
                    <MapPinned className="shrink-0" size={16} />
                    <span className="truncate">{getShortLocation(party.location)}</span>
                  </span>
                  <span className="flex items-center gap-2"><Users size={16} />{party.expectedGuests} convidados</span>
                </div>
              </div>
              <div className="absolute right-2.5 top-2.5 grid gap-2">
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#7c3cff]/40 bg-[#2a0f3d]/70 text-[#c15cff]"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEditPartyDialog(party);
                  }}
                  type="button"
                  title="Editar evento"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#1f2c45] bg-[#061123]/90 text-slate-300"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handleTogglePartyFinalized(party);
                  }}
                  type="button"
                  title={party.isFinalized ? 'Reabrir evento' : 'Finalizar evento'}
                >
                  <CheckCheck size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
        <button
          className="mt-1 flex h-14 w-full items-center justify-center gap-3 rounded-[14px] bg-[linear-gradient(90deg,#5128ff,#ef3f98)] text-xl font-bold text-white"
          type="button"
          onClick={openCreatePartyDialog}
        >
          <Plus size={24} />
          Novo evento
        </button>
        {renderCreatePartyDialog(true)}
      </MobilePage>
    );
  }

  function renderMobileGuests() {
    return (
      <MobilePage title="Convidados" action={null} headerAction={renderMobileHeaderActions()}>
        {renderMobilePartySelector()}
        {renderMobileGuestDialog()}
        <Button
          className="h-12 rounded-[16px] bg-[linear-gradient(90deg,#0fb7ef,#5128ff,#ef3f98)] text-white"
          disabled={!selectedParty || selectedPartyLocked}
          onClick={() => setGuestDialogOpen(true)}
          type="button"
        >
          <Plus size={18} />
          Novo convidado
        </Button>
        <div className="rounded-[20px] border border-white/10 bg-[#101a2d] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-2 rounded-[16px] bg-white/5 px-3">
            <Search className="text-slate-400" size={18} />
            <input
              className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-50 outline-none placeholder:text-slate-500"
              placeholder="Buscar convidado"
              value={guestSearch}
              onChange={(event) => setGuestSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {['Todos', ...guestStatuses].map((status) => (
            <button
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-bold',
                guestFilter === status ? 'bg-[#5128ff] text-white' : 'border border-white/10 bg-white/10 text-slate-300'
              )}
              key={status}
              onClick={() => setGuestFilter(status as 'Todos' | GuestStatus)}
              type="button"
            >
              {status}
            </button>
          ))}
        </div>

        <div className="grid gap-2.5">
          {filteredGuests.map((guest) => (
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[18px] border border-white/10 bg-[#101a2d] p-3 shadow-[0_10px_26px_rgba(0,0,0,0.22)]" key={guest.id}>
              <div className="min-w-0">
                <strong className="block truncate text-slate-50">{guest.name}</strong>
                <span className="text-sm text-slate-400">{guest.group}</span>
                {guest.email || guest.phoneNumber ? (
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {[guest.email, guest.phoneNumber].filter(Boolean).join(' | ')}
                  </span>
                ) : null}
              </div>
              <div className="grid shrink-0 justify-items-end gap-1.5">
                <span className="rounded-full bg-[#fce2f0] px-3 py-1.5 text-xs font-bold text-[#ef3f98]">
                  {guest.status}
                </span>
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200"
                  onClick={() => void handleCopyInvitationLink(guest.name, guest.invitationToken)}
                  type="button"
                >
                  <Copy size={13} />
                  Link
                </button>
                <div className="flex gap-1">
                  {guest.email ? (
                    <a
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-200"
                      href={getMailtoUrl(guest.email, guest.name, guest.invitationToken)}
                    >
                      <Mail size={14} />
                    </a>
                  ) : null}
                  {guest.phoneNumber ? (
                    <a
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-200"
                      href={getWhatsappUrl(guest.phoneNumber, guest.name, guest.invitationToken)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <WhatsappIcon size={14} />
                    </a>
                  ) : null}
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={selectedPartyLocked || deleteGuest.isPending}
                    onClick={() => void handleDeleteGuest(guest)}
                    type="button"
                    title="Excluir convidado"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MobilePage>
    );
  }

  function renderTaskEditForm(task: TaskItem, compact = false) {
    return (
      <div className="grid gap-2">
        {selectedPartyLocked ? (
          <p className="rounded-md border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            Evento finalizado. Este card não pode mais ser alterado.
          </p>
        ) : null}
        <Input
          disabled={selectedPartyLocked}
          required
          value={editingTaskForm.title}
          onChange={(event) => setEditingTaskForm((current) => ({ ...current, title: event.target.value }))}
        />
        <Input
          disabled={selectedPartyLocked}
          placeholder="Responsável"
          value={editingTaskForm.assignee}
          onChange={(event) => setEditingTaskForm((current) => ({ ...current, assignee: event.target.value }))}
        />
        <textarea
          className={cn(
            'w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring',
            compact ? 'min-h-[76px]' : 'min-h-[96px]'
          )}
          disabled={selectedPartyLocked}
          maxLength={500}
          placeholder="Descrição"
          value={editingTaskForm.description}
          onChange={(event) => setEditingTaskForm((current) => ({ ...current, description: event.target.value }))}
        />
        <div className="flex items-center gap-2">
          <Button disabled={selectedPartyLocked || updateTask.isPending || !editingTaskForm.title.trim()} onClick={() => void handleSaveTask(task)} size="sm" type="button" variant="premium">
            <CheckCheck size={15} />
            Salvar
          </Button>
          <Button onClick={cancelTaskEdit} size="sm" type="button" variant="outline">
            <X size={15} />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  function renderTaskPreviewDialog() {
    return (
      <Dialog open={Boolean(viewingTask)} onOpenChange={(open) => !open && setViewingTask(null)}>
        <DialogContent className="max-w-lg md:top-1/2 max-md:bottom-0 max-md:top-auto max-md:translate-y-0 max-md:rounded-b-none">
          <DialogHeader>
            <DialogTitle className="whitespace-normal break-words text-2xl font-semibold leading-tight">{viewingTask?.title}</DialogTitle>
            <DialogDescription>
              {viewingTask ? normalizeTaskStatus(viewingTask.status, viewingTask.done) : ''}
            </DialogDescription>
          </DialogHeader>
          {viewingTask ? (
            <div className="grid gap-4 text-sm">
              <div className="rounded-lg border border-border bg-muted/35 p-3">
                <span className="text-muted-foreground">Responsável</span>
                <strong className="mt-1 block text-foreground">{viewingTask.assignee || 'Sem responsável'}</strong>
              </div>
              <div className="rounded-lg border border-border bg-muted/35 p-3">
                <span className="text-muted-foreground">Descrição</span>
                <p className="mt-2 whitespace-pre-wrap leading-6 text-foreground">
                  {viewingTask.description || 'Sem descrição cadastrada.'}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    );
  }

  function renderCreateTaskDialog() {
    return (
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogTrigger asChild>
          <Button disabled={!selectedParty || selectedPartyLocked} variant="premium">
            <Plus size={18} />
            Nova tarefa
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[88dvh] overflow-y-auto md:top-1/2 max-md:bottom-0 max-md:top-auto max-md:translate-y-0 max-md:rounded-b-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Nova tarefa</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              Crie um card para a festa selecionada.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-3" onSubmit={handleCreateTask}>
            <Field label="Título">
              <Input
                placeholder="Ex.: Confirmar fornecedores"
                required
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
              />
            </Field>
            <Field label="Responsável">
              <Input
                placeholder="Ex.: Leonardo"
                value={taskForm.assignee}
                onChange={(event) => setTaskForm((current) => ({ ...current, assignee: event.target.value }))}
              />
            </Field>
            <Field label="Descrição">
              <textarea
                className="min-h-[112px] w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={500}
                placeholder="Detalhes do card"
                value={taskForm.description}
                onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
              />
            </Field>
            <Button disabled={!selectedParty || selectedPartyLocked || createTask.isPending} type="submit" variant="premium">
              <ClipboardCheck size={17} />
              Salvar tarefa
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  function renderMobileTasks() {
    return (
      <MobilePage title="Tarefas" action={renderCreateTaskDialog()} headerAction={renderMobileHeaderActions()}>
        {renderTaskPreviewDialog()}
        {renderMobilePartySelector()}
        <div className="grid gap-3">
          {selectedPartyLocked ? (
            <p className="rounded-[18px] border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
              Evento finalizado automaticamente. Novas tarefas, despesas e convidados estão bloqueados.
            </p>
          ) : null}
          {taskColumns.map((column) => {
            const tasks = (selectedParty?.tasks ?? []).filter((task) => normalizeTaskStatus(task.status, task.done) === column.id);

            return (
              <section className="rounded-[20px] border border-white/10 bg-[#101a2d] p-3.5" key={column.id}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-50">{column.label}</h2>
                  <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', column.tone)}>{tasks.length}</span>
                </div>
                <div className="grid max-h-[390px] gap-2.5 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:thin]">
                  {tasks.map((task) => (
                    <article className="rounded-[16px] border border-white/10 bg-[#071225] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.22)]" key={task.id}>
                      {editingTaskId === task.id ? (
                        renderTaskEditForm(task, true)
                      ) : (
                        <>
                          <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#5128ff,#ef3f98)] text-white">
                              <ClipboardCheck size={19} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <strong className="block truncate text-slate-50">{task.title}</strong>
                              <small className="block truncate text-sm text-slate-400">{task.assignee || 'Sem responsável'}</small>
                              {task.description ? <p className="mt-2 line-clamp-3 text-sm text-slate-300">{task.description}</p> : null}
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <Button className="h-8 w-8 px-0" onClick={() => setViewingTask(task)} type="button" variant="outline">
                                <Eye size={14} />
                              </Button>
                              <Button className="h-8 w-8 px-0" disabled={selectedPartyLocked} onClick={() => startTaskEdit(task)} type="button" variant="outline">
                                <Edit3 size={14} />
                              </Button>
                              <button
                                className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={selectedPartyLocked || deleteTask.isPending}
                                onClick={() => void handleDeleteTask(task)}
                                type="button"
                                title="Excluir tarefa"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Select disabled={selectedPartyLocked} value={normalizeTaskStatus(task.status, task.done)} onValueChange={(value) => void handleMoveTask(task.id, value)}>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Mover para" />
                              </SelectTrigger>
                              <SelectContent>
                                {taskColumns.map((option) => (
                                  <SelectItem key={option.id} value={option.id}>
                                    Mover para {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                  {tasks.length === 0 ? <p className="py-4 text-center text-sm text-slate-500">Sem tarefas.</p> : null}
                </div>
              </section>
            );
          })}
        </div>
      </MobilePage>
    );
  }

  function renderMobileExpenses() {
    const hasBudgetCeiling = selectedParty?.budget.estimated !== null && (selectedParty?.budget.estimated ?? 0) > 0;
    const budgetProgress =
      selectedParty && hasBudgetCeiling
        ? Math.min(100, Math.round((selectedParty.budget.spent / (selectedParty.budget.estimated ?? 1)) * 100))
        : 0;

    return (
      <MobilePage title="Despesas" action={null} headerAction={renderMobileHeaderActions()}>
        {renderMobilePartySelector()}

        {selectedParty ? (
          <>
            {selectedPartyLocked ? (
              <p className="rounded-[18px] border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
                Evento finalizado automaticamente. Despesas não podem mais ser criadas ou alteradas.
              </p>
            ) : null}
            <section className="rounded-[20px] border border-[#14233b] bg-[linear-gradient(145deg,rgba(10,22,39,0.96),rgba(5,13,28,0.98))] p-3.5">
              <h2 className="text-lg font-bold text-white">{selectedParty.name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MetricMini label="Gasto" value={currencyFormatter.format(selectedParty.budget.spent)} />
                <MetricMini label="Orçamento" value={hasBudgetCeiling ? currencyFormatter.format(selectedParty.budget.estimated ?? 0) : 'Sem teto'} />
              </div>
              {hasBudgetCeiling ? (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Uso</span>
                    <span>{budgetProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#172235]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#5128ff,#ef3f98)]" style={{ width: `${budgetProgress}%` }} />
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-[14px] border border-sky-300/20 bg-sky-400/10 p-3 text-sm text-sky-100">
                  Sem teto definido para as despesas.
                </p>
              )}
            </section>

            <section className="rounded-[20px] border border-[#14233b] bg-[linear-gradient(145deg,rgba(10,22,39,0.96),rgba(5,13,28,0.98))] p-3.5">
              <h3 className="text-lg font-bold text-white">Nova despesa</h3>
              <form className="mt-3 grid gap-3" onSubmit={handleCreateBudgetItem}>
                <Input placeholder="Descrição" required value={budgetForm.label} onChange={(event) => setBudgetForm((current) => ({ ...current, label: event.target.value }))} />
                <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm((current) => ({ ...current, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  required
                  value={budgetForm.amount}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, amount: formatCurrencyInput(event.target.value) }))}
                />
                <Button disabled={selectedPartyLocked || createBudgetItem.isPending} type="submit" variant="premium">
                  Salvar despesa
                </Button>
              </form>
            </section>

            <section className="grid gap-2.5">
              {selectedParty.budget.items.length > 0 ? (
                selectedParty.budget.items.map((item) => (
                  <div className="grid gap-3 rounded-[18px] border border-white/10 bg-[#101a2d] p-3.5" key={item.id}>
                    <div className="min-w-0">
                      <strong className="block truncate text-slate-50">{item.label}</strong>
                      <span className="text-sm text-slate-400">{getExpenseCategoryLabel(item.category)}</span>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
                      {editingBudgetItemId === item.id ? (
                        <Input
                          className="h-10"
                          inputMode="decimal"
                          value={editingBudgetAmount}
                          onChange={(event) => setEditingBudgetAmount(formatCurrencyInput(event.target.value))}
                        />
                      ) : (
                        <strong className="text-slate-50">{currencyFormatter.format(item.amount)}</strong>
                      )}
                      {editingBudgetItemId === item.id ? (
                        <button
                          className="grid h-10 w-10 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                          disabled={selectedPartyLocked}
                          onClick={() => void handleUpdateBudgetItem(item)}
                          type="button"
                        >
                          <CheckCheck size={17} />
                        </button>
                      ) : (
                        <button
                          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-slate-200"
                          disabled={selectedPartyLocked}
                          onClick={() => startBudgetItemEdit(item)}
                          type="button"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      <button
                        className="grid h-10 w-10 place-items-center rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-200"
                        disabled={selectedPartyLocked}
                        onClick={() => void handleDeleteBudgetItem(item)}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-[18px] border border-white/10 bg-[#101a2d] p-4 text-center text-sm text-slate-400">
                  Nenhuma despesa registrada.
                </p>
              )}
            </section>
          </>
        ) : null}
      </MobilePage>
    );
  }

  function renderMobileProfile() {
    return (
      <MobilePage title="Perfil" action={null} headerAction={renderMobileHeaderActions()}>
        <section className="rounded-[26px] border border-white/10 bg-[#101a2d] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-fuchsia-400 bg-white/5 text-lg font-bold text-slate-50">
              {getInitials(session.user.name)}
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-xl text-slate-50">{session.user.name}</strong>
              <span className="block truncate text-sm text-slate-400">{session.user.email}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[26px] border border-white/10 bg-[#101a2d] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <strong className="text-slate-50">Notificações</strong>
              <p className="text-sm text-slate-400">Alertas e toasts do app.</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={(checked) => void onNotificationsChange(checked)} />
          </div>
        </section>

        <Button className="h-12 w-full rounded-[18px]" onClick={onLogout} variant="premium">
          <LogOut size={18} />
          Encerrar sessão
        </Button>
      </MobilePage>
    );
  }

  function renderEvents() {
    return (
      <div className="grid gap-5">
        <Tabs value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as PartyCategoryFilter)}>
          <TabsList className="flex max-w-full overflow-x-auto">
            {partyCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                      {getPartyCategoryLabel(category)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={categoryFilter}>
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredParties.map((party, index) => renderPartyCard(party, index))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedParty ? (
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>{selectedParty.name}</CardTitle>
                <CardDescription>
                  {formatDateLabel(selectedParty.date)} às {selectedParty.time} - {selectedParty.location || 'Local a definir'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <MetricPanel label="Orçamento" value={formatOptionalBudget(selectedParty.budget.estimated)} />
                  <MetricPanel label="Gasto atual" value={currencyFormatter.format(selectedParty.budget.spent)} />
                  <MetricPanel label="Convidados" value={`${selectedParty.guests.length}/${selectedParty.expectedGuests}`} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="w-full md:w-fit" onClick={() => openEditPartyDialog(selectedParty)} type="button" variant="outline">
                    <Edit3 size={17} />
                    Editar evento
                  </Button>
                  <Button
                    className="w-full md:w-fit"
                    disabled={updateParty.isPending}
                    onClick={() => void handleTogglePartyFinalized(selectedParty)}
                    type="button"
                    variant={selectedParty.isFinalized ? 'outline' : 'premium'}
                  >
                    <CheckCheck size={17} />
                    {selectedParty.isFinalized ? 'Reabrir evento' : 'Marcar como finalizado'}
                  </Button>
                </div>
                {selectedParty.location ? (
                  <a
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold transition-colors hover:bg-white/10 md:w-fit"
                    href={getMapsUrl(selectedParty.location)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MapPinned size={17} />
                    Ver local no Maps
                  </a>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registrar despesa</CardTitle>
                <CardDescription>Controle custos com feedback visual imediato.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-3" onSubmit={handleCreateBudgetItem}>
                  <Field label="Descrição">
                    <Input required value={budgetForm.label} onChange={(event) => setBudgetForm((current) => ({ ...current, label: event.target.value }))} />
                  </Field>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Categoria">
                      <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm((current) => ({ ...current, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Valor">
                      <Input
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        required
                        value={budgetForm.amount}
                        onChange={(event) => setBudgetForm((current) => ({ ...current, amount: formatCurrencyInput(event.target.value) }))}
                      />
                    </Field>
                  </div>
                  <Button disabled={createBudgetItem.isPending} type="submit" variant="premium">
                    Salvar despesa
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    );
  }

  function renderGuests() {
    return (
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        {renderTaskPreviewDialog()}
        <Card>
          <CardHeader>
            <CardTitle>Convidados</CardTitle>
            <CardDescription>{selectedParty ? selectedParty.name : 'Selecione uma festa para filtrar a lista.'}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-2 rounded-md border border-input bg-input px-3">
                <Search className="text-muted-foreground" size={17} />
                <Input
                  className="border-0 bg-transparent px-0 focus-visible:ring-0"
                  placeholder="Buscar por nome ou grupo"
                  value={guestSearch}
                  onChange={(event) => setGuestSearch(event.target.value)}
                />
              </div>
              <Tabs value={guestFilter} onValueChange={(value) => setGuestFilter(value as 'Todos' | GuestStatus)}>
                <TabsList>
                  {['Todos', ...guestStatuses].map((status) => (
                    <TabsTrigger key={status} value={status}>
                      {status}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-3">
              {filteredGuests.map((guest) => (
                <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 md:grid-cols-[1fr_auto] md:items-center" key={guest.id}>
                  <div>
                    <strong>{guest.name}</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{guest.group}</p>
                    {guest.email || guest.phoneNumber ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[guest.email, guest.phoneNumber].filter(Boolean).join(' | ')}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <Badge className={cn(guest.status === 'Confirmado' && 'bg-emerald-400/15 text-emerald-200', guest.status === 'Recusou' && 'bg-rose-400/15 text-rose-200')}>
                      {guest.status}
                    </Badge>
                    <Button
                      onClick={() => void handleCopyInvitationLink(guest.name, guest.invitationToken)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Copy size={15} />
                      Copiar link
                    </Button>
                    {guest.email ? (
                      <a
                        className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-white/10"
                        href={getMailtoUrl(guest.email, guest.name, guest.invitationToken)}
                      >
                        <Mail size={15} />
                        Email
                      </a>
                    ) : null}
                    {guest.phoneNumber ? (
                      <a
                        className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-white/10"
                        href={getWhatsappUrl(guest.phoneNumber, guest.name, guest.invitationToken)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <WhatsappIcon size={15} />
                        WhatsApp
                      </a>
                    ) : null}
                    <Button
                      disabled={selectedPartyLocked || deleteGuest.isPending}
                      onClick={() => void handleDeleteGuest(guest)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 size={15} />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novo convidado</CardTitle>
            <CardDescription>Entrada rápida para o evento selecionado.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPartyLocked ? (
              <p className="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
                Evento finalizado automaticamente. Não é possível adicionar convidados.
              </p>
            ) : null}
            <form className="grid gap-3" onSubmit={handleCreateGuest}>
              <Field label="Nome">
                <Input required value={guestForm.name} onChange={(event) => setGuestForm((current) => ({ ...current, name: event.target.value }))} />
              </Field>
              <Field label="Grupo">
                <Input required value={guestForm.group} onChange={(event) => setGuestForm((current) => ({ ...current, group: event.target.value }))} />
              </Field>
              <Field label="Email">
                <Input inputMode="email" placeholder="nome@email.com" value={guestForm.email} onChange={(event) => setGuestForm((current) => ({ ...current, email: event.target.value }))} />
              </Field>
              <Field label="Celular">
                <Input
                  inputMode="tel"
                  placeholder="+55 (11) 99999-9999"
                  value={guestForm.phoneNumber}
                  onChange={(event) => setGuestForm((current) => ({ ...current, phoneNumber: formatBrazilPhoneInput(event.target.value) }))}
                />
              </Field>
              <Button disabled={!selectedParty || selectedPartyLocked || createGuest.isPending} type="submit" variant="premium">
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderExpenses() {
    if (!selectedParty) {
      return <EmptyState onCreate={openCreatePartyDialog} />;
    }

    const hasBudgetCeiling = selectedParty.budget.estimated !== null && selectedParty.budget.estimated > 0;
    const budgetProgress = hasBudgetCeiling
      ? Math.min(100, Math.round((selectedParty.budget.spent / (selectedParty.budget.estimated ?? 1)) * 100))
      : 0;

    return (
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
            <CardDescription>{selectedParty.name}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {selectedPartyLocked ? (
              <p className="rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
                Evento finalizado automaticamente. Despesas não podem mais ser criadas ou alteradas.
              </p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-3">
              <MetricPanel label="Orçamento" value={hasBudgetCeiling ? currencyFormatter.format(selectedParty.budget.estimated ?? 0) : 'Sem teto'} />
              <MetricPanel label="Gasto atual" value={currencyFormatter.format(selectedParty.budget.spent)} />
              <MetricPanel
                label={hasBudgetCeiling ? 'Saldo' : 'Limite'}
                value={hasBudgetCeiling ? currencyFormatter.format(Math.max((selectedParty.budget.estimated ?? 0) - selectedParty.budget.spent, 0)) : 'Livre'}
              />
            </div>

            {hasBudgetCeiling ? (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Uso do orçamento</span>
                  <span>{budgetProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-fuchsia-400" style={{ width: `${budgetProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-sky-300/20 bg-sky-400/10 p-4 text-sm text-sky-100">
                Este evento não tem orçamento definido. As despesas ficam sem teto até você definir um valor.
              </div>
            )}

            <div className="grid gap-3">
              {selectedParty.budget.items.length > 0 ? (
                selectedParty.budget.items.map((item) => (
                  <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 md:grid-cols-[1fr_auto] md:items-center" key={item.id}>
                    <div>
                      <strong>{item.label}</strong>
                      <p className="mt-1 text-sm text-muted-foreground">{getExpenseCategoryLabel(item.category)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {editingBudgetItemId === item.id ? (
                        <Input
                          className="h-9 w-36"
                          inputMode="decimal"
                          value={editingBudgetAmount}
                          onChange={(event) => setEditingBudgetAmount(formatCurrencyInput(event.target.value))}
                        />
                      ) : (
                        <strong className="min-w-28 text-right">{currencyFormatter.format(item.amount)}</strong>
                      )}
                      {editingBudgetItemId === item.id ? (
                        <Button
                          disabled={selectedPartyLocked || updateBudgetItem.isPending}
                          onClick={() => void handleUpdateBudgetItem(item)}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <CheckCheck size={15} />
                          Salvar
                        </Button>
                      ) : (
                        <Button disabled={selectedPartyLocked} onClick={() => startBudgetItemEdit(item)} size="sm" type="button" variant="outline">
                          <Edit3 size={15} />
                          Editar
                        </Button>
                      )}
                      <Button
                        disabled={selectedPartyLocked || deleteBudgetItem.isPending}
                        onClick={() => void handleDeleteBudgetItem(item)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 size={15} />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Nenhuma despesa registrada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nova despesa</CardTitle>
            <CardDescription>{hasBudgetCeiling ? 'Controle o consumo do orçamento.' : 'Evento sem teto de orçamento.'}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPartyLocked ? (
              <p className="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
                Evento finalizado. Não é possível adicionar despesas.
              </p>
            ) : null}
            <form className="grid gap-3" onSubmit={handleCreateBudgetItem}>
              <Field label="Descrição">
                <Input required value={budgetForm.label} onChange={(event) => setBudgetForm((current) => ({ ...current, label: event.target.value }))} />
              </Field>
              <Field label="Categoria">
                <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm((current) => ({ ...current, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Valor">
                <Input
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  required
                  value={budgetForm.amount}
                  onChange={(event) => setBudgetForm((current) => ({ ...current, amount: formatCurrencyInput(event.target.value) }))}
                />
              </Field>
              <Button disabled={selectedPartyLocked || createBudgetItem.isPending} type="submit" variant="premium">
                <CircleDollarSign size={17} />
                Salvar despesa
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderTasks() {
    return (
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Kanban de tarefas</CardTitle>
            <CardDescription>Mova as tarefas entre as etapas da festa selecionada.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPartyLocked ? (
              <p className="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
                Evento finalizado automaticamente. Não é possível mover ou criar tarefas.
              </p>
            ) : null}
            {selectedParty ? (
              <div className="grid gap-3 xl:grid-cols-3">
                {taskColumns.map((column) => {
                  const tasks = selectedParty.tasks.filter((task) => normalizeTaskStatus(task.status, task.done) === column.id);

                  return (
                    <section
                      className={cn(
                        'min-h-[360px] rounded-lg border border-border bg-muted/25 p-3 transition-colors',
                        draggingTaskId && 'border-sky-300/45 bg-sky-400/5'
                      )}
                      key={column.id}
                      onDragOver={handleTaskDragOver}
                      onDrop={(event) => {
                        if (!selectedPartyLocked) {
                          handleTaskDrop(event, column.id);
                        }
                      }}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{column.label}</h3>
                        <Badge className={column.tone}>{tasks.length}</Badge>
                      </div>
                      <div className="grid max-h-[504px] gap-3 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:thin]">
                        {tasks.map((task) => {
                          return (
                            <motion.article
                              className={cn(
                                'cursor-grab rounded-lg border border-border bg-card p-4 shadow-sm active:cursor-grabbing',
                                draggingTaskId === task.id && 'opacity-55'
                              )}
                              draggable={!selectedPartyLocked}
                              key={task.id}
                              layout
                              onDragEnd={() => setDraggingTaskId('')}
                              onDragStart={(event) => {
                                if (!selectedPartyLocked) {
                                  handleTaskDragStart(event as unknown as React.DragEvent<HTMLElement>, task.id);
                                }
                              }}
                              transition={{ duration: 0.16 }}
                            >
                              {editingTaskId === task.id ? renderTaskEditForm(task) : null}
                              <div className={cn('grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3', editingTaskId === task.id && 'hidden')}>
                                <div className="min-w-0 flex-1">
                                  <strong className="block truncate">{task.title}</strong>
                                  <p className="mt-1 truncate text-sm text-muted-foreground">Responsável: {task.assignee || 'Sem responsável'}</p>
                                  {task.description ? <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{task.description}</p> : null}
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <Button className="h-8 w-8 px-0" onClick={() => setViewingTask(task)} type="button" variant="outline">
                                    <Eye size={14} />
                                  </Button>
                                  <Button className="h-8 w-8 px-0" disabled={selectedPartyLocked} onClick={() => startTaskEdit(task)} type="button" variant="outline">
                                    <Edit3 size={14} />
                                  </Button>
                                  <Button
                                    className="h-8 w-8 px-0 text-slate-400 hover:text-rose-200"
                                    disabled={selectedPartyLocked || deleteTask.isPending}
                                    onClick={() => void handleDeleteTask(task)}
                                    type="button"
                                    variant="outline"
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              </div>
                              <p className={cn('mt-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-center text-xs font-semibold text-muted-foreground', editingTaskId === task.id && 'hidden')}>
                                Arraste para outra coluna
                              </p>
                            </motion.article>
                          );
                        })}
                        {tasks.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                            Sem tarefas nesta etapa.
                          </div>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma festa selecionada.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nova tarefa</CardTitle>
            <CardDescription>Crie uma próxima ação para a festa ativa.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPartyLocked ? (
              <p className="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-semibold text-amber-100">
                Evento finalizado. Não é possível adicionar tarefas.
              </p>
            ) : null}
            <form className="grid gap-3" onSubmit={handleCreateTask}>
              <Field label="Título">
                <Input required value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} />
              </Field>
              <Field label="Responsável">
                <Input value={taskForm.assignee} onChange={(event) => setTaskForm((current) => ({ ...current, assignee: event.target.value }))} />
              </Field>
              <Field label="Descrição">
                <textarea
                  className="min-h-[96px] w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                  maxLength={500}
                  value={taskForm.description}
                  onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                />
              </Field>
              <Button disabled={!selectedParty || selectedPartyLocked || createTask.isPending} type="submit" variant="premium">
                Salvar tarefa
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderSettings() {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
            <CardDescription>Ajustes rápidos da experiência PWA.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
              <div>
                <strong>Notificações elegantes</strong>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Toasts para login, criação e atualizações importantes.</p>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={(checked) => void onNotificationsChange(checked)} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 p-4">
              <div>
                <strong>Tema premium</strong>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Dark como padrão, com opção clara preservada.</p>
              </div>
              <Button
                size="icon"
                type="button"
                variant="outline"
                onClick={() => void onThemeChange(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>{session.user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-fuchsia-400 font-semibold text-white">
                {getInitials(session.user.name)}
              </div>
              <div>
                <strong>{session.user.name}</strong>
                <p className="text-sm text-muted-foreground">Organizador Celebra</p>
              </div>
            </div>
            <Button className="w-full" onClick={onLogout} variant="outline">
              <LogOut size={17} />
          Encerrar sessão
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderDesktopPartySelector() {
    if (parties.length === 0) {
      return null;
    }

    return (
      <section className="rounded-lg border border-border bg-card/70 p-3 shadow-xl backdrop-blur-xl">
        <div
          className="flex min-w-0 cursor-grab touch-pan-x select-none gap-2 overflow-x-auto pb-1 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onPointerDown={handlePartySelectorPointerDown}
          onPointerMove={handlePartySelectorPointerMove}
          onPointerUp={handlePartySelectorPointerUp}
          onPointerCancel={handlePartySelectorPointerUp}
        >
          {parties.map((party) => {
            const isActive = selectedParty?.id === party.id;

            return (
              <button
                className={cn(
                  'grid min-w-[230px] grid-cols-[48px_minmax(0,1fr)] items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-all',
                  isActive
                    ? 'border-sky-300/50 bg-sky-400/12 shadow-[0_14px_34px_rgba(14,165,233,0.14)]'
                    : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
                )}
                key={party.id}
                onClick={() => handlePartySelectorClick(party.id)}
                type="button"
              >
                <img alt="" className="h-12 w-12 rounded-md object-cover" src={getPartyCoverImage(party)} />
                <span className="min-w-0">
                  <strong className="block truncate text-sm text-foreground">{party.name}</strong>
                  <span className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays size={13} />
                    <span className="truncate">{formatShortDateLabel(party.date)}</span>
                    {party.time ? <span className="shrink-0">as {party.time}</span> : null}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  function renderMobilePartySelector() {
    if (parties.length === 0) {
      return null;
    }

    return (
      <section className="max-w-full overflow-hidden rounded-[18px] border border-white/10 bg-[#071225]/88 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
        <div
          className="flex max-w-full cursor-grab touch-pan-x select-none gap-2 overflow-x-auto active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onPointerDown={handlePartySelectorPointerDown}
          onPointerMove={handlePartySelectorPointerMove}
          onPointerUp={handlePartySelectorPointerUp}
          onPointerCancel={handlePartySelectorPointerUp}
        >
          {parties.map((party) => {
            const isActive = selectedParty?.id === party.id;

            return (
              <button
                className={cn(
                  'grid min-w-[174px] max-w-[174px] grid-cols-[36px_minmax(0,1fr)] items-center gap-2 rounded-[13px] border px-2 py-1.5 text-left transition-all',
                  isActive
                    ? 'border-[#7c3cff]/60 bg-[#7c3cff]/18 shadow-[0_10px_24px_rgba(124,60,255,0.18)]'
                    : 'border-white/10 bg-white/[0.045]'
                )}
                key={party.id}
                onClick={() => handlePartySelectorClick(party.id)}
                type="button"
              >
                <img alt="" className="h-9 w-9 rounded-[9px] object-cover" src={getPartyCoverImage(party)} />
                <span className="min-w-0">
                  <strong className="block truncate text-[0.73rem] font-bold text-slate-50">{party.name}</strong>
                  <span className="mt-0.5 block truncate text-[0.62rem] font-semibold text-slate-400">
                    {formatShortDateLabel(party.date)}
                    {party.time ? ` às ${party.time}` : ''}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  function renderMobileGuestDialog() {
    return (
      <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
        <DialogContent className="bottom-0 top-auto max-h-[86vh] w-full max-w-none translate-y-0 rounded-b-none rounded-t-[26px] border-white/10 bg-[#071225] p-5 text-slate-50 sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:rounded-[22px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Novo convidado</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedParty ? `Convite para ${selectedParty.name}` : 'Selecione uma festa para continuar.'}
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-3" onSubmit={handleCreateGuest}>
            <Field label="Nome">
              <Input
                required
                value={guestForm.name}
                onChange={(event) => setGuestForm((current) => ({ ...current, name: event.target.value }))}
              />
            </Field>
            <Field label="Grupo">
              <Input
                required
                value={guestForm.group}
                onChange={(event) => setGuestForm((current) => ({ ...current, group: event.target.value }))}
              />
            </Field>
            <Field label="Email">
              <Input
                inputMode="email"
                placeholder="nome@email.com"
                value={guestForm.email}
                onChange={(event) => setGuestForm((current) => ({ ...current, email: event.target.value }))}
              />
            </Field>
            <Field label="Celular">
              <Input
                inputMode="tel"
                placeholder="+55 (11) 99999-9999"
                value={guestForm.phoneNumber}
                onChange={(event) => setGuestForm((current) => ({ ...current, phoneNumber: formatBrazilPhoneInput(event.target.value) }))}
              />
            </Field>

            <Button disabled={!selectedParty || selectedPartyLocked || createGuest.isPending} type="submit" variant="premium">
              <Plus size={18} />
              Adicionar convidado
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  function renderMobileHeaderActions() {
    return (
      <div className="flex items-center gap-4">
        <button
          className="relative grid h-11 w-11 place-items-center rounded-full text-white"
          onClick={() => setMobileNotificationsOpen(true)}
          type="button"
        >
          <Bell size={25} />
          {unreadNotifications > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#ef3f98] px-1 text-xs font-bold text-white">
              {unreadNotifications}
            </span>
          ) : null}
        </button>
        <div className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-fuchsia-400 bg-[#0f172a] text-xs font-bold text-slate-50">
          {getInitials(session.user.name)}
        </div>
      </div>
    );
  }

  function renderMobileNotificationsSheet() {
    return (
      <Dialog open={mobileNotificationsOpen} onOpenChange={setMobileNotificationsOpen}>
        <DialogContent className="bottom-0 top-auto flex max-h-[78vh] w-full max-w-none translate-y-0 grid-rows-none flex-col gap-0 overflow-hidden rounded-b-none rounded-t-[26px] border-white/10 bg-[#071225] p-0 text-slate-50 sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-y-1/2 sm:rounded-[22px]">
          <DialogHeader className="shrink-0 p-5 pb-3">
            <DialogTitle className="text-2xl font-bold">Notificações</DialogTitle>
            <DialogDescription className="text-slate-400">{unreadNotifications} não lidas</DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-5 pb-4 pr-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div className="rounded-[16px] border border-white/10 bg-white/[0.05] p-3" key={notification.id}>
                  <strong className="block text-sm text-slate-50">{notification.title}</strong>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{notification.message}</p>
                </div>
              ))
            ) : (
              <p className="rounded-[16px] border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-400">
                Nenhuma notificação por enquanto.
              </p>
            )}
          </div>

          <div className="sticky bottom-0 grid shrink-0 grid-cols-2 gap-2 border-t border-white/10 bg-[#071225]/95 p-4 backdrop-blur">
            <Button
              disabled={markAllAsRead.isPending || notifications.length === 0}
              onClick={() => void handleMarkAllNotificationsRead()}
              size="sm"
              type="button"
              variant="outline"
            >
              Ler tudo
            </Button>
            <Button
              disabled={clearAllNotifications.isPending || notifications.length === 0}
              onClick={() => void handleClearNotifications()}
              size="sm"
              type="button"
              variant="ghost"
            >
              Limpar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const activeLabel = sections.find((section) => section.id === activeSection)?.label ?? 'Painel';

  return (
    <ToastProvider swipeDirection="right">
      <div className="min-h-screen max-w-full overflow-x-clip px-0 py-0 lg:max-w-none lg:px-4 lg:py-4">
        <div className="mx-auto max-w-none">
          <aside className="fixed left-4 top-4 hidden h-[calc(100vh-2rem)] w-[260px] rounded-lg border border-border bg-card/80 p-4 shadow-2xl backdrop-blur-xl lg:grid lg:content-between">
            <div>
              <div className="mb-8 flex items-center gap-3 px-2">
                <img alt="Celebra" className="h-12 w-12 rounded-full" src="/brand/celebra-mark-white.png" />
                <div>
                  <strong className="text-lg">Celebra</strong>
                  <p className="text-xs text-muted-foreground">Party planner</p>
                </div>
              </div>
              <nav className="grid gap-2">
                {sections.map((section) => (
                  <button
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground',
                      activeSection === section.id && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                    )}
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    type="button"
                  >
                    <section.icon size={18} />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut size={17} />
              Sair
            </Button>
          </aside>

          <main className="min-w-0 lg:ml-[284px]">
            <div className="lg:hidden">
              {renderMobileNotificationsSheet()}
              {activeSection === 'Painel' ? renderMobileHome() : null}
              {activeSection !== 'Painel' ? (
                <>
                  {activeSection === 'Eventos' ? renderMobileEvents() : null}
                  {activeSection === 'Convidados' ? renderMobileGuests() : null}
                  {activeSection === 'Tarefas' ? renderMobileTasks() : null}
                  {activeSection === 'Despesas' ? renderMobileExpenses() : null}
                  {activeSection === 'Ajustes' ? renderMobileProfile() : null}
                </>
              ) : null}
            </div>

            <div className="hidden content-start gap-5 pb-6 lg:grid">
            <header className="sticky top-4 z-30 rounded-lg border border-border bg-card/78 p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">{activeLabel}</p>
                  <h1 className="mt-1 truncate text-2xl font-semibold md:text-3xl">Olá, {session.user.name}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button size="icon" type="button" variant="outline" onClick={() => setNotificationsOpen((current) => !current)}>
                      <Bell size={18} />
                    </Button>
                    {unreadNotifications > 0 ? (
                      <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-fuchsia-500 px-1 text-xs font-bold text-white">
                        {unreadNotifications}
                      </span>
                    ) : null}
                    {notificationsOpen ? (
                      <Card className="absolute right-0 top-14 z-40 flex max-h-[min(70vh,520px)] w-[min(90vw,360px)] flex-col overflow-hidden">
                        <CardHeader className="border-b border-border">
                          <CardTitle>Notificações</CardTitle>
                          <CardDescription>{unreadNotifications} não lidas</CardDescription>
                        </CardHeader>
                        <CardContent className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div className="rounded-md bg-muted/50 p-3" key={notification.id}>
                                <strong className="text-sm">{notification.title}</strong>
                                <p className="mt-1 text-sm leading-5 text-muted-foreground">{notification.message}</p>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
                          )}
                        </CardContent>
                        <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-border bg-card/95 p-3 backdrop-blur">
                            <Button disabled={markAllAsRead.isPending || notifications.length === 0} size="sm" variant="outline" onClick={() => void handleMarkAllNotificationsRead()}>
                              Ler tudo
                            </Button>
                            <Button disabled={clearAllNotifications.isPending || notifications.length === 0} size="sm" variant="ghost" onClick={() => void handleClearNotifications()}>
                              Limpar
                            </Button>
                        </div>
                      </Card>
                    ) : null}
                  </div>
                  {renderCreatePartyDialog()}
                </div>
              </div>
            </header>
            {renderDesktopPartySelector()}

            {actionError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {actionError}
              </div>
            ) : null}

            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                key={activeSection}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {activeSection === 'Painel' ? renderOverview() : null}
                {activeSection === 'Eventos' ? renderEvents() : null}
                {activeSection === 'Convidados' ? renderGuests() : null}
                {activeSection === 'Tarefas' ? renderTasks() : null}
                {activeSection === 'Despesas' ? renderExpenses() : null}
                {activeSection === 'Ajustes' ? renderSettings() : null}
              </motion.div>
            </AnimatePresence>
            </div>
          </main>
        </div>

        <nav className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-[9999] grid h-14 grid-cols-6 rounded-[18px] border border-white/12 bg-[#071225]/72 px-2 py-1 shadow-[0_18px_42px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#071225]/58 lg:hidden">
          {sections.map((section) => (
            <button
              className={cn(
                'relative grid min-w-0 place-items-center rounded-[16px] text-slate-300/80 transition-colors',
                activeSection === section.id && 'bg-transparent text-[#7c3cff]'
              )}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              type="button"
              aria-label={section.label}
              title={section.label}
            >
              <section.icon size={22} strokeWidth={activeSection === section.id ? 2.8 : 2.2} />
              <span className={cn('absolute bottom-1 h-0.5 w-5 rounded-full', activeSection === section.id ? 'bg-[#7c3cff]' : 'bg-transparent')} />
            </button>
          ))}
        </nav>
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastProvider>
  );
}

function MobilePage({
  action,
  children,
  headerAction,
  subtitle,
  title
}: {
  action: React.ReactNode;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="min-h-dvh w-full min-w-0 max-w-full overflow-x-clip bg-[#020914] px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 text-slate-50 sm:px-4 sm:pt-5">
      <header className="mb-4 grid min-w-0 gap-4 overflow-hidden sm:mb-5 sm:gap-5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[linear-gradient(135deg,#5128ff,#f1329d)] sm:h-11 sm:w-11 sm:rounded-[14px]">
              <PartyPopper size={23} />
            </div>
            <strong className="min-w-0 truncate bg-[linear-gradient(135deg,#5b35ff_8%,#f1329d_92%)] bg-clip-text text-[1.55rem] font-extrabold leading-none text-transparent sm:text-[1.78rem]">
              Celebra
            </strong>
          </div>
          <div className="shrink-0">{headerAction}</div>
        </div>
        <div>
          <h1 className="truncate text-[2rem] font-bold leading-tight sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-base text-slate-300 sm:text-lg">{subtitle}</p> : null}
        </div>
        <div className="shrink-0">{action}</div>
      </header>
      <div className="grid min-w-0 max-w-full gap-4 overflow-x-clip">{children}</div>
    </div>
  );
}

function CountdownUnit({ label, value }: { label: string; value: string }) {
  const normalizedValue = value === 'Hoje' || value === 'Encerrada' || value === '--' ? value : value.padStart(2, '0');

  return (
    <div className="min-w-0 text-center">
      <strong className="block truncate bg-[linear-gradient(135deg,#5128ff,#ef3f98)] bg-clip-text text-[1.55rem] font-extrabold leading-none text-transparent">
        {normalizedValue}
      </strong>
      <span className="mt-1 block text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}

function MobileMetricCard({
  detail,
  icon,
  label,
  progress,
  progressLabel,
  tint,
  value
}: {
  detail: string;
  icon: React.ReactNode;
  label: string;
  progress: number;
  progressLabel?: string;
  tint: 'pink' | 'purple';
  value: string;
}) {
  return (
    <section className="min-h-[168px] min-w-0 overflow-hidden rounded-[20px] border border-[#14233b] bg-[linear-gradient(145deg,rgba(10,22,39,0.96),rgba(5,13,28,0.98))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_34px_rgba(0,0,0,0.28)]">
      <h3 className="line-clamp-2 min-h-9 text-[0.78rem] font-bold leading-[1.15] text-white">{label}</h3>
      <div className="mt-4 grid min-h-[54px] grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
        <div
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-full',
            tint === 'purple' ? 'bg-[#251260] text-[#7c3cff]' : 'bg-[#55183a] text-[#ef3f98]'
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <strong className="block whitespace-nowrap text-[1.28rem] font-extrabold leading-tight text-white">{value}</strong>
          <span className="mt-1 block truncate text-[0.72rem] text-slate-400">{detail}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-2">
        <div className="h-2 overflow-hidden rounded-full bg-[#172235]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#5128ff,#ef3f98)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progressLabel ? (
          <span className="max-w-14 truncate whitespace-nowrap text-right text-[0.72rem] font-bold text-[#ef3f98]">{progressLabel}</span>
        ) : null}
      </div>
    </section>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-white/7 p-3">
      <strong className="block truncate text-sm">{value}</strong>
      <span className="mt-1 block truncate text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function HeroChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
      <strong className="block text-xl">{value}</strong>
      <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-slate-100/70">{label}</span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-sky-400/12 text-sky-200">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-xl">{value}</strong>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className="mt-2 block text-xl">{value}</strong>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card>
      <CardContent className="grid place-items-center gap-4 p-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-sky-400/12 text-sky-200">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Nenhuma festa cadastrada</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Crie a primeira festa para liberar cards, filtros, convidados e tarefas.
          </p>
        </div>
        <Button onClick={onCreate} variant="premium">
          <Plus size={18} />
          Criar festa
        </Button>
      </CardContent>
    </Card>
  );
}
