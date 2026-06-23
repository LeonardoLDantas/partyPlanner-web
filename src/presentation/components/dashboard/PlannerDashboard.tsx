import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type { AuthSession } from '@/domain/entities/auth';
import type { ThemeMode } from '@/domain/entities/notification';
import { ToastProvider, ToastStack } from '@/presentation/components/ui/toast';
import { Button } from '@/presentation/components/ui/button';
import { MobileOverviewSection } from '@/presentation/features/overview/OverviewSection.mobile';
import { OverviewSection } from '@/presentation/features/overview/OverviewSection';
import { EventsSection } from '@/presentation/features/events/EventsSection';
import { MobileEventsSection } from '@/presentation/features/events/EventsSection.mobile';
import { CreatePartyDialog } from '@/presentation/features/events/CreatePartyDialog';
import { DesktopPartySelector } from '@/presentation/features/events/PartySelector';
import { GuestsSection } from '@/presentation/features/guests/GuestsSection';
import { MobileGuestsSection } from '@/presentation/features/guests/GuestsSection.mobile';
import { TasksSection } from '@/presentation/features/tasks/TasksSection';
import { MobileTasksSection } from '@/presentation/features/tasks/TasksSection.mobile';
import { ExpensesSection } from '@/presentation/features/expenses/ExpensesSection';
import { MobileExpensesSection } from '@/presentation/features/expenses/ExpensesSection.mobile';
import { SettingsSection } from '@/presentation/features/settings/SettingsSection';
import { MobileSettingsSection } from '@/presentation/features/settings/SettingsSection.mobile';
import { Sidebar } from '@/presentation/layout/Sidebar';
import { MobileBottomNavigation } from '@/presentation/layout/MobileBottomNav';
import { MobileHeaderActions } from '@/presentation/layout/MobileHeaderActions';
import { MobileNotificationsSheet, DesktopNotificationsPanel } from '@/presentation/layout/NotificationsSheet';
import { useDashboardState } from '@/presentation/hooks/useDashboardState';

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
  const state = useDashboardState();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('celebra-sidebar-collapsed') === 'true'; } catch { return false; }
  });

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('celebra-sidebar-collapsed', String(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const partySelectorProps = {
    onPointerDown: state.handlePartySelectorPointerDown,
    onPointerMove: state.handlePartySelectorPointerMove,
    onPointerUp: state.handlePartySelectorPointerUp,
    onPartyClick: state.handlePartySelectorClick
  };

  const mobileHeaderAction = (
    <MobileHeaderActions
      unreadNotifications={state.unreadNotifications}
      userName={session.user.name}
      onOpenNotifications={() => state.setMobileNotificationsOpen(true)}
    />
  );

  const activeLabel = {
    Painel: 'Início',
    Eventos: 'Eventos',
    Convidados: 'Convidados',
    Tarefas: 'Tarefas',
    Despesas: 'Despesas',
    Ajustes: 'Perfil'
  }[state.activeSection] ?? 'Painel';

  return (
    <ToastProvider swipeDirection="right">
      <div className="max-w-full overflow-x-clip px-0 py-0 lg:h-screen lg:max-w-none lg:overflow-hidden lg:px-4 lg:py-4">
        <div className="mx-auto max-w-none lg:h-full">
          <Sidebar
            activeSection={state.activeSection}
            collapsed={sidebarCollapsed}
            onSectionChange={state.setActiveSection}
            onToggle={handleSidebarToggle}
            onLogout={onLogout}
          />

          <main
            className={`min-w-0 lg:h-full lg:transition-[margin-left] lg:duration-[280ms] lg:ease-[ease] ${sidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[284px]'}`}
          >
            {/* Mobile layout */}
            <div className="lg:hidden">
              <MobileNotificationsSheet
                open={state.mobileNotificationsOpen}
                onOpenChange={state.setMobileNotificationsOpen}
                notifications={state.notifications}
                unreadNotifications={state.unreadNotifications}
                markAllAsRead={state.markAllAsRead}
                clearAllNotifications={state.clearAllNotifications}
                onMarkAllRead={() => void state.handleMarkAllNotificationsRead()}
                onClear={() => void state.handleClearNotifications()}
              />

              {state.activeSection === 'Painel' ? (
                <MobileOverviewSection
                  filteredParties={state.filteredParties}
                  selectedParty={state.selectedParty}
                  mobileCarouselRef={state.mobileCarouselRef}
                  unreadNotifications={state.unreadNotifications}
                  session={session}
                  onCarouselScroll={state.handleMobileCarouselScroll}
                  onSelectParty={state.setSelectedPartyId}
                  onCreateParty={state.openCreatePartyDialog}
                  onSetSection={state.setActiveSection}
                  onOpenMobileNotifications={() => state.setMobileNotificationsOpen(true)}
                />
              ) : null}

              {state.activeSection === 'Eventos' ? (
                <MobileEventsSection
                  filteredParties={state.filteredParties}
                  categoryFilter={state.categoryFilter}
                  setCategoryFilter={state.setCategoryFilter}
                  createOpen={state.createOpen}
                  setCreateOpen={state.setCreateOpen}
                  editingPartyId={state.editingPartyId}
                  partyForm={state.partyForm}
                  setPartyForm={state.setPartyForm}
                  actionError={state.actionError}
                  createParty={state.createParty}
                  updateParty={state.updateParty}
                  deleteParty={state.deleteParty}
                  headerAction={mobileHeaderAction}
                  onSelectParty={state.setSelectedPartyId}
                  onEditParty={state.openEditPartyDialog}
                  onToggleFinalized={(party) => void state.handleTogglePartyFinalized(party)}
                  onCreateParty={state.openCreatePartyDialog}
                  onCreatePartySubmit={state.handleCreateParty}
                  onDeleteParty={() => void state.handleDeleteParty()}
                  onCoverImageChange={state.handleCoverImageChange}
                />
              ) : null}

              {state.activeSection === 'Convidados' ? (
                <MobileGuestsSection
                  selectedParty={state.selectedParty}
                  selectedPartyLocked={state.selectedPartyLocked}
                  filteredGuests={state.filteredGuests}
                  guestSearch={state.guestSearch}
                  setGuestSearch={state.setGuestSearch}
                  guestFilter={state.guestFilter}
                  setGuestFilter={state.setGuestFilter}
                  guestDialogOpen={state.guestDialogOpen}
                  setGuestDialogOpen={state.setGuestDialogOpen}
                  guestForm={state.guestForm}
                  setGuestForm={state.setGuestForm}
                  parties={state.parties}
                  createGuest={state.createGuest}
                  deleteGuest={state.deleteGuest}
                  headerAction={mobileHeaderAction}
                  partySelectorProps={partySelectorProps}
                  onCreateGuest={state.handleCreateGuest}
                  onDeleteGuest={(guest) => void state.handleDeleteGuest(guest)}
                  onCopyInvitationLink={(name, token) => void state.handleCopyInvitationLink(name, token)}
                  getWhatsappUrl={state.getWhatsappUrl}
                  getMailtoUrl={state.getMailtoUrl}
                />
              ) : null}

              {state.activeSection === 'Tarefas' ? (
                <MobileTasksSection
                  selectedParty={state.selectedParty}
                  selectedPartyLocked={state.selectedPartyLocked}
                  parties={state.parties}
                  taskForm={state.taskForm}
                  setTaskForm={state.setTaskForm}
                  editingTaskId={state.editingTaskId}
                  editingTaskForm={state.editingTaskForm}
                  setEditingTaskForm={state.setEditingTaskForm}
                  viewingTask={state.viewingTask}
                  setViewingTask={state.setViewingTask}
                  taskDialogOpen={state.taskDialogOpen}
                  setTaskDialogOpen={state.setTaskDialogOpen}
                  createTask={state.createTask}
                  updateTask={state.updateTask}
                  deleteTask={state.deleteTask}
                  headerAction={mobileHeaderAction}
                  partySelectorProps={partySelectorProps}
                  onCreateTask={state.handleCreateTask}
                  onSaveTask={(task) => void state.handleSaveTask(task)}
                  onDeleteTask={(task) => void state.handleDeleteTask(task)}
                  onMoveTask={(id, status) => void state.handleMoveTask(id, status)}
                  onStartTaskEdit={state.startTaskEdit}
                  onCancelTaskEdit={state.cancelTaskEdit}
                />
              ) : null}

              {state.activeSection === 'Despesas' ? (
                <MobileExpensesSection
                  selectedParty={state.selectedParty}
                  selectedPartyLocked={state.selectedPartyLocked}
                  parties={state.parties}
                  budgetForm={state.budgetForm}
                  setBudgetForm={state.setBudgetForm}
                  editingBudgetItemId={state.editingBudgetItemId}
                  editingBudgetAmount={state.editingBudgetAmount}
                  setEditingBudgetAmount={state.setEditingBudgetAmount}
                  createBudgetItem={state.createBudgetItem}
                  updateBudgetItem={state.updateBudgetItem}

                  headerAction={mobileHeaderAction}
                  partySelectorProps={partySelectorProps}
                  onCreateBudgetItem={state.handleCreateBudgetItem}
                  onUpdateBudgetItem={(item) => void state.handleUpdateBudgetItem(item)}
                  onDeleteBudgetItem={(item) => void state.handleDeleteBudgetItem(item)}
                  onToggleBudgetItemPaid={(item) => void state.handleToggleBudgetItemPaid(item)}
                  onStartBudgetItemEdit={state.startBudgetItemEdit}
                />
              ) : null}

              {state.activeSection === 'Ajustes' ? (
                <MobileSettingsSection
                  session={session}
                  notificationsEnabled={notificationsEnabled}
                  headerAction={mobileHeaderAction}
                  onNotificationsChange={onNotificationsChange}
                  onLogout={onLogout}
                />
              ) : null}
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex lg:h-full lg:flex-col lg:gap-5 lg:overflow-hidden">
              <header className="sticky top-4 z-30 shrink-0 rounded-lg border border-border bg-card/78 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    {state.activeSection === 'Painel' ? (
                      <>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-300">
                          Bem-vindo de volta
                        </p>
                        <h1 className="mt-1 truncate text-2xl font-semibold md:text-3xl">
                          Olá, {session.user.name.split(' ')[0]}
                        </h1>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {{
                            Eventos: 'Gerencie suas celebrações',
                            Convidados: 'Lista e confirmações',
                            Tarefas: 'Kanban do evento ativo',
                            Despesas: 'Orçamento e gastos',
                            Ajustes: 'Configurações da conta'
                          }[state.activeSection] ?? ''}
                        </p>
                        <h1 className="mt-1 truncate text-2xl font-semibold md:text-3xl">
                          {activeLabel}
                        </h1>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Button size="icon" type="button" variant="outline" onClick={() => state.setNotificationsOpen((current) => !current)}>
                        <Bell size={18} />
                      </Button>
                      {state.unreadNotifications > 0 ? (
                        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-sky-500 px-1 text-xs font-bold text-white">
                          {state.unreadNotifications}
                        </span>
                      ) : null}
                      {state.notificationsOpen ? (
                        <DesktopNotificationsPanel
                          notifications={state.notifications}
                          unreadNotifications={state.unreadNotifications}
                          markAllAsRead={state.markAllAsRead}
                          clearAllNotifications={state.clearAllNotifications}
                          onMarkAllRead={() => void state.handleMarkAllNotificationsRead()}
                          onClear={() => void state.handleClearNotifications()}
                        />
                      ) : null}
                    </div>
                    <CreatePartyDialog
                      createOpen={state.createOpen}
                      setCreateOpen={state.setCreateOpen}
                      editingPartyId={state.editingPartyId}
                      partyForm={state.partyForm}
                      setPartyForm={state.setPartyForm}
                      actionError={state.actionError}
                      createParty={state.createParty}
                      updateParty={state.updateParty}
                      deleteParty={state.deleteParty}
                      onSubmit={state.handleCreateParty}
                      onDelete={() => void state.handleDeleteParty()}
                      onCoverImageChange={state.handleCoverImageChange}
                      onOpen={state.openCreatePartyDialog}
                    />
                  </div>
                </div>
              </header>

              <DesktopPartySelector
                parties={state.parties}
                selectedParty={state.selectedParty}
                {...partySelectorProps}
              />

              {state.actionError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {state.actionError}
                </div>
              ) : null}

              <div className={`min-h-0 flex-1 ${state.activeSection === 'Eventos' ? 'overflow-hidden' : 'overflow-y-auto [scrollbar-width:thin]'}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className={state.activeSection === 'Eventos' ? 'h-full' : undefined}
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={state.activeSection}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {state.activeSection === 'Painel' ? (
                    <OverviewSection
                      featuredParty={state.featuredParty}
                      selectedParty={state.selectedParty}
                      parties={state.parties}
                      confirmedGuests={state.confirmedGuests}
                      completedTasks={state.completedTasks}
                      totalTasks={state.totalTasks}
                      totalBudget={state.totalBudget}
                      updateParty={state.updateParty}
                      onCreateParty={state.openCreatePartyDialog}
                      onEditParty={state.openEditPartyDialog}
                      onToggleFinalized={(party) => void state.handleTogglePartyFinalized(party)}
                    />
                  ) : null}

                  {state.activeSection === 'Eventos' ? (
                    <EventsSection
                      filteredParties={state.filteredParties}
                      selectedParty={state.selectedParty}
                      categoryFilter={state.categoryFilter}
                      onCategoryChange={state.setCategoryFilter}
                      onSelectParty={state.setSelectedPartyId}
                      onEditParty={state.openEditPartyDialog}
                      onToggleFinalized={(party) => void state.handleTogglePartyFinalized(party)}
                    />
                  ) : null}

                  {state.activeSection === 'Convidados' ? (
                    <GuestsSection
                      selectedParty={state.selectedParty}
                      selectedPartyLocked={state.selectedPartyLocked}
                      filteredGuests={state.filteredGuests}
                      guestSearch={state.guestSearch}
                      setGuestSearch={state.setGuestSearch}
                      guestFilter={state.guestFilter}
                      setGuestFilter={state.setGuestFilter}
                      guestForm={state.guestForm}
                      setGuestForm={state.setGuestForm}
                      createGuest={state.createGuest}
                      deleteGuest={state.deleteGuest}
                      onCreateGuest={state.handleCreateGuest}
                      onDeleteGuest={(guest) => void state.handleDeleteGuest(guest)}
                      onCopyInvitationLink={(name, token) => void state.handleCopyInvitationLink(name, token)}
                      getWhatsappUrl={state.getWhatsappUrl}
                      getMailtoUrl={state.getMailtoUrl}
                    />
                  ) : null}

                  {state.activeSection === 'Tarefas' ? (
                    <TasksSection
                      selectedParty={state.selectedParty}
                      selectedPartyLocked={state.selectedPartyLocked}
                      taskForm={state.taskForm}
                      setTaskForm={state.setTaskForm}
                      editingTaskId={state.editingTaskId}
                      editingTaskForm={state.editingTaskForm}
                      setEditingTaskForm={state.setEditingTaskForm}
                      viewingTask={state.viewingTask}
                      setViewingTask={state.setViewingTask}
                      draggingTaskId={state.draggingTaskId}
                      setDraggingTaskId={state.setDraggingTaskId}
                      taskDialogOpen={state.taskDialogOpen}
                      setTaskDialogOpen={state.setTaskDialogOpen}
                      createTask={state.createTask}
                      updateTask={state.updateTask}
                      deleteTask={state.deleteTask}
                      onCreateTask={state.handleCreateTask}
                      onSaveTask={(task) => void state.handleSaveTask(task)}
                      onDeleteTask={(task) => void state.handleDeleteTask(task)}
                      onMoveTask={(id, status) => void state.handleMoveTask(id, status)}
                      onStartTaskEdit={state.startTaskEdit}
                      onCancelTaskEdit={state.cancelTaskEdit}
                      onTaskDragStart={state.handleTaskDragStart}
                      onTaskDragOver={state.handleTaskDragOver}
                      onTaskDrop={state.handleTaskDrop}
                    />
                  ) : null}

                  {state.activeSection === 'Despesas' ? (
                    <ExpensesSection
                      selectedParty={state.selectedParty}
                      selectedPartyLocked={state.selectedPartyLocked}
                      budgetForm={state.budgetForm}
                      setBudgetForm={state.setBudgetForm}
                      editingBudgetItemId={state.editingBudgetItemId}
                      editingBudgetAmount={state.editingBudgetAmount}
                      setEditingBudgetAmount={state.setEditingBudgetAmount}
                      createBudgetItem={state.createBudgetItem}
                      updateBudgetItem={state.updateBudgetItem}
                      deleteBudgetItem={state.deleteBudgetItem}
                      onCreateBudgetItem={state.handleCreateBudgetItem}
                      onUpdateBudgetItem={(item) => void state.handleUpdateBudgetItem(item)}
                      onDeleteBudgetItem={(item) => void state.handleDeleteBudgetItem(item)}
                      onToggleBudgetItemPaid={(item) => void state.handleToggleBudgetItemPaid(item)}
                      onStartBudgetItemEdit={state.startBudgetItemEdit}
                      onCreateParty={state.openCreatePartyDialog}
                    />
                  ) : null}

                  {state.activeSection === 'Ajustes' ? (
                    <SettingsSection
                      session={session}
                      notificationsEnabled={notificationsEnabled}
                      theme={theme}
                      onNotificationsChange={onNotificationsChange}
                      onThemeChange={onThemeChange}
                      onLogout={onLogout}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
              </div>
            </div>
          </main>
        </div>

        <MobileBottomNavigation
          activeSection={state.activeSection}
          onSectionChange={state.setActiveSection}
        />
      </div>
      <ToastStack toasts={state.toasts} onDismiss={state.dismissToast} />
    </ToastProvider>
  );
}
