import {
  ActionIcon,
  Avatar,
  AppShell,
  Badge,
  Button,
  Burger,
  Group,
  NavLink,
  NumberInput,
  Paper,
  Popover,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  CircleAlert,
  ExternalLink,
  LayoutDashboard,
  Mail,
  MapPinned,
  LogOut,
  Moon,
  PencilLine,
  Phone,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Users
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { DayPicker } from 'react-day-picker';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type { AuthSession } from '@/domain/entities/auth';
import type { GuestStatus } from '@/domain/entities/party';
import type { ThemeMode } from '@/domain/entities/notification';
import { useDashboardData } from '@/presentation/hooks/useDashboardData';
import { currencyFormatter, formatDateTime } from '@/shared/utils/formatters';

const desktopSections = [
  { id: 'Painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'Planejar', label: 'Planejar', icon: Sparkles },
  { id: 'Operacao', label: 'Operacao', icon: CheckCheck },
  { id: 'Ajustes', label: 'Ajustes', icon: Settings2 }
] as const;

const guestStatuses: GuestStatus[] = ['Confirmado', 'Pendente', 'Recusou'];
const partyCategories = [
  { value: 'Aniversario', label: 'Aniversario' },
  { value: 'Festa', label: 'Festa' },
  { value: 'Formatura', label: 'Formatura' },
  { value: 'Casamento', label: 'Casamento' },
  { value: 'Noivado', label: 'Noivado' },
  { value: 'Outros', label: 'Outros' }
];

function formatZipCode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

type PartyFormState = {
  name: string;
  category: string;
  date: string;
  time: string;
  street: string;
  neighborhood: string;
  houseNumber: string;
  zipCode: string;
  referencePoint: string;
  expectedGuests: string;
  estimatedBudget: string;
  themeChoice: string;
  paletteChoice: string;
};

type PlanningView = 'list' | 'create' | 'detail';
type GuestFilter = 'Todos' | GuestStatus;
type NotificationFilter = 'Todas' | 'Nao lidas' | 'Lembretes' | 'Atualizacoes';
type ToastNotification = {
  id: string;
  title: string;
  message: string;
};

function createToastNotification(title: string, message: string): ToastNotification {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message
  };
}

function createEmptyPartyForm(): PartyFormState {
  return {
    name: '',
    category: 'Aniversario',
    date: '',
    time: '19:00',
    street: '',
    neighborhood: '',
    houseNumber: '',
    zipCode: '',
    referencePoint: '',
    expectedGuests: '60',
    estimatedBudget: '',
    themeChoice: 'Aniversario',
    paletteChoice: 'purple'
  };
}

function buildPartyLocation(form: PartyFormState) {
  return [
    [form.street.trim(), form.houseNumber.trim()].filter(Boolean).join(', '),
    form.neighborhood.trim(),
    form.zipCode.trim() ? `CEP ${form.zipCode.trim()}` : '',
    form.referencePoint.trim() ? `Ref.: ${form.referencePoint.trim()}` : ''
  ]
    .filter(Boolean)
    .join(' | ');
}

function createPartyFormFromParty(
  party: {
    name: string;
    category: string;
    date: string;
    time?: string;
    location: string;
    expectedGuests?: number;
    budget: { estimated: number };
  } | null | undefined
): PartyFormState {
  if (!party) {
    return createEmptyPartyForm();
  }

  const sections = party.location.split('|').map((section) => section.trim()).filter(Boolean);
  const [streetAndNumber = '', neighborhood = '', zipCodeSection = '', referenceSection = ''] = sections;
  const streetSplit = streetAndNumber.split(',').map((item) => item.trim()).filter(Boolean);

  return {
    name: party.name,
    category: party.category || 'Aniversario',
    date: party.date || '',
    time: party.time || '19:00',
    street: streetSplit[0] ?? '',
    houseNumber: streetSplit[1] ?? '',
    neighborhood,
    zipCode: formatZipCode(zipCodeSection.replace(/^CEP\s*/i, '')),
    referencePoint: referenceSection.replace(/^Ref\.:\s*/i, ''),
    expectedGuests: String(party.expectedGuests ?? 0),
    estimatedBudget: String(party.budget.estimated ?? ''),
    themeChoice: party.category || 'Aniversario',
    paletteChoice: 'purple'
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

function formatPartyDateLabel(value: string) {
  if (!dayjs(value).isValid()) {
    return value;
  }

  return dayjs(value).format('ddd, DD MMM YYYY');
}

function getDaysLeftLabel(value: string) {
  if (!dayjs(value).isValid()) {
    return '--';
  }

  const diff = dayjs(value).startOf('day').diff(dayjs().startOf('day'), 'day');

  if (diff < 0) {
    return 'Encerrada';
  }

  if (diff === 0) {
    return 'Hoje';
  }

  return `${diff} dias`;
}

function getCountdownParts(date: string, time: string) {
  const eventDateTime = dayjs(`${date} ${time}`);

  if (!eventDateTime.isValid()) {
    return { days: '--', hours: '--', minutes: '--', seconds: '--' };
  }

  const now = dayjs();
  const diff = Math.max(eventDateTime.diff(now, 'second'), 0);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
}

function getNotificationCategory(type: string): NotificationFilter {
  if (type === 'budget' || type === 'task') {
    return 'Lembretes';
  }

  if (type === 'party' || type === 'guest') {
    return 'Atualizacoes';
  }

  return 'Todas';
}

function getPartyArtwork(category: string) {
  switch (category) {
    case 'Casamento':
      return '/illustrations/wedding-hero.svg';
    case 'Formatura':
      return '/illustrations/graduation-hero.svg';
    default:
      return '/illustrations/birthday-hero.svg';
  }
}

type DesktopSection = (typeof desktopSections)[number]['id'];
type Section = DesktopSection | 'Convidados' | 'Tarefas' | 'Perfil' | 'Notificacoes';

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
  function renderOverviewTooltip({
    active,
    payload
  }: {
    active?: boolean;
    payload?: ReadonlyArray<{
      payload?: { name: string; fullDate: string; spent: number; confirmedGuests: number };
    }>;
  }) {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const [item] = payload;
    const data = item?.payload;

    if (!data) {
      return null;
    }

    return (
      <div className="overview-chart-tooltip">
        <strong>{data.name}</strong>
        <span>{data.fullDate}</span>
        <small>Gasto: {currencyFormatter.format(data.spent)}</small>
        <small>Confirmados: {data.confirmedGuests}</small>
      </div>
    );
  }

  const [activeSection, setActiveSection] = useState<Section>('Painel');
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpened, setMobileOpened] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [planningView, setPlanningView] = useState<PlanningView>('list');
  const [planningPartyId, setPlanningPartyId] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);
  const [plannerCalendarOpen, setPlannerCalendarOpen] = useState(false);
  const [partyForm, setPartyForm] = useState<PartyFormState>(createEmptyPartyForm);
  const [taskForm, setTaskForm] = useState({
    title: '',
    assignee: '',
    dueDate: '',
    status: 'Pendente'
  });
  const [guestForm, setGuestForm] = useState({
    name: '',
    group: '',
    status: 'Pendente' as GuestStatus
  });
  const [budgetForm, setBudgetForm] = useState({ label: '', category: '', amount: '' });
  const [plannerStep, setPlannerStep] = useState(1);
  const [guestFilter, setGuestFilter] = useState<GuestFilter>('Todos');
  const [guestSearch, setGuestSearch] = useState('');
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>('Todas');
  const [actionError, setActionError] = useState('');

  const {
    dashboardQuery,
    createParty,
    updateParty,
    createTask,
    createGuest,
    createBudgetItem,
    toggleTask,
    markAllAsRead,
    clearAllNotifications
  } = useDashboardData(true);

  const parties = dashboardQuery.data?.parties ?? [];
  const notifications = dashboardQuery.data?.notifications ?? [];
  const isMobile = useMediaQuery('(max-width: 48em)');
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const notificationsInitializedRef = useRef(false);
  const notificationsPanelRef = useRef<HTMLElement | null>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement | null>(null);

  function pushToast(toastNotification: ToastNotification) {
    setToastNotifications((current) => [...current, toastNotification].slice(-3));

    window.setTimeout(() => {
      setToastNotifications((current) =>
        current.filter((item) => item.id !== toastNotification.id)
      );
    }, 4500);
  }

  useEffect(() => {
    if (!selectedPartyId && parties[0]) {
      setSelectedPartyId(parties[0].id);
    }
  }, [parties, selectedPartyId]);

  useEffect(() => {
    if (!planningPartyId && parties[0]) {
      setPlanningPartyId(parties[0].id);
    }
  }, [parties, planningPartyId]);

  useEffect(() => {
    if (!dashboardQuery.data) {
      return;
    }

    if (!notificationsInitializedRef.current) {
      notifications.forEach((notification) => {
        seenNotificationIdsRef.current.add(notification.id);
      });
      notificationsInitializedRef.current = true;
      return;
    }

    const nextToasts = notifications.filter(
      (notification) =>
        !seenNotificationIdsRef.current.has(notification.id) &&
        notification.title.trim().toLowerCase() !== 'login realizado'
    );

    if (nextToasts.length === 0) {
      return;
    }

    nextToasts.forEach((notification) => {
      seenNotificationIdsRef.current.add(notification.id);
      pushToast({
        id: notification.id,
        title: notification.title,
        message: notification.message
      });
    });
  }, [dashboardQuery.data, notifications]);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      if (notificationsPanelRef.current?.contains(target)) {
        return;
      }

      if (notificationsButtonRef.current?.contains(target)) {
        return;
      }

      setNotificationsOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [notificationsOpen]);

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === selectedPartyId) ?? parties[0] ?? null,
    [parties, selectedPartyId]
  );
  const planningParty = useMemo(
    () => parties.find((party) => party.id === planningPartyId) ?? null,
    [parties, planningPartyId]
  );

  const globalConfirmedGuests = parties.reduce(
    (count, party) => count + party.guests.filter((guest) => guest.status === 'Confirmado').length,
    0
  );
  const globalBudget = parties.reduce((sum, party) => sum + party.budget.spent, 0);
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;
  const featuredParty = useMemo(() => {
    if (parties.length === 0) {
      return null;
    }

    const upcomingParties = [...parties].sort((firstParty, secondParty) => {
      const firstDate = dayjs(firstParty.date).valueOf();
      const secondDate = dayjs(secondParty.date).valueOf();
      return firstDate - secondDate;
    });

    return upcomingParties[0] ?? null;
  }, [parties]);
  const overviewChartData = useMemo(
    () =>
      [...parties]
        .sort((firstParty, secondParty) => {
          const firstDate = dayjs(firstParty.date).valueOf();
          const secondDate = dayjs(secondParty.date).valueOf();
          return firstDate - secondDate;
        })
        .slice(0, 8)
        .map((party) => {
          const confirmedGuestsCount = party.guests.filter(
            (guest) => guest.status === 'Confirmado'
          ).length;

          return {
            id: party.id,
            name: party.name,
            label:
              party.name.length > 18 ? `${party.name.slice(0, 18).trim()}...` : party.name,
            fullDate: dayjs(party.date).isValid()
              ? dayjs(party.date).format('DD/MM/YYYY')
              : party.date,
            spent: party.budget.spent,
            confirmedGuests: confirmedGuestsCount
          };
        }),
    [parties]
  );
  const featuredGuests = featuredParty?.guests.slice(0, 5) ?? [];
  const featuredTasks = featuredParty?.tasks.slice(0, 4) ?? [];
  const featuredConfirmedGuests =
    featuredParty?.guests.filter((guest) => guest.status === 'Confirmado').length ?? 0;
  const featuredPendingGuests =
    featuredParty?.guests.filter((guest) => guest.status === 'Pendente').length ?? 0;
  const featuredDeclinedGuests =
    featuredParty?.guests.filter((guest) => guest.status === 'Recusou').length ?? 0;
  const mobileParty = selectedParty ?? featuredParty;
  const mobileGuests = mobileParty?.guests ?? [];
  const mobileTasks = mobileParty?.tasks ?? [];
  const mobileBudgetItems = mobileParty?.budget.items ?? [];
  const filteredMobileGuests = mobileGuests.filter((guest) => {
    const matchesFilter = guestFilter === 'Todos' || guest.status === guestFilter;
    const search = guestSearch.trim().toLowerCase();
    const matchesSearch =
      search.length === 0 ||
      guest.name.toLowerCase().includes(search) ||
      guest.group.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });
  const hasGuestFilters = guestFilter !== 'Todos' || guestSearch.trim().length > 0;
  const filteredNotifications = notifications.filter((notification) => {
    if (notificationFilter === 'Nao lidas' && notification.isRead) {
      return false;
    }

    if (notificationFilter === 'Lembretes') {
      return getNotificationCategory(notification.type) === 'Lembretes';
    }

    if (notificationFilter === 'Atualizacoes') {
      return getNotificationCategory(notification.type) === 'Atualizacoes';
    }

    return true;
  });
  const totalTaskCount = parties.reduce((count, party) => count + party.tasks.length, 0);
  const completedTaskCount = parties.reduce(
    (count, party) => count + party.tasks.filter((task) => task.done).length,
    0
  );
  const profileCards = [
    {
      id: 'account',
      label: 'Minha conta',
      description: 'Veja e edite suas informacoes pessoais.',
      icon: Users
    },
    {
      id: 'preferences',
      label: 'Preferencias',
      description: 'Personalize o visual e o comportamento do app.',
      icon: Settings2
    },
    {
      id: 'notifications',
      label: 'Notificacoes',
      description: 'Escolha como e quando receber alertas.',
      icon: Bell
    }
  ] as const;
  const countdown = featuredParty ? getCountdownParts(featuredParty.date, featuredParty.time) : null;

  async function handleCreateParty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setActionError('');
      const formattedLocation = buildPartyLocation(partyForm);

      const created = await createParty.mutateAsync({
        name: partyForm.name.trim(),
        category: partyForm.category.trim(),
        date: partyForm.date.trim(),
        time: partyForm.time.trim(),
        location: formattedLocation,
        expectedGuests: Number(partyForm.expectedGuests) || 0,
        estimatedBudget: Number(partyForm.estimatedBudget) || 0
      });

      setSelectedPartyId(created.id);
      setPlanningPartyId(created.id);
      setPlanningView('detail');
      setPartyForm(createPartyFormFromParty(created));
      setPlannerCalendarOpen(false);
      pushToast(
        createToastNotification(
          'Festa criada',
          `A festa "${created.name}" foi criada com sucesso.`
        )
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Nao foi possivel criar a festa.');
    }
  }

  async function handleUpdateParty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!planningParty) {
      return;
    }

    try {
      setActionError('');
      const updated = await updateParty.mutateAsync({
        partyId: planningParty.id,
        name: partyForm.name.trim(),
        category: partyForm.category.trim(),
        date: partyForm.date.trim(),
        time: partyForm.time.trim(),
        location: buildPartyLocation(partyForm),
        expectedGuests: Number(partyForm.expectedGuests) || 0,
        estimatedBudget: Number(partyForm.estimatedBudget) || 0
      });

      setSelectedPartyId(updated.id);
      setPlanningPartyId(updated.id);
      setPartyForm(createPartyFormFromParty(updated));
      pushToast(
        createToastNotification(
          'Festa atualizada',
          `As alteracoes da festa "${updated.name}" foram salvas.`
        )
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Nao foi possivel atualizar a festa.');
    }
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedParty) {
      return;
    }

    try {
      setActionError('');
      await createTask.mutateAsync({ partyId: selectedParty.id, ...taskForm });
      setTaskForm({ title: '', assignee: '', dueDate: '', status: 'Pendente' });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Nao foi possivel criar a tarefa.');
    }
  }

  async function handleCreateGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedParty) {
      return;
    }

    try {
      setActionError('');
      await createGuest.mutateAsync({ partyId: selectedParty.id, ...guestForm });
      setGuestForm({ name: '', group: '', status: 'Pendente' });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Nao foi possivel criar o convidado.');
    }
  }

  async function handleCreateBudgetItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedParty) {
      return;
    }

    try {
      setActionError('');
      await createBudgetItem.mutateAsync({
        partyId: selectedParty.id,
        label: budgetForm.label,
        category: budgetForm.category,
        amount: Number(budgetForm.amount)
      });
      setBudgetForm({ label: '', category: '', amount: '' });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Nao foi possivel criar a despesa.');
    }
  }

  async function handleOpenNotifications() {
    if (isMobile) {
      setActiveSection('Notificacoes');

      if (unreadNotifications > 0) {
        await markAllAsRead.mutateAsync();
      }

      return;
    }

    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);

    if (nextState && unreadNotifications > 0) {
      await markAllAsRead.mutateAsync();
    }
  }

  async function handleClearNotifications() {
    try {
      await clearAllNotifications.mutateAsync();
      seenNotificationIdsRef.current.clear();
      setNotificationsOpen(false);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Nao foi possivel limpar as notificacoes.'
      );
    }
  }

  function handleNavbarToggle() {
    if (isMobile) {
      setMobileOpened((current) => !current);
      return;
    }

    setDesktopCollapsed((current) => !current);
  }

  function handleQuickCreateParty() {
    setActiveSection('Planejar');
    setPlanningView('create');
    setPlanningPartyId('');
    setPartyForm(createEmptyPartyForm());
    setPlannerStep(1);
    setPlannerCalendarOpen(false);

    if (isMobile) {
      setMobileOpened(false);
    }
  }

  function handleSectionChange(section: Section) {
    setActiveSection(section);

    if (isMobile) {
      setMobileOpened(false);
    }
  }

  const isCollapsedDesktop = !isMobile && desktopCollapsed;
  const selectedPlannerDate = partyForm.date ? new Date(`${partyForm.date}T12:00:00`) : undefined;
  const plannerDisplayParty = planningParty ?? selectedParty;
  const planningPartyMapsUrl = plannerDisplayParty?.location.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plannerDisplayParty.location.trim())}`
    : '';
  const plannerFieldStyles = {
    input: {
      background: 'var(--input-bg)',
      color: 'var(--text)',
      borderColor: 'var(--border)'
    },
    label: {
      color: 'var(--text)',
      fontWeight: 700
    },
    description: {
      color: 'var(--text-muted)'
    }
  } as const;
  const plannerSelectStyles = {
    ...plannerFieldStyles,
    dropdown: {
      background: 'var(--card)',
      borderColor: 'var(--border)',
      color: 'var(--text)'
    },
    option: {
      color: 'var(--text)',
      background: 'transparent',
      '&[data-combobox-selected]': {
        background: 'rgba(239, 123, 69, 0.18)',
        color: 'var(--text)'
      },
      '&[data-combobox-active]': {
        background: 'rgba(239, 123, 69, 0.12)',
        color: 'var(--text)'
      }
    }
  } as const;
  const plannerFieldClassNames = {
    input: 'planner-field-input',
    label: 'planner-field-label',
    description: 'planner-field-description'
  } as const;
  const plannerSelectClassNames = {
    ...plannerFieldClassNames,
    dropdown: 'planner-field-dropdown',
    option: 'planner-field-option'
  } as const;
  const mobileSegmentedStyles = {
    root: {
      background: 'rgba(255,255,255,0.72)',
      border: '1px solid rgba(116, 79, 255, 0.08)',
      borderRadius: '999px',
      boxShadow: 'var(--shadow)'
    },
    indicator: {
      background: 'linear-gradient(145deg, #4a27ff 0%, #7c44ff 58%, #ff4ba0 100%)',
      borderRadius: '999px'
    },
    label: {
      fontWeight: 700,
      color: 'var(--text-soft)'
    }
  } as const;
  const mobileSurfaceStyles = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)'
  } as const;

  return (
    <AppShell
      className="dashboard-shell-ui"
      navbar={{
        width: isMobile ? 0 : desktopCollapsed ? 92 : 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: false }
      }}
      padding="md"
    >
      {!isMobile ? (
        <AppShell.Navbar
          className={desktopCollapsed ? 'app-navbar is-collapsed' : 'app-navbar'}
          p="md"
        >
          <AppShell.Section>
            <div className="navbar-toggle-row">
              <ActionIcon
                aria-label={desktopCollapsed ? 'Expandir menu lateral' : 'Retrair menu lateral'}
                className="app-action navbar-toggle-button"
                onClick={handleNavbarToggle}
                radius="xl"
                size="xl"
                variant="default"
              >
                <Burger aria-hidden opened={!desktopCollapsed} size="sm" />
              </ActionIcon>
            </div>
          </AppShell.Section>

          <AppShell.Section className="app-navbar-grow" component={ScrollArea}>
            <Stack gap="xs">
              {desktopSections.map((section) => {
                const Icon = section.icon;
                return (
                  <NavLink
                    key={section.id}
                    active={section.id === activeSection}
                    className="mantine-nav-link"
                    label={!isCollapsedDesktop ? section.label : undefined}
                    leftSection={<Icon size={18} />}
                    onClick={() => handleSectionChange(section.id)}
                    styles={{
                      root: {
                        borderRadius: '18px',
                        color: section.id === activeSection ? '#fff7ed' : 'var(--sidebar-text)',
                        width: isCollapsedDesktop ? '56px' : '100%',
                        height: isCollapsedDesktop ? '56px' : 'auto',
                        minHeight: isCollapsedDesktop ? '56px' : '48px',
                        padding: isCollapsedDesktop ? '0' : '12px 16px',
                        marginInline: isCollapsedDesktop ? 'auto' : undefined,
                        justifyContent: isCollapsedDesktop ? 'center' : undefined,
                        background:
                          section.id === activeSection ? 'var(--accent)' : 'transparent',
                        transition: 'background 0.18s ease, color 0.18s ease',
                        '&:hover': {
                          background:
                            section.id === activeSection ? 'var(--accent)' : '#d96733',
                          color:
                            section.id === activeSection ? '#fff7ed' : '#1b1f27'
                        }
                      },
                      body: isCollapsedDesktop
                        ? {
                            display: 'none'
                          }
                        : undefined,
                      section: {
                        color: 'inherit',
                        marginInlineEnd: isCollapsedDesktop ? '0' : undefined,
                        minWidth: isCollapsedDesktop ? '18px' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      },
                      label: {
                        color: 'inherit',
                        fontWeight: 600
                      }
                    }}
                    title={section.label}
                  />
                );
              })}
            </Stack>
          </AppShell.Section>

          <AppShell.Section>
            <button className="ghost-button logout-button" onClick={onLogout} type="button">
              <LogOut size={16} />
              {desktopCollapsed ? '' : 'Sair da conta'}
            </button>
          </AppShell.Section>
        </AppShell.Navbar>
      ) : null}

      <AppShell.Main className="dashboard-main">
        <header className="app-header">
          <Group className="app-header-row" justify="space-between" wrap="nowrap">
            {isMobile ? (
              <>
                <Group>
                  <img alt="Celebra" className="app-header-brand__logo" src="/icons/logo_pwa_circle.png" />
                  <span className="app-header-brand__name">Celebra</span>
                </Group>

                <Group className="topbar-actions topbar-actions-mobile" gap="sm" wrap="nowrap">
                  <ActionIcon
                    aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
                    className="app-action"
                    onClick={() => void onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                    radius="xl"
                    size="xl"
                    variant="default"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </ActionIcon>

                  <ActionIcon
                    aria-label="Abrir notificacoes"
                    className="app-action notification-trigger"
                    onClick={handleOpenNotifications}
                    ref={notificationsButtonRef}
                    radius="xl"
                    size="xl"
                    variant="default"
                  >
                    <Bell size={18} />
                    {unreadNotifications > 0 ? (
                      <span className="badge">{Math.min(unreadNotifications, 9)}</span>
                    ) : null}
                  </ActionIcon>

                  <button
                    aria-label="Abrir perfil"
                    className="app-header-avatar-button"
                    onClick={() => handleSectionChange('Perfil')}
                    type="button"
                  >
                    <Avatar className="app-header-avatar" color="grape" radius="xl" size={42}>
                      {getInitials(session.user.name)}
                    </Avatar>
                  </button>
                </Group>
              </>
            ) : (
              <>
                <div className="app-header-brand">
                  <span className="eyebrow">Mesmo backend, nova experiencia</span>
                  <h1 className="app-header-title">{activeSection}</h1>
                  <p className="app-header-copy">{`${session.user.name} | ${session.user.email}`}</p>
                </div>

                <Group className="topbar-actions" gap="sm" wrap="nowrap">
                  <div className="install-callout">
                    <span>PWA pronta para instalar</span>
                    <small>Abra no Chrome ou Edge e use "Instalar aplicativo".</small>
                  </div>

                  <ActionIcon
                    aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
                    className="app-action"
                    onClick={() => void onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                    radius="xl"
                    size="xl"
                    variant="default"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </ActionIcon>

                  <ActionIcon
                    aria-label="Abrir notificacoes"
                    className="app-action notification-trigger"
                    onClick={handleOpenNotifications}
                    ref={notificationsButtonRef}
                    radius="xl"
                    size="xl"
                    variant="default"
                  >
                    <Bell size={18} />
                    {unreadNotifications > 0 ? (
                      <span className="badge">{Math.min(unreadNotifications, 9)}</span>
                    ) : null}
                  </ActionIcon>
                </Group>
              </>
            )}
          </Group>
        </header>

    {!isMobile && notificationsOpen ? (
      <section className="notifications-popover card-light" ref={notificationsPanelRef}>
        <div className="inline-heading">
          <strong>Notificacoes</strong>
          <span>{notifications.length} itens</span>
        </div>

        <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <article key={notification.id} className="notification-card">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <span>{formatDateTime(notification.createdAtUtc)}</span>
                  </article>
                ))
              ) : (
            <p className="empty-copy">Nenhuma notificacao ainda.</p>
          )}
        </div>

        <div className="notifications-footer">
          <Button
            color="orange"
            disabled={notifications.length === 0}
            loading={clearAllNotifications.isPending}
            radius="md"
            size="compact-md"
            type="button"
            variant="subtle"
            onClick={() => void handleClearNotifications()}
          >
            Limpar notificacoes
          </Button>
        </div>
      </section>
    ) : null}

        {toastNotifications.length > 0 ? (
          <section className="toast-stack" aria-live="polite" aria-atomic="true">
            {toastNotifications.map((toastNotification) => (
              <article key={toastNotification.id} className="toast-card">
                <div className="toast-icon">
                  <CircleAlert size={16} />
                </div>
                <div className="toast-copy">
                  <strong>{toastNotification.title}</strong>
                  <p>{toastNotification.message}</p>
                </div>
                <button
                  className="toast-close"
                  onClick={() =>
                    setToastNotifications((current) =>
                      current.filter((item) => item.id !== toastNotification.id)
                    )
                  }
                  type="button"
                >
                  Fechar
                </button>
              </article>
            ))}
          </section>
        ) : null}

        {activeSection === 'Painel' && isMobile ? (
          <section className="mobile-overview-shell">
            {featuredParty ? (
              <>
                <article className="mobile-featured-event">
                  <div className="mobile-featured-event__top">
                    <Badge className="mobile-featured-badge" radius="xl" size="sm">
                      Proxima festa
                    </Badge>
                    <span className="mobile-featured-event__category">{featuredParty.category}</span>
                  </div>

                  <div className="mobile-featured-event__body">
                    <h2>{featuredParty.name}</h2>
                    <p>{formatPartyDateLabel(featuredParty.date)}</p>
                    <small>{featuredParty.location.split('|')[0]?.trim() || featuredParty.location}</small>
                  </div>

                  <img
                    alt={featuredParty.category}
                    className="mobile-featured-event__art"
                    src={getPartyArtwork(featuredParty.category)}
                  />
                </article>

                <section className="mobile-featured-metrics">
                  <article className="mobile-chip-card">
                    <span>Data</span>
                    <strong>{dayjs(featuredParty.date).isValid() ? dayjs(featuredParty.date).format('DD MMM') : featuredParty.date}</strong>
                    <small>{featuredParty.time || formatPartyDateLabel(featuredParty.date)}</small>
                  </article>

                  <article className="mobile-chip-card is-highlight">
                    <span>Budget</span>
                    <strong>{currencyFormatter.format(featuredParty.budget.estimated)}</strong>
                    <small>{currencyFormatter.format(featuredParty.budget.spent)} usado</small>
                  </article>

                  <article className="mobile-chip-card">
                    <span>Dias restantes</span>
                    <strong>{getDaysLeftLabel(featuredParty.date)}</strong>
                    <small>ate a realizacao</small>
                  </article>
                </section>

                {countdown ? (
                  <article className="mobile-countdown-card">
                    <div className="mobile-countdown-card__head">
                      <strong>Contagem regressiva</strong>
                      <Sparkles size={18} />
                    </div>
                    <div className="mobile-countdown-grid">
                      <div><strong>{countdown.days}</strong><span>dias</span></div>
                      <div><strong>{countdown.hours}</strong><span>horas</span></div>
                      <div><strong>{countdown.minutes}</strong><span>min</span></div>
                      <div><strong>{countdown.seconds}</strong><span>seg</span></div>
                    </div>
                  </article>
                ) : null}

                <section className="mobile-insight-grid">
                  <article className="mobile-section-card">
                    <div className="mobile-section-card__head">
                      <strong>Convidados</strong>
                      <span>{featuredParty.guests.length} no total</span>
                    </div>

                    <div className="mobile-guest-row">
                      {featuredGuests.map((guest, index) => (
                        <div
                          key={guest.id}
                          className={`mobile-guest-avatar tone-${(index % 5) + 1}`}
                          title={guest.name}
                        >
                          {getInitials(guest.name)}
                        </div>
                      ))}
                      {featuredParty.guests.length > featuredGuests.length ? (
                        <div className="mobile-guest-avatar more">
                          +{featuredParty.guests.length - featuredGuests.length}
                        </div>
                      ) : null}
                    </div>

                    <div className="mobile-guest-status">
                      <span className="ok">{featuredConfirmedGuests} Confirmados</span>
                      <span className="pending">{featuredPendingGuests} Pendentes</span>
                      <span className="declined">{featuredDeclinedGuests} Recusaram</span>
                    </div>
                  </article>

                  <article className="mobile-section-card">
                    <div className="mobile-section-card__head">
                      <strong>Tarefas</strong>
                      <button
                        className="mobile-inline-link"
                        type="button"
                        onClick={() => handleSectionChange('Operacao')}
                      >
                        Ver tudo
                      </button>
                    </div>

                    <div className="mobile-task-list">
                      {featuredTasks.length > 0 ? (
                        featuredTasks.map((task) => (
                          <div key={task.id} className="mobile-task-item">
                            <span className={task.done ? 'task-state done' : 'task-state pending'} />
                            <div>
                              <strong>{task.title}</strong>
                              <small>{task.assignee || 'Sem responsavel definido'}</small>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="empty-copy">Nenhuma tarefa cadastrada ainda.</p>
                      )}
                    </div>

                    <button
                      className="mobile-add-link"
                      type="button"
                      onClick={() => handleSectionChange('Planejar')}
                    >
                      + Ir para planejamento
                    </button>
                  </article>
                </section>
              </>
            ) : (
              <article className="mobile-empty-card">
                <span className="eyebrow">Primeiro passo</span>
                <h2>Crie sua primeira festa</h2>
                <p>Assim que ela existir, esse painel mobile ganha destaque, convidados e tarefas.</p>
                <Button color="orange" radius="xl" onClick={handleQuickCreateParty}>
                  Criar festa agora
                </Button>
              </article>
            )}
          </section>
        ) : null}

        {activeSection === 'Painel' && !isMobile ? (
          <section className="stats-grid">
            <article className="stat-card">
              <CalendarDays size={18} />
              <strong>{parties.length}</strong>
              <span>Festas ativas</span>
            </article>
            <article className="stat-card">
              <Users size={18} />
              <strong>{globalConfirmedGuests}</strong>
              <span>Confirmados</span>
            </article>
            <article className="stat-card">
              <CircleDollarSign size={18} />
              <strong>{currencyFormatter.format(globalBudget)}</strong>
              <span>Gasto acumulado</span>
            </article>
          </section>
        ) : null}

        {dashboardQuery.isLoading ? <div className="card-light loading-inline">Carregando dados...</div> : null}
        {dashboardQuery.error ? (
          <div className="feedback error">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : 'Nao foi possivel carregar a API.'}
          </div>
        ) : null}
        {actionError ? <div className="feedback error">{actionError}</div> : null}

        {activeSection === 'Operacao' && !isMobile ? (
          <section className="party-rail">
            {parties.map((party) => (
              <button
                key={party.id}
                className={party.id === selectedParty?.id ? 'party-card is-active' : 'party-card'}
                onClick={() => setSelectedPartyId(party.id)}
                type="button"
              >
                <span>{party.category}</span>
                <strong>{party.name}</strong>
                <small>{party.date}</small>
                <small>{party.location}</small>
              </button>
            ))}
          </section>
        ) : null}

        {activeSection === 'Painel' && !isMobile ? (
          <section className="dashboard-overview">
            <article className="card-light overview-chart-card">
              <div className="overview-chart-header">
                <div>
                  <span className="eyebrow">Visao geral</span>
                  <h3>Panorama rapido das festas cadastradas</h3>
                  <p>
                    Compare o gasto por festa com os convidados confirmados e acompanhe o ritmo
                    do planejamento sem trocar de tela.
                  </p>
                </div>

                <div className="overview-chart-legend">
                  <span className="legend-pill legend-pill-spent">Gasto por festa</span>
                  <span className="legend-pill legend-pill-guests">Convidados confirmados</span>
                </div>
              </div>

              {overviewChartData.length > 0 ? (
                <div className="overview-chart-shell">
                  <div className="overview-chart-frame">
                    <ResponsiveContainer height={360} width="100%">
                      <ComposedChart
                        data={overviewChartData}
                        margin={{ top: 12, right: 16, left: 0, bottom: 16 }}
                      >
                        <defs>
                          <linearGradient id="overviewSpentGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#ffad76" />
                            <stop offset="100%" stopColor="#ef7b45" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.08)"
                          strokeDasharray="4 8"
                          vertical={false}
                        />
                        <XAxis
                          axisLine={false}
                          dataKey="label"
                          tick={{ fill: 'var(--text-soft)', fontSize: 12 }}
                          tickLine={false}
                        />
                        <YAxis
                          axisLine={false}
                          tick={{ fill: 'var(--text-soft)', fontSize: 12 }}
                          tickFormatter={(value) => currencyFormatter.format(Number(value))}
                          tickLine={false}
                          width={96}
                          yAxisId="spent"
                        />
                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          orientation="right"
                          tick={{ fill: '#79bbff', fontSize: 12 }}
                          tickLine={false}
                          width={54}
                          yAxisId="guests"
                        />
                        <Tooltip
                          content={renderOverviewTooltip}
                          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <Legend />
                        <Bar
                          barSize={42}
                          dataKey="spent"
                          fill="url(#overviewSpentGradient)"
                          name="Gasto por festa"
                          radius={[16, 16, 16, 16]}
                          yAxisId="spent"
                        />
                        <Line
                          activeDot={{ fill: '#79bbff', r: 7, stroke: '#0f1724', strokeWidth: 2 }}
                          dataKey="confirmedGuests"
                          dot={{ fill: '#79bbff', r: 5, stroke: '#0f1724', strokeWidth: 2 }}
                          name="Convidados confirmados"
                          stroke="#79bbff"
                          strokeWidth={3}
                          type="monotone"
                          yAxisId="guests"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="overview-empty-chart">
                  <strong>Nenhuma festa cadastrada ainda.</strong>
                  <p>Assim que voce criar as festas, o panorama geral vai aparecer aqui.</p>
                </div>
              )}
            </article>
          </section>
        ) : null}

        {activeSection === 'Planejar' && isMobile ? (
          <section className="mobile-page-shell">
            {planningView === 'create' ? (
              <form className="mobile-wizard-shell" onSubmit={handleCreateParty}>
                <SegmentedControl
                  className="mobile-stepper-shell"
                  data={[
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                    { label: '3', value: '3' },
                    { label: '4', value: '4' }
                  ]}
                  fullWidth
                  radius="xl"
                  styles={mobileSegmentedStyles}
                  value={String(plannerStep)}
                  onChange={(value) => setPlannerStep(Number(value))}
                />

                {plannerStep === 1 ? (
                  <Paper className="mobile-surface-card" p="lg" radius="xl" style={mobileSurfaceStyles}>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={700}>Dados do evento</Text>
                        <Text c="dimmed" size="sm">Passo 1 de 4</Text>
                      </div>
                      <Badge radius="xl" variant="light">Essencial</Badge>
                    </Group>

                    <Stack gap="md">
                      <TextInput
                        classNames={plannerFieldClassNames}
                        label="Nome do evento"
                        placeholder="Ex.: Aniversario da Ana"
                        radius="lg"
                        styles={plannerFieldStyles}
                        value={partyForm.name}
                        onChange={(event) => setPartyForm((current) => ({ ...current, name: event.target.value }))}
                      />
                      <Select
                        classNames={plannerSelectClassNames}
                        data={partyCategories}
                        label="Tipo de festa"
                        radius="lg"
                        styles={plannerSelectStyles}
                        value={partyForm.category}
                        onChange={(value) => setPartyForm((current) => ({ ...current, category: value ?? 'Aniversario' }))}
                      />
                      <SimpleGrid cols={2} spacing="sm">
                        <TextInput
                          classNames={plannerFieldClassNames}
                          label="Data"
                          radius="lg"
                          styles={plannerFieldStyles}
                          type="date"
                          value={partyForm.date}
                          onChange={(event) => setPartyForm((current) => ({ ...current, date: event.target.value }))}
                        />
                        <TextInput
                          classNames={plannerFieldClassNames}
                          label="Horario"
                          radius="lg"
                          styles={plannerFieldStyles}
                          type="time"
                          value={partyForm.time}
                          onChange={(event) => setPartyForm((current) => ({ ...current, time: event.target.value }))}
                        />
                      </SimpleGrid>
                    </Stack>
                  </Paper>
                ) : null}

                {plannerStep === 2 ? (
                  <Paper className="mobile-surface-card" p="lg" radius="xl" style={mobileSurfaceStyles}>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={700}>Local</Text>
                        <Text c="dimmed" size="sm">Passo 2 de 4</Text>
                      </div>
                      <Badge radius="xl" variant="light">Endereco</Badge>
                    </Group>

                    <Stack gap="md">
                      <TextInput
                        classNames={plannerFieldClassNames}
                        label="Rua"
                        radius="lg"
                        styles={plannerFieldStyles}
                        value={partyForm.street}
                        onChange={(event) => setPartyForm((current) => ({ ...current, street: event.target.value }))}
                      />
                      <SimpleGrid cols={2} spacing="sm">
                        <TextInput
                          classNames={plannerFieldClassNames}
                          label="Bairro"
                          radius="lg"
                          styles={plannerFieldStyles}
                          value={partyForm.neighborhood}
                          onChange={(event) => setPartyForm((current) => ({ ...current, neighborhood: event.target.value }))}
                        />
                        <TextInput
                          classNames={plannerFieldClassNames}
                          label="Numero"
                          radius="lg"
                          styles={plannerFieldStyles}
                          value={partyForm.houseNumber}
                          onChange={(event) => setPartyForm((current) => ({ ...current, houseNumber: event.target.value }))}
                        />
                      </SimpleGrid>
                      <SimpleGrid cols={2} spacing="sm">
                        <TextInput
                          classNames={plannerFieldClassNames}
                          label="CEP"
                          radius="lg"
                          styles={plannerFieldStyles}
                          value={partyForm.zipCode}
                          onChange={(event) => setPartyForm((current) => ({ ...current, zipCode: formatZipCode(event.target.value) }))}
                        />
                        <TextInput
                          classNames={plannerFieldClassNames}
                          label="Referencia"
                          radius="lg"
                          styles={plannerFieldStyles}
                          value={partyForm.referencePoint}
                          onChange={(event) => setPartyForm((current) => ({ ...current, referencePoint: event.target.value }))}
                        />
                      </SimpleGrid>
                    </Stack>
                  </Paper>
                ) : null}

                {plannerStep === 3 ? (
                  <Paper className="mobile-surface-card" p="lg" radius="xl" style={mobileSurfaceStyles}>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={700}>Plano</Text>
                        <Text c="dimmed" size="sm">Passo 3 de 4</Text>
                      </div>
                      <Badge radius="xl" variant="light">Recursos</Badge>
                    </Group>

                    <Stack gap="md">
                      <SimpleGrid cols={2} spacing="sm">
                        <NumberInput
                          allowDecimal={false}
                          classNames={plannerFieldClassNames}
                          hideControls
                          label="Convidados esperados"
                          radius="lg"
                          styles={plannerFieldStyles}
                          value={partyForm.expectedGuests}
                          onChange={(value) =>
                            setPartyForm((current) => ({
                              ...current,
                              expectedGuests: value === '' ? '' : String(value)
                            }))
                          }
                        />
                        <NumberInput
                          allowDecimal
                          classNames={plannerFieldClassNames}
                          decimalScale={2}
                          decimalSeparator=","
                          hideControls
                          label="Orcamento inicial"
                          prefix="R$ "
                          radius="lg"
                          styles={plannerFieldStyles}
                          thousandSeparator="."
                          value={partyForm.estimatedBudget}
                          onChange={(value) =>
                            setPartyForm((current) => ({
                              ...current,
                              estimatedBudget: value === '' ? '' : String(value)
                            }))
                          }
                        />
                      </SimpleGrid>
                      <div className="mobile-theme-grid">
                        {partyCategories.slice(0, 3).map((category) => (
                          <button
                            key={category.value}
                            className={partyForm.themeChoice === category.value ? 'mobile-theme-card is-active' : 'mobile-theme-card'}
                            type="button"
                            onClick={() => setPartyForm((current) => ({ ...current, themeChoice: category.value }))}
                          >
                            <img alt={category.label} src={getPartyArtwork(category.value)} />
                            <span>{category.label}</span>
                          </button>
                        ))}
                      </div>
                    </Stack>
                  </Paper>
                ) : null}

                {plannerStep === 4 ? (
                  <Paper className="mobile-surface-card" p="lg" radius="xl" style={mobileSurfaceStyles}>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={700}>Resumo</Text>
                        <Text c="dimmed" size="sm">Passo 4 de 4</Text>
                      </div>
                      <Badge radius="xl" variant="light">Pronto</Badge>
                    </Group>
                    <div className="mobile-summary-card">
                      <img alt={partyForm.themeChoice} className="mobile-summary-card__art" src={getPartyArtwork(partyForm.themeChoice)} />
                      <div>
                        <Text fw={700}>{partyForm.name || 'Nova festa'}</Text>
                        <Text c="dimmed" size="sm">{partyForm.date || 'Data a definir'} {partyForm.time ? `| ${partyForm.time}` : ''}</Text>
                        <Text c="dimmed" size="sm">{buildPartyLocation(partyForm) || 'Local a definir'}</Text>
                        <Text c="dimmed" size="sm">{partyForm.expectedGuests || 0} convidados | {currencyFormatter.format(Number(partyForm.estimatedBudget) || 0)}</Text>
                      </div>
                    </div>
                  </Paper>
                ) : null}

                <div className="mobile-wizard-actions">
                  <Button
                    className="mobile-outline-button"
                    radius="xl"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (plannerStep === 1) {
                        setPlanningView('list');
                        return;
                      }
                      setPlannerStep((current) => current - 1);
                    }}
                  >
                    {plannerStep === 1 ? 'Cancelar' : 'Voltar'}
                  </Button>
                  {plannerStep < 4 ? (
                    <Button
                      className="mobile-gradient-button"
                      radius="xl"
                      type="button"
                      onClick={() => setPlannerStep((current) => current + 1)}
                    >
                      Continuar
                    </Button>
                  ) : (
                    <Button
                      className="mobile-gradient-button"
                      loading={createParty.isPending}
                      radius="xl"
                      type="submit"
                    >
                      {createParty.isPending ? 'Criando...' : 'Criar evento'}
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <>
                {featuredParty ? (
                  <article className="mobile-featured-event compact">
                    <div className="mobile-featured-event__top">
                      <Badge className="mobile-featured-badge" radius="xl" size="sm">
                        Evento em destaque
                      </Badge>
                      <span className="mobile-featured-event__category">{featuredParty.category}</span>
                    </div>
                    <div className="mobile-featured-event__body">
                      <h2>{featuredParty.name}</h2>
                      <p>{formatPartyDateLabel(featuredParty.date)}</p>
                      <small>
                        {featuredParty.time} | {featuredParty.location.split('|')[0]?.trim() || featuredParty.location}
                      </small>
                    </div>
                    <img
                      alt={featuredParty.category}
                      className="mobile-featured-event__art"
                      src={getPartyArtwork(featuredParty.category)}
                    />
                  </article>
                ) : null}

                <div className="mobile-event-mini-grid single-column">
                  {parties.map((party) => (
                    <article key={party.id} className="mobile-event-list-card">
                      <img
                        alt={party.category}
                        className="mobile-event-list-card__thumb media"
                        src={getPartyArtwork(party.category)}
                      />
                      <div className="mobile-event-list-card__body">
                        <strong>{party.name}</strong>
                        <span>{formatPartyDateLabel(party.date)}</span>
                        <small>{party.time} | {party.location.split('|')[0]?.trim() || party.location}</small>
                      </div>
                      <button
                        className="mobile-inline-link"
                        type="button"
                        onClick={() => {
                          setSelectedPartyId(party.id);
                          setPlanningPartyId(party.id);
                          setPlanningView('detail');
                          setActiveSection('Tarefas');
                        }}
                      >
                        Ver
                      </button>
                    </article>
                  ))}
                </div>

                <button className="mobile-gradient-button" type="button" onClick={handleQuickCreateParty}>
                  <Plus size={18} />
                  <span>Criar evento</span>
                </button>
              </>
            )}
          </section>
        ) : null}

        {activeSection === 'Convidados' && isMobile ? (
          <section className="mobile-page-shell">
            <Paper className="mobile-gradient-summary" p="lg" radius="xl" shadow="sm">
              <Group gap="sm" mb="md">
                <ThemeIcon color="grape" radius="xl" size="lg" variant="white">
                  <Users size={18} />
                </ThemeIcon>
                <Text fw={700}>Resumo dos convidados</Text>
              </Group>

              <SimpleGrid cols={3} spacing="sm">
                <Stack align="center" gap={2}>
                  <Text c="white" fw={800} size="2rem">
                    {mobileGuests.filter((guest) => guest.status === 'Confirmado').length}
                  </Text>
                  <Text c="rgba(255,255,255,0.88)" size="sm">Confirmados</Text>
                </Stack>
                <Stack align="center" gap={2}>
                  <Text c="white" fw={800} size="2rem">
                    {mobileGuests.filter((guest) => guest.status === 'Pendente').length}
                  </Text>
                  <Text c="rgba(255,255,255,0.88)" size="sm">Pendentes</Text>
                </Stack>
                <Stack align="center" gap={2}>
                  <Text c="white" fw={800} size="2rem">
                    {mobileGuests.filter((guest) => guest.status === 'Recusou').length}
                  </Text>
                  <Text c="rgba(255,255,255,0.88)" size="sm">Recusados</Text>
                </Stack>
              </SimpleGrid>
            </Paper>

            <SegmentedControl
              fullWidth
              data={[
                { label: 'Todos', value: 'Todos' },
                { label: 'Confirmados', value: 'Confirmado' },
                { label: 'Pendentes', value: 'Pendente' },
                { label: 'Recusados', value: 'Recusou' }
              ]}
              radius="xl"
              styles={mobileSegmentedStyles}
              value={guestFilter}
              onChange={(value) => setGuestFilter(value as GuestFilter)}
            />

            <Group align="stretch" wrap="nowrap">
              <TextInput
                aria-label="Buscar convidados"
                classNames={plannerFieldClassNames}
                leftSection={<Search size={18} />}
                placeholder="Buscar convidados"
                radius="xl"
                style={{ flex: 1 }}
                size="md"
                styles={plannerFieldStyles}
                value={guestSearch}
                onChange={(event) => setGuestSearch(event.target.value)}
              />
              <Button
                leftSection={<SlidersHorizontal size={18} />}
                radius="xl"
                styles={{
                  root: {
                    alignSelf: 'stretch',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                    color: 'var(--text)'
                  }
                }}
                variant="default"
                onClick={() => {
                  setGuestFilter('Todos');
                  setGuestSearch('');
                }}
              >
                {hasGuestFilters ? 'Limpar' : guestFilter}
              </Button>
            </Group>

            <div className="mobile-list-stack">
              {filteredMobileGuests.length > 0 ? (
                filteredMobileGuests.map((guest, index) => (
                  <Paper key={guest.id} className="mobile-guest-card" p="md" radius="xl" style={mobileSurfaceStyles}>
                    <Avatar
                      className={`mobile-guest-avatar tone-${(index % 5) + 1}`}
                      color="grape"
                      radius="xl"
                      size={46}
                    >
                      {getInitials(guest.name)}
                    </Avatar>
                    <div className="mobile-guest-card__body">
                      <Text fw={700}>{guest.name}</Text>
                      <span className={`mobile-status-pill status-${guest.status.toLowerCase()}`}>
                        {guest.status}
                      </span>
                    </div>
                    <Group className="mobile-guest-card__actions" gap="xs">
                      <ActionIcon radius="xl" size="md" variant="subtle"><Phone size={16} /></ActionIcon>
                      <ActionIcon radius="xl" size="md" variant="subtle"><Mail size={16} /></ActionIcon>
                      <ActionIcon radius="xl" size="md" variant="subtle"><ChevronRight size={18} /></ActionIcon>
                    </Group>
                  </Paper>
                ))
              ) : (
                <Paper className="mobile-empty-card compact" p="lg" radius="xl" style={mobileSurfaceStyles}>
                  <Text c="dimmed">Nenhum convidado encontrado para esse filtro.</Text>
                </Paper>
              )}
            </div>
          </section>
        ) : null}

        {activeSection === 'Notificacoes' && isMobile ? (
          <section className="mobile-page-shell">
            <SegmentedControl
              fullWidth
              data={[
                { label: 'Todas', value: 'Todas' },
                { label: 'Nao lidas', value: 'Nao lidas' },
                { label: 'Lembretes', value: 'Lembretes' },
                { label: 'Atualizacoes', value: 'Atualizacoes' }
              ]}
              radius="xl"
              styles={mobileSegmentedStyles}
              value={notificationFilter}
              onChange={(value) => setNotificationFilter(value as NotificationFilter)}
            />

            <Button
              className="mobile-mark-read"
              leftSection={<CheckCheck size={16} />}
              radius="xl"
              variant="subtle"
              onClick={() => void markAllAsRead.mutateAsync()}
            >
              Marcar todas como lidas
            </Button>

            <div className="mobile-list-stack">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) => (
                  <Paper key={notification.id} className="mobile-notification-card" p="md" radius="xl" style={mobileSurfaceStyles}>
                    <span className={`mobile-notification-dot tone-${(index % 5) + 1}`} />
                    <ThemeIcon className="mobile-notification-card__icon" radius="xl" size={44} variant="light">
                      <Bell size={18} />
                    </ThemeIcon>
                    <div className="mobile-notification-card__copy">
                      <Text fw={700}>{notification.title}</Text>
                      <Text c="dimmed" size="sm">{notification.message}</Text>
                      <Text c="dimmed" size="xs">{formatDateTime(notification.createdAtUtc)}</Text>
                    </div>
                    <ChevronRight size={18} />
                  </Paper>
                ))
              ) : (
                <Paper className="mobile-empty-card compact" p="lg" radius="xl" style={mobileSurfaceStyles}>
                  <Text c="dimmed">Nenhuma notificacao encontrada nesse filtro.</Text>
                </Paper>
              )}
            </div>

            <Button
              className="mobile-outline-button"
              disabled={notifications.length === 0 || clearAllNotifications.isPending}
              radius="xl"
              variant="outline"
              onClick={() => void handleClearNotifications()}
            >
              {clearAllNotifications.isPending ? 'Limpando...' : 'Limpar notificacoes'}
            </Button>
          </section>
        ) : null}

        {activeSection === 'Tarefas' && isMobile ? (
          <section className="mobile-page-shell">
            <article className="mobile-surface-card">
              <div className="mobile-surface-card__header">
                <strong>Lista de tarefas</strong>
                <button className="mobile-inline-link" type="button">Visao geral</button>
              </div>

              <div className="mobile-task-list detailed">
                {mobileTasks.length > 0 ? (
                  mobileTasks.map((task) => (
                    <div key={task.id} className="mobile-task-row">
                      <button
                        className={task.done ? 'mobile-task-check is-done' : 'mobile-task-check'}
                        type="button"
                        onClick={() =>
                          mobileParty
                            ? void toggleTask.mutateAsync({ partyId: mobileParty.id, taskId: task.id })
                            : undefined
                        }
                      >
                        {task.done ? <CheckCheck size={14} /> : null}
                      </button>
                      <div className="mobile-task-row__copy">
                        <strong>{task.title}</strong>
                        <small>{mobileParty?.date || 'Sem data definida'}</small>
                      </div>
                      <span className={task.done ? 'mobile-tag success' : 'mobile-tag pending'}>
                        {task.done ? 'Concluida' : 'Pendente'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="empty-copy">Nenhuma tarefa cadastrada.</p>
                )}
              </div>

              <button className="mobile-gradient-button" type="button" onClick={() => handleSectionChange('Planejar')}>
                <Plus size={18} />
                <span>Nova tarefa</span>
              </button>
            </article>

            <article className="mobile-surface-card">
              <div className="mobile-surface-card__header">
                <strong>Resumo do orcamento</strong>
                <button className="mobile-inline-link" type="button">Visao geral</button>
              </div>

              <div className="mobile-budget-summary">
                <div>
                  <span>Orcamento total</span>
                  <strong>{currencyFormatter.format(mobileParty?.budget.estimated ?? 0)}</strong>
                </div>
                <div>
                  <span>Gasto ate agora</span>
                  <strong>{currencyFormatter.format(mobileParty?.budget.spent ?? 0)}</strong>
                </div>
                <div>
                  <span>Valor restante</span>
                  <strong>
                    {currencyFormatter.format(
                      Math.max((mobileParty?.budget.estimated ?? 0) - (mobileParty?.budget.spent ?? 0), 0)
                    )}
                  </strong>
                </div>
              </div>

              <div className="mobile-budget-progress">
                <div
                  className="mobile-budget-progress__fill"
                  style={{
                    width: `${mobileParty && mobileParty.budget.estimated > 0
                      ? Math.min((mobileParty.budget.spent / mobileParty.budget.estimated) * 100, 100)
                      : 0}%`
                  }}
                />
              </div>

              <div className="mobile-budget-category-list">
                {mobileBudgetItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="mobile-budget-category-item">
                    <div>
                      <strong>{item.category}</strong>
                      <small>{item.label}</small>
                    </div>
                    <span>{currencyFormatter.format(item.amount)}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {activeSection === 'Perfil' && isMobile ? (
          <section className="mobile-page-shell">
            <article className="mobile-profile-hero">
              <div className="mobile-profile-avatar">{getInitials(session.user.name)}</div>
              <div className="mobile-profile-copy">
                <strong>{session.user.name}</strong>
                <small>{session.user.email}</small>
              </div>
            </article>

            <div className="mobile-profile-stats">
              <article className="mobile-profile-stat-card">
                <Calendar size={18} />
                <strong>{parties.length}</strong>
                <span>Eventos criados</span>
              </article>
              <article className="mobile-profile-stat-card">
                <Users size={18} />
                <strong>{parties.reduce((count, party) => count + party.guests.length, 0)}</strong>
                <span>Convidados</span>
              </article>
              <article className="mobile-profile-stat-card">
                <CheckCheck size={18} />
                <strong>{completedTaskCount}</strong>
                <span>{totalTaskCount} tarefas</span>
              </article>
            </div>

            <div className="mobile-list-stack">
              {profileCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.id} className="mobile-settings-card">
                    <div className="mobile-settings-card__icon">
                      <Icon size={18} />
                    </div>
                    <div className="mobile-settings-card__copy">
                      <strong>{card.label}</strong>
                      <span>{card.description}</span>
                    </div>
                    <ChevronRight size={18} />
                  </article>
                );
              })}
            </div>

            <article className="mobile-surface-card">
              <div className="mobile-surface-card__header">
                <strong>Meus eventos</strong>
                <button className="mobile-inline-link" type="button" onClick={() => handleSectionChange('Planejar')}>
                  Ver todos
                </button>
              </div>

              <div className="mobile-event-mini-grid">
                {parties.slice(0, 2).map((party) => (
                  <div key={party.id} className="mobile-event-mini-card">
                    <div className="mobile-event-mini-card__thumb media">
                      <img alt={party.category} src={getPartyArtwork(party.category)} />
                    </div>
                    <div className="mobile-event-mini-card__copy">
                      <strong>{party.name}</strong>
                      <span>{formatPartyDateLabel(party.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <button className="mobile-outline-button" type="button" onClick={onLogout}>
              <LogOut size={18} />
              <span>Sair da conta</span>
            </button>
          </section>
        ) : null}

        {activeSection === 'Planejar' && !isMobile ? (
          <section className="planner-shell">
            <Paper className="planner-hero-card" p="xl" radius="xl" shadow="sm" withBorder>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text className="eyebrow">Planejamento</Text>
                  <Title order={3}>
                    {planningView === 'list'
                      ? 'Todas as festas em um grid de controle'
                      : planningView === 'create'
                        ? 'Criar nova festa'
                        : 'Tela da festa'}
                  </Title>
                  <Text c="dimmed" mt="xs">
                    {planningView === 'list'
                      ? 'Visualize todas as festas, entre na tela de cada uma e gerencie o fluxo de planejamento.'
                      : planningView === 'create'
                        ? 'Cadastre uma nova festa. Depois dela criada, voce entra direto na tela de gerenciamento.'
                        : 'Edite a festa e gerencie tarefas, convidados e despesas no mesmo lugar.'}
                  </Text>
                </div>

                <Group gap="sm">
                  {planningView === 'detail' ? (
                    <Button
                      leftSection={<ArrowLeft size={16} />}
                      radius="md"
                      variant="default"
                      onClick={() => {
                        setPlanningView('list');
                        setPlannerCalendarOpen(false);
                      }}
                    >
                      Voltar ao grid
                    </Button>
                  ) : null}

                  <Button
                    color="orange"
                    leftSection={<Plus size={16} />}
                    radius="md"
                    onClick={() => {
                      setPlanningView('create');
                      setPlannerCalendarOpen(false);
                      setPartyForm(createEmptyPartyForm());
                    }}
                  >
                    Nova festa
                  </Button>
                </Group>
              </Group>
            </Paper>

            {planningView === 'list' ? (
              <section className="planner-grid-list">
                {parties.length > 0 ? (
                  parties.map((party) => (
                    <Paper key={party.id} className="planner-list-card" p="lg" radius="xl" shadow="sm" withBorder>
                      <Stack gap="sm">
                        <Group justify="space-between" align="flex-start">
                          <Badge radius="xl" variant="light">
                            {party.category}
                          </Badge>
                          {party.canEdit ? (
                            <Badge color="teal" radius="xl" variant="light">
                              Editavel
                            </Badge>
                          ) : (
                            <Badge color="gray" radius="xl" variant="light">
                              Bloqueada
                            </Badge>
                          )}
                        </Group>

                        <button
                          className="planner-title-link"
                          onClick={() => {
                            setPlanningPartyId(party.id);
                            setSelectedPartyId(party.id);
                            setPlanningView('detail');
                            setPartyForm(createPartyFormFromParty(party));
                          }}
                          type="button"
                        >
                          {party.name}
                        </button>

                        <Text c="dimmed" size="sm">
                          {party.date}
                        </Text>
                        <Text c="dimmed" size="sm">
                          {party.location}
                        </Text>

                        <Group justify="space-between" mt="sm">
                          <Text c="dimmed" size="sm">
                            {party.tasks.length} tarefas | {party.guests.length} convidados
                          </Text>

                          <Button
                            leftSection={<PencilLine size={16} />}
                            radius="md"
                            size="sm"
                            variant="light"
                            onClick={() => {
                              setPlanningPartyId(party.id);
                              setSelectedPartyId(party.id);
                              setPlanningView('detail');
                              setPartyForm(createPartyFormFromParty(party));
                            }}
                          >
                            Editar
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>
                  ))
                ) : (
                  <Paper className="planner-empty-card" p="xl" radius="xl" shadow="sm" withBorder>
                    <Stack gap="xs">
                      <Title order={4}>Nenhuma festa criada ainda</Title>
                      <Text c="dimmed">
                        Use o botao superior para cadastrar a primeira festa e depois gerenciar tudo
                        na tela dela.
                      </Text>
                    </Stack>
                  </Paper>
                )}
              </section>
            ) : null}

            {planningView === 'create' || planningView === 'detail' ? (
              <>
                <Paper className="planner-block-card" p="xl" radius="xl" shadow="sm" withBorder>
                  <form onSubmit={planningView === 'create' ? handleCreateParty : handleUpdateParty}>
                    <Stack gap="lg">
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Text className="eyebrow">
                            {planningView === 'create' ? 'Nova festa' : 'Editar festa'}
                          </Text>
                          <Title order={4}>
                            {planningView === 'create'
                              ? 'Dados principais da festa'
                              : plannerDisplayParty?.name ?? 'Festa'}
                          </Title>
                        </div>
                        {planningView === 'detail' && plannerDisplayParty ? (
                          <Badge className="planner-selected-badge" radius="xl" size="lg" variant="light">
                            {plannerDisplayParty.canEdit ? 'Edicao liberada' : 'Edicao bloqueada'}
                          </Badge>
                        ) : null}
                      </Group>

                      {planningView === 'detail' && plannerDisplayParty && !plannerDisplayParty.canEdit ? (
                        <div className="feedback neutral">
                          Essa festa nao pode mais ser editada porque ja atingiu a data de realizacao.
                        </div>
                      ) : null}

                      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                        <TextInput
                          label="Nome da festa"
                          placeholder="Ex.: Casamento Ana e Pedro"
                          radius="md"
                          size="md"
                          classNames={plannerFieldClassNames}
                          styles={plannerFieldStyles}
                          value={partyForm.name}
                          onChange={(event) =>
                            setPartyForm((current) => ({ ...current, name: event.target.value }))
                          }
                        />

                        <Select
                          checkIconPosition="right"
                          data={partyCategories}
                          label="Categoria"
                          radius="md"
                          size="md"
                          classNames={plannerSelectClassNames}
                          styles={plannerSelectStyles}
                          value={partyForm.category}
                          onChange={(value) =>
                            setPartyForm((current) => ({ ...current, category: value ?? 'Aniversario' }))
                          }
                        />

                        <Popover
                          opened={plannerCalendarOpen}
                          onChange={setPlannerCalendarOpen}
                          position="bottom-start"
                          middlewares={{ flip: false, shift: false }}
                          shadow="md"
                          width="auto"
                          withArrow
                        >
                          <Popover.Target>
                            <div>
                              <TextInput
                                label="Data"
                                placeholder="Selecione a data"
                                radius="md"
                                size="md"
                                classNames={plannerFieldClassNames}
                                readOnly
                                rightSection={<CalendarDays size={16} />}
                                styles={plannerFieldStyles}
                                value={partyForm.date ? dayjs(partyForm.date).format('DD/MM/YYYY') : ''}
                                onClick={() => setPlannerCalendarOpen((current) => !current)}
                              />
                            </div>
                          </Popover.Target>

                          <Popover.Dropdown className="planner-date-popover">
                            <div className="planner-date-popover-inner">
                              <DayPicker
                                className="planner-day-picker"
                                mode="single"
                                selected={selectedPlannerDate}
                                onSelect={(value) => {
                                  setPartyForm((current) => ({
                                    ...current,
                                    date: value ? dayjs(value).format('YYYY-MM-DD') : ''
                                  }));
                                  if (value) {
                                    setPlannerCalendarOpen(false);
                                  }
                                }}
                              />

                              <Group className="planner-date-actions" justify="space-between" mt="sm">
                                <Button
                                  color="gray"
                                  radius="md"
                                  size="compact-sm"
                                  type="button"
                                  variant="subtle"
                                  onClick={() => {
                                    setPartyForm((current) => ({ ...current, date: '' }));
                                    setPlannerCalendarOpen(false);
                                  }}
                                >
                                  Limpar
                                </Button>

                                <Button
                                  color="orange"
                                  radius="md"
                                  size="compact-sm"
                                  type="button"
                                  variant="light"
                                  onClick={() => setPlannerCalendarOpen(false)}
                                >
                                  Fechar
                                </Button>
                              </Group>
                            </div>
                          </Popover.Dropdown>
                        </Popover>

                        <NumberInput
                          allowDecimal
                          decimalScale={2}
                          decimalSeparator=","
                          fixedDecimalScale={false}
                          hideControls
                          label="Orcamento previsto"
                          placeholder="0,00"
                          prefix="R$ "
                          radius="md"
                          size="md"
                          classNames={plannerFieldClassNames}
                          styles={plannerFieldStyles}
                          thousandSeparator="."
                          value={partyForm.estimatedBudget}
                          onChange={(value) =>
                            setPartyForm((current) => ({
                              ...current,
                              estimatedBudget: value === '' ? '' : String(value)
                            }))
                          }
                        />
                      </SimpleGrid>

                      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                        <TextInput
                          label="Rua"
                          placeholder="Ex.: Rua das Flores"
                          radius="md"
                          size="md"
                          classNames={plannerFieldClassNames}
                          styles={plannerFieldStyles}
                          value={partyForm.street}
                          onChange={(event) =>
                            setPartyForm((current) => ({ ...current, street: event.target.value }))
                          }
                        />

                        <TextInput
                          label="Bairro"
                          placeholder="Ex.: Centro"
                          radius="md"
                          size="md"
                          classNames={plannerFieldClassNames}
                          styles={plannerFieldStyles}
                          value={partyForm.neighborhood}
                          onChange={(event) =>
                            setPartyForm((current) => ({ ...current, neighborhood: event.target.value }))
                          }
                        />

                        <TextInput
                          label="Numero da casa"
                          placeholder="Ex.: 245"
                          radius="md"
                          size="md"
                          classNames={plannerFieldClassNames}
                          styles={plannerFieldStyles}
                          value={partyForm.houseNumber}
                          onChange={(event) =>
                            setPartyForm((current) => ({ ...current, houseNumber: event.target.value }))
                          }
                        />

                        <TextInput
                          label="CEP"
                          placeholder="Ex.: 01001-000"
                          radius="md"
                          size="md"
                          classNames={plannerFieldClassNames}
                          styles={plannerFieldStyles}
                          value={partyForm.zipCode}
                          onChange={(event) =>
                            setPartyForm((current) => ({
                              ...current,
                              zipCode: formatZipCode(event.target.value)
                            }))
                          }
                        />
                      </SimpleGrid>

                      <TextInput
                        description="Depois da festa criada, o endereco salvo sera usado para abrir o local no Google Maps."
                        label="Ponto de referencia"
                        placeholder="Ex.: Em frente a praca central"
                        radius="md"
                        size="md"
                        classNames={plannerFieldClassNames}
                        styles={plannerFieldStyles}
                        value={partyForm.referencePoint}
                        onChange={(event) =>
                          setPartyForm((current) => ({ ...current, referencePoint: event.target.value }))
                        }
                      />

                      <Group justify="space-between">
                        {planningView === 'detail' && planningPartyMapsUrl ? (
                          <Button
                            component="a"
                            href={planningPartyMapsUrl}
                            leftSection={<MapPinned size={16} />}
                            radius="md"
                            rel="noreferrer"
                            rightSection={<ExternalLink size={14} />}
                            target="_blank"
                            variant="light"
                          >
                            Ver local no Maps
                          </Button>
                        ) : (
                          <div />
                        )}

                        <Button
                          color="orange"
                          disabled={planningView === 'detail' && !plannerDisplayParty?.canEdit}
                          loading={planningView === 'create' ? createParty.isPending : updateParty.isPending}
                          radius="md"
                          size="md"
                          type="submit"
                        >
                          {planningView === 'create' ? 'Criar festa' : 'Salvar alteracoes'}
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Paper>

                {planningView === 'detail' && plannerDisplayParty ? (
                  <section className="planner-section-grid">
                    <Paper className="planner-block-card" p="lg" radius="xl" shadow="sm" withBorder>
                      <form onSubmit={handleCreateTask}>
                        <Stack gap="md">
                          <div>
                            <Title order={4}>Adicionar tarefa</Title>
                            <Text c="dimmed" size="sm">
                              Festa selecionada: {plannerDisplayParty.name}
                            </Text>
                          </div>

                          <TextInput
                            label="Titulo da tarefa"
                            placeholder="Ex.: Confirmar buffet"
                            radius="md"
                            classNames={plannerFieldClassNames}
                            styles={plannerFieldStyles}
                            value={taskForm.title}
                            onChange={(event) =>
                              setTaskForm((current) => ({ ...current, title: event.target.value }))
                            }
                          />

                          <TextInput
                            label="Responsavel"
                            placeholder="Quem vai assumir essa etapa?"
                            radius="md"
                            classNames={plannerFieldClassNames}
                            styles={plannerFieldStyles}
                            value={taskForm.assignee}
                            onChange={(event) =>
                              setTaskForm((current) => ({ ...current, assignee: event.target.value }))
                            }
                          />

                          <Button
                            color="orange"
                            disabled={!plannerDisplayParty.canEdit}
                            loading={createTask.isPending}
                            radius="md"
                            type="submit"
                            variant="light"
                          >
                            Salvar tarefa
                          </Button>
                        </Stack>
                      </form>
                    </Paper>

                    <Paper className="planner-block-card" p="lg" radius="xl" shadow="sm" withBorder>
                      <form onSubmit={handleCreateGuest}>
                        <Stack gap="md">
                          <div>
                            <Title order={4}>Adicionar convidado</Title>
                            <Text c="dimmed" size="sm">
                              Cadastre convidados por grupo e acompanhe o RSVP depois.
                            </Text>
                          </div>

                          <TextInput
                            label="Nome do convidado"
                            placeholder="Ex.: Maria Oliveira"
                            radius="md"
                            classNames={plannerFieldClassNames}
                            styles={plannerFieldStyles}
                            value={guestForm.name}
                            onChange={(event) =>
                              setGuestForm((current) => ({ ...current, name: event.target.value }))
                            }
                          />

                          <TextInput
                            label="Grupo"
                            placeholder="Ex.: Familia da noiva"
                            radius="md"
                            classNames={plannerFieldClassNames}
                            styles={plannerFieldStyles}
                            value={guestForm.group}
                            onChange={(event) =>
                              setGuestForm((current) => ({ ...current, group: event.target.value }))
                            }
                          />

                          <Select
                            checkIconPosition="right"
                            data={guestStatuses.map((status) => ({ value: status, label: status }))}
                            label="Status inicial"
                            radius="md"
                            classNames={plannerSelectClassNames}
                            styles={plannerSelectStyles}
                            value={guestForm.status}
                            onChange={(value) =>
                              setGuestForm((current) => ({
                                ...current,
                                status: (value as GuestStatus | null) ?? 'Pendente'
                              }))
                            }
                          />

                          <Button
                            color="orange"
                            disabled={!plannerDisplayParty.canEdit}
                            loading={createGuest.isPending}
                            radius="md"
                            type="submit"
                            variant="light"
                          >
                            Salvar convidado
                          </Button>
                        </Stack>
                      </form>
                    </Paper>

                    <Paper className="planner-block-card" p="lg" radius="xl" shadow="sm" withBorder>
                      <form onSubmit={handleCreateBudgetItem}>
                        <Stack gap="md">
                          <div>
                            <Title order={4}>Adicionar despesa</Title>
                            <Text c="dimmed" size="sm">
                              Lance os custos previstos e acompanhe o financeiro por festa.
                            </Text>
                          </div>

                          <TextInput
                            label="Descricao"
                            placeholder="Ex.: Entrada do salao"
                            radius="md"
                            classNames={plannerFieldClassNames}
                            styles={plannerFieldStyles}
                            value={budgetForm.label}
                            onChange={(event) =>
                              setBudgetForm((current) => ({ ...current, label: event.target.value }))
                            }
                          />

                          <TextInput
                            label="Categoria"
                            placeholder="Ex.: Espaco, Buffet, Decoracao"
                            radius="md"
                            classNames={plannerFieldClassNames}
                            styles={plannerFieldStyles}
                            value={budgetForm.category}
                            onChange={(event) =>
                              setBudgetForm((current) => ({ ...current, category: event.target.value }))
                            }
                          />

                          <NumberInput
                            allowDecimal
                            decimalScale={2}
                            decimalSeparator=","
                            fixedDecimalScale={false}
                            hideControls
                            label="Valor"
                            placeholder="0,00"
                            prefix="R$ "
                            radius="md"
                            classNames={plannerFieldClassNames}
                            styles={plannerFieldStyles}
                            thousandSeparator="."
                            value={budgetForm.amount}
                            onChange={(value) =>
                              setBudgetForm((current) => ({
                                ...current,
                                amount: value === '' ? '' : String(value)
                              }))
                            }
                          />

                          <Button
                            color="orange"
                            disabled={!plannerDisplayParty.canEdit}
                            loading={createBudgetItem.isPending}
                            radius="md"
                            type="submit"
                            variant="light"
                          >
                            Salvar despesa
                          </Button>
                        </Stack>
                      </form>
                    </Paper>
                  </section>
                ) : null}
              </>
            ) : null}
          </section>
        ) : null}

        {activeSection === 'Operacao' && !isMobile ? (
          <section className="content-grid">
            <article className="card-light">
              <h3>Tarefas</h3>
              <div className="list-stack">
                {selectedParty?.tasks.map((task) => (
                  <button
                    key={task.id}
                    className="list-card task-card"
                    onClick={() =>
                      void toggleTask.mutateAsync({ partyId: selectedParty.id, taskId: task.id })
                    }
                    type="button"
                  >
                    <span className={task.done ? 'task-state done' : 'task-state pending'} />
                    <div>
                      <strong>{task.title}</strong>
                      <p>Responsavel: {task.assignee}</p>
                    </div>
                    <small>{task.done ? 'Feita' : 'Pendente'}</small>
                  </button>
                )) ?? <p className="empty-copy">Nenhuma tarefa cadastrada.</p>}
              </div>
            </article>

            <article className="card-light">
              <h3>Convidados</h3>
              <div className="list-stack">
                {selectedParty?.guests.map((guest) => (
                  <div key={guest.id} className="list-card">
                    <div>
                      <strong>{guest.name}</strong>
                      <p>{guest.group}</p>
                    </div>
                    <small>{guest.status}</small>
                  </div>
                )) ?? <p className="empty-copy">Nenhum convidado cadastrado.</p>}
              </div>
            </article>

            <article className="card-light">
              <h3>Financeiro</h3>
              {selectedParty ? (
                <>
                  <div className="budget-panel">
                    <span>Gasto atual</span>
                    <strong>{currencyFormatter.format(selectedParty.budget.spent)}</strong>
                    <p>Previsto: {currencyFormatter.format(selectedParty.budget.estimated)}</p>
                  </div>
                  <div className="list-stack">
                    {selectedParty.budget.items.map((item) => (
                      <div key={item.id} className="list-card">
                        <div>
                          <strong>{item.label}</strong>
                          <p>{item.category}</p>
                        </div>
                        <small>{currencyFormatter.format(item.amount)}</small>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty-copy">Nenhuma festa selecionada.</p>
              )}
            </article>
          </section>
        ) : null}

        {activeSection === 'Ajustes' && !isMobile ? (
          <section className="content-grid settings-grid">
            <article className="card-light settings-card">
              <h3>Preferencias</h3>
              <label className="toggle-row">
                <div>
                  <strong>Notificacoes informativas</strong>
                  <p>Mensagens visuais para login, alteracoes e eventos importantes.</p>
                </div>
                <input
                  checked={notificationsEnabled}
                  onChange={(event) => void onNotificationsChange(event.target.checked)}
                  type="checkbox"
                />
              </label>

              <div className="theme-hint">
                <strong>Tema da interface</strong>
                <p>Use o icone no topo para alternar entre white e dark.</p>
              </div>
            </article>

            <article className="card-light account-card">
              <h3>Conta</h3>
              <strong>{session.user.name}</strong>
              <p>{session.user.email}</p>
              <button className="ghost-button" onClick={onLogout} type="button">
                Encerrar sessao
              </button>
            </article>
          </section>
        ) : null}

        {isMobile ? (
          <nav className="mobile-bottom-nav" aria-label="Navegacao principal mobile">
            <button
              className={activeSection === 'Painel' ? 'mobile-bottom-nav__item is-active' : 'mobile-bottom-nav__item'}
              type="button"
              onClick={() => handleSectionChange('Painel')}
            >
              <LayoutDashboard size={18} />
              <span>Inicio</span>
            </button>

            <button
              className={activeSection === 'Planejar' ? 'mobile-bottom-nav__item is-active' : 'mobile-bottom-nav__item'}
              type="button"
              onClick={() => handleSectionChange('Planejar')}
            >
              <Calendar size={18} />
              <span>Eventos</span>
            </button>

            <button
              className={activeSection === 'Convidados' ? 'mobile-bottom-nav__item is-active' : 'mobile-bottom-nav__item'}
              type="button"
              onClick={() => handleSectionChange('Convidados')}
            >
              <Users size={18} />
              <span>Convidados</span>
            </button>

            <button
              className={activeSection === 'Tarefas' ? 'mobile-bottom-nav__item is-active' : 'mobile-bottom-nav__item'}
              type="button"
              onClick={() => handleSectionChange('Tarefas')}
            >
              <CheckCheck size={18} />
              <span>Tarefas</span>
            </button>

            <button
              className={activeSection === 'Perfil' ? 'mobile-bottom-nav__item is-active' : 'mobile-bottom-nav__item'}
              type="button"
              onClick={() => handleSectionChange('Perfil')}
            >
              <Users size={18} />
              <span>Perfil</span>
            </button>
          </nav>
        ) : null}
      </AppShell.Main>
    </AppShell>
  );
}
