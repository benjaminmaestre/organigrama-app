import React from 'react';
import type { Task, Subtask } from '../types/tracking.types';
import { cn } from '../../../lib/cn';
import { Check, Clock, AlertTriangle, Shield, CheckSquare, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  subtasks: Subtask[];
  onToggleComplete: (taskId: string, isCompleted: boolean) => Promise<void>;
  onStatusChange: (taskId: string, status: Task['status'], comment?: string) => Promise<void>;
  onOpenDetails: (task: Task) => void;
}

const PRIORITY_STYLES = {
  normal: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  important: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200/50',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200/50 animate-pulse',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  blocked: 'Bloqueada',
  completed: 'Completada',
  not_applicable: 'No aplica',
};

const ASSIGNED_LABELS = {
  superintendent: 'Jhonny F.',
  assistant: 'Benjamín P.',
  both: 'Ambos',
  department_head: 'Sup. Depto.',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  subtasks,
  onToggleComplete,
  onStatusChange,
  onOpenDetails,
}) => {
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isCompleted = task.status === 'completed';
  const isNotApplicable = task.status === 'not_applicable';

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.status !== 'completed' && task.status !== 'not_applicable' && task.due_date && task.due_date < todayStr;

  // Estadísticas de subtareas
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.is_completed).length;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id, !isCompleted);
  };

  const handleStatusSelect = (status: Task['status']) => {
    if (status === 'not_applicable') {
      const reason = prompt('Por favor, ingresa una justificación para marcar esta tarea como "No aplica":');
      if (reason === null) return; // Cancelado
      if (!reason.trim()) {
        alert('Debes ingresar una justificación.');
        return;
      }
      onStatusChange(task.id, status, reason);
    } else if (status === 'blocked') {
      const reason = prompt('Por favor, ingresa el motivo del bloqueo de la tarea:');
      if (reason === null) return;
      if (!reason.trim()) {
        alert('Debes ingresar el motivo.');
        return;
      }
      onStatusChange(task.id, status, reason);
    } else {
      onStatusChange(task.id, status);
    }
    setShowStatusMenu(false);
  };

  return (
    <div
      onClick={() => onOpenDetails(task)}
      className={cn(
        "relative p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col gap-4 group scroll-mt-28 w-full",
        isCompleted && "bg-slate-50 dark:bg-slate-950/20 opacity-75 border-emerald-100/60 dark:border-emerald-950/20",
        isNotApplicable && "opacity-55 bg-slate-100 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800/40",
        isOverdue && "border-red-200 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10"
      )}
    >
      <div className="flex items-start gap-3 w-full">
        {/* Checkbox Táctil y Grande */}
        <button
          onClick={handleCheckboxClick}
          disabled={isNotApplicable}
          className={cn(
            "w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all select-none min-w-[28px] min-h-[28px] active:scale-90",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : isNotApplicable
                ? "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : isOverdue
                  ? "border-red-400 hover:border-red-500 hover:bg-red-500/10"
                  : "border-slate-300 hover:border-(--institutional-blue) dark:border-slate-700 dark:hover:border-(--institutional-blue) hover:bg-(--institutional-blue)/5"
          )}
        >
          {isCompleted && <Check size={18} strokeWidth={3} />}
        </button>

        {/* Info Tarea */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Responsabilidad */}
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {task.responsibility_type === 'committee'
                ? 'Comité'
                : task.responsibility_type === 'supervision'
                  ? 'Supervisión'
                  : 'Alojamiento'}
            </span>

            {/* Prioridad */}
            <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-transparent", PRIORITY_STYLES[task.priority])}>
              {task.priority}
            </span>
          </div>

          <h4 className={cn(
            "text-sm sm:text-base font-bold text-(--page-text) leading-tight transition-colors line-clamp-2",
            isCompleted && "line-through text-(--text-muted)"
          )}>
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-(--text-muted) line-clamp-2 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Menú de Estados (Status Select) */}
        <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => !isNotApplicable && setShowStatusMenu(!showStatusMenu)}
            disabled={isNotApplicable}
            className={cn(
              "p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none",
              isNotApplicable && "opacity-30 cursor-not-allowed"
            )}
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-30 py-1 backdrop-blur-xl"
              >
                {(Object.keys(STATUS_LABELS) as Task['status'][]).map((statusKey) => (
                  <button
                    key={statusKey}
                    onClick={() => handleStatusSelect(statusKey)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between",
                      task.status === statusKey
                        ? "text-(--institutional-blue) bg-slate-50 dark:bg-slate-800/50"
                        : "text-(--page-text)"
                    )}
                  >
                    <span>{STATUS_LABELS[statusKey]}</span>
                    {task.status === statusKey && <Check size={14} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Tarjeta */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/40 text-[11px] font-semibold text-(--text-muted)">
        {/* Due Date & Subtasks */}
        <div className="flex flex-wrap items-center gap-3">
          {task.due_date && (
            <div className={cn("flex items-center gap-1", isOverdue && "text-red-500 font-bold")}>
              <Clock size={12} />
              <span>
                {isOverdue ? 'Vencida: ' : ''}
                {task.due_date.split('-').reverse().join('/')}
              </span>
              {isOverdue && <AlertTriangle size={12} className="animate-pulse" />}
            </div>
          )}

          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-slate-500">
              <CheckSquare size={12} />
              <span>{completedSubtasks}/{totalSubtasks} subtareas</span>
            </div>
          )}
        </div>

        {/* Assigned and Badge Status */}
        <div className="flex items-center gap-2">
          {/* Badge Estado */}
          <span className={cn(
            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border",
            task.status === 'completed' && "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
            task.status === 'in_progress' && "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
            task.status === 'blocked' && "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
            task.status === 'pending' && "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent",
            task.status === 'not_applicable' && "bg-slate-200/50 dark:bg-slate-900 text-slate-400 border-transparent"
          )}>
            {STATUS_LABELS[task.status]}
          </span>

          {/* Asignado a */}
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg">
            <Shield size={10} />
            <span>{ASSIGNED_LABELS[task.assigned_to]}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
export default TaskCard;
