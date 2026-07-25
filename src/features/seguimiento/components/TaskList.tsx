import React from 'react';
import type { Task, Subtask } from '../types/tracking.types';
import { TaskCard } from './TaskCard';
import { Search, Plus, X, Filter, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { getDeptIcon } from '../../../lib/icons';
import { cn } from '../../../lib/cn';

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

const CATEGORY_GROUPS = [
  { code: 'committee', name: 'Responsabilidades del Comité' },
  { code: 'supervision', name: 'Supervisión General' },
  { code: 'accommodation', name: 'Departamento de Alojamiento' },
  { code: 'information-volunteers', name: 'Información y Servicio Voluntario' },
  { code: 'installation', name: 'Instalación' },
  { code: 'cleaning', name: 'Limpieza' },
  { code: 'lost-found-cloakroom', name: 'Objetos Perdidos y Guardarropa' },
  { code: 'transport-materials', name: 'Transporte y Materiales' },
];

const DEPARTMENTS_FOR_FILTER = [
  { code: 'superintendence', name: 'Superintendencia de Alojamiento' },
  { code: 'accommodation', name: 'Alojamiento' },
  { code: 'information-volunteers', name: 'Información y S. Voluntario' },
  { code: 'installation', name: 'Instalación' },
  { code: 'cleaning', name: 'Limpieza' },
  { code: 'lost-found-cloakroom', name: 'Objetos Perdidos y Guardarropa' },
  { code: 'transport-materials', name: 'Transporte y Materiales' },
];

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
  const [sourceFilter, setSourceFilter] = React.useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

  // Estado de colapsables por categoría (por defecto todos desplegados)
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
    committee: true,
    supervision: true,
    accommodation: true,
    'information-volunteers': true,
    installation: true,
    cleaning: true,
    'lost-found-cloakroom': true,
    'transport-materials': true,
  });

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

  const toggleCategory = (code: string) => {
    setExpandedCategories((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Tareas pertenecientes a la fase activa
  const phaseTasks = React.useMemo(() => {
    return tasks.filter((t) => t.phase === activePhase);
  }, [tasks, activePhase]);

  // Avance global de la fase activa
  const activePhaseProgress = React.useMemo(() => {
    const valid = phaseTasks.filter((t) => t.status !== 'not_applicable');
    const completed = valid.filter((t) => t.status === 'completed').length;
    return { completed, total: valid.length };
  }, [phaseTasks]);

  // Filtrado general (usando el concepto de grupo virtual para selectedDept === 'superintendence')
  const filteredPhaseTasks = React.useMemo(() => {
    return phaseTasks
      .filter((t) => {
        if (!selectedDept) return true;
        if (selectedDept === 'superintendence') {
          return t.department_code === 'committee' || t.department_code === 'supervision';
        }
        return t.department_code === selectedDept;
      })
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
      })
      .filter((t) => {
        if (sourceFilter === 'all') return true;
        const isLocal = t.source === 'custom' || t.source_classification === 'local';
        if (sourceFilter === 'local') return isLocal;
        if (isLocal) return false;

        const hasCO1 = t.source_refs?.some((r) => r.document === 'CO-1');
        const hasCO80 = t.source_refs?.some((r) => r.document === 'CO-80');

        if (sourceFilter === 'co1') return Boolean(hasCO1);
        if (sourceFilter === 'co80') return Boolean(hasCO80);
        if (sourceFilter === 'co1_and_co80') return Boolean(hasCO1 && hasCO80);
        if (sourceFilter === 'pending') return (!t.source_refs || t.source_refs.length === 0);

        return true;
      });
  }, [phaseTasks, selectedDept, search, statusFilter, priorityFilter, assignedFilter, sourceFilter]);

  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (assignedFilter !== 'all') count++;
    if (sourceFilter !== 'all') count++;
    return count;
  }, [statusFilter, priorityFilter, assignedFilter, sourceFilter]);

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

  const phaseTitle = activePhase === 'before' ? 'ANTES DE LA ASAMBLEA' : activePhase === 'during' ? 'DURANTE LA ASAMBLEA' : 'DESPUÉS DE LA ASAMBLEA';

  // Obtener qué categorías son visibles según el filtro seleccionado
  const visibleGroups = React.useMemo(() => {
    if (!selectedDept) return CATEGORY_GROUPS;
    if (selectedDept === 'superintendence') {
      return CATEGORY_GROUPS.filter((g) => g.code === 'committee' || g.code === 'supervision');
    }
    return CATEGORY_GROUPS.filter((g) => g.code === selectedDept);
  }, [selectedDept]);

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      {/* CABECERA DE FASE CON CONTADOR GENERAL */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 sm:p-4 shadow-2xs">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-(--page-text) uppercase tracking-wider">{phaseTitle}</h3>
          <p className="text-[10px] text-(--text-muted) hidden xs:block">
            Checklist oficial precargado para esta etapa.
          </p>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs font-black text-(--page-text)">
          {activePhaseProgress.completed} de {activePhaseProgress.total} hechas
        </div>
      </div>

      {/* BARRA DE FILTROS RESUMIDA */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 w-full">
          <div className="relative group w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tareas en el checklist..."
              className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
            />
          </div>

          <div className="flex items-center gap-2 w-full">
            {/* Botón Filtros (N) */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shrink-0 select-none",
                activeFiltersCount > 0 || showAdvancedFilters
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400"
                  : "bg-transparent border-slate-200 dark:border-slate-800 text-(--text-muted) hover:text-(--page-text)"
              )}
            >
              <Filter size={13} />
              <span>Filtros {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>

            {/* Selector de Departamento */}
            <select
              value={selectedDept || ''}
              onChange={(e) => onSelectDept(e.target.value || null)}
              className="bg-(--input-bg) border border-(--border-color) text-(--page-text) rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold flex-1"
            >
              <option value="">Todos los Grupos</option>
              {DEPARTMENTS_FOR_FILTER.map((grp) => (
                <option key={grp.code} value={grp.code}>
                  {grp.name}
                </option>
              ))}
            </select>

            {selectedDept && (
              <button
                onClick={() => onSelectDept(null)}
                className="p-2 rounded-xl border border-red-500/15 text-red-500 hover:bg-red-500/10 transition-colors"
                aria-label="Limpiar filtro de departamento"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Panel Desplegable de Filtros Avanzados (Responsive) */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-850",
          showAdvancedFilters ? "flex" : "hidden sm:grid"
        )}>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Estado</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-(--input-bg) border border-(--border-color) text-(--page-text) rounded-lg py-1.5 px-2 text-xs focus:outline-none font-semibold w-full"
            >
              <option value="all">Todos los Estados</option>
              <option value="pending">Pendientes</option>
              <option value="in_progress">En proceso</option>
              <option value="blocked">Bloqueadas</option>
              <option value="completed">Completadas</option>
              <option value="overdue">Atrasadas / Vencidas</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Prioridad</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-(--input-bg) border border-(--border-color) text-(--page-text) rounded-lg py-1.5 px-2 text-xs focus:outline-none font-semibold w-full"
            >
              <option value="all">Todas las Prioridades</option>
              <option value="normal">Normal</option>
              <option value="important">Importante</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Responsable</span>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="bg-(--input-bg) border border-(--border-color) text-(--page-text) rounded-lg py-1.5 px-2 text-xs focus:outline-none font-semibold w-full"
            >
              <option value="all">Todos los Responsables</option>
              <option value="both">Ambos</option>
              <option value="superintendent">Jhonny F.</option>
              <option value="assistant">Benjamín P.</option>
              <option value="department_head">Sup. Depto.</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-0.5">Origen Documental</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-(--input-bg) border border-(--border-color) text-(--page-text) rounded-lg py-1.5 px-2 text-xs focus:outline-none font-semibold w-full"
            >
              <option value="all">Todas las Fuentes</option>
              <option value="co1">CO-1</option>
              <option value="co80">CO-80</option>
              <option value="co1_and_co80">CO-1 y CO-80</option>
              <option value="local">Tareas locales</option>
              <option value="pending">Sin referencias</option>
            </select>
          </div>

          {(activeFiltersCount > 0 || search) && (
            <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-1">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setAssignedFilter('all');
                  setSourceFilter('all');
                  setSearch('');
                }}
                className="text-red-500 hover:text-red-600 transition-colors uppercase text-[9px] font-black tracking-widest flex items-center gap-1 select-none py-1"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ENCABEZADO VIRTUAL DE LA SUPERINTENDENCIA */}
      {selectedDept === 'superintendence' && (
        <div className="p-3.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
          <h4 className="text-xs font-black text-blue-900 dark:text-blue-100 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={13} className="text-blue-600 dark:text-blue-400" />
            Superintendencia de Alojamiento
          </h4>
          <p className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">
            Mostrando responsabilidades y tareas como Comité de Asamblea y Supervisión General.
          </p>
        </div>
      )}

      {/* LISTADO DE TAREAS AGRUPADAS POR DEPARTAMENTO */}
      <div className="space-y-3.5">
        {visibleGroups.map((grp) => {
          const groupTasks = filteredPhaseTasks.filter((t) => t.department_code === grp.code);

          // Si hay filtro activo y este grupo no tiene tareas, no mostrar grupo vacío
          if (groupTasks.length === 0 && (search || statusFilter !== 'all' || priorityFilter !== 'all' || assignedFilter !== 'all' || sourceFilter !== 'all')) {
            return null;
          }

          // Todos los ítems del grupo en la fase
          const allGroupPhaseTasks = phaseTasks.filter((t) => t.department_code === grp.code);
          const completedCount = allGroupPhaseTasks.filter((t) => t.status === 'completed').length;
          const totalCount = allGroupPhaseTasks.length;

          const isExpanded = expandedCategories[grp.code] ?? true;

          return (
            <div key={grp.code} className="space-y-2">
              {/* ACCORDION HEADER */}
              <div
                onClick={() => toggleCategory(grp.code)}
                className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-all select-none shadow-3xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {getDeptIcon(grp.name, 14)}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-(--page-text)">{grp.name}</span>
                </div>

                <div className="text-[10px] font-black text-(--text-muted) bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                  {completedCount}/{totalCount}
                </div>
              </div>

              {/* CONTENIDO DEL GRUPO */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 sm:pl-1">
                  {groupTasks.length > 0 ? (
                    groupTasks.map((task) => (
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
                    <div className="md:col-span-2 text-center py-4 text-slate-400 dark:text-slate-500 font-semibold italic text-[11px] bg-slate-50/30 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-250 dark:border-slate-800">
                      No hay tareas registradas en este departamento para la etapa seleccionada.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TAREA PERSONALIZADA (ACCIÓN SECUNDARIA AL FINAL) */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        {!showAddForm ? (
          <div className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <div>
              <h5 className="text-[11px] font-bold text-(--page-text)">¿Necesitas agregar una tarea extraordinaria?</h5>
              <p className="text-[10px] text-(--text-muted)">Las tareas personalizadas son opcionales y adicionales al checklist oficial.</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-(--page-text) rounded-lg font-bold transition-all text-[11px] shrink-0"
            >
              <Plus size={14} />
              <span>Añadir</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-md w-full"
          >
            <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-slate-100 dark:border-slate-800/40">
              <h4 className="text-xs font-black text-(--page-text) uppercase tracking-wider">Nueva Tarea Personalizada</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Comprar baterías de repuesto para megáfonos"
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Descripción (Opcional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detalles adicionales..."
                  rows={2}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-(--page-text)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Departamento</label>
                <select
                  value={newDept}
                  onChange={(e) => {
                    const val = e.target.value as Task['department_code'];
                    setNewDept(val);
                    if (val === 'committee') setNewType('committee');
                    else if (val === 'supervision') setNewType('supervision');
                    else setNewType('direct_accommodation');
                  }}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs focus:outline-none text-(--page-text)"
                >
                  {CATEGORY_GROUPS.map((grp) => (
                    <option key={grp.code} value={grp.code}>
                      {grp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tipo de Responsabilidad</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Task['responsibility_type'])}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs focus:outline-none text-(--page-text)"
                >
                  <option value="direct_accommodation">Directa (Alojamiento)</option>
                  <option value="supervision">Supervisión</option>
                  <option value="committee">Comité</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Prioridad</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs focus:outline-none text-(--page-text)"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Importante</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Responsable</label>
                <select
                  value={newAssigned}
                  onChange={(e) => setNewAssigned(e.target.value as Task['assigned_to'])}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs focus:outline-none text-(--page-text)"
                >
                  <option value="both">Ambos (Jhonny y Benjamín)</option>
                  <option value="superintendent">Jhonny F. (Superintendente)</option>
                  <option value="assistant">Benjamín P. (Auxiliar)</option>
                  <option value="department_head">Superintendente de Depto.</option>
                </select>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Fecha Límite</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2 px-3 text-xs focus:outline-none text-(--page-text)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-slate-350 dark:border-slate-800 text-slate-650 dark:text-slate-400 rounded-lg font-bold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3.5 py-1.5 bg-(--institutional-blue) hover:brightness-110 text-white rounded-lg font-bold text-[11px] disabled:opacity-50 select-none"
              >
                {isSubmitting ? 'Creando...' : 'Crear Tarea'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default TaskList;
