import { CheckCheck, Edit3, Eye, X } from 'lucide-react';
import { motion } from 'motion/react';
import type * as React from 'react';

import { taskColumns } from '@/domain/constants/party.constants';
import { normalizeTaskStatus } from '@/domain/utils/party.utils';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Field, Input } from '@/presentation/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/presentation/components/ui/dialog';
import type { DashboardState, TaskItem } from '@/presentation/hooks/useDashboardState';
import { cn } from '@/shared/utils/cn';
import { Plus, ClipboardCheck } from 'lucide-react';

type TasksSectionProps = {
  selectedParty: DashboardState['selectedParty'];
  selectedPartyLocked: DashboardState['selectedPartyLocked'];
  taskForm: DashboardState['taskForm'];
  setTaskForm: DashboardState['setTaskForm'];
  editingTaskId: DashboardState['editingTaskId'];
  editingTaskForm: DashboardState['editingTaskForm'];
  setEditingTaskForm: DashboardState['setEditingTaskForm'];
  viewingTask: DashboardState['viewingTask'];
  setViewingTask: DashboardState['setViewingTask'];
  draggingTaskId: DashboardState['draggingTaskId'];
  setDraggingTaskId: DashboardState['setDraggingTaskId'];
  taskDialogOpen: DashboardState['taskDialogOpen'];
  setTaskDialogOpen: DashboardState['setTaskDialogOpen'];
  createTask: DashboardState['createTask'];
  updateTask: DashboardState['updateTask'];
  deleteTask: DashboardState['deleteTask'];
  onCreateTask: (event: React.FormEvent<HTMLFormElement>) => void;
  onSaveTask: (task: TaskItem) => void;
  onDeleteTask: (task: TaskItem) => void;
  onMoveTask: (taskId: string, status: string) => void;
  onStartTaskEdit: (task: TaskItem) => void;
  onCancelTaskEdit: () => void;
  onTaskDragStart: (event: React.DragEvent<HTMLElement>, taskId: string) => void;
  onTaskDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onTaskDrop: (event: React.DragEvent<HTMLElement>, status: string) => void;
};

export function TasksSection({
  selectedParty,
  selectedPartyLocked,
  taskForm,
  setTaskForm,
  editingTaskId,
  editingTaskForm,
  setEditingTaskForm,
  viewingTask,
  setViewingTask,
  draggingTaskId,
  setDraggingTaskId,
  taskDialogOpen: _taskDialogOpen,
  setTaskDialogOpen: _setTaskDialogOpen,
  createTask,
  updateTask,
  deleteTask,
  onCreateTask,
  onSaveTask,
  onDeleteTask,
  onMoveTask: _onMoveTask,
  onStartTaskEdit,
  onCancelTaskEdit,
  onTaskDragStart,
  onTaskDragOver,
  onTaskDrop
}: TasksSectionProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <TaskPreviewDialog viewingTask={viewingTask} onClose={() => setViewingTask(null)} />

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
                    onDragOver={onTaskDragOver}
                    onDrop={(event) => {
                      if (!selectedPartyLocked) {
                        onTaskDrop(event, column.id);
                      }
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{column.label}</h3>
                      <Badge className={column.tone}>{tasks.length}</Badge>
                    </div>
                    <div className="grid max-h-[504px] gap-3 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:thin]">
                      {tasks.map((task) => (
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
                              onTaskDragStart(event as unknown as React.DragEvent<HTMLElement>, task.id);
                            }
                          }}
                          transition={{ duration: 0.16 }}
                        >
                          {editingTaskId === task.id ? (
                            <TaskEditForm
                              task={task}
                              editingTaskForm={editingTaskForm}
                              setEditingTaskForm={setEditingTaskForm}
                              selectedPartyLocked={selectedPartyLocked}
                              updateTask={updateTask}
                              onSave={onSaveTask}
                              onCancel={onCancelTaskEdit}
                            />
                          ) : null}
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
                              <Button className="h-8 w-8 px-0" disabled={selectedPartyLocked} onClick={() => onStartTaskEdit(task)} type="button" variant="outline">
                                <Edit3 size={14} />
                              </Button>
                              <Button
                                className="h-8 w-8 px-0 text-slate-400 hover:text-rose-200"
                                disabled={selectedPartyLocked || deleteTask.isPending}
                                onClick={() => onDeleteTask(task)}
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
                      ))}
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
          <form className="grid gap-3" onSubmit={onCreateTask}>
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

export function TaskCreateDialog({
  selectedParty,
  selectedPartyLocked,
  taskDialogOpen,
  setTaskDialogOpen,
  taskForm,
  setTaskForm,
  createTask,
  onCreateTask
}: {
  selectedParty: DashboardState['selectedParty'];
  selectedPartyLocked: DashboardState['selectedPartyLocked'];
  taskDialogOpen: DashboardState['taskDialogOpen'];
  setTaskDialogOpen: DashboardState['setTaskDialogOpen'];
  taskForm: DashboardState['taskForm'];
  setTaskForm: DashboardState['setTaskForm'];
  createTask: DashboardState['createTask'];
  onCreateTask: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
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
        <form className="grid gap-3" onSubmit={onCreateTask}>
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

export function TaskPreviewDialog({
  viewingTask,
  onClose
}: {
  viewingTask: TaskItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(viewingTask)} onOpenChange={(open) => !open && onClose()}>
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

export function TaskEditForm({
  task,
  editingTaskForm,
  setEditingTaskForm,
  selectedPartyLocked,
  updateTask,
  onSave,
  onCancel,
  compact = false
}: {
  task: TaskItem;
  editingTaskForm: DashboardState['editingTaskForm'];
  setEditingTaskForm: DashboardState['setEditingTaskForm'];
  selectedPartyLocked: boolean;
  updateTask: DashboardState['updateTask'];
  onSave: (task: TaskItem) => void;
  onCancel: () => void;
  compact?: boolean;
}) {
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
        <Button disabled={selectedPartyLocked || updateTask.isPending || !editingTaskForm.title.trim()} onClick={() => onSave(task)} size="sm" type="button" variant="premium">
          <CheckCheck size={15} />
          Salvar
        </Button>
        <Button onClick={onCancel} size="sm" type="button" variant="outline">
          <X size={15} />
          Cancelar
        </Button>
      </div>
    </div>
  );
}
