import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../features/seguimiento/api/supabaseClient';
import { AppHeader } from '../components/AppHeader';
import { ProgressSummary } from '../features/seguimiento/components/ProgressSummary';
import { TaskList } from '../features/seguimiento/components/TaskList';
import { TaskDetailsDialog } from '../features/seguimiento/components/TaskDetailsDialog';
import { IssueTracker } from '../features/seguimiento/components/IssueTracker';
import { useTrackingTasks } from '../features/seguimiento/hooks/useTrackingTasks';
import type { Task } from '../features/seguimiento/types/tracking.types';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ClipboardList, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/cn';

export function SeguimientoPage() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  // Obtener fase por defecto según la fecha actual local
  const getDefaultPhase = (): Task['phase'] => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (todayStr < '2026-07-31') return 'before';
    if (todayStr <= '2026-08-02') return 'during';
    return 'after';
  };

  const [activePhase, setActivePhase] = React.useState<Task['phase']>(getDefaultPhase);
  const [viewTab, setViewTab] = React.useState<'checklist' | 'incidents'>('checklist');
  const [selectedDept, setSelectedDept] = React.useState<string | null>(null);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const enabled = !authLoading && Boolean(user?.id);

  // Cargar datos en tiempo real mediante el custom hook únicamente si hay sesión autenticada
  const {
    tasks,
    subtasks,
    issues,
    configs,
    activities,
    loading: dataLoading,
    error: dataError,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskAssignment,
    updateTaskNotes,
    updateTaskDueDate,
    createCustomTask,
    toggleSubtask,
    addSubtask,
    createIssue,
    updateIssueStatus,
    configureDepartmentStatus,
    refetch,
  } = useTrackingTasks('11111111-1111-1111-1111-111111111111', enabled);

  // Escuchar estado de autenticación real de Supabase
  React.useEffect(() => {
    const getSession = async () => {
      setAuthLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const resolveName = (email?: string, name?: string) => {
          const clean = email?.toLowerCase().trim() || '';
          if (clean === 'dartjfe@gmail.com') return 'Jhonny Flores';
          if (clean === 'benjaminmaestre@gmail.com') return 'Benjamín Pérez';
          if (name && !name.includes('@') && name !== clean.split('@')[0]) return name;
          return name || email || 'Usuario';
        };

        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name: resolveName(session.user.email, profile?.full_name),
          role: profile?.role || 'viewer',
        });
      } else {
        // Si no hay sesión de Supabase Auth, redirigir a login
        setUser(null);
        navigate('/login', { replace: true });
      }
      setAuthLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        localStorage.removeItem('mock-session');
        localStorage.removeItem('mock-user');
        navigate('/login', { replace: true });
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const resolveName = (email?: string, name?: string) => {
          const clean = email?.toLowerCase().trim() || '';
          if (clean === 'dartjfe@gmail.com') return 'Jhonny Flores';
          if (clean === 'benjaminmaestre@gmail.com') return 'Benjamín Pérez';
          if (name && !name.includes('@') && name !== clean.split('@')[0]) return name;
          return name || email || 'Usuario';
        };

        setUser({
          id: session.user.id,
          email: session.user.email,
          full_name: resolveName(session.user.email, profile?.full_name),
          role: profile?.role || 'viewer',
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('mock-session');
    localStorage.removeItem('mock-user');
    navigate('/login', { replace: true });
  };

  // Mantener actualizado el activeTask si cambia en el listado de tareas en tiempo real
  const currentActiveTask = React.useMemo(() => {
    if (!activeTask) return null;
    return tasks.find((t) => t.id === activeTask.id) || activeTask;
  }, [tasks, activeTask]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--page-bg) text-(--page-text)">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-(--institutional-blue)" />
          <span className="text-sm font-bold">Verificando sesión privada...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-(--page-bg) text-(--page-text) font-sans overflow-x-hidden transition-colors duration-300">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] md:w-[40%] md:h-[40%] bg-blue-500/10 blur-[60px] md:blur-[120px] rounded-full opacity-(--blob-opacity)" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] md:w-[40%] md:h-[40%] bg-purple-500/10 blur-[60px] md:blur-[120px] rounded-full opacity-(--blob-opacity)" />
      </div>

      <AppHeader user={user} onLogout={handleLogout} />

      <main className="grow max-w-7xl mx-auto px-4 py-6 md:py-12 relative z-10 w-full flex flex-col gap-6 sm:gap-8">
        
        {/* TITULO Y DESCRIPCION DE LA SECCIÓN */}
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-(--page-text) tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
            <ClipboardList className="text-(--institutional-blue)" size={28} />
            Seguimiento de la Asamblea
          </h2>
          <p className="text-xs sm:text-sm text-(--text-muted)">
            Mapeo de tareas y pendientes de la Superintendencia de Alojamiento · Medellín 4
          </p>
        </div>

        {/* ERROR ÚNICO DE SINCRONIZACIÓN */}
        {dataError && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h5 className="font-bold">Sincronización pendiente</h5>
              <p className="text-xs leading-relaxed">{dataError}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all active:scale-95"
            >
              <RefreshCw size={13} />
              Reintentar
            </button>
          </div>
        )}

        {/* DASHBOARD DE RESUMEN DE PROGRESO */}
        <ProgressSummary
          tasks={tasks}
          configs={configs}
          onConfigureDept={configureDepartmentStatus}
          onSelectDept={(code) => {
            setSelectedDept(code);
            setViewTab('checklist');
          }}
        />

        {/* NAVEGACIÓN PRINCIPAL DEL MÓDULO (CHECKLIST VS INCIDENCIAS) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          {/* Fases Temporales (Antes, Durante, Después) */}
          <div className="inline-flex p-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm self-start">
            <button
              onClick={() => setActivePhase('before')}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all",
                activePhase === 'before'
                  ? "bg-(--institutional-blue) text-white shadow-md"
                  : "text-(--text-muted) hover:text-(--page-text)"
              )}
            >
              <Calendar size={14} />
              Antes
            </button>
            <button
              onClick={() => setActivePhase('during')}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all",
                activePhase === 'during'
                  ? "bg-(--institutional-blue) text-white shadow-md"
                  : "text-(--text-muted) hover:text-(--page-text)"
              )}
            >
              <Calendar size={14} />
              Durante
            </button>
            <button
              onClick={() => setActivePhase('after')}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all",
                activePhase === 'after'
                  ? "bg-(--institutional-blue) text-white shadow-md"
                  : "text-(--text-muted) hover:text-(--page-text)"
              )}
            >
              <Calendar size={14} />
              Después
            </button>
          </div>

          {/* Vistas Secundarias (Tareas vs Incidencias) */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setViewTab('checklist')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black border transition-all active:scale-95",
                viewTab === 'checklist'
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-800 dark:border-slate-800"
                  : "bg-transparent border-slate-200 dark:border-slate-800 text-(--text-muted) hover:text-(--page-text)"
              )}
            >
              Tareas
            </button>
            <button
              onClick={() => setViewTab('incidents')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black border transition-all active:scale-95 flex items-center gap-1.5",
                viewTab === 'incidents'
                  ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-800 dark:border-slate-800"
                  : "bg-transparent border-slate-200 dark:border-slate-800 text-(--text-muted) hover:text-(--page-text)"
              )}
            >
              Incidencias
              {issues.filter((i) => i.status !== 'resolved').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>



        {/* VISTAS DINÁMICAS */}
        {dataLoading ? (
          <div className="h-64 flex items-center justify-center text-(--text-muted) font-semibold italic gap-2">
            <Loader2 size={20} className="animate-spin text-(--institutional-blue)" />
            Cargando actividades del checklist...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewTab === 'checklist' ? (
              <motion.div
                key="checklist"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <TaskList
                  tasks={tasks}
                  subtasks={subtasks}
                  activePhase={activePhase}
                  selectedDept={selectedDept}
                  onSelectDept={setSelectedDept}
                  onToggleComplete={async (id, complete) => {
                    const status = complete ? 'completed' : 'pending';
                    await updateTaskStatus(id, status);
                  }}
                  onStatusChange={updateTaskStatus}
                  onOpenDetails={setActiveTask}
                  onCreateTask={createCustomTask}
                />
              </motion.div>
            ) : (
              <motion.div
                key="incidents"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <IssueTracker
                  issues={issues}
                  currentUserName={user?.full_name || user?.email}
                  onCreateIssue={createIssue}
                  onResolveIssue={updateIssueStatus}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* MODAL DETALLE DE TAREA */}
      <AnimatePresence>
        {currentActiveTask && (
          <TaskDetailsDialog
            task={currentActiveTask}
            subtasks={subtasks[currentActiveTask.id] || []}
            activities={activities}
            onClose={() => setActiveTask(null)}
            onUpdateStatus={updateTaskStatus}
            onUpdatePriority={updateTaskPriority}
            onUpdateAssignment={updateTaskAssignment}
            onUpdateNotes={updateTaskNotes}
            onUpdateDueDate={updateTaskDueDate}
            onToggleSubtask={toggleSubtask}
            onAddSubtask={addSubtask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
export default SeguimientoPage;
