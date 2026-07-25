import React from 'react';
import { calculateProgress } from '../utils/calculateProgress';
import type { Task, DepartmentConfig } from '../types/tracking.types';
import { getDeptIcon } from '../../../lib/icons';
import { cn } from '../../../lib/cn';
import { AlertCircle, HelpCircle, CheckCircle2, RotateCw, Settings } from 'lucide-react';

interface ProgressSummaryProps {
  tasks: Task[];
  configs: DepartmentConfig[];
  onConfigureDept: (code: 'installation' | 'transport-materials', status: DepartmentConfig['status']) => Promise<void>;
  onSelectDept: (code: string) => void;
}

const DEPARTMENTS = [
  { code: 'accommodation', name: 'Alojamiento', optional: false },
  { code: 'information-volunteers', name: 'Información y S. Voluntario', optional: false },
  { code: 'installation', name: 'Instalación', optional: true },
  { code: 'cleaning', name: 'Limpieza', optional: false },
  { code: 'lost-found-cloakroom', name: 'Objetos Perdidos y Guardarropa', optional: false },
  { code: 'transport-materials', name: 'Transporte y Materiales', optional: true },
];

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  tasks,
  configs,
  onConfigureDept,
  onSelectDept,
}) => {
  const globalProgress = calculateProgress(tasks);

  // Obtener estado de configuración de los departamentos opcionales
  const getOptionalStatus = (code: 'installation' | 'transport-materials') => {
    return configs.find((c) => c.department_code === code)?.status || 'active';
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* CARD PRINCIPAL - AVANCE GLOBAL */}
      <div className="relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-(--page-text) tracking-tight">Avance General</h2>
            <p className="text-xs sm:text-sm text-(--text-muted) max-w-sm">
              Progreso acumulado de todas las responsabilidades activas para la asamblea.
            </p>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            {/* Círculo de Progreso Grande */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="stroke-(--institutional-blue) transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDasharray-offset={`${2 * Math.PI * 45 * (1 - globalProgress.percentage / 100)}`}
                  style={{
                    strokeDashoffset: 2 * Math.PI * 45 * (1 - globalProgress.percentage / 100),
                    strokeLinecap: 'round',
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-black text-(--page-text)">{globalProgress.percentage}%</span>
                <span className="text-[10px] text-(--text-muted) uppercase font-bold tracking-wider">Listo</span>
              </div>
            </div>

            {/* Contadores Rápidos */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={16} />
                <span>{globalProgress.completed} Completadas</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                <RotateCw size={16} className="animate-spin-slow" />
                <span>{globalProgress.inProgress} En proceso</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
                <HelpCircle size={16} />
                <span>{globalProgress.pending} Pendientes</span>
              </div>
              {globalProgress.overdue > 0 && (
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold animate-pulse">
                  <AlertCircle size={16} />
                  <span>{globalProgress.overdue} Vencidas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESO POR DEPARTAMENTO */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)] transition-all duration-300">
        <h3 className="text-lg font-black text-(--page-text) uppercase tracking-wider mb-6 border-b border-(--border-color) pb-3">
          Progreso por Departamento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEPARTMENTS.map((dept) => {
            const isOptional = dept.optional;
            const optionalStatus = isOptional
              ? getOptionalStatus(dept.code as 'installation' | 'transport-materials')
              : 'active';
            const isNotApplicable = optionalStatus !== 'active';

            const deptTasks = tasks.filter((t) => t.department_code === dept.code);
            const progress = calculateProgress(deptTasks);

            return (
              <div
                key={dept.code}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3 group relative overflow-hidden",
                  isNotApplicable
                    ? "bg-slate-100/70 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800/40 opacity-60"
                    : "bg-slate-50 dark:bg-slate-900/20 border-slate-200/80 dark:border-slate-800/50 hover:border-(--institutional-blue)/30 hover:shadow-lg cursor-pointer"
                )}
                onClick={() => !isNotApplicable && onSelectDept(dept.code)}
              >
                {/* Header Departamento */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-(--page-text)">
                    <div className={cn(
                      "p-2 rounded-xl transition-all",
                      isNotApplicable
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105"
                    )}>
                      {getDeptIcon(dept.name, 18)}
                    </div>
                    <span>{dept.name}</span>
                  </div>

                  {/* Selector para departamentos opcionales */}
                  {isOptional ? (
                    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Settings size={12} />
                        <select
                          value={optionalStatus}
                          onChange={(e) =>
                            onConfigureDept(
                              dept.code as 'installation' | 'transport-materials',
                              e.target.value as DepartmentConfig['status']
                            )
                          }
                          className="bg-transparent border-none focus:outline-none cursor-pointer pr-1 uppercase text-[10px] font-bold"
                        >
                          <option value="active">Activo</option>
                          <option value="not_required">No Requiere</option>
                          <option value="not_applicable">No Aplica</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-black text-(--page-text)">{progress.percentage}%</span>
                  )}
                </div>

                {/* Progress Bar / Not Applicable Status */}
                {isNotApplicable ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 italic py-2">
                    <AlertCircle size={14} />
                    <span>Departamento excluido para esta asamblea</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Barra */}
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    {/* Info */}
                    <div className="flex items-center justify-between text-[11px] text-(--text-muted) font-semibold">
                      <span>{progress.completed} completadas</span>
                      <span className="flex items-center gap-1">
                        {progress.pending + progress.inProgress} pendientes
                        {progress.overdue > 0 && (
                          <span className="text-red-500 font-bold animate-pulse">
                            • {progress.overdue} atrasada(s)
                          </span>
                        )}
                      </span>
                    </div>
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
