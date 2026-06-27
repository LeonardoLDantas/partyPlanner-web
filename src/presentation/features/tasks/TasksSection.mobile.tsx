import { Button } from '@/presentation/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import { Eye, Edit3, X, ClipboardCheck } from 'lucide-react';
import type * as React from 'react';

import { taskColumns } from '@/domain/constants/party.constants';
import { normalizeTaskStatus } from '@/domain/utils/party.utils';
import { MobilePage } from '@/presentation/layout/MobilePage';
import { MobilePartySelector } from '@/presentation/features/events/PartySelector';
import { TaskCreateDialog, TaskPreviewDialog, TaskEditForm } from '@/presentation/features/tasks/TasksSection';
import type { DashboardState, TaskItem } from '@/presentation/hooks/useDashboardState';
import { cn } from '@/shared/utils/cn';

type MobileTasksSectionProps = {
  selectedParty: DashboardState['selectedParty'];
  selectedPartyLocked: DashboardState['selectedPartyLocked'];
  parties: DashboardState['parties'];
  taskForm: DashboardState['taskForm'];
  setTaskForm: DashboardState['setTaskForm'];
  editingTaskId: DashboardState['editingTaskId'];
  editingTaskForm: DashboardState['editingTaskForm'];
  setEditingTaskForm: DashboardState['setEditingTaskForm'];
  viewingTask: DashboardState['viewingTask'];
  setViewingTask: DashboardState['setViewingTask'];
  taskDialogOpen: DashboardState['taskDialogOpen'];
  setTaskDialogOpen: DashboardState['setTaskDialogOpen'];
  createTask: DashboardState['createTask'];
  updateTask: DashboardState['updateTask'];
  deleteTask: DashboardState['deleteTask'];
  headerAction: React.ReactNode;
  partySelectorProps: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: () => void;
    onPartyClick: (partyId: string) => void;
  };
  onCreateTask: (event: React.FormEvent<HTMLFormElement>) => void;
  onSaveTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
  onMoveTask: (taskId: string, status: string) => void;
  onStartTaskEdit: (task: TaskItem) => void;
  onCancelTaskEdit: () => void;
};

export function MobileTasksSection({
  selectedParty,
  selectedPartyLocked,
  parties,
  taskForm,
  setTaskForm,
  editingTaskId,
  editingTaskForm,
  setEditingTaskForm,
  viewingTask,
  setViewingTask,
  taskDialogOpen,
  setTaskDialogOpen,
  createTask,
  updateTask,
  deleteTask,
  headerAction,
  partySelectorProps,
  onCreateTask,
  onSaveTask,
  onDeleteTask,
  onMoveTask,
  onStartTaskEdit,
  onCancelTaskEdit
}: MobileTasksSectionProps) {
  return (
    <MobilePage
      title="Tarefas"
      action={
        <TaskCreateDialog
          selectedParty={selectedParty}
          selectedPartyLocked={selectedPartyLocked}
          taskDialogOpen={taskDialogOpen}
          setTaskDialogOpen={setTaskDialogOpen}
          taskForm={taskForm}
          setTaskForm={setTaskForm}
          createTask={createTask}
          onCreateTask={onCreateTask}
        />
      }
      headerAction={headerAction}
    >
      <TaskPreviewDialog viewingTask={viewingTask} onClose={() => setViewingTask(null)} />
      <MobilePartySelector
        parties={parties}
        selectedParty={selectedParty}
        {...partySelectorProps}
      />
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
              <div className="grid gap-2.5">
                {tasks.map((task) => (
                  <article className="rounded-[16px] border border-white/10 bg-panel p-3 shadow-[0_10px_24px_rgba(0,0,0,0.22)]" key={task.id}>
                    {editingTaskId === task.id ? (
                      <TaskEditForm
                        task={task}
                        editingTaskForm={editingTaskForm}
                        setEditingTaskForm={setEditingTaskForm}
                        selectedPartyLocked={selectedPartyLocked}
                        updateTask={updateTask}
                        onSave={onSaveTask}
                        onCancel={onCancelTaskEdit}
                        compact
                      />
                    ) : (
                      <>
                        <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-3">
                          <span className="celebra-brand-mark grid h-10 w-10 shrink-0 place-items-center rounded-full">
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
                            <Button className="h-8 w-8 px-0" disabled={selectedPartyLocked} onClick={() => onStartTaskEdit(task)} type="button" variant="outline">
                              <Edit3 size={14} />
                            </Button>
                            <button
                              className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={selectedPartyLocked || deleteTask.isPending}
                              onClick={() => onDeleteTask(task)}
                              type="button"
                              title="Excluir tarefa"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Select disabled={selectedPartyLocked} value={normalizeTaskStatus(task.status, task.done)} onValueChange={(value) => onMoveTask(task.id, value)}>
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
