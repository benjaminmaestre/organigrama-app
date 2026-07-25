import React from 'react';
import type { Issue } from '../types/tracking.types';
import { cn } from '../../../lib/cn';
import { AlertCircle, CheckCircle2, RotateCw, Plus, X, ShieldAlert, Send } from 'lucide-react';

interface IssueTrackerProps {
  issues: Issue[];
  currentUserName: string;
  onCreateIssue: (departmentCode: string, description: string, level: Issue['level'], reportedBy: string) => Promise<void>;
  onResolveIssue: (issueId: string, status: Issue['status'], actionTaken?: string) => Promise<void>;
}

const DEPT_LABELS: Record<string, string> = {
  accommodation: 'Alojamiento',
  'information-volunteers': 'Información y S. Voluntario',
  installation: 'Instalación',
  cleaning: 'Limpieza',
  'lost-found-cloakroom': 'Objetos Perdidos',
  'transport-materials': 'Transporte y Materiales',
  committee: 'Comité',
  supervision: 'Supervisión Gral.',
};

const SEVERITY_STYLES = {
  normal: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  important: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-900/60',
  urgent: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900/60 animate-pulse',
};


export const IssueTracker: React.FC<IssueTrackerProps> = ({
  issues,
  currentUserName,
  onCreateIssue,
  onResolveIssue,
}) => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [department, setDepartment] = React.useState('accommodation');
  const [level, setLevel] = React.useState<Issue['level']>('normal');
  const [reportedBy, setReportedBy] = React.useState(currentUserName);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'active' | 'resolved'>('active');

  const filteredIssues = React.useMemo(() => {
    return issues.filter((i) => (activeTab === 'active' ? i.status !== 'resolved' : i.status === 'resolved'));
  }, [issues, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !reportedBy.trim()) {
      alert('Ingresa todos los datos requeridos.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreateIssue(department, description.trim(), level, reportedBy.trim());
      setDescription('');
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = (issueId: string) => {
    const action = prompt('Ingresa la acción tomada o la solución aplicada para esta incidencia:');
    if (action === null) return;
    if (!action.trim()) {
      alert('Debes ingresar la solución.');
      return;
    }
    onResolveIssue(issueId, 'resolved', action.trim());
  };

  const handleInProgress = (issueId: string) => {
    onResolveIssue(issueId, 'in_progress');
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)] transition-all duration-300 w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/40 mb-6">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-(--page-text) uppercase tracking-wider">
            Asuntos Pendientes e Incidencias
          </h3>
          <p className="text-xs text-(--text-muted)">
            Registro y control de incidencias o problemas reportados durante el evento.
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
          >
            <Plus size={16} />
            <span>Reportar Incidencia</span>
          </button>
        )}
      </div>

      {/* FORMULARIO DE INGRESO */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 mb-6 space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-red-500/10">
            <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert size={14} />
              Reportar Incidencia Nueva
            </span>
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
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Descripción del Problema</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el incidente ocurrido (ej: Fuga de agua en baños del sector occidental)"
                rows={2}
                className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-(--page-text)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Departamento</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none text-(--page-text)"
              >
                {Object.keys(DEPT_LABELS).map((code) => (
                  <option key={code} value={code}>
                    {DEPT_LABELS[code]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gravedad</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as Issue['level'])}
                className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none text-(--page-text)"
              >
                <option value="normal">Normal (Baja)</option>
                <option value="important">Importante (Media)</option>
                <option value="urgent">Urgente (Alta)</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Informado por</label>
              <input
                type="text"
                required
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full bg-(--input-bg) border border-(--border-color) rounded-xl py-2.5 px-3 text-xs sm:text-sm focus:outline-none text-(--page-text)"
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
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md"
            >
              <Send size={12} />
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Reporte'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TABS DE INCIDENCIAS (ACTIVAS VS RESUELTAS) */}
      <div className="flex gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/40 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
            activeTab === 'active'
              ? "bg-slate-900 text-white dark:bg-slate-800"
              : "text-(--text-muted) hover:text-(--page-text)"
          )}
        >
          <span>Activas</span>
          <span className="bg-red-500/15 text-red-500 px-1.5 py-0.5 rounded-md text-[10px]">
            {issues.filter((i) => i.status !== 'resolved').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
            activeTab === 'resolved'
              ? "bg-slate-900 text-white dark:bg-slate-800"
              : "text-(--text-muted) hover:text-(--page-text)"
          )}
        >
          <span>Resueltas</span>
          <span className="bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-md text-[10px]">
            {issues.filter((i) => i.status === 'resolved').length}
          </span>
        </button>
      </div>

      {/* LISTADO DE INCIDENCIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => {
            const isOpen = issue.status === 'open';
            const isInProgress = issue.status === 'in_progress';
            const isResolved = issue.status === 'resolved';

            return (
              <div
                key={issue.id}
                className={cn(
                  "p-4 rounded-2xl border flex flex-col gap-3 justify-between bg-slate-50 dark:bg-slate-900/20 transition-all border-slate-200 dark:border-slate-800/80",
                  isResolved && "opacity-75 border-emerald-100 dark:border-emerald-950/20 bg-slate-100/50 dark:bg-slate-950/20",
                  issue.level === 'urgent' && !isResolved && "border-red-200 dark:border-red-950/30"
                )}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Departamento */}
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {DEPT_LABELS[issue.department_code] || issue.department_code}
                    </span>

                    {/* Nivel de Alerta */}
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      SEVERITY_STYLES[issue.level]
                    )}>
                      {issue.level}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-(--page-text) leading-relaxed font-semibold">
                    {issue.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/40 text-[10px] font-semibold text-(--text-muted)">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      Reportó: <span className="text-(--page-text) font-bold">{issue.reported_by}</span>
                    </div>
                    <div>
                      {new Date(issue.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {issue.action_taken && (
                    <div className="p-2.5 bg-emerald-500/5 dark:bg-emerald-950/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl leading-relaxed text-xs">
                      <span className="font-black uppercase text-[9px] block mb-0.5">Acción tomada / Solución:</span>
                      "{issue.action_taken}"
                    </div>
                  )}

                  {/* Acciones del checklist */}
                  {!isResolved && (
                    <div className="flex gap-2 pt-1 relative z-20">
                      {isOpen && (
                        <button
                          onClick={() => handleInProgress(issue.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors font-bold text-xs"
                        >
                          <RotateCw size={12} className="animate-spin-slow" />
                          <span>Atender</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleResolve(issue.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors font-bold text-xs"
                      >
                        <CheckCircle2 size={12} />
                        <span>Resolver</span>
                      </button>

                      {isInProgress && (
                        <span className="ml-auto text-blue-500 flex items-center gap-1 animate-pulse uppercase text-[8px] font-black tracking-wider">
                          <AlertCircle size={10} /> En Proceso
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 text-center py-8 text-slate-400 dark:text-slate-500 font-semibold italic bg-white/20 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 text-xs">
            No hay incidencias registradas en esta categoría.
          </div>
        )}
      </div>
    </div>
  );
};
export default IssueTracker;
