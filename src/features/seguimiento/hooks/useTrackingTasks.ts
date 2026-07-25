import React from 'react';
import { supabase } from '../api/supabaseClient';
import type { Task, Subtask, Issue, DepartmentConfig, TaskActivity } from '../types/tracking.types';
import { OFFICIAL_CHECKLIST_SEED } from '../data/seedData';

export function useTrackingTasks(
  eventId: string = '11111111-1111-1111-1111-111111111111',
  enabled: boolean = true
) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [subtasks, setSubtasks] = React.useState<Record<string, Subtask[]>>({});
  const [issues, setIssues] = React.useState<Issue[]>([]);
  const [configs, setConfigs] = React.useState<DepartmentConfig[]>([]);
  const [activities, setActivities] = React.useState<TaskActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Validación en desarrollo del catálogo maestro para asegurar que ninguna tarea oficial carezca de fundamento
  React.useEffect(() => {
    const unreferenced = OFFICIAL_CHECKLIST_SEED.filter(
      (t) => !t.source_refs || t.source_refs.length === 0 || !t.instruction_basis?.trim()
    );
    if (unreferenced.length > 0) {
      console.warn('[Checklist Audit Warning]: Tareas oficiales sin fundamento documental:', unreferenced.map((t) => t.template_key));
    }
  }, []);

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

const LEGACY_TITLE_MAP: Record<string, string> = {
  'confirmar documentos e instrucciones vigentes': 'before_committee_instructions',
  'estudiar y repasar todas las cartas y manuales de asamblea actualizados para alojamiento.': 'before_committee_instructions',
  'participar en la selección de superintendentes y auxiliares': 'before_committee_select_superintendents',
  'confirmar los departamentos necesarios': 'before_committee_confirm_departments',
  'participar en la ubicación de los departamentos': 'before_committee_department_locations',
  'participar en la reunión preasamblea': 'before_committee_preassembly_meeting',
  'participar en la asignación de habitaciones de cortesía y hospedaje particular': 'before_committee_courtesy_rooms',
  'reunirse con cada superintendente de departamento y su auxiliar': 'before_supervision_meet_department_superintendents',
  'confirmar que conocen sus instrucciones': 'before_supervision_confirm_instructions',
  'revisar organización, personal y horarios de los departamentos': 'before_supervision_review_personnel_schedules',
  'revisar necesidades de equipos y materiales': 'before_supervision_equipment_needs',
  'confirmar canales de comunicación': 'before_supervision_communication_channels',
  'identificar necesidades de personal y resolver faltantes': 'before_supervision_resolve_personnel_deficits',
  'inspeccionar las instalaciones durante el montaje': 'before_supervision_inspect_montage',
  'coordinar con hoteles y hospedajes locales': 'before_accommodation_hotels_coordination',
  'reclutar y programar personal voluntario': 'before_volunteers_recruit_schedule',
  'revisar herramientas y materiales requeridos para el montaje': 'before_installation_review_tools',
  'confirmar personal suficiente, insumos de limpieza y plan de basura': 'before_cleaning_supplies_trash_plan',
  'establecer área segura para guardar ropa y objetos perdidos': 'before_lost_found_secure_area',
  'coordinar vehículos de carga y materiales pesados': 'before_transport_heavy_vehicles',
  'visitar todos los departamentos supervisados al menos una vez cada día (viernes)': 'during_supervision_daily_visit_friday',
  'visitar todos los departamentos supervisados al menos una vez cada día (sábado)': 'during_supervision_daily_visit_saturday',
  'visitar todos los departamentos supervisados al menos una vez cada día (domingo)': 'during_supervision_daily_visit_sunday',
  'buscar aspectos por los cuales felicitar': 'during_supervision_commend_volunteers',
  'ayudar a mejorar el desempeño cuando sea necesario': 'during_supervision_improve_performance',
  'confirmar que cada departamento funciona correctamente': 'during_supervision_confirm_proper_function',
  'informar al comité sobre asuntos graves': 'during_committee_report_serious_matters',
  'dar seguimiento a incidencias abiertas': 'during_supervision_follow_open_issues',
  'atender a los delegados e invitados especiales al llegar': 'during_accommodation_receive_delegates',
  'instalar el stand de información y atender dudas': 'during_volunteers_info_stand',
  'estar disponible para resolver fallas en las estructuras del evento': 'during_installation_structural_repairs',
  'inspeccionar baños y áreas comunes continuamente': 'during_cleaning_restrooms_inspection',
  'registrar objetos recibidos y entregados': 'during_lost_found_register',
  'estar disponible para traslados logísticos urgentes': 'during_transport_urgent_relocations',
  'confirmar el cierre de cada departamento': 'after_supervision_confirm_department_closure',
  'participar en la inspección final': 'after_committee_final_inspection',
  'reunirse con los superintendentes de departamento': 'after_supervision_debrief_meeting',
  'registrar lo que funcionó bien, dificultades y recomendaciones': 'after_supervision_consolidated_report',
  'identificar hermanos que recibieron capacitación': 'after_supervision_identify_trained_brothers',
  'entregar información pertinente a la siguiente asamblea': 'after_committee_handover_next_assembly',
  'verificar que no queden incidencias abiertas': 'after_supervision_verify_no_open_issues',
  'verificar la entrega de llaves y estado de habitaciones': 'after_accommodation_keys_room_checkout',
  'recoger equipos, banners y archivar registros': 'after_volunteers_collect_equipment',
  'desmontar estructuras, ordenar y guardar materiales': 'after_installation_dismantle_structures',
  'hacer limpieza profunda final y entrega de llaves': 'after_cleaning_deep_clean',
  'clasificar objetos no reclamados y coordinar su destino': 'after_lost_found_unclaimed_items',
  'retornar equipos rentados y archivar inventarios': 'after_transport_return_rented_equipment',
};

  // Inicialización y precarga del checklist oficial (con sincronización idempotente de fuentes y metadatos)
  const initializeOfficialChecklist = async (targetEventId: string): Promise<number> => {
    await ensureEventExists(targetEventId);

    // Intentar primero mediante la función RPC segura de Supabase (si está creada en la BD)
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('sync_official_checklist_metadata', {
        p_event_id: targetEventId,
        p_tasks: OFFICIAL_CHECKLIST_SEED,
      });

      if (!rpcErr && rpcRes?.status === 'success') {
        console.log('[RPC Sync Exitoso]:', rpcRes);
      }
    } catch (e) {
      console.warn('[RPC Sync Warning]: RPC no ejecutada o no disponible, usando sincronización cliente verificada.', e);
    }

    // 1. Consultar tareas existentes por template_key, title e id
    const { data: existingTasks, error: fetchErr } = await supabase
      .from('tasks')
      .select('id, template_key, title, description, phase, department_code, responsibility_type, source_refs, instruction_basis, source_classification')
      .eq('event_id', targetEventId);

    if (fetchErr) {
      console.error('[Checklist Error]: Error al consultar tareas existentes en Supabase:', fetchErr);
      throw new Error(`Error al consultar tareas existentes: ${fetchErr.message}`);
    }

    const existingByTemplateKey = new Map<string, any>();
    const existingByTitle = new Map<string, any>();

    (existingTasks || []).forEach((t) => {
      if (t.template_key) {
        existingByTemplateKey.set(t.template_key, t);
      }
      if (t.title) {
        existingByTitle.set(t.title.trim().toLowerCase(), t);
      }
    });

    const missingSeedTasks: typeof OFFICIAL_CHECKLIST_SEED = [];
    const tasksToSyncMetadata: Array<{ id: string; seed: typeof OFFICIAL_CHECKLIST_SEED[0] }> = [];

    OFFICIAL_CHECKLIST_SEED.forEach((seed) => {
      // 1. Buscar por template_key exacto
      let existing = existingByTemplateKey.get(seed.template_key);

      // 2. Buscar por título nuevo exacto
      if (!existing && seed.title) {
        existing = existingByTitle.get(seed.title.trim().toLowerCase());
      }

      // 3. Buscar por mapeo de título heredado (legacy)
      if (!existing) {
        for (const [legacyTitle, mappedKey] of Object.entries(LEGACY_TITLE_MAP)) {
          if (mappedKey === seed.template_key) {
            existing = existingByTitle.get(legacyTitle);
            if (existing) break;
          }
        }
      }

      if (!existing) {
        missingSeedTasks.push(seed);
      } else {
        // Verificar si la tarea carece de template_key o metadatos maestros documentales
        const needsUpdate =
          !existing.template_key ||
          !existing.source_refs ||
          existing.source_refs.length === 0 ||
          existing.instruction_basis !== seed.instruction_basis ||
          existing.source_classification !== seed.source_classification ||
          existing.title !== seed.title;

        if (needsUpdate) {
          tasksToSyncMetadata.push({ id: existing.id, seed });
        }
      }
    });

    console.log('[Checklist Preload Diagnostics]:', {
      eventIdUsed: targetEventId,
      catalogSize: OFFICIAL_CHECKLIST_SEED.length,
      foundInSupabase: existingTasks?.length || 0,
      missingToInsert: missingSeedTasks.length,
      toSyncMetadata: tasksToSyncMetadata.length,
    });

    // 2. Insertar las tareas faltantes en Supabase y verificar respuesta
    let insertedCount = 0;
    if (missingSeedTasks.length > 0) {
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
        source_refs: seed.source_refs || [],
        instruction_basis: seed.instruction_basis || null,
        source_classification: seed.source_classification || 'direct',
      }));

      const { data: insertedRows, error: insertError } = await supabase
        .from('tasks')
        .insert(payload)
        .select('id, template_key');

      if (insertError) {
        console.error('[Checklist Error]: Error de Supabase al insertar checklist:', insertError);
        throw new Error(`[Supabase Error ${insertError.code || ''}]: ${insertError.message}`);
      }

      insertedCount = insertedRows?.length || payload.length;
    }

    // 3. Actualizar metadatos documentales de tareas existentes capturando DATA y ERROR explícitamente
    let successfulUpdatesCount = 0;
    for (const { id, seed } of tasksToSyncMetadata) {
      const { data: updatedRow, error: updateErr } = await supabase
        .from('tasks')
        .update({
          template_key: seed.template_key,
          title: seed.title,
          description: seed.description || null,
          source_refs: seed.source_refs || [],
          instruction_basis: seed.instruction_basis || null,
          source_classification: seed.source_classification || 'direct',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id, template_key, title, source_refs, instruction_basis, source_classification')
        .single();

      if (updateErr) {
        console.error('[Official Metadata Sync Error]', {
          taskId: id,
          templateKey: seed.template_key,
          code: updateErr.code,
          message: updateErr.message,
          details: updateErr.details,
          hint: updateErr.hint,
        });
        throw new Error(`No se pudo sincronizar ${seed.template_key}: ${updateErr.message}`);
      }

      if (!updatedRow) {
        throw new Error(`Supabase no devolvió la tarea actualizada: ${seed.template_key}`);
      }

      successfulUpdatesCount++;
    }

    // 4. Verificación completa post-sincronización en la BD real
    const { data: verifiedTasks, error: verifyErr } = await supabase
      .from('tasks')
      .select('id, template_key, title, source_refs, instruction_basis, source_classification')
      .eq('event_id', targetEventId)
      .eq('source', 'official');

    if (verifyErr) {
      console.error('[Checklist Verification Query Error]:', verifyErr);
    } else {
      const incompleteTasks = (verifiedTasks || []).filter(
        (t) =>
          !Array.isArray(t.source_refs) ||
          t.source_refs.length === 0 ||
          !t.instruction_basis?.trim() ||
          !t.source_classification
      );

      const summaryStats = {
        catalogSize: OFFICIAL_CHECKLIST_SEED.length,
        existingTasks: existingTasks?.length || 0,
        requestedUpdates: tasksToSyncMetadata.length,
        successfulUpdates: successfulUpdatesCount,
        verifiedComplete: (verifiedTasks?.length || 0) - incompleteTasks.length,
        incomplete: incompleteTasks.length,
      };

      console.log('[Checklist Metadata Sync Summary]:', summaryStats);

      if (incompleteTasks.length > 0) {
        console.error(
          '[Checklist Metadata Verification Failed]:',
          incompleteTasks.map((t) => ({
            template_key: t.template_key,
            title: t.title,
            references: t.source_refs,
            hasBasis: Boolean(t.instruction_basis?.trim()),
            classification: t.source_classification,
          }))
        );
      }
    }

    return insertedCount + successfulUpdatesCount;
  };

  // Cargar datos de Supabase de forma sincronizada
  const fetchData = React.useCallback(async () => {
    // Comprobación de diagnóstico obligatoria de sesión antes de precargar
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[Auth Diagnostic Before Preload]:', {
      authenticated: Boolean(session),
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role || 'authenticated',
    });

    if (!session?.user) {
      console.warn('[Checklist Cancelled]: No existe una sesión activa de Supabase Auth. Cancelando precarga.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let seedFailed = false;
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
      } catch (seedErr: unknown) {
        const errMsg = seedErr instanceof Error ? seedErr.message : String(seedErr);
        console.error('Fallo en initializeOfficialChecklist:', seedErr);
        seedFailed = true;
        console.warn('[Checklist Fallback]: La precarga en Supabase falló. Se evaluará si usar datos locales.', errMsg);
      }

      // 1. Consultar tareas completas para el evento
      const { data: tasksData, error: tasksErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', activeEventId);

      if (tasksErr) {
        throw new Error(`Error al leer tareas de la base de datos: ${tasksErr.message}`);
      }

      // 2. FALLBACK: Si Supabase no tiene tareas y la precarga falló (RLS u otro error),
      //    generar tareas locales desde el catálogo oficial para que la UI no esté vacía.
      if ((!tasksData || tasksData.length === 0) && seedFailed) {
        console.warn('[Checklist Fallback]: Supabase devolvió 0 tareas y la precarga falló. Usando datos locales del checklist oficial.');
        const now = new Date().toISOString();
        const localTasks: Task[] = OFFICIAL_CHECKLIST_SEED.map((seed, index) => ({
          id: `local-${seed.template_key}-${index}`,
          event_id: activeEventId,
          template_key: seed.template_key,
          source: 'official' as const,
          title: seed.title,
          description: seed.description,
          phase: seed.phase,
          department_code: seed.department_code,
          responsibility_type: seed.responsibility_type,
          priority: seed.priority,
          assigned_to: seed.assigned_to,
          status: 'pending' as const,
          source_refs: seed.source_refs,
          instruction_basis: seed.instruction_basis,
          source_classification: seed.source_classification,
          updated_at: now,
          created_at: now,
        }));
        setTasks(localTasks);
        setError(
          'Las políticas de seguridad (RLS) de Supabase impiden guardar el checklist. ' +
          'Los datos se muestran desde el catálogo local. ' +
          'Para habilitar la persistencia, ejecuta las políticas RLS en el SQL Editor de Supabase.'
        );
      } else {
        setTasks(tasksData || []);
      }

      // 3. Subtareas
      const { data: subtasksData, error: subtasksErr } = await supabase
        .from('subtasks')
        .select('*');
      if (subtasksErr) console.warn('Error al cargar subtareas:', subtasksErr);

      // 4. Incidencias
      const { data: issuesData, error: issuesErr } = await supabase
        .from('issues')
        .select('*')
        .eq('event_id', activeEventId);
      if (issuesErr) console.warn('Error al cargar incidencias:', issuesErr);

      // 5. Configs de departamento
      const { data: configsData, error: configsErr } = await supabase
        .from('department_configs')
        .select('*')
        .eq('event_id', activeEventId);
      if (configsErr) console.warn('Error al cargar configs:', configsErr);

      // 6. Historial de actividad
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
    if (!enabled) {
      setLoading(false);
      return;
    }

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
  }, [enabled, fetchData]);

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

  // Mutador: Actualizar Fecha Límite
  const updateTaskDueDate = async (taskId: string, dueDate: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, due_date: dueDate } : t))
    );
    try {
      const { error: err } = await supabase
        .from('tasks')
        .update({ due_date: dueDate || null, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (err) throw err;
    } catch (err: any) {
      console.error('Error updating task due date:', err);
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
    updateTaskDueDate,
    createCustomTask,
    toggleSubtask,
    addSubtask,
    createIssue,
    updateIssueStatus,
    configureDepartmentStatus,
    refetch: fetchData,
  };
}
