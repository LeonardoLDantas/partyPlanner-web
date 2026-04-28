import {
  ActionIcon,
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
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCheck,
  CircleDollarSign,
  CircleAlert,
  ExternalLink,
  LayoutDashboard,
  MapPinned,
  LogOut,
  Moon,
  PencilLine,
  Plus,
  Settings2,
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

const sections = [
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
  street: string;
  neighborhood: string;
  houseNumber: string;
  zipCode: string;
  referencePoint: string;
  estimatedBudget: string;
};

type PlanningView = 'list' | 'create' | 'detail';
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
    street: '',
    neighborhood: '',
    houseNumber: '',
    zipCode: '',
    referencePoint: '',
    estimatedBudget: ''
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
    location: string;
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
    street: streetSplit[0] ?? '',
    houseNumber: streetSplit[1] ?? '',
    neighborhood,
    zipCode: formatZipCode(zipCodeSection.replace(/^CEP\s*/i, '')),
    referencePoint: referenceSection.replace(/^Ref\.:\s*/i, ''),
    estimatedBudget: String(party.budget.estimated ?? '')
  };
}

type Section = (typeof sections)[number]['id'];

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
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '' });
  const [guestForm, setGuestForm] = useState({
    name: '',
    group: '',
    status: 'Pendente' as GuestStatus
  });
  const [budgetForm, setBudgetForm] = useState({ label: '', category: '', amount: '' });
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

  async function handleCreateParty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setActionError('');
      const formattedLocation = buildPartyLocation(partyForm);

      const created = await createParty.mutateAsync({
        name: partyForm.name.trim(),
        category: partyForm.category.trim(),
        date: partyForm.date.trim(),
        location: formattedLocation,
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
        location: buildPartyLocation(partyForm),
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
      setTaskForm({ title: '', assignee: '' });
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

  return (
    <AppShell
      className="dashboard-shell-ui"
      navbar={{
        width: isMobile ? 280 : desktopCollapsed ? 92 : 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: false }
      }}
      padding="md"
    >
      <AppShell.Navbar
        className={!isMobile && desktopCollapsed ? 'app-navbar is-collapsed' : 'app-navbar'}
        p="md"
      >
        <AppShell.Section>
          <div className="navbar-toggle-row">
            <ActionIcon
              aria-label={isMobile ? 'Fechar menu lateral' : desktopCollapsed ? 'Expandir menu lateral' : 'Retrair menu lateral'}
              className="app-action navbar-toggle-button"
              onClick={handleNavbarToggle}
              radius="xl"
              size="xl"
              variant="default"
            >
              <Burger aria-hidden opened={isMobile ? mobileOpened : !desktopCollapsed} size="sm" />
            </ActionIcon>
          </div>
        </AppShell.Section>

        <AppShell.Section className="app-navbar-grow" component={ScrollArea}>
          <Stack gap="xs">
            {sections.map((section) => {
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
            {!isMobile && desktopCollapsed ? '' : 'Sair da conta'}
          </button>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main className="dashboard-main">
        <header className="app-header">
          <Group className="app-header-row" justify="space-between" wrap="nowrap">
            <div>
              <span className="eyebrow">Mesmo backend, nova experiencia</span>
              <h1 className="app-header-title">{activeSection}</h1>
              <p className="app-header-copy">
                {session.user.name} | {session.user.email}
              </p>
            </div>

            <Group className="topbar-actions" gap="sm" wrap="nowrap">
              {isMobile ? (
                <ActionIcon
                  aria-label="Abrir menu lateral"
                  className="app-action"
                  onClick={handleNavbarToggle}
                  radius="xl"
                  size="xl"
                  variant="default"
                >
                  <Burger aria-hidden opened={mobileOpened} size="sm" />
                </ActionIcon>
              ) : null}

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
          </Group>
        </header>

    {notificationsOpen ? (
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

        {activeSection === 'Painel' ? (
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

        {activeSection === 'Operacao' ? (
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

        {activeSection === 'Painel' ? (
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

        {activeSection === 'Planejar' ? (
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

        {activeSection === 'Operacao' ? (
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

        {activeSection === 'Ajustes' ? (
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
      </AppShell.Main>
    </AppShell>
  );
}
