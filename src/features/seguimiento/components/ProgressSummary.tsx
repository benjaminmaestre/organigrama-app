import React from 'react';
import { calculateProgress } from '../utils/calculateProgress';
import type { Task, DepartmentConfig, Issue } from '../types/tracking.types';
import { getDeptIcon } from '../../../lib/icons';
import { cn } from '../../../lib/cn';
import { AlertCircle, HelpCircle, CheckCircle2, RotateCw, ChevronDown, ChevronUp, BellRing } from 'lucide-react';

interface ProgressSummaryProps {
  tasks: Task[];
  issues: Issue[];
  configs: DepartmentConfig[];
  canViewSuperintendence: boolean;
  onConfigureDept: (code: 'installation' | 'transport-materials', status: DepartmentConfig['status']) => Promise<void>;
  onSelectDept: (code: string) => void;
}

const DEPARTMENTS_METADATA = [
  { code: 'accommodation', name: 'Alojamiento', optional: false },
  { code: 'information-volunteers', name: 'Información y S. Voluntario', optional: false },
  { code: 'installation', name: 'Instalación', optional: true },
  { code: 'cleaning', name: 'Limpieza', optional: false },
  { code: 'lost-found-cloakroom', name: 'Objetos Perdidos y Guardarropa', optional: false },
  { code: 'transport-materials', name: 'Transporte y Materiales', optional: true },
];

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  tasks,
  issues,
  configs,
  canViewSuperintendence,
  onConfigureDept,
  onSelectDept,
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(() => {
    const saved = sessionStorage.getItem('progress_summary_expanded');
    return saved === 'true';
  });

  const handleToggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      sessionStorage.setItem('progress_summary_expanded', String(next));
      return next;
    });
  };

  const getOptionalStatus = React.useCallback((code: string) => {
    return configs.find((c) => c.department_code === code)?.status || 'active';
  }, [configs]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtrar tareas activas a nivel global (excluyendo departamentos marcados como no aplicables y tareas 'not_applicable')
  const activeGlobalTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === 'not_applicable') return false;
      if (t.department_code === 'installation' && getOptionalStatus('installation') !== 'active') return false;
      if (t.department_code === 'transport-materials' && getOptionalStatus('transport-materials') !== 'active') return false;
      return true;
    });
  }, [tasks, getOptionalStatus]);

  const globalProgress = calculateProgress(activeGlobalTasks);

  // Guardamos la marca de tiempo actual del render para usarla en los hooks de forma pura
  const nowMs = React.useMemo(() => Date.now(), []);

  // Alertas de la Superintendencia
  const superintendencyAlerts = React.useMemo(() => {
    const superTasks = tasks.filter((t) => t.department_code === 'committee' || t.department_code === 'supervision');
    
    // Tareas propias urgentes, vencidas o bloqueadas
    const urgentTasks = superTasks.filter((t) => t.status !== 'completed' && t.status !== 'not_applicable' && t.priority === 'urgent');
    const overdueTasks = superTasks.filter((t) => t.status !== 'completed' && t.status !== 'not_applicable' && t.due_date && t.due_date < todayStr);
    const blockedTasks = superTasks.filter((t) => t.status === 'blocked');

    // Incidencias urgentes o vencidas de cualquiera de los otros departamentos (no resueltas)
    const openUrgentIssues = issues.filter((i) => i.status !== 'resolved' && i.level === 'urgent');

    // Departamentos sin actualización reciente (> 3 días)
    const inactiveDepartments: string[] = [];
    DEPARTMENTS_METADATA.forEach((dept) => {
      const deptTasks = tasks.filter((t) => t.department_code === dept.code);
      if (deptTasks.length > 0) {
        const lastUpdate = deptTasks.reduce((latest, t) => {
          const tDate = new Date(t.updated_at).getTime();
          return tDate > latest ? tDate : latest;
        }, 0);
        const days = lastUpdate > 0 ? Math.floor((nowMs - lastUpdate) / (1000 * 60 * 60 * 24)) : 999;
        if (days > 3) {
          inactiveDepartments.push(dept.name);
        }
      }
    });

    return {
      urgentTasksCount: urgentTasks.length,
      overdueTasksCount: overdueTasks.length,
      blockedTasksCount: blockedTasks.length,
      urgentIssuesCount: openUrgentIssues.length,
      inactiveDeptCount: inactiveDepartments.length,
      inactiveDeptNames: inactiveDepartments,
    };
  }, [tasks, issues, todayStr, nowMs]);

  // Construcción de la lista de departamentos e información de progreso
  const departmentGroups = React.useMemo(() => {
    const list = [];

    // 1. Superintendencia de Alojamiento (siempre primero)
    if (canViewSuperintendence) {
      const superTasks = tasks.filter((t) => t.department_code === 'committee' || t.department_code === 'supervision');
      const progress = calculateProgress(superTasks);
      
      const totalAlerts = 
        superintendencyAlerts.urgentTasksCount + 
        superintendencyAlerts.overdueTasksCount + 
        superintendencyAlerts.blockedTasksCount +
        superintendencyAlerts.urgentIssuesCount;

      list.push({
        code: 'superintendence',
        name: 'Superintendencia de Alojamiento',
        isSuperintendency: true,
        optional: false,
        progress,
        isNotApplicable: false,
        hasAlerts: totalAlerts > 0,
        alertText: totalAlerts > 0 ? `${totalAlerts} alertas críticas` : '',
      });
    }

    // 2. Departamentos tradicionales
    DEPARTMENTS_METADATA.forEach((dept) => {
      const optionalStatus = dept.optional ? getOptionalStatus(dept.code) : 'active';
      const isNotApplicable = optionalStatus !== 'active';
      
      // Alojamiento solo calcula tareas de department_code = 'accommodation'
      const deptTasks = tasks.filter((t) => t.department_code === dept.code);
      const progress = calculateProgress(deptTasks);

      const overdueCount = deptTasks.filter((t) => t.status !== 'completed' && t.status !== 'not_applicable' && t.due_date && t.due_date < todayStr).length;
      const deptOpenIssues = issues.filter((i) => i.department_code === dept.code && i.status !== 'resolved');
      const hasCriticalIssues = deptOpenIssues.some((i) => i.level === 'urgent');

      list.push({
        code: dept.code,
        name: dept.name,
        isSuperintendency: false,
        optional: dept.optional,
        progress,
        isNotApplicable,
        hasAlerts: overdueCount > 0 || hasCriticalIssues,
        alertText: overdueCount > 0 
          ? `${overdueCount} atrasada(s)` 
          : hasCriticalIssues 
          ? 'Incidencia urgente' 
          : '',
      });
    });

    return list;
  }, [tasks, issues, canViewSuperintendence, superintendencyAlerts, todayStr, getOptionalStatus]);

  // Selección de departamentos para mostrar en móvil en modo colapsado
  const visibleMobileDepartments = React.useMemo(() => {
    // Si está expandido, mostramos todo
    if (isExpanded) return departmentGroups;

    // Si está colapsado, mostramos siempre la Superintendencia, y departamentos con alertas o el menor avance
    const result: Array<typeof departmentGroups[number]> = [];
    
    // Superintendencia primero
    const superintendence = departmentGroups.find(d => d.isSuperintendency);
    if (superintendence) {
      result.push(superintendence);
    }

    // Filtrar los demás departamentos que tienen alertas
    const others = departmentGroups.filter(d => !d.isSuperintendency && !d.isNotApplicable);
    const withAlerts = others.filter(d => d.hasAlerts);
    result.push(...withAlerts);

    // Si no sumamos al menos 3 grupos en total (incluyendo Superintendencia), rellenar con los de menor avance
    if (result.length < 3) {
      const sortedByProgress = [...others]
        .filter(d => !result.some(r => r.code === d.code))
        .sort((a, b) => a.progress.percentage - b.progress.percentage);
      
      const needed = 3 - result.length;
      result.push(...sortedByProgress.slice(0, needed));
    }

    return result;
  }, [departmentGroups, isExpanded]);

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      
      {/* CARD PRINCIPAL - AVANCE GLOBAL */}
      <div className="relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center sm:text-left space-y-0.5">
            <h2 className="text-base sm:text-lg font-black text-(--page-text) tracking-tight">Avance General</h2>
            <p className="text-[10px] sm:text-xs text-(--text-muted) max-w-sm">
              Progreso acumulado de responsabilidades activas.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
            {/* Círculo de Progreso (Visible en Tablets/Desktop, Oculto en Móvil) */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  className="stroke-(--institutional-blue) transition-all duration-1000 ease-out"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - globalProgress.percentage / 100)}`}
                  style={{
                    strokeLinecap: 'round',
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm sm:text-base font-black text-(--page-text)">{globalProgress.percentage}%</span>
                <span className="text-[8px] text-(--text-muted) uppercase font-bold tracking-wider">Listo</span>
              </div>
            </div>

            {/* Contadores Rápidos de Progreso (Súper Compactos) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                <span>{globalProgress.completed} hechas</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <RotateCw size={13} className="animate-spin-slow" />
                <span>{globalProgress.inProgress} en curso</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <HelpCircle size={13} />
                <span>{globalProgress.pending} pendientes</span>
              </div>
              {globalProgress.overdue > 0 && (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold animate-pulse">
                  <AlertCircle size={13} />
                  <span>{globalProgress.overdue} vencidas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESO POR DEPARTAMENTO */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3.5">
          <h3 className="text-xs font-black text-(--page-text) uppercase tracking-wider">
            Progreso por Departamento
          </h3>
          {/* Botón de expandir/contraer en móvil */}
          <button
            onClick={handleToggleExpand}
            className="sm:hidden inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest"
          >
            {isExpanded ? (
              <>
                <span>Mostrar resumen</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>Ver los 7 grupos</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>

        {/* Grilla flexible y adaptada. En iPad vertical se dividirá en 2 columnas, con Superintendencia ocupando la primera fila completa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
          {(window.innerWidth < 640 ? visibleMobileDepartments : departmentGroups).map((dept) => {
            const isNotApplicable = dept.isNotApplicable;
            const progress = dept.progress;

            return (
              <div
                key={dept.code}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between min-h-[58px] sm:min-h-[72px] relative overflow-hidden group select-none",
                  dept.isSuperintendency
                    ? "bg-blue-50/40 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 hover:border-blue-400/50 hover:shadow-xs cursor-pointer sm:col-span-2 lg:col-span-3"
                    : isNotApplicable
                    ? "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800/40 opacity-50"
                    : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/80 dark:border-slate-800/50 hover:border-(--institutional-blue)/30 hover:shadow-xs cursor-pointer"
                )}
                onClick={() => !isNotApplicable && onSelectDept(dept.code)}
              >
                {/* Cabecera del Item */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-(--page-text)">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-all",
                      dept.isSuperintendency
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        : isNotApplicable
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105"
                    )}>
                      {getDeptIcon(dept.isSuperintendency ? 'Comité' : dept.name, 14)}
                    </div>
                    <span className="truncate max-w-[170px] sm:max-w-xs">{dept.name}</span>
                  </div>

                  {/* Configuración de departamentos opcionales */}
                  {dept.optional ? (
                    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700">
                        <select
                          value={getOptionalStatus(dept.code)}
                          onChange={(e) =>
                            onConfigureDept(
                              dept.code as 'installation' | 'transport-materials',
                              e.target.value as DepartmentConfig['status']
                            )
                          }
                          className="bg-transparent border-none focus:outline-none cursor-pointer pr-1 uppercase text-[9px] font-black focus:ring-0 text-slate-600 dark:text-slate-300"
                        >
                          <option value="active">Activo</option>
                          <option value="not_required">Excluido</option>
                          <option value="not_applicable">N/A</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] font-black text-(--page-text)">{progress.percentage}%</span>
                  )}
                </div>

                {/* Cuerpo del Item: Barra de Progreso y Estadísticas / Alertas */}
                {isNotApplicable ? (
                  <div className="text-[9px] font-semibold text-slate-400 italic mt-1.5 flex items-center gap-1">
                    <AlertCircle size={10} />
                    <span>No aplica</span>
                  </div>
                ) : (
                  <div className="space-y-1 mt-1.5">
                    {/* Barra de progreso de 4px */}
                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 ease-out",
                          dept.isSuperintendency 
                            ? "bg-blue-600 dark:bg-blue-400" 
                            : "bg-linear-to-r from-blue-500 to-indigo-600"
                        )}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>

                    {/* Información y Alertas */}
                    <div className="flex items-center justify-between text-[9px] text-(--text-muted) font-semibold flex-wrap gap-x-2 gap-y-0.5">
                      <span>{progress.completed} hechas · {progress.pending + progress.inProgress} pendientes</span>
                      
                      {dept.hasAlerts && (
                        <span className="text-red-500 font-bold animate-pulse flex items-center gap-0.5">
                          <AlertCircle size={10} />
                          {dept.alertText}
                        </span>
                      )}
                    </div>

                    {/* Alertas específicas de la Superintendencia (Tareas Propias vs Alertas de Supervisión) */}
                    {dept.isSuperintendency && (
                      <div className="border-t border-blue-500/10 pt-1.5 mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-black text-blue-700 dark:text-blue-300">
                        {superintendencyAlerts.urgentTasksCount > 0 && (
                          <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400 animate-pulse">
                            ⚠ {superintendencyAlerts.urgentTasksCount} tareas urgentes propias
                          </span>
                        )}
                        {superintendencyAlerts.overdueTasksCount > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold">
                            ◷ {superintendencyAlerts.overdueTasksCount} vencidas propias
                          </span>
                        )}
                        {superintendencyAlerts.blockedTasksCount > 0 && (
                          <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-bold">
                            ● {superintendencyAlerts.blockedTasksCount} bloqueadas propias
                          </span>
                        )}
                        {superintendencyAlerts.urgentIssuesCount > 0 && (
                          <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400 animate-bounce">
                            <BellRing size={10} className="mt-0.5" />
                            {superintendencyAlerts.urgentIssuesCount} incidencia(s) urgente(s)
                          </span>
                        )}
                        {superintendencyAlerts.inactiveDeptCount > 0 && (
                          <span className="text-slate-500 dark:text-slate-400">
                            💤 {superintendencyAlerts.inactiveDeptCount} depto(s) inactivo(s)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ProgressSummary;
