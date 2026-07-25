import React from 'react';
import type { Task, Subtask, TaskActivity } from '../types/tracking.types';
import { OFFICIAL_TASK_METADATA_BY_KEY } from '../data/seedData';
import { cn } from '../../../lib/cn';
import {
  X,
  User,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  History,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
} from 'lucide-react';

interface TaskDetailsDialogProps {
  task: Task;
  subtasks: Subtask[];
  activities: TaskActivity[];
  onClose: () => void;
  onUpdateStatus?: (taskId: string, status: Task['status'], comment?: string) => Promise<void>;
  onUpdatePriority: (taskId: string, priority: Task['priority']) => Promise<void>;
  onUpdateAssignment: (taskId: string, assignedTo: Task['assigned_to']) => Promise<void>;
  onUpdateNotes: (taskId: string, notes: string) => Promise<void>;
  onUpdateDueDate?: (taskId: string, dueDate: string) => Promise<void>;
  onSyncOfficialContent?: () => Promise<void>;
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

const ASSIGNED_OPTIONS: Array<{
  value: Task['assigned_to'];
  label: string;
  subLabel: string;
}> = [
  {
    value: 'both',
    label: 'Ambos',
    subLabel: 'Jhonny Florez y Benjamín Pérez',
  },
  {
    value: 'superintendent',
    label: 'Superintendente',
    subLabel: 'Jhonny Florez',
  },
  {
    value: 'assistant',
    label: 'Auxiliar',
    subLabel: 'Benjamín Pérez',
  },
  {
    value: 'department_head',
    label: 'Sup. del departamento',
    subLabel: 'Responsable operativo del departamento',
  },
];

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  subtasks,
  activities,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateAssignment,
  onUpdateNotes,
  onUpdateDueDate,
  onToggleSubtask,
  onAddSubtask,
}) => {
  const [notes, setNotes] = React.useState(task.notes || '');
  const [newSubTitle, setNewSubTitle] = React.useState('');
  const [dueDateInput, setDueDateInput] = React.useState(task.due_date || '');
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [addingSub, setAddingSub] = React.useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = React.useState(false);

  const assignMenuRef = React.useRef<HTMLDivElement>(null);

  // Bloquear el desplazamiento de la página de fondo al abrir el modal y escuchar tecla Escape
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Manejar clic fuera del selector de responsable personalizado
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (assignMenuRef.current && !assignMenuRef.current.contains(e.target as Node)) {
        setShowAssignDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Actualizar nota local al cambiar de tarea activa
  React.useEffect(() => {
    setNotes(task.notes || '');
    setDueDateInput(task.due_date || '');
  }, [task.id, task.notes, task.due_date]);

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

  const handleStatusChange = (status: Task['status']) => {
    if (!onUpdateStatus) return;
    if (status === 'not_applicable') {
      const reason = prompt('Por favor, ingresa una justificación para marcar esta tarea como "No aplica":');
      if (reason === null) return;
      if (!reason.trim()) {
        alert('Debes ingresar una justificación.');
        return;
      }
      onUpdateStatus(task.id, status, reason);
    } else if (status === 'blocked') {
      const reason = prompt('Por favor, ingresa el motivo del bloqueo de la tarea:');
      if (reason === null) return;
      if (!reason.trim()) {
        alert('Debes ingresar el motivo.');
        return;
      }
      onUpdateStatus(task.id, status, reason);
    } else {
      onUpdateStatus(task.id, status);
    }
  };

  const handleDueDateBlur = () => {
    if (onUpdateDueDate && dueDateInput !== (task.due_date || '')) {
      onUpdateDueDate(task.id, dueDateInput);
    }
  };

  const isLocalTask = task.source === 'custom' || task.source_classification === 'local';
  const officialMetadata = task.template_key ? OFFICIAL_TASK_METADATA_BY_KEY.get(task.template_key) : undefined;

  const references = officialMetadata?.source_refs ?? task.source_refs ?? [];
  const quotes = officialMetadata?.source_quotes ?? task.source_quotes ?? [];
  const instructionBasis = officialMetadata?.instruction_basis ?? task.instruction_basis;
  const classification = officialMetadata?.source_classification ?? task.source_classification ?? (isLocalTask ? 'local' : 'direct');

  const classificationBadgeText = isLocalTask
    ? 'Tarea local'
    : CLASSIFICATION_LABELS[classification] || 'Instrucción oficial';

  const currentAssignedOption = ASSIGNED_OPTIONS.find((opt) => opt.value === task.assigned_to) || ASSIGNED_OPTIONS[0];

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-dialog-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl sm:rounded-4xl shadow-2xl w-[min(96vw,1100px)] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO FIJO (shrink-0) */}
        <div className="shrink-0 p-6 sm:p-8 pb-4 border-b border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Superintendencia de Alojamiento</span>
              <span>•</span>
              <span className="text-(--institutional-blue)">
                {task.phase === 'before' ? 'Antes de la asamblea' : task.phase === 'during' ? 'Durante la asamblea' : 'Después de la asamblea'}
              </span>
            </div>
            <h3 id="task-dialog-title" className="text-lg sm:text-2xl font-black text-(--page-text) leading-tight">
              {task.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* CUERPO CON SCROLL ÚNICO (flex-1 overflow-y-auto) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(290px,340px)] gap-6 sm:gap-8">
            {/* COLUMNA IZQUIERDA: Descripción, Fundamento, Subtareas y Observaciones */}
            <div className="min-w-0 space-y-6">
              {/* Descripción */}
              {task.description && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Descripción de la Tarea</span>
                  <p className="text-xs sm:text-sm text-(--text-muted) leading-relaxed bg-slate-50 dark:bg-slate-800/10 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                    {task.description}
                  </p>
                </div>
              )}

              {/* RECUADRO FUNDAMENTO DE LA TAREA */}
              <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-blue-500/15">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <BookOpen size={15} />
                    Fundamento de la Tarea
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-500/10 dark:bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-500/20">
                    {classificationBadgeText}
                  </span>
                </div>

                {/* TAREA OFICIAL */}
                {!isLocalTask && (
                  <div className="space-y-4">
                    {/* CHIPS DE REFERENCIAS */}
                    {references.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {references.map((ref, idx) => (
                          <span
                            key={idx}
                            title={`${ref.document}${ref.chapter ? ` · Cap. ${ref.chapter}` : ''}${ref.paragraphs ? `, párrs. ${ref.paragraphs}` : ''}`}
                            className="text-[11px] font-black px-3 py-1 rounded-lg bg-blue-600/15 dark:bg-blue-400/20 text-blue-900 dark:text-blue-200 border border-blue-500/30"
                          >
                            {ref.displayLabel}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CITAS DOCUMENTALES TEXTUALES CORTAS */}
                    {quotes.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        {quotes.map((sq, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-blue-500/20 space-y-1 shadow-xs">
                            <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest block">
                              Cita Documental — {sq.reference}
                            </span>
                            <p className="text-xs sm:text-sm text-(--page-text) leading-relaxed italic font-medium">
                              "{sq.quote}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* APLICACIÓN DE LA INSTRUCCIÓN / RESUMEN OPERATIVO */}
                    {instructionBasis && (
                      <div className="space-y-1.5 pt-3 border-t border-blue-500/15">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          {classification === 'operational_summary' ? 'Resumen Operativo' : 'Aplicación de la Instrucción'}
                        </span>
                        <p className="text-xs sm:text-sm text-(--page-text) leading-relaxed">
                          {instructionBasis}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAREA LOCAL */}
                {isLocalTask && (
                  <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      Tarea Local
                    </span>
                    <p className="text-xs sm:text-sm text-(--text-muted) leading-relaxed">
                      Esta tarea fue añadida para atender una necesidad específica de esta asamblea.
                    </p>
                  </div>
                )}
              </div>

              {/* SUBTAREAS */}
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

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {subtasks.length > 0 ? (
                    subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => onToggleSubtask(sub.id, !sub.is_completed)}
                        className={cn(
                          'flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800/40 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all',
                          sub.is_completed && 'opacity-70'
                        )}
                      >
                        <button
                          className={cn(
                            'w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all',
                            sub.is_completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-700'
                          )}
                        >
                          {sub.is_completed && <CheckCircle2 size={14} />}
                        </button>
                        <span className={cn('text-xs sm:text-sm text-(--page-text)', sub.is_completed && 'line-through text-(--text-muted)')}>
                          {sub.title}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">No hay subtareas registradas para esta actividad.</p>
                  )}
                </div>
              </div>

              {/* OBSERVACIONES / NOTAS */}
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

            {/* COLUMNA DERECHA: Estado, Prioridad, Responsable, Fecha Límite e Historial */}
            <div className="min-w-0 lg:min-w-[290px] space-y-6 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800/40 pt-6 lg:pt-0 lg:pl-6">
              {/* 1. ESTADO */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  <span>Estado de la Tarea</span>
                </label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold focus:outline-none text-(--page-text)"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En proceso</option>
                  <option value="blocked">Bloqueada</option>
                  <option value="completed">Completada</option>
                  <option value="not_applicable">No aplica</option>
                </select>
              </div>

              {/* 2. PRIORIDAD */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <ArrowUpRight size={12} />
                  <span>Prioridad</span>
                </label>
                <select
                  value={task.priority}
                  onChange={(e) => onUpdatePriority(task.id, e.target.value as Task['priority'])}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold focus:outline-none text-(--page-text)"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Importante</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              {/* 3. RESPONSABLE (Selector Personalizado Accesible Sin Truncamiento) */}
              <div className="space-y-1.5 relative" ref={assignMenuRef}>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <User size={12} />
                  <span>Responsable</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold text-left flex items-center justify-between gap-2 text-(--page-text) focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <span className="truncate">{currentAssignedOption.label}</span>
                  <ChevronDown size={16} className="shrink-0 text-slate-400" />
                </button>

                {/* Subtexto descriptivo del responsable */}
                <p className="text-[11px] text-(--text-muted) font-semibold pt-0.5">
                  {currentAssignedOption.subLabel}
                </p>

                {/* Menú Desplegable Personalizado */}
                {showAssignDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 space-y-1 max-h-60 overflow-y-auto">
                    {ASSIGNED_OPTIONS.map((opt) => {
                      const isSelected = opt.value === task.assigned_to;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            onUpdateAssignment(task.id, opt.value);
                            setShowAssignDropdown(false);
                          }}
                          className={cn(
                            'w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5',
                            isSelected
                              ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-(--page-text)'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold leading-tight">{opt.label}</div>
                            <div className="text-[10px] text-(--text-muted) leading-tight mt-0.5">{opt.subLabel}</div>
                          </div>
                          {isSelected && <Check size={16} className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. FECHA LÍMITE */}
              <div className="space-y-1.5">
                <label htmlFor="task-due-date" className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>Fecha Límite</span>
                </label>
                <input
                  type="date"
                  id="task-due-date"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  onBlur={handleDueDateBlur}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold focus:outline-none text-(--page-text)"
                />
              </div>

              {/* 5. HISTORIAL DE CAMBIOS (Multi-línea y Wrapping) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <History size={12} />
                  <span>Historial de Tarea</span>
                </label>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {taskActivities.length > 0 ? (
                    taskActivities.map((act) => (
                      <div key={act.id} className="relative flex items-start gap-2.5 text-[11px] leading-relaxed border-l-2 border-slate-200 dark:border-slate-800 pl-3 py-0.5 min-w-0">
                        <div className="space-y-0.5 min-w-0 wrap-break-word whitespace-normal">
                          <span className="font-bold text-(--page-text) block">{act.user_name}</span>
                          <p className="text-(--text-muted) wrap-break-word">
                            {ACTION_LABELS[act.action] || act.action}
                            {act.new_status && ` a "${STATUS_LABELS[act.new_status] || act.new_status}"`}
                          </p>
                          {act.comment && (
                            <p className="text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/20 p-2 rounded-lg mt-1 wrap-break-word">
                              "{act.comment}"
                            </p>
                          )}
                          <span className="text-[9px] text-slate-400 block pt-0.5">
                            {new Date(act.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
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
    </div>
  );
};
export default TaskDetailsDialog;
