import type { Task, SourceReference, SourceClassification } from '../types/tracking.types';

export interface SeedTask {
  template_key: string;
  title: string;
  description?: string;
  phase: Task['phase'];
  department_code: Task['department_code'];
  responsibility_type: Task['responsibility_type'];
  priority: Task['priority'];
  assigned_to: Task['assigned_to'];
  source_refs: SourceReference[];
  instruction_basis: string;
  source_classification: SourceClassification;
}

export const OFFICIAL_CHECKLIST_SEED: SeedTask[] = [
  // ==========================================
  // 1. ANTES DE LA ASAMBLEA
  // ==========================================

  // Responsabilidades del Comité (committee)
  {
    template_key: 'before_committee_instructions',
    title: 'Estudiar las instrucciones aplicables a la Superintendencia de Alojamiento',
    description: 'Revisar cuidadosamente las pautas correspondientes del CO-1 y el Manual CO-80 antes de organizar el trabajo.',
    phase: 'before',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'urgent',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', chapter: '1', paragraphs: '23', displayLabel: 'CO-1 · 1:23' },
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'El superintendente de Alojamiento debe estudiar y seguir cuidadosamente el Manual de alojamiento para asambleas regionales (CO-80) y las pautas generales del CO-1.',
    source_classification: 'combined',
  },
  {
    template_key: 'before_committee_select_superintendents',
    title: 'Participar en la selección de superintendentes de departamento y sus auxiliares',
    description: 'Proponer y evaluar nombres de hermanos capacitados para liderar los departamentos bajo nuestra supervisión.',
    phase: 'before',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'important',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-1', chapter: '1', paragraphs: '24', displayLabel: 'CO-1 · 1:24' },
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'El Comité de Asamblea selecciona y nombra a los superintendentes de departamento y sus auxiliares con suficiente antelación.',
    source_classification: 'combined',
  },
  {
    template_key: 'before_committee_know_situation',
    title: 'Conocer la situación de los departamentos con dos o tres meses de anticipación',
    description: 'Diagnosticar anticipadamente la organización, necesidades de personal y espacio físico de los departamentos.',
    phase: 'before',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'normal',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', section: 'Asuntos que atender antes de la asamblea', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'El superintendente debe familiarizarse con el estado de preparación de los departamentos varios meses antes del evento.',
    source_classification: 'direct',
  },
  {
    template_key: 'before_committee_confirm_departments',
    title: 'Confirmar que se cuenta con los departamentos necesarios',
    description: 'Definir si se requieren los departamentos opcionales de Instalación y Transporte y Materiales.',
    phase: 'before',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'important',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '50', displayLabel: 'CO-1 · 3:50' },
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Determinar si la magnitud del recinto exige habilitar los departamentos adicionales de Instalación o Transporte.',
    source_classification: 'combined',
  },

  // Supervisión General (supervision)
  {
    template_key: 'before_supervision_meet_heads',
    title: 'Reunirse con cada superintendente de departamento y su auxiliar',
    description: 'Reunión preasamblea individual con los responsables de Alojamiento, Voluntarios, Limpieza, etc.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', section: 'Asuntos que atender antes de la asamblea', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Mantener reuniones de alineación con cada responsable de departamento para verificar el nivel de preparación.',
    source_classification: 'direct',
  },
  {
    template_key: 'before_supervision_understand_instructions',
    title: 'Confirmar que cada departamento conoce y comprende sus instrucciones',
    description: 'Verificar que tengan copias actualizadas de las guías y formularios requeridos.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Asegurarse de que todos los superintendentes de departamento a su cargo entiendan las pautas del manual.',
    source_classification: 'direct',
  },
  {
    template_key: 'before_supervision_review_volunteers',
    title: 'Coordinar la solicitud de voluntarios cuando falte personal',
    description: 'Si falta personal en algún departamento, solicitar al Departamento de Información y Servicio Voluntario una solicitud conjunta.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'assistant',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '52-53', displayLabel: 'CO-1 · 3:52-53' },
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Si todavía falta personal en algún departamento, el superintendente de Alojamiento puede pedir al Departamento de Información y Servicio Voluntario que prepare una solicitud conjunta para las congregaciones.',
    source_classification: 'combined',
  },
  {
    template_key: 'before_supervision_review_materials',
    title: 'Revisar las necesidades de equipos, materiales y mobiliario',
    description: 'Asegurar que Limpieza, Instalación y Transporte tengan sus herramientas antes del montaje.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Validar que los departamentos dispongan de las herramientas y suministros adecuados para sus tareas.',
    source_classification: 'operational_summary',
  },
  {
    template_key: 'before_supervision_track_pending',
    title: 'Dar seguimiento a la preparación de las instalaciones en el montaje',
    description: 'Inspeccionar el estado físico del local durante los días de preparación y montaje.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'urgent',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', section: 'Asuntos que atender antes de la asamblea', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Supervisar el avance del montaje de la infraestructura en el local antes de que inicien las sesiones.',
    source_classification: 'direct',
  },

  // Alojamiento (accommodation)
  {
    template_key: 'before_accommodation_department_directories',
    title: 'Preparar los directorios de los departamentos',
    description: 'Preparar directorios sencillos con la ubicación de los departamentos y distribuirlos a quienes corresponda.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'normal',
    assigned_to: 'assistant',
    source_refs: [
      { document: 'CO-1', chapter: '1', paragraphs: '26', displayLabel: 'CO-1 · 1:26' },
      { document: 'CO-1', chapter: '3', paragraphs: '51', displayLabel: 'CO-1 · 3:51' },
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Se deben preparar directorios sencillos con la ubicación de los departamentos, excepto las zonas relacionadas con Contabilidad, y entregarlos a las personas autorizadas.',
    source_classification: 'combined',
  },
  {
    template_key: 'before_accommodation_complimentary_and_backup',
    title: 'Confirmar las habitaciones de cortesía y el hospedaje de respaldo',
    description: 'Verificar la lista aprobada por el Comité y contar con margen de hospedaje particular para casos imprevistos.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '79', displayLabel: 'CO-1 · 3:79' },
      { document: 'CO-80', chapter: '6', paragraphs: '4-8', displayLabel: 'CO-80 · 6:4-8' }
    ],
    instruction_basis: 'El Comité de Asamblea decide quién recibirá habitaciones de cortesía, y el superintendente de Alojamiento debe contar además con hospedaje de respaldo en casas particulares.',
    source_classification: 'combined',
  },
  {
    template_key: 'before_accommodation_hotel_reservations',
    title: 'Coordinar con hoteles y hospedajes locales',
    description: 'Confirmar contratos, listas de precios negociados y acuerdos logísticos con los establecimientos hotelero.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-80', chapter: '1', paragraphs: '1-10', displayLabel: 'CO-80 · 1:1-10' },
      { document: 'CO-80', chapter: '2', paragraphs: '1-12', displayLabel: 'CO-80 · 2:1-12' }
    ],
    instruction_basis: 'Establecer contacto oficial con los hoteles locales, negociar tarifas acordes y validar los cupos de reserva.',
    source_classification: 'direct',
  },

  // Información y Servicio Voluntario (information-volunteers)
  {
    template_key: 'before_info_volunteers_stand_location',
    title: 'Verificar la ubicación y preparación del puesto de Información',
    description: 'Confirmar que el puesto de Información esté bien situado y equipado con los impresos y listas necesarias.',
    phase: 'before',
    department_code: 'information-volunteers',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '51', displayLabel: 'CO-1 · 3:51' },
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'El Departamento de Información debe situarse en un área accesible para atender las consultas de los asistentes.',
    source_classification: 'combined',
  },

  // Instalación (installation)
  {
    template_key: 'before_installation_inspect_site',
    title: 'Supervisar la preparación de la estructura física del local',
    description: 'Supervisar el trabajo de montaje, plataformas, rotulación y áreas reservadas.',
    phase: 'before',
    department_code: 'installation',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '55-62', displayLabel: 'CO-1 · 3:55-62' }
    ],
    instruction_basis: 'Verificar que la sección de Instalación adecúe los espacios, tarimas, letreros y acometidas conforme a los planos.',
    source_classification: 'direct',
  },

  // Limpieza (cleaning)
  {
    template_key: 'before_cleaning_verify_supplies',
    title: 'Verificar la preparación del plan de limpieza e insumos',
    description: 'Confirmar personal suficiente, insumos de limpieza y plan de recogida de basura.',
    phase: 'before',
    department_code: 'cleaning',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'El Departamento de Limpieza debe contar con los insumos y voluntarios necesarios para la limpieza previa y durante el evento.',
    source_classification: 'combined',
  },

  // Objetos Perdidos y Guardarropa (lost-found-cloakroom)
  {
    template_key: 'before_lost_found_setup_area',
    title: 'Establecer el área segura para objetos perdidos y guardarropa',
    description: 'Delimitar y señalizar el módulo de objetos perdidos y guardarropa en la sede.',
    phase: 'before',
    department_code: 'lost-found-cloakroom',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '63-67', displayLabel: 'CO-1 · 3:63-67' }
    ],
    instruction_basis: 'Disponer un espacio seguro y bien identificado para la recepción y custodia de artículos extraviados y prendas.',
    source_classification: 'direct',
  },

  // Transporte y Materiales (transport-materials)
  {
    template_key: 'before_transport_inventory_rentals',
    title: 'Supervisar la logística de recepción de materiales pesados y equipos',
    description: 'Garantizar que el transporte y descarga de equipos cuente con permisos y áreas despejadas.',
    phase: 'before',
    department_code: 'transport-materials',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '80-85', displayLabel: 'CO-1 · 3:80-85' }
    ],
    instruction_basis: 'Coordinar el traslado, descarga y almacenamiento seguro del mobiliario y materiales traídos al local.',
    source_classification: 'direct',
  },

  // ==========================================
  // 2. DURANTE LA ASAMBLEA
  // ==========================================

  // Comité
  {
    template_key: 'during_committee_daily_meetings',
    title: 'Participar en las reuniones diarias de coordinación del Comité',
    description: 'Evaluar el desarrollo diario de la asamblea y ajustar medidas operativas con el Comité.',
    phase: 'during',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'important',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Mantener comunicación continua con el Comité de Asamblea para resolver imprevistos durante el programa.',
    source_classification: 'direct',
  },

  // Supervisión General
  {
    template_key: 'during_supervision_daily_visits',
    title: 'Visitar diariamente los departamentos bajo supervisión',
    description: 'Visitar junto con el auxiliar todos los departamentos bajo esta superintendencia.',
    phase: 'during',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'urgent',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', section: 'Asuntos que atender durante la asamblea', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'El superintendente de Alojamiento y su auxiliar deben visitar todos los departamentos a su cargo al menos una vez al día, si es posible.',
    source_classification: 'direct',
  },
  {
    template_key: 'during_supervision_resolve_incidents',
    title: 'Atender y resolver incidencias operativas de inmediato',
    description: 'Resolver bloqueos o necesidades urgentes reportadas por los jefes de departamento.',
    phase: 'during',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'urgent',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Prestar asistencia inmediata a cualquier departamento que enfrente dificultades operativas durante las sesiones.',
    source_classification: 'operational_summary',
  },

  // Alojamiento
  {
    template_key: 'during_accommodation_operate_stand',
    title: 'Confirmar el funcionamiento del puesto de Alojamiento',
    description: 'Verificar que esté visible, atendido y preparado para resolver consultas y problemas.',
    phase: 'during',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', chapter: '1', paragraphs: '25', displayLabel: 'CO-1 · 1:25' },
      { document: 'CO-1', chapter: '3', paragraphs: '78', displayLabel: 'CO-1 · 3:78' },
      { document: 'CO-80', chapter: '7', paragraphs: '10-11', displayLabel: 'CO-80 · 7:10-11' }
    ],
    instruction_basis: 'El puesto debe estar ubicado en un lugar visible y preparado para atender preguntas, problemas de alojamiento y necesidades de hospedaje de última hora.',
    source_classification: 'combined',
  },
  {
    template_key: 'during_accommodation_manage_hotel_problems',
    title: 'Investigar y resolver problemas relacionados con los hoteles',
    description: 'Atender reclamos comunicados por hoteles o delegados y registrar soluciones.',
    phase: 'during',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '8, 12-13', displayLabel: 'CO-80 · 7:8, 12-13' }
    ],
    instruction_basis: 'Los problemas comunicados por hoteles o asambleístas deben investigarse y resolverse rápidamente. También debe mantenerse un registro conciso de los comentarios y soluciones.',
    source_classification: 'direct',
  },

  // Información
  {
    template_key: 'during_info_volunteers_answer_queries',
    title: 'Supervisar la atención al público en el puesto de Información',
    description: 'Verificar que se suministre orientación clara y respetuosa a los asistentes.',
    phase: 'during',
    department_code: 'information-volunteers',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '51-54', displayLabel: 'CO-1 · 3:51-54' }
    ],
    instruction_basis: 'Brindar información exacta sobre horarios, servicios y ubicación de departamentos durante la jornada.',
    source_classification: 'direct',
  },

  // Limpieza
  {
    template_key: 'during_cleaning_continuous_sweeping',
    title: 'Supervisar el mantenimiento continuo de higiene del recinto',
    description: 'Verificar la recogida periódica de basura y aseo de áreas comunes.',
    phase: 'during',
    department_code: 'cleaning',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Asegurar que los equipos de limpieza recorran las instalaciones para mantener la pulcritud durante las sesiones.',
    source_classification: 'operational_summary',
  },

  // Objetos Perdidos
  {
    template_key: 'during_lost_found_handle_items',
    title: 'Supervisar la custodia y devolución de objetos extraviados',
    description: 'Verificar la anotación rigurosa de pertenencias recibidas e identificaciones devueltas.',
    phase: 'during',
    department_code: 'lost-found-cloakroom',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '63-67', displayLabel: 'CO-1 · 3:63-67' }
    ],
    instruction_basis: 'Llevar un control ordenado de los artículos hallados en el recinto para su pronta devolución a los dueños.',
    source_classification: 'direct',
  },

  // ==========================================
  // 3. DESPUÉS DE LA ASAMBLEA
  // ==========================================

  // Tareas Postasamblea Oficiales de Alojamiento (CO-80)
  {
    template_key: 'after_accommodation_available_for_calls',
    title: 'Estar disponible para atender llamadas telefónicas el día siguiente',
    description: 'Mantener habilitado el contacto para atender inquietudes de última hora de hoteles o delegados.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '14', displayLabel: 'CO-80 · 7:14' }
    ],
    instruction_basis: 'El superintendente de Alojamiento debe estar disponible por teléfono durante todo el día siguiente al cierre de la asamblea.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_accommodation_visit_hotels',
    title: 'Visitar los hoteles contratados tras la asamblea',
    description: 'Agradecer la atención recibida y recopilar impresiones o informes de conducta de los hoteles.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'normal',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '15', displayLabel: 'CO-80 · 7:15' }
    ],
    instruction_basis: 'El superintendente o su auxiliar deben visitar los hoteles utilizados para conocer los comentarios de la gerencia sobre el grupo.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_accommodation_obtain_occupancy_figures',
    title: 'Obtener las cifras finales de ocupación de los hoteles',
    description: 'Solicitar los datos estadísticos exactos de cuartos utilizados en cada establecimiento.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '15', displayLabel: 'CO-80 · 7:15' }
    ],
    instruction_basis: 'Recopilar los datos cuantitativos finales de habitaciones reservadas y ocupadas realmente por asambleístas.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_accommodation_verify_reward_points',
    title: 'Verificar los puntos de premio de hotel, cuando corresponda',
    description: 'Confirmar el manejo correcto de incentivos o puntos generados según las pautas de la sucursal.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'normal',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '16', displayLabel: 'CO-80 · 7:16' }
    ],
    instruction_basis: 'Asegurarse de que los beneficios o puntos acumulados por reservas se gestionen en estricta conformidad con las normas.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_accommodation_fill_co83',
    title: 'Completar el Informe de ocupación de hotel (CO-83)',
    description: 'Diligenciar el formulario oficial CO-83 con los datos de hospedaje consolidados.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'urgent',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '17-20', displayLabel: 'CO-80 · 7:17-20' }
    ],
    instruction_basis: 'Llenar completamente el formulario CO-83 resumiendo la ocupación hotelera y los comentarios recibidos.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_accommodation_send_co83',
    title: 'Enviar el formulario CO-83 dentro de las dos semanas posteriores',
    description: 'Remitir el informe oficial CO-83 a la sucursal en el plazo reglamentario.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'urgent',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '21', displayLabel: 'CO-80 · 7:21' }
    ],
    instruction_basis: 'El formulario CO-83 debe enviarse a la sucursal a más tardar dos semanas después de haber concluido la asamblea.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_accommodation_hand_copy_to_coordinator',
    title: 'Entregar copia del CO-83 y la correspondencia al coordinador',
    description: 'Facilitar una copia completa del informe y cartas relevantes al coordinador del Comité de Asamblea.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '21', displayLabel: 'CO-80 · 7:21' }
    ],
    instruction_basis: 'Entregar una copia del informe CO-83 y la correspondencia oficial de alojamiento al coordinador del Comité de Asamblea.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_accommodation_archive_records',
    title: 'Archivar los registros, formularios y correspondencia del departamento',
    description: 'Organizar los expedientes para la custodia y consulta en futuras asambleas.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'normal',
    assigned_to: 'assistant',
    source_refs: [
      { document: 'CO-80', chapter: '7', paragraphs: '22-23', displayLabel: 'CO-80 · 7:22-23' }
    ],
    instruction_basis: 'Conservar los archivos ordenados de contratos, listas y notas de trabajo conforme a los plazos establecidos.',
    source_classification: 'direct',
  },

  // Otros departamentos en Postasamblea
  {
    template_key: 'after_committee_handover_info',
    title: 'Entregar información relevante a la siguiente asamblea',
    description: 'Transferir aprendizajes y registros archivados al comité del siguiente año.',
    phase: 'after',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'normal',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', chapter: '2', paragraphs: '30-35', displayLabel: 'CO-1 · 2:30-35' }
    ],
    instruction_basis: 'Consolidar la información del evento para garantizar la continuidad operativa en la asamblea venidera.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_supervision_verify_resolved',
    title: 'Verificar la conclusión de los informes pendientes del departamento',
    description: 'Asegurar que todas las actas e informes requeridos hayan sido cerrados.',
    phase: 'after',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'both',
    source_refs: [
      { document: 'CO-1', appendix: 'E', displayLabel: 'CO-1 · Apéndice E' }
    ],
    instruction_basis: 'Comprobar que los departamentos bajo supervisión hayan finalizado sus compromisos postasamblea.',
    source_classification: 'operational_summary',
  },
  {
    template_key: 'after_info_volunteers_pack_up',
    title: 'Supervisar el repliegue del puesto de Información',
    description: 'Verificar la recolección de impresos y archivo de registros de voluntarios.',
    phase: 'after',
    department_code: 'information-volunteers',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '54', displayLabel: 'CO-1 · 3:54' }
    ],
    instruction_basis: 'Recoger los recursos del stand de información y resguardar la documentación generada.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_installation_teardown',
    title: 'Supervisar el desmontaje de la estructura física e inventarios',
    description: 'Supervisar el retiro seguro de letreros, plataformas e infraestructura temporal.',
    phase: 'after',
    department_code: 'installation',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '62', displayLabel: 'CO-1 · 3:62' }
    ],
    instruction_basis: 'Coordinar el desmontaje ordenado garantizando la protección de los elementos del local.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_cleaning_deep_clean',
    title: 'Supervisar la inspección y entrega final del local',
    description: 'Verificar el estado del recinto junto con los administradores de la propiedad.',
    phase: 'after',
    department_code: 'cleaning',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '2', paragraphs: '28-29', displayLabel: 'CO-1 · 2:28-29' }
    ],
    instruction_basis: 'Realizar el recorrido final de inspección para devolver las instalaciones limpias y en buen estado.',
    source_classification: 'combined',
  },
  {
    template_key: 'after_lost_found_classify_unclaimed',
    title: 'Supervisar el procedimiento con los objetos no reclamados',
    description: 'Verificar la clasificación y destino final de artículos extraviados según las normas.',
    phase: 'after',
    department_code: 'lost-found-cloakroom',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '66-67', displayLabel: 'CO-1 · 3:66-67' }
    ],
    instruction_basis: 'Procesar adecuadamente los bienes no reclamados una vez finalizado el periodo de atención.',
    source_classification: 'direct',
  },
  {
    template_key: 'after_transport_return_rentals',
    title: 'Supervisar la devolución de equipos y mobiliario prestado',
    description: 'Confirmar el despacho de tarimas, andamios y camiones de carga contratados.',
    phase: 'after',
    department_code: 'transport-materials',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
    source_refs: [
      { document: 'CO-1', chapter: '3', paragraphs: '84-85', displayLabel: 'CO-1 · 3:84-85' }
    ],
    instruction_basis: 'Verificar la devolución a tiempo de todo el material arrendado o prestado para evitar cobros adicionales.',
    source_classification: 'direct',
  },
];
