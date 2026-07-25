import React from 'react';
import type { Task, Subtask, TaskActivity } from '../types/tracking.types';
import { cn } from '../../../lib/cn';
import { X, User, CheckCircle2, Plus, ArrowUpRight, History, BookOpen, FileText } from 'lucide-react';

interface TaskDetailsDialogProps {
  task: Task;
  subtasks: Subtask[];
  activities: TaskActivity[];
  onClose: () => void;
  onUpdatePriority: (taskId: string, priority: Task['priority']) => Promise<void>;
  onUpdateAssignment: (taskId: string, assignedTo: Task['assigned_to']) => Promise<void>;
  onUpdateNotes: (taskId: string, notes: string) => Promise<void>;
  onToggleSubtask: (subtaskId: string, isCompleted: boolean) => Promise<void>;
  onAddSubtask: (taskId: string, title: string) => Promise<void>;
}

const ACTION_LABELS: Record<string, string> = {
  update_status: 'Cambió el estado',
  update_notes: 'Actualizó las observaciones',
  update_assignment: 'Modificó la asignación',
  create_task: 'Creó la tarea',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  blocked: 'Bloqueada',
  completed: 'Completada',
  not_applicable: 'No aplica',
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  direct: 'Instrucción directa',
  combined: 'Instrucción combinada',
  operational_summary: 'Resumen operativo',
  local: 'Tarea local',
};

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  subtasks,
  activities,
  onClose,
  onUpdatePriority,
  onUpdateAssignment,
  onUpdateNotes,
  onToggleSubtask,
  onAddSubtask,
}) => {
  const [notes, setNotes] = React.useState(task.notes || '');
  const [newSubTitle, setNewSubTitle] = React.useState('');
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [addingSub, setAddingSub] = React.useState(false);

  // Filtrar actividades asociadas a esta tarea
  const taskActivities = React.useMemo(() => {
    return activities.filter((act) => act.task_id === task.id);
  }, [activities, task.id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await onUpdateNotes(task.id, notes);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTitle.trim()) return;
    setAddingSub(true);
    try {
      await onAddSubtask(task.id, newSubTitle.trim());
      setNewSubTitle('');
    } finally {
      setAddingSub(false);
    }
  };

  const isLocalTask = task.source === 'custom' || task.source_classification === 'local';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-4xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Superintendencia de Alojamiento</span>
              <span>•</span>
              <span className="text-(--institutional-blue)">
                {task.phase === 'before' ? 'Antes' : task.phase === 'during' ? 'Durante' : 'Después'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-(--page-text) leading-tight">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto flex-1">
          {/* DETALLES DE LA TAREA (Izquierda) */}
          <div className="md:col-span-2 space-y-6">
            {task.description && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Descripción</span>
                <p className="text-xs sm:text-sm text-(--text-muted) leading-relaxed bg-slate-50 dark:bg-slate-800/10 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/30">
                  {task.description}
                </p>
              </div>
            )}

            {/* FUNDAMENTO DE LA TAREA */}
            <div className="space-y-3 p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <BookOpen size={14} />
                  Fundamento de la Tarea
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-800 dark:text-blue-200">
                  {CLASSIFICATION_LABELS[task.source_classification || (isLocalTask ? 'local' : 'direct')]}
                </span>
              </div>

              {isLocalTask ? (
                <p className="text-xs text-(--text-muted) leading-relaxed">
                  Esta es una tarea local o extraordinaria creada para las necesidades específicas de esta asamblea. No cuenta con referencia directa en los manuales oficiales CO-1 o CO-80.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {/* Referencias documentales */}
                  {task.source_refs && task.source_refs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Referencias:</span>
                      <div className="flex flex-col gap-1">
                        {task.source_refs.map((ref, idx) => (
                          <div key={idx} className="text-xs font-semibold text-(--page-text) flex items-center gap-2">
                            <FileText size={12} className="text-blue-500 shrink-0" />
                            <span>
                              {ref.document}
                              {ref.chapter && ` — Capítulo ${ref.chapter}`}
                              {ref.paragraphs && `, párrafo${ref.paragraphs.includes('-') || ref.paragraphs.includes(',') ? 's' : ''} ${ref.paragraphs}`}
                              {ref.appendix && ` — Apéndice ${ref.appendix}`}
                              {ref.section && ` (${ref.section})`}
                              {ref.page && `, pág. ${ref.page}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resumen de la Instrucción */}
                  {task.instruction_basis && (
                    <div className="space-y-1 pt-1 border-t border-blue-500/10">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Resumen de la Instrucción:</span>
                      <p className="text-xs text-(--page-text) leading-relaxed italic">
                        "{task.instruction_basis}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Gestión de Subtareas */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Subtareas</span>
              
              <form onSubmit={handleAddSub} className="flex gap-2">
                <input
                  type="text"
                  value={newSubTitle}
                  onChange={(e) => setNewSubTitle(e.target.value)}
                  placeholder="Agregar nueva subtarea..."
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                />
                <button
                  type="submit"
                  disabled={addingSub || !newSubTitle.trim()}
                  className="px-3.5 py-2 bg-(--institutional-blue) hover:brightness-110 active:brightness-95 disabled:opacity-50 text-white rounded-xl font-bold transition-all text-xs flex items-center justify-center shrink-0"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline ml-1">Añadir</span>
                </button>
              </form>

              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {subtasks.length > 0 ? (
                  subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onToggleSubtask(sub.id, !sub.is_completed)}
                      className={cn(
                        "flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800/40 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all",
                        sub.is_completed && "opacity-70"
                      )}
                    >
                      <button className={cn(
                        "w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all",
                        sub.is_completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 dark:border-slate-700"
                      )}>
                        {sub.is_completed && <CheckCircle2 size={14} />}
                      </button>
                      <span className={cn(
                        "text-xs sm:text-sm text-(--page-text)",
                        sub.is_completed && "line-through text-(--text-muted)"
                      )}>
                        {sub.title}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No hay subtareas registradas para esta actividad.</p>
                )}
              </div>
            </div>

            {/* Observaciones / Notas */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Observaciones e Incidencias</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe observaciones, comentarios o el motivo del bloqueo de la tarea..."
                rows={3}
                className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes || notes === (task.notes || '')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-(--page-text) rounded-xl font-bold text-xs disabled:opacity-50 transition-colors"
              >
                {savingNotes ? 'Guardando...' : 'Guardar Observaciones'}
              </button>
            </div>
          </div>

          {/* CONTROLES / METADATOS (Derecha) */}
          <div className="space-y-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/40 pt-6 md:pt-0 md:pl-6">
            {/* Prioridad */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <ArrowUpRight size={12} />
                <span>Prioridad</span>
              </label>
              <select
                value={task.priority}
                onChange={(e) => onUpdatePriority(task.id, e.target.value as Task['priority'])}
                className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold focus:outline-none text-(--page-text)"
              >
                <option value="normal">Normal</option>
                <option value="important">Importante</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Asignado A */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <User size={12} />
                <span>Responsable</span>
              </label>
              <select
                value={task.assigned_to}
                onChange={(e) => onUpdateAssignment(task.id, e.target.value as Task['assigned_to'])}
                className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold focus:outline-none text-(--page-text)"
              >
                <option value="both">Ambos (Jhonny y Benjamín)</option>
                <option value="superintendent">Jhonny F. (Superintendente)</option>
                <option value="assistant">Benjamín P. (Auxiliar)</option>
                <option value="department_head">Sup. Departamento</option>
              </select>
            </div>

            {/* Historial de cambios */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <History size={12} />
                <span>Historial de Tarea</span>
              </label>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {taskActivities.length > 0 ? (
                  taskActivities.map((act) => (
                    <div key={act.id} className="relative flex items-start gap-2.5 text-[11px] leading-relaxed border-l-2 border-slate-200 dark:border-slate-800 pl-3 py-0.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-(--page-text)">{act.user_name}</span>
                        <p className="text-(--text-muted)">
                          {ACTION_LABELS[act.action] || act.action} 
                          {act.new_status && ` a "${STATUS_LABELS[act.new_status] || act.new_status}"`}
                        </p>
                        {act.comment && (
                          <p className="text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/10 px-2 py-1 rounded-lg mt-1 select-all">
                            "{act.comment}"
                          </p>
                        )}
                        <span className="text-[9px] text-slate-400 block pt-0.5">
                          {new Date(act.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No hay historial para esta tarea.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TaskDetailsDialog;
