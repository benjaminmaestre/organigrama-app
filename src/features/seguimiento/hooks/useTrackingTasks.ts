import React from 'react';
import { supabase } from '../api/supabaseClient';
import type { Task, Subtask, Issue, DepartmentConfig, TaskActivity } from '../types/tracking.types';

export function useTrackingTasks(eventId: string = '11111111-1111-1111-1111-111111111111') {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [subtasks, setSubtasks] = React.useState<Record<string, Subtask[]>>({});
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [configs, setConfigs] = React.useState<DepartmentConfig[]>([]);
  const [activities, setActivities] = React.useState<TaskActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Cargar datos iniciales de una sola vez de forma eficiente
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Tareas
      const { data: tasksData, error: tasksErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', eventId);
      if (tasksErr) throw tasksErr;

      // 2. Subtareas
      const { data: subtasksData, error: subtasksErr } = await supabase
        .from('subtasks')
        .select('*');
      if (subtasksErr) throw subtasksErr;

      // 3. Incidencias
      const { data: issuesData, error: issuesErr } = await supabase
        .from('issues')
        .select('*')
        .eq('event_id', eventId);
      if (issuesErr) throw issuesErr;

      // 4. Configs de departamento
      const { data: configsData, error: configsErr } = await supabase
        .from('department_configs')
        .select('*')
        .eq('event_id', eventId);
      if (configsErr) throw configsErr;

      // 5. Historial de actividad (últimas 25)
      const { data: activitiesData, error: activitiesErr } = await supabase
        .from('task_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);
      if (activitiesErr) throw activitiesErr;

      setTasks(tasksData || []);
      setIssues(issuesData || []);
      setConfigs(configsData || []);
      setActivities(activitiesData || []);

      // Agrupar subtareas por task_id
      const subtaskMap: Record<string, Subtask[]> = {};
      subtasksData?.forEach((sub) => {
        if (!subtaskMap[sub.task_id]) {
          subtaskMap[sub.task_id] = [];
        }
        subtaskMap[sub.task_id].push(sub);
      });
      setSubtasks(subtaskMap);
    } catch (err: any) {
      console.error('Error fetching tracking data:', err);
      setError(err.message || 'Error al conectar con la base de datos.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Suscripciones en Tiempo Real mediante Supabase Realtime
  React.useEffect(() => {
    // 1. Suscripción a tareas
    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newTask = payload.new as Task;
          setTasks((prev) => [...prev, newTask]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedTask = payload.new as Task;
          setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
          // Refrescar actividades ya que un update registra actividad
          supabase
            .from('task_activity')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(25)
            .then(({ data }) => data && setActivities(data));
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any).id;
          setTasks((prev) => prev.filter((t) => t.id !== deletedId));
        }
      })
      .subscribe();

    // 2. Suscripción a subtareas
    const subtasksChannel = supabase
      .channel('subtasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newSub = payload.new as Subtask;
          setSubtasks((prev) => {
            const list = prev[newSub.task_id] || [];
            return { ...prev, [newSub.task_id]: [...list, newSub] };
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedSub = payload.new as Subtask;
          setSubtasks((prev) => {
            const list = prev[updatedSub.task_id] || [];
            return {
              ...prev,
              [updatedSub.task_id]: list.map((s) => (s.id === updatedSub.id ? updatedSub : s)),
            };
          });
        } else if (payload.eventType === 'DELETE') {
          const oldSub = payload.old as any;
          setSubtasks((prev) => {
            // Buscamos el task_id de la subtarea eliminada
            const key = Object.keys(prev).find((taskId) => prev[taskId].some((s) => s.id === oldSub.id));
            if (!key) return prev;
            return {
              ...prev,
              [key]: prev[key].filter((s) => s.id !== oldSub.id),
            };
          });
        }
      })
      .subscribe();

    // 3. Suscripción a incidencias (issues)
    const issuesChannel = supabase
      .channel('issues-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIssues((prev) => [...prev, payload.new as Issue]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedIssue = payload.new as Issue;
          setIssues((prev) => prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i)));
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any).id;
          setIssues((prev) => prev.filter((i) => i.id !== deletedId));
        }
      })
      .subscribe();

    // 4. Suscripción a configs de departamento
    const configsChannel = supabase
      .channel('configs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'department_configs' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const updatedConfig = payload.new as DepartmentConfig;
          setConfigs((prev) => prev.map((c) => (c.id === updatedConfig.id ? updatedConfig : c)));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(subtasksChannel);
      supabase.removeChannel(issuesChannel);
      supabase.removeChannel(configsChannel);
    };
  }, []);

  // ==========================================
  // OPERACIONES / MUTACIONES
  // ==========================================

  // Modificar estado de tarea
  const updateTaskStatus = async (
    taskId: string,
    status: Task['status'],
    notes?: string
  ) => {
    try {
      const updates = {
        status,
        notes: notes ?? null,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        completed_by: status === 'completed' ? (await supabase.auth.getUser()).data.user?.id : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    } catch (err: any) {
      console.error('Error updating task status:', err);
      alert('Error al actualizar el estado: ' + err.message);
    }
  };

  // Modificar prioridad de tarea
  const updateTaskPriority = async (taskId: string, priority: Task['priority']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ priority, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error updating task priority:', err);
      alert('Error al cambiar prioridad: ' + err.message);
    }
  };

  // Modificar asignación de tarea
  const updateTaskAssignment = async (taskId: string, assignedTo: Task['assigned_to']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error updating task assignment:', err);
      alert('Error al cambiar responsable: ' + err.message);
    }
  };

  // Actualizar notas/observaciones de tarea
  const updateTaskNotes = async (taskId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ notes: notes || null, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error updating task notes:', err);
      alert('Error al actualizar observaciones: ' + err.message);
    }
  };

  // Crear una nueva tarea personalizada
  const createCustomTask = async (
    title: string,
    description: string,
    phase: Task['phase'],
    departmentCode: Task['department_code'],
    responsibilityType: Task['responsibility_type'],
    priority: Task['priority'],
    assignedTo: Task['assigned_to'],
    dueDate?: string
  ) => {
    try {
      const { error } = await supabase.from('tasks').insert({
        event_id: eventId,
        title,
        description: description || null,
        phase,
        department_code: departmentCode,
        responsibility_type: responsibilityType,
        priority,
        assigned_to: assignedTo,
        due_date: dueDate || null,
        status: 'pending',
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Error creating custom task:', err);
      alert('Error al crear la tarea: ' + err.message);
    }
  };

  // Toggle estado de subtarea
  const toggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', subtaskId);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error toggling subtask:', err);
      alert('Error al actualizar subtarea: ' + err.message);
    }
  };

  // Agregar subtarea
  const addSubtask = async (taskId: string, title: string) => {
    try {
      const { error } = await supabase.from('subtasks').insert({
        task_id: taskId,
        title,
        is_completed: false,
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Error adding subtask:', err);
      alert('Error al añadir subtarea: ' + err.message);
    }
  };

  // Crear incidencia
  const createIssue = async (
    departmentCode: string,
    description: string,
    level: Issue['level'],
    reportedBy: string,
    taskId?: string
  ) => {
    try {
      const { error } = await supabase.from('issues').insert({
        event_id: eventId,
        department_code: departmentCode,
        task_id: taskId || null,
        description,
        level,
        status: 'open',
        reported_by: reportedBy,
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Error creating issue:', err);
      alert('Error al registrar incidencia: ' + err.message);
    }
  };

  // Cambiar estado o resolución de incidencia
  const updateIssueStatus = async (
    issueId: string,
    status: Issue['status'],
    actionTaken?: string
  ) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await supabase
        .from('issues')
        .update({
          status,
          action_taken: actionTaken || null,
          assigned_to: userId || null,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', issueId);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error resolving issue:', err);
      alert('Error al actualizar incidencia: ' + err.message);
    }
  };

  // Configurar departamentos opcionales (Instalación y Transporte)
  const configureDepartmentStatus = async (
    departmentCode: 'installation' | 'transport-materials',
    status: DepartmentConfig['status']
  ) => {
    try {
      // 1. Actualizar configuración en Supabase
      const { error } = await supabase
        .from('department_configs')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('event_id', eventId)
        .eq('department_code', departmentCode);

      if (error) throw error;

      // 2. Si se marca como "not_required" o "not_applicable", marcar todas las tareas activas de ese departamento como "not_applicable"
      if (status === 'not_required' || status === 'not_applicable') {
        const { error: tasksUpdateErr } = await supabase
          .from('tasks')
          .update({ status: 'not_applicable', updated_at: new Date().toISOString() })
          .eq('event_id', eventId)
          .eq('department_code', departmentCode)
          .neq('status', 'completed'); // Solo las que no están ya completadas

        if (tasksUpdateErr) throw tasksUpdateErr;
      } else if (status === 'active') {
        // Si se vuelve a activar, regresar a 'pending' las que se marcaron como 'not_applicable' automáticamente
        const { error: tasksUpdateErr } = await supabase
          .from('tasks')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('event_id', eventId)
          .eq('department_code', departmentCode)
          .eq('status', 'not_applicable');

        if (tasksUpdateErr) throw tasksUpdateErr;
      }
    } catch (err: any) {
      console.error('Error configuring department status:', err);
      alert('Error al configurar departamento: ' + err.message);
    }
  };

  return {
    tasks,
    subtasks,
    issues,
    configs,
    activities,
    loading,
    error,
    refetch: fetchData,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskAssignment,
    updateTaskNotes,
    createCustomTask,
    toggleSubtask,
    addSubtask,
    createIssue,
    updateIssueStatus,
    configureDepartmentStatus,
  };
}
