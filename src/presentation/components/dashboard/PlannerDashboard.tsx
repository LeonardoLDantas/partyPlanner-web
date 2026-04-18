import {
  Bell,
  CalendarDays,
  CheckCheck,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings2,
  Sparkles,
  Sun,
  Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { AuthSession } from '@/domain/entities/auth';
import type { GuestStatus } from '@/domain/entities/party';
import type { ThemeMode } from '@/domain/entities/notification';
import { useDashboardData } from '@/presentation/hooks/useDashboardData';
import { environment } from '@/shared/config/environment';
import { currencyFormatter, formatDateTime } from '@/shared/utils/formatters';

const sections = [
  { id: 'Painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'Planejar', label: 'Planejar', icon: Sparkles },
  { id: 'Operacao', label: 'Operacao', icon: CheckCheck },
  { id: 'Ajustes', label: 'Ajustes', icon: Settings2 }
] as const;

const guestStatuses: GuestStatus[] = ['Confirmado', 'Pendente', 'Recusou'];

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
  const [activeSection, setActiveSection] = useState<Section>('Painel');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [partyForm, setPartyForm] = useState({
    name: '',
    category: '',
    date: '',
    location: '',
    estimatedBudget: ''
  });
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '' });
  const [guestForm, setGuestForm] = useState({ name: '', group: '', status: 'Pendente' as GuestStatus });
  const [budgetForm, setBudgetForm] = useState({ label: '', category: '', amount: '' });
  const [actionError, setActionError] = useState('');

  const {
    dashboardQuery,
    createParty,
    createTask,
    createGuest,
    createBudgetItem,
    toggleTask,
    markAllAsRead
  } = useDashboardData(true);

  const parties = dashboardQuery.data?.parties ?? [];
  const notifications = dashboardQuery.data?.notifications ?? [];

  useEffect(() => {
    if (!selectedPartyId && parties[0]) {
      setSelectedPartyId(parties[0].id);
    }
  }, [parties, selectedPartyId]);

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === selectedPartyId) ?? parties[0] ?? null,
    [parties, selectedPartyId]
  );

  const globalConfirmedGuests = parties.reduce(
    (count, party) => count + party.guests.filter((guest) => guest.status === 'Confirmado').length,
    0
  );
  const globalBudget = parties.reduce((sum, party) => sum + party.budget.spent, 0);
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;
  const completedTasks = selectedParty?.tasks.filter((task) => task.done).length ?? 0;
  const confirmedGuests =
    selectedParty?.guests.filter((guest) => guest.status === 'Confirmado').length ?? 0;
  const budgetProgress =
    selectedParty && selectedParty.budget.estimated > 0
      ? Math.round((selectedParty.budget.spent / selectedParty.budget.estimated) * 100)
      : 0;

  async function handleCreateParty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setActionError('');
      const created = await createParty.mutateAsync({
        name: partyForm.name.trim(),
        category: partyForm.category.trim(),
        date: partyForm.date.trim(),
        location: partyForm.location.trim(),
        estimatedBudget: Number(partyForm.estimatedBudget) || 0
      });

      setSelectedPartyId(created.id);
      setActiveSection('Painel');
      setPartyForm({ name: '', category: '', date: '', location: '', estimatedBudget: '' });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Nao foi possivel criar a festa.');
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

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div>
          <div className="brand-block">
            <span className="brand-mark">PP</span>
            <div>
              <strong>Party Planner</strong>
              <p>PWA + React</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={section.id === activeSection ? 'sidebar-link is-active' : 'sidebar-link'}
                  onClick={() => setActiveSection(section.id)}
                  type="button"
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        <button className="ghost-button logout-button" onClick={onLogout} type="button">
          <LogOut size={16} />
          Sair da conta
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Mesmo backend, nova experiencia</span>
            <h1>{activeSection}</h1>
            <p>
              {session.user.name} | {session.user.email}
            </p>
          </div>

          <div className="topbar-actions">
            <div className="install-callout">
              <span>PWA pronta para instalar</span>
              <small>Abra no Chrome ou Edge e use "Instalar aplicativo".</small>
            </div>

            <button className="icon-button" onClick={handleOpenNotifications} type="button">
              <Bell size={18} />
              {unreadNotifications > 0 ? <span className="badge">{Math.min(unreadNotifications, 9)}</span> : null}
            </button>
          </div>
        </header>

        {notificationsOpen ? (
          <section className="notifications-popover card-light">
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
          </section>
        ) : null}

        <section className="hero-panel card-dark">
          <div>
            <span className="eyebrow">Clean architecture</span>
            <h2>Frontend web desacoplado do framework e pronto para crescer.</h2>
            <p>
              Dominio, casos de uso, adapters HTTP e apresentacao separados para facilitar evolucao,
              testes e reaproveitamento dos contratos com a API atual.
            </p>
          </div>
          <div className="hero-meta">
            <span>API</span>
            <strong>{environment.apiBaseUrl}</strong>
          </div>
        </section>

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

        {dashboardQuery.isLoading ? <div className="card-light loading-inline">Carregando dados...</div> : null}
        {dashboardQuery.error ? (
          <div className="feedback error">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : 'Nao foi possivel carregar a API.'}
          </div>
        ) : null}
        {actionError ? <div className="feedback error">{actionError}</div> : null}

        {activeSection !== 'Ajustes' ? (
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
          <section className="content-grid">
            <article className="card-light detail-card">
              {selectedParty ? (
                <>
                  <span className="eyebrow">{selectedParty.category}</span>
                  <h3>{selectedParty.name}</h3>
                  <p>
                    {selectedParty.date} | {selectedParty.location}
                  </p>
                  <div className="detail-metrics">
                    <div>
                      <strong>
                        {completedTasks}/{selectedParty.tasks.length}
                      </strong>
                      <span>Tarefas concluidas</span>
                    </div>
                    <div>
                      <strong>
                        {confirmedGuests}/{selectedParty.guests.length}
                      </strong>
                      <span>RSVP confirmados</span>
                    </div>
                    <div>
                      <strong>{budgetProgress}%</strong>
                      <span>Uso do orcamento</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="empty-copy">Crie a primeira festa para comecar.</p>
              )}
            </article>

            <article className="card-light roadmap-card">
              <h3>Mapa operacional</h3>
              <ul className="roadmap-list">
                <li>
                  <strong>Autenticacao</strong>
                  <span>Fluxo com JWT validado no bootstrap da aplicacao.</span>
                </li>
                <li>
                  <strong>Planejamento</strong>
                  <span>Cadastros de festa, tarefas, convidados e despesas em formularios dedicados.</span>
                </li>
                <li>
                  <strong>Operacao</strong>
                  <span>Tarefas e acompanhamento financeiro em uma visao unica por festa.</span>
                </li>
              </ul>
            </article>
          </section>
        ) : null}

        {activeSection === 'Planejar' ? (
          <section className="form-grid">
            <form className="card-light stacked-form" onSubmit={handleCreateParty}>
              <h3>Nova festa</h3>
              <input
                placeholder="Nome da festa"
                value={partyForm.name}
                onChange={(event) => setPartyForm((current) => ({ ...current, name: event.target.value }))}
              />
              <input
                placeholder="Categoria"
                value={partyForm.category}
                onChange={(event) =>
                  setPartyForm((current) => ({ ...current, category: event.target.value }))
                }
              />
              <input
                placeholder="Data"
                value={partyForm.date}
                onChange={(event) => setPartyForm((current) => ({ ...current, date: event.target.value }))}
              />
              <input
                placeholder="Local"
                value={partyForm.location}
                onChange={(event) =>
                  setPartyForm((current) => ({ ...current, location: event.target.value }))
                }
              />
              <input
                placeholder="Orcamento previsto"
                inputMode="decimal"
                value={partyForm.estimatedBudget}
                onChange={(event) =>
                  setPartyForm((current) => ({
                    ...current,
                    estimatedBudget: event.target.value
                  }))
                }
              />
              <button className="primary-button" type="submit" disabled={createParty.isPending}>
                {createParty.isPending ? 'Salvando...' : 'Criar festa'}
              </button>
            </form>

            <form className="card-light stacked-form" onSubmit={handleCreateTask}>
              <h3>Adicionar tarefa</h3>
              <p className="helper-copy">
                Festa selecionada: <strong>{selectedParty?.name ?? 'Selecione ou crie uma festa'}</strong>
              </p>
              <input
                placeholder="Titulo da tarefa"
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
              />
              <input
                placeholder="Responsavel"
                value={taskForm.assignee}
                onChange={(event) =>
                  setTaskForm((current) => ({ ...current, assignee: event.target.value }))
                }
              />
              <button className="primary-button" type="submit" disabled={!selectedParty || createTask.isPending}>
                {createTask.isPending ? 'Salvando...' : 'Salvar tarefa'}
              </button>
            </form>

            <form className="card-light stacked-form" onSubmit={handleCreateGuest}>
              <h3>Adicionar convidado</h3>
              <input
                placeholder="Nome do convidado"
                value={guestForm.name}
                onChange={(event) => setGuestForm((current) => ({ ...current, name: event.target.value }))}
              />
              <input
                placeholder="Grupo"
                value={guestForm.group}
                onChange={(event) => setGuestForm((current) => ({ ...current, group: event.target.value }))}
              />
              <div className="status-pills">
                {guestStatuses.map((status) => (
                  <button
                    key={status}
                    className={guestForm.status === status ? 'pill is-active' : 'pill'}
                    onClick={() => setGuestForm((current) => ({ ...current, status }))}
                    type="button"
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button className="primary-button" type="submit" disabled={!selectedParty || createGuest.isPending}>
                {createGuest.isPending ? 'Salvando...' : 'Salvar convidado'}
              </button>
            </form>

            <form className="card-light stacked-form" onSubmit={handleCreateBudgetItem}>
              <h3>Adicionar despesa</h3>
              <input
                placeholder="Descricao"
                value={budgetForm.label}
                onChange={(event) => setBudgetForm((current) => ({ ...current, label: event.target.value }))}
              />
              <input
                placeholder="Categoria"
                value={budgetForm.category}
                onChange={(event) =>
                  setBudgetForm((current) => ({ ...current, category: event.target.value }))
                }
              />
              <input
                placeholder="Valor"
                inputMode="decimal"
                value={budgetForm.amount}
                onChange={(event) => setBudgetForm((current) => ({ ...current, amount: event.target.value }))}
              />
              <button
                className="primary-button"
                type="submit"
                disabled={!selectedParty || createBudgetItem.isPending}
              >
                {createBudgetItem.isPending ? 'Salvando...' : 'Salvar despesa'}
              </button>
            </form>
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

              <div className="theme-switcher">
                <div>
                  <strong>Tema da interface</strong>
                  <p>Escolha entre o modo claro e o modo escuro para a aplicacao.</p>
                </div>
                <div className="theme-options">
                  <button
                    className={theme === 'light' ? 'theme-option is-active' : 'theme-option'}
                    onClick={() => void onThemeChange('light')}
                    type="button"
                  >
                    <Sun size={16} />
                    White
                  </button>
                  <button
                    className={theme === 'dark' ? 'theme-option is-active' : 'theme-option'}
                    onClick={() => void onThemeChange('dark')}
                    type="button"
                  >
                    <Moon size={16} />
                    Dark
                  </button>
                </div>
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
      </section>
    </main>
  );
}
