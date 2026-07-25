import React from 'react';
import type { Task, Subtask } from '../types/tracking.types';
import { TaskCard } from './TaskCard';
import { Search, Plus, X, Filter } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  subtasks: Record<string, Subtask[]>;
  activePhase: Task['phase'];
  selectedDept: string | null;
  onSelectDept: (dept: string | null) => void;
  onToggleComplete: (taskId: string, isCompleted: boolean) => Promise<void>;
  onStatusChange: (taskId: string, status: Task['status'], comment?: string) => Promise<void>;
  onOpenDetails: (task: Task) => void;
  onCreateTask: (
    title: string,
    description: string,
    phase: Task['phase'],
    departmentCode: Task['department_code'],
    responsibilityType: Task['responsibility_type'],
    priority: Task['priority'],
    assignedTo: Task['assigned_to'],
    dueDate?: string
  ) => Promise<void>;
}

const DEPT_LABELS: Record<string, string> = {
  committee: 'Comité',
  supervision: 'Supervisión Gral.',
  accommodation: 'Alojamiento',
  'information-volunteers': 'Información',
  installation: 'Instalación',
  cleaning: 'Limpieza',
  'lost-found-cloakroom': 'Objetos Perdidos',
  'transport-materials': 'Transporte',
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  subtasks,
  activePhase,
  selectedDept,
  onSelectDept,
  onToggleComplete,
  onStatusChange,
  onOpenDetails,
  onCreateTask,
}) => {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [assignedFilter, setAssignedFilter] = React.useState<string>('all');
  
  // Estado para la creación de tareas personalizadas
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newDept, setNewDept] = React.useState<Task['department_code']>('accommodation');
  const [newType, setNewType] = React.useState<Task['responsibility_type']>('direct_accommodation');
  const [newPriority, setNewPriority] = React.useState<Task['priority']>('normal');
  const [newAssigned, setNewAssigned] = React.useState<Task['assigned_to']>('both');
  const [newDueDate, setNewDueDate] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filtrado de tareas
  const filteredTasks = React.useMemo(() => {
    return tasks
      .filter((t) => t.phase === activePhase)
      .filter((t) => (selectedDept ? t.department_code === selectedDept : true))
      .filter((t) => {
        if (!search.trim()) return true;
        const normSearch = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(normSearch) ||
          t.description?.toLowerCase().includes(normSearch)
        );
      })
      .filter((t) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'overdue') {
          const todayStr = new Date().toISOString().split('T')[0];
          return t.status !== 'completed' && t.status !== 'not_applicable' && t.due_date && t.due_date < todayStr;
        }
        return t.status === statusFilter;
      })
      .filter((t) => {
        if (priorityFilter === 'all') return true;
        return t.priority === priorityFilter;
      })
      .filter((t) => {
        if (assignedFilter === 'all') return true;
        return t.assigned_to === assignedFilter;
      });
  }, [tasks, activePhase, selectedDept, search, statusFilter, priorityFilter, assignedFilter]);

  // Ordenación de tareas:
  // 1. Atrasadas (Overdue)
  // 2. Prioridad Urgente
  // 3. En Proceso
  // 4. Pendiente
  // 5. Completadas
  // 6. No Aplican
  const sortedTasks = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return [...filteredTasks].sort((a, b) => {
      const aOverdue = a.status !== 'completed' && a.status !== 'not_applicable' && a.due_date && a.due_date < todayStr;
      const bOverdue = b.status !== 'completed' && b.status !== 'not_applicable' && b.due_date && b.due_date < todayStr;

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      const priorityOrder = { urgent: 0, important: 1, normal: 2 };
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      if (a.status !== 'completed' && b.status !== 'completed') {
        if (aPriority !== bPriority) return aPriority - bPriority;
      }

      const statusOrder = { blocked: 0, in_progress: 1, pending: 2, completed: 3, not_applicable: 4 };
      const aStatus = statusOrder[a.status as keyof typeof statusOrder] ?? 2;
      const bStatus = statusOrder[b.status as keyof typeof statusOrder] ?? 2;
      return aStatus - bStatus;
    });
  }, [filteredTasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Ingresa el título de la tarea.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreateTask(
        newTitle,
        newDesc,
        activePhase,
        newDept,
        newType,
        newPriority,
        newAssigned,
        newDueDate
      );
      setNewTitle('');
      setNewDesc('');
      setNewDueDate('');
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* BARRA DE FILTROS */}
      <div className="bg-white/40 dark:bg-slate-900/10 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
        {/* Fila 1: Buscar y Filtro Departamento */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDept || ''}
              onChange={(e) => onSelectDept(e.target.value || null)}
              className="bg-(--input-bg) border border-(--border-color) text-(--page-text) rounded-xl py-2.5 px-3.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
            >
              <option value="">Todos los Departamentos</option>
              {Object.keys(DEPT_LABELS).map((code) => (
                <option key={code} value={code}>
                  {DEPT_LABELS[code]}
                </option>
              ))}
            </select>
            {selectedDept && (
              <button
                onClick={() => onSelectDept(null)}
                className="p-2.5 rounded-xl border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-colors"
                aria-label="Limpiar filtro de departamento"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Filtros de Estado, Prioridad y Asignado */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800/40 pt-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-(--text-muted)">
            <Filter size={14} />
            <span>Filtros avanzados:</span>
          </div>

          {/* Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-b border-slate-300 dark:border-slate-700 text-(--page-text) py-1.5 focus:outline-none focus:border-blue-500 font-bold"
          >
            <option value="all">Cualquier Estado</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En proceso</option>
            <option value="blocked">Bloqueada</option>
            <option value="completed">Completada</option>
            <option value="overdue">Atrasada / Vencida</option>
          </select>

          {/* Prioridad */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent border-b border-slate-300 dark:border-slate-700 text-(--page-text) py-1.5 focus:outline-none focus:border-blue-500 font-bold"
          >
            <option value="all">Cualquier Prioridad</option>
            <option value="normal">Normal</option>
            <option value="important">Importante</option>
            <option value="urgent">Urgente</option>
          </select>

          {/* Asignado */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="bg-transparent border-b border-slate-300 dark:border-slate-700 text-(--page-text) py-1.5 focus:outline-none focus:border-blue-500 font-bold"
          >
            <option value="all">Cualquier Responsable</option>
            <option value="superintendent">Jhonny F.</option>
            <option value="assistant">Benjamín P.</option>
            <option value="both">Ambos</option>
            <option value="department_head">Sup. Depto.</option>
          </select>

          {/* Botón de limpiar filtros generales */}
          {(statusFilter !== 'all' || priorityFilter !== 'all' || assignedFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setAssignedFilter('all');
                setSearch('');
              }}
              className="ml-auto text-red-500 hover:text-red-600 transition-colors uppercase text-[10px] font-black tracking-wider"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* BOTÓN Y FORMULARIO DE NUEVA TAREA */}
      <div className="w-full">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto bg-(--institutional-blue) hover:brightness-110 active:brightness-95 text-white rounded-2xl font-bold transition-all shadow-md active:scale-98 text-sm"
          >
            <Plus size={18} />
            <span>Añadir Tarea Personalizada</span>
          </button>
        ) : (
          <form
            onSubmit={handleCreate}
            className="bg-white/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg w-full"
          >
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
              <h4 className="text-sm font-black text-(--page-text) uppercase tracking-wider">Nueva Tarea</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Revisar inventario final de Limpieza"
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Descripción (Opcional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detalles adicionales..."
                  rows={2}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Departamento</label>
                <select
                  value={newDept}
                  onChange={(e) => {
                    const val = e.target.value as Task['department_code'];
                    setNewDept(val);
                    // Mapeo automático de responsabilidad para ahorrar clics
                    if (val === 'committee') setNewType('committee');
                    else if (val === 'supervision') setNewType('supervision');
                    else setNewType('direct_accommodation');
                  }}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-sm focus:outline-none text-(--page-text)"
                >
                  {Object.keys(DEPT_LABELS).map((code) => (
                    <option key={code} value={code}>
                      {DEPT_LABELS[code]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tipo de Responsabilidad</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Task['responsibility_type'])}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-sm focus:outline-none text-(--page-text)"
                >
                  <option value="direct_accommodation">Directa (Alojamiento)</option>
                  <option value="supervision">Supervisión</option>
                  <option value="committee">Comité</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Prioridad</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-sm focus:outline-none text-(--page-text)"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Importante</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Responsable</label>
                <select
                  value={newAssigned}
                  onChange={(e) => setNewAssigned(e.target.value as Task['assigned_to'])}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-sm focus:outline-none text-(--page-text)"
                >
                  <option value="both">Ambos (Jhonny y Benjamín)</option>
                  <option value="superintendent">Jhonny F. (Superintendente)</option>
                  <option value="assistant">Benjamín P. (Auxiliar)</option>
                  <option value="department_head">Superintendente de Depto.</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fecha Límite</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-sm focus:outline-none text-(--page-text)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-(--institutional-blue) hover:brightness-110 text-white rounded-xl font-bold text-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Creando...' : 'Crear Tarea'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* LISTADO DE TARJETAS ORDENADAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              subtasks={subtasks[task.id] || []}
              onToggleComplete={onToggleComplete}
              onStatusChange={onStatusChange}
              onOpenDetails={onOpenDetails}
            />
          ))
        ) : (
          <div className="md:col-span-2 text-center py-12 text-slate-400 dark:text-slate-500 font-semibold italic bg-white/20 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80">
            No se encontraron tareas con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};
export default TaskList;
