import React from 'react';
import { supabase } from '../api/supabaseClient';
import type { Task, Subtask, Issue, DepartmentConfig, TaskActivity } from '../types/tracking.types';
import { OFFICIAL_CHECKLIST_SEED } from '../data/seedData';

export function useTrackingTasks(eventId: string = '11111111-1111-1111-1111-111111111111') {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [subtasks, setSubtasks] = React.useState<Record<string, Subtask[]>>({});
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [configs, setConfigs] = React.useState<DepartmentConfig[]>([]);
  const [activities, setActivities] = React.useState<TaskActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Asegura la existencia del evento en public.events antes de insertar tareas
  const ensureEventExists = async (targetEventId: string) => {
    try {
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('id', targetEventId)
        .maybeSingle();

      if (!existing) {
        console.log('[Checklist Preload]: Evento no registrado, insertando en public.events...', targetEventId);
        await supabase.from('events').insert({
          id: targetEventId,
          name: 'Asamblea Regional Medellín 4 — 2026',
          year: 2026,
          is_active: true,
        });
      }
    } catch (e) {
      console.warn('[Checklist Warning]: Error verificando tabla events:', e);
    }
  };

  // Inicialización y precarga del checklist oficial (compatible con cualquier esquema de BD)
  const initializeOfficialChecklist = async (targetEventId: string): Promise<number> => {
    await ensureEventExists(targetEventId);

    // 1. Consultar tareas existentes por la columna estándar 'title'
    const { data: existingTasks, error: fetchErr } = await supabase
      .from('tasks')
      .select('title')
      .eq('event_id', targetEventId);

    if (fetchErr) {
      console.error('[Checklist Error]: Error al consultar tareas existentes en Supabase:', fetchErr);
      throw new Error(`Error al consultar tareas existentes: ${fetchErr.message}`);
    }

    const existingTitles = new Set(
      (existingTasks || []).map((t) => t.title?.trim().toLowerCase()).filter(Boolean)
    );

    // 2. Filtrar OFFICIAL_CHECKLIST_SEED para obtener solo las tareas faltantes por título
    const missingSeedTasks = OFFICIAL_CHECKLIST_SEED.filter(
      (seed) => !existingTitles.has(seed.title.trim().toLowerCase())
    );

    console.log('[Checklist Preload Diagnostics]:', {
      eventIdUsed: targetEventId,
      catalogSize: OFFICIAL_CHECKLIST_SEED.length,
      foundInSupabase: existingTasks?.length || 0,
      missingToInsert: missingSeedTasks.length,
    });

    if (missingSeedTasks.length === 0) {
      return 0;
    }

    // 3. Preparar payload de inserción con columnas 100% estándar
    const payload = missingSeedTasks.map((seed) => ({
      event_id: targetEventId,
      template_key: seed.template_key,
      source: 'official',
      title: seed.title,
      description: seed.description || null,
      phase: seed.phase,
      department_code: seed.department_code,
      responsibility_type: seed.responsibility_type,
      priority: seed.priority,
      assigned_to: seed.assigned_to,
      status: 'pending',
    }));

    // 4. Insertar las tareas faltantes en Supabase
    const { data: insertedData, error: insertError } = await supabase
      .from('tasks')
      .insert(payload)
      .select('*');

    if (insertError) {
      console.error('[Checklist Error]: Error completo de Supabase al insertar checklist:', {
        eventIdUsed: targetEventId,
        catalogSize: OFFICIAL_CHECKLIST_SEED.length,
        foundInSupabase: existingTasks?.length || 0,
        missingToInsert: missingSeedTasks.length,
        supabaseError: insertError,
      });
      throw new Error(`[Supabase Error ${insertError.code || ''}]: ${insertError.message}`);
    }

    console.log(`[Checklist Preload Exitoso]: ${insertedData?.length || payload.length} tareas oficiales insertadas en Supabase.`);
    return insertedData?.length || payload.length;
  };

  // Cargar datos de Supabase de forma sincronizada
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let activeEventId = eventId;
      try {
        const { data: eventData } = await supabase
          .from('events')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (eventData?.id) {
          activeEventId = eventData.id;
        }
      } catch (e) {
        console.warn('Usando event_id predeterminado:', eventId);
      }

      // Inicializar y garantizar tareas del checklist oficial
      try {
        await initializeOfficialChecklist(activeEventId);
      } catch (seedErr: any) {
        console.error('Fallo en initializeOfficialChecklist:', seedErr);
        setError(`No fue posible cargar el checklist oficial: ${seedErr.message}`);
      }

      // 1. Consultar tareas completas para el evento
      const { data: tasksData, error: tasksErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', activeEventId);

      if (tasksErr) {
        throw new Error(`Error al leer tareas de la base de datos: ${tasksErr.message}`);
      }

      setTasks(tasksData || []);

      // 2. Subtareas
      const { data: subtasksData, error: subtasksErr } = await supabase
        .from('subtasks')
        .select('*');
      if (subtasksErr) console.warn('Error al cargar subtareas:', subtasksErr);

      // 3. Incidencias
      const { data: issuesData, error: issuesErr } = await supabase
        .from('issues')
        .select('*')
        .eq('event_id', activeEventId);
      if (issuesErr) console.warn('Error al cargar incidencias:', issuesErr);

      // 4. Configs de departamento
      const { data: configsData, error: configsErr } = await supabase
        .from('department_configs')
        .select('*')
        .eq('event_id', activeEventId);
      if (configsErr) console.warn('Error al cargar configs:', configsErr);

      // 5. Historial de actividad
      const { data: activitiesData, error: activitiesErr } = await supabase
        .from('task_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);
      if (activitiesErr) console.warn('Error al cargar historial:', activitiesErr);

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

    // Canales en tiempo real
    const tasksSubscription = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const subtasksSubscription = supabase
      .channel('subtasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const issuesSubscription = supabase
      .channel('issues-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'issues' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const configsSubscription = supabase
      .channel('department-configs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'department_configs' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(subtasksSubscription);
      supabase.removeChannel(issuesSubscription);
      supabase.removeChannel(configsSubscription);
    };
  }, [fetchData]);

  // Mutador: Actualizar Estado de Tarea y registrar auditoría
  const updateTaskStatus = async (
    taskId: string,
    newStatus: Task['status'],
    comment?: string
  ) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const previousStatus = targetTask.status;

    // Actualización optimista en interfaz
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || null;
      const userName = userData?.user?.email || 'Usuario Activo';

      const updateData: Partial<Task> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        if (userId) updateData.completed_by = userId;
      }

      const { error: err } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (err) throw err;

      // Registrar auditoría en task_activity
      await supabase.from('task_activity').insert({
        task_id: taskId,
        user_id: userId,
        user_name: userName,
        action: `Cambió estado a ${newStatus}`,
        previous_status: previousStatus,
        new_status: newStatus,
        comment: comment || null,
      });
    } catch (err: any) {
      console.error('Error updating task status:', err);
      // Revertir optimismo
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
      );
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  // Mutador: Actualizar Prioridad
  const updateTaskPriority = async (taskId: string, priority: Task['priority']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority } : t))
    );
    try {
      const { error: err } = await supabase
        .from('tasks')
        .update({ priority, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (err) throw err;
    } catch (err: any) {
      console.error('Error updating task priority:', err);
      fetchData();
    }
  };

  // Mutador: Actualizar Asignado
  const updateTaskAssignment = async (taskId: string, assignedTo: Task['assigned_to']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assigned_to: assignedTo } : t))
    );
    try {
      const { error: err } = await supabase
        .from('tasks')
        .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (err) throw err;
    } catch (err: any) {
      console.error('Error updating task assignment:', err);
      fetchData();
    }
  };

  // Mutador: Actualizar Notas u Observaciones
  const updateTaskNotes = async (taskId: string, notes: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, notes } : t))
    );
    try {
      const { error: err } = await supabase
        .from('tasks')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (err) throw err;
    } catch (err: any) {
      console.error('Error updating task notes:', err);
      fetchData();
    }
  };

  // Mutador: Crear Tarea Personalizada (con source = 'custom')
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
    let activeEventId = eventId;
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (eventData?.id) activeEventId = eventData.id;
    } catch (e) {}

    const newTaskPayload = {
      event_id: activeEventId,
      source: 'custom',
      title,
      description: description || null,
      phase,
      department_code: departmentCode,
      responsibility_type: responsibilityType,
      priority,
      assigned_to: assignedTo,
      due_date: dueDate || null,
      status: 'pending',
    };

    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .insert(newTaskPayload)
        .select('*')
        .single();

      if (err) throw err;
      if (data) {
        setTasks((prev) => [data, ...prev]);
      }
    } catch (err: any) {
      console.error('Error creating custom task:', err);
      alert(`Error al crear tarea personalizada: ${err.message}`);
    }
  };

  // Mutador: Subtareas
  const toggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    setSubtasks((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((taskId) => {
        next[taskId] = next[taskId].map((s) =>
          s.id === subtaskId
            ? { ...s, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : undefined }
            : s
        );
      });
      return next;
    });

    try {
      const { error: err } = await supabase
        .from('subtasks')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', subtaskId);
      if (err) throw err;
    } catch (err: any) {
      console.error('Error toggling subtask:', err);
      fetchData();
    }
  };

  const addSubtask = async (taskId: string, title: string) => {
    try {
      const { data, error: err } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          title,
          is_completed: false,
        })
        .select('*')
        .single();

      if (err) throw err;

      if (data) {
        setSubtasks((prev) => ({
          ...prev,
          [taskId]: [...(prev[taskId] || []), data],
        }));
      }
    } catch (err: any) {
      console.error('Error adding subtask:', err);
      alert(`Error al crear subtarea: ${err.message}`);
    }
  };

  // Mutador: Incidencias
  const createIssue = async (
    departmentCode: string,
    description: string,
    level: Issue['level'],
    reportedBy: string
  ) => {
    let activeEventId = eventId;
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (eventData?.id) activeEventId = eventData.id;
    } catch (e) {}

    const payload = {
      event_id: activeEventId,
      department_code: departmentCode,
      description,
      level,
      status: 'open',
      reported_by: reportedBy,
    };

    try {
      const { data, error: err } = await supabase
        .from('issues')
        .insert(payload)
        .select('*')
        .single();

      if (err) throw err;
      if (data) {
        setIssues((prev) => [data, ...prev]);
      }
    } catch (err: any) {
      console.error('Error creating issue:', err);
      alert(`Error al registrar incidencia: ${err.message}`);
    }
  };

  const updateIssueStatus = async (
    issueId: string,
    status: Issue['status'],
    actionTaken?: string
  ) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status,
              action_taken: actionTaken || i.action_taken,
              resolved_at: status === 'resolved' ? new Date().toISOString() : i.resolved_at,
            }
          : i
      )
    );

    try {
      const updateData: any = { status };
      if (actionTaken) updateData.action_taken = actionTaken;
      if (status === 'resolved') updateData.resolved_at = new Date().toISOString();

      const { error: err } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', issueId);

      if (err) throw err;
    } catch (err: any) {
      console.error('Error updating issue status:', err);
      fetchData();
    }
  };

  const configureDepartmentStatus = async (
    departmentCode: 'installation' | 'transport-materials',
    status: DepartmentConfig['status']
  ) => {
    let activeEventId = eventId;
    try {
      const { data: eventData } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (eventData?.id) activeEventId = eventData.id;
    } catch (e) {}

    setConfigs((prev) => {
      const exists = prev.some((c) => c.department_code === departmentCode);
      if (exists) {
        return prev.map((c) => (c.department_code === departmentCode ? { ...c, status } : c));
      }
      return [
        ...prev,
        {
          id: 'temp',
          event_id: activeEventId,
          department_code: departmentCode,
          status,
          updated_at: new Date().toISOString(),
        },
      ];
    });

    try {
      const { error: err } = await supabase
        .from('department_configs')
        .upsert(
          {
            event_id: activeEventId,
            department_code: departmentCode,
            status,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'event_id,department_code' }
        );
      if (err) throw err;
    } catch (err: any) {
      console.error('Error configuring department status:', err);
      fetchData();
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
    refetch: fetchData,
  };
}
