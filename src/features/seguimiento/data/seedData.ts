import type { Task } from '../types/tracking.types';

export interface SeedTask {
  template_key: string;
  title: string;
  description?: string;
  phase: Task['phase'];
  department_code: Task['department_code'];
  responsibility_type: Task['responsibility_type'];
  priority: Task['priority'];
  assigned_to: Task['assigned_to'];
}

export const OFFICIAL_CHECKLIST_SEED: SeedTask[] = [
  // ==========================================
  // 1. ANTES DE LA ASAMBLEA
  // ==========================================

  // Responsabilidades del Comité (committee)
  {
    template_key: 'before_committee_instructions',
    title: 'Confirmar que se cuenta con las instrucciones vigentes',
    description: 'Revisar la carta S-38 y las pautas actualizadas de la sucursal para la asamblea.',
    phase: 'before',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'urgent',
    assigned_to: 'both',
  },
  {
    template_key: 'before_committee_select_superintendents',
    title: 'Participar en la selección de superintendentes de departamento y sus auxiliares',
    description: 'Evaluar y nombrar a los hermanos calificados para cada uno de los 6 departamentos.',
    phase: 'before',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'important',
    assigned_to: 'superintendent',
  },
  {
    template_key: 'before_committee_know_situation',
    title: 'Conocer la situación de los departamentos con dos o tres meses de anticipación',
    description: 'Hacer el primer diagnóstico de necesidades, personal e infraestructura.',
    phase: 'before',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'normal',
    assigned_to: 'both',
  },
  {
    template_key: 'before_committee_confirm_departments',
    title: 'Confirmar que se cuenta con todos los departamentos necesarios',
    description: 'Verificar la estructura completa de los 6 departamentos bajo Alojamiento.',
    phase: 'before',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'important',
    assigned_to: 'both',
  },

  // Supervisión General (supervision)
  {
    template_key: 'before_supervision_meet_heads',
    title: 'Reunirse con cada superintendente de departamento y su auxiliar',
    description: 'Reunión inicial de orientación para revisar metas e instrucciones del departamento.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'both',
  },
  {
    template_key: 'before_supervision_understand_instructions',
    title: 'Confirmar que cada departamento comprende sus instrucciones',
    description: 'Asegurar que los jefes de departamento tengan el manual y los formularios requeridos.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'both',
  },
  {
    template_key: 'before_supervision_review_volunteers',
    title: 'Revisar las necesidades de personal y cantidad de voluntarios',
    description: 'Validar la cantidad de voluntarios requeridos por departamento.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'assistant',
  },
  {
    template_key: 'before_supervision_review_materials',
    title: 'Revisar equipos, materiales, mobiliario y espacios asignados',
    description: 'Confirmar que cada departamento tenga el espacio físico y recursos para trabajar.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'both',
  },
  {
    template_key: 'before_supervision_track_pending',
    title: 'Registrar y dar seguimiento a los asuntos pendientes',
    description: 'Llevar el control de todas las alertas y temas abiertos antes del evento.',
    phase: 'before',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'urgent',
    assigned_to: 'both',
  },

  // Alojamiento (accommodation)
  {
    template_key: 'before_accommodation_contact_phone',
    title: 'Confirmar el medio de contacto y teléfono del Departamento de Alojamiento',
    description: 'Publicar el número de atención a delegados y discursantes.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'urgent',
    assigned_to: 'both',
  },
  {
    template_key: 'before_accommodation_stand_location',
    title: 'Confirmar la ubicación y preparación del puesto de Alojamiento',
    description: 'Ubicar el stand/oficina de alojamiento en el recinto de la asamblea.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'assistant',
  },
  {
    template_key: 'before_accommodation_hotel_reservations',
    title: 'Dar seguimiento a las reservas de hotel y negociaciones de tarifas',
    description: 'Verificar la lista de hoteles en convenio y confirmaciones de reserva.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
  },
  {
    template_key: 'before_accommodation_complimentary_rooms',
    title: 'Confirmar las habitaciones de cortesía aprobadas',
    description: 'Verificar la asignación de habitaciones de cortesía para discursantes e invitados.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
  },
  {
    template_key: 'before_accommodation_backup_housing',
    title: 'Preparar hospedaje de respaldo en casas particulares',
    description: 'Tener una lista de hogares de hermanos dispuestos a recibir emergencias.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'normal',
    assigned_to: 'both',
  },
  {
    template_key: 'before_accommodation_department_directories',
    title: 'Preparar los directorios de los departamentos',
    description: 'Consolidar los datos de contacto de todos los superintendentes de la asamblea.',
    phase: 'before',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'normal',
    assigned_to: 'assistant',
  },

  // Información y Servicio Voluntario (information-volunteers)
  {
    template_key: 'before_info_volunteers_stand_location',
    title: 'Confirmar la ubicación y montaje del puesto de Información',
    description: 'Verificar mesas, señalización y volantes Informativos.',
    phase: 'before',
    department_code: 'information-volunteers',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },
  {
    template_key: 'before_info_volunteers_id_cards',
    title: 'Organizar las tarjetas de identificación y registros de voluntarios',
    description: 'Tener listos los distintivos para el personal que colaborará durante la asamblea.',
    phase: 'before',
    department_code: 'information-volunteers',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // Instalación (installation)
  {
    template_key: 'before_installation_inspect_site',
    title: 'Inspeccionar la infraestructura física, tarima y áreas de la sede',
    description: 'Supervisar el estado físico de la sede y accesos.',
    phase: 'before',
    department_code: 'installation',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },
  {
    template_key: 'before_installation_review_tech_specs',
    title: 'Revisar requerimientos de montaje, electricidad y señalización',
    description: 'Coordinar requerimientos técnicos y planos de montaje.',
    phase: 'before',
    department_code: 'installation',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // Limpieza (cleaning)
  {
    template_key: 'before_cleaning_verify_supplies',
    title: 'Verificar suministros de aseo, bolsas, escobas y desinfectantes',
    description: 'Asegurar que se cuente con los insumos suficientes para los 3 días.',
    phase: 'before',
    department_code: 'cleaning',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
  },
  {
    template_key: 'before_cleaning_assign_zones',
    title: 'Asignar zonas de limpieza a los grupos de voluntarios',
    description: 'Distribuir auditorio, baños y pasillos por turnos de congregación.',
    phase: 'before',
    department_code: 'cleaning',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // Objetos Perdidos y Guardarropa (lost-found-cloakroom)
  {
    template_key: 'before_lost_found_setup_area',
    title: 'Preparar el área de custodia para objetos perdidos y guardarropa',
    description: 'Organizar estantes, fichas y seguridad del área.',
    phase: 'before',
    department_code: 'lost-found-cloakroom',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // Transporte y Materiales (transport-materials)
  {
    template_key: 'before_transport_inventory_rentals',
    title: 'Coordinar inventario de equipos rentados o prestados',
    description: 'Registrar tarimas, andamios, sillas y mesas que ingresen a la sede.',
    phase: 'before',
    department_code: 'transport-materials',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
  },

  // ==========================================
  // 2. DURANTE LA ASAMBLEA
  // ==========================================

  // Comité
  {
    template_key: 'during_committee_daily_meetings',
    title: 'Asistir a las reuniones diarias del Comité de Asamblea',
    description: 'Reportar novedades del día y recibir instrucciones.',
    phase: 'during',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'important',
    assigned_to: 'both',
  },

  // Supervisión General
  {
    template_key: 'during_supervision_daily_visits',
    title: 'Visitar diariamente los departamentos bajo supervisión',
    description: 'Recorrer los 6 departamentos al menos dos veces por jornada.',
    phase: 'during',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'urgent',
    assigned_to: 'both',
  },
  {
    template_key: 'during_supervision_resolve_incidents',
    title: 'Atender y resolver incidencias operativas de inmediato',
    description: 'Dar apoyo a los superintendentes de departamento ante problemas imprevistos.',
    phase: 'during',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'urgent',
    assigned_to: 'both',
  },

  // Alojamiento
  {
    template_key: 'during_accommodation_operate_stand',
    title: 'Operar el puesto de atención de Alojamiento durante las sesiones',
    description: 'Atender dudas de hospedaje de delegados y discursantes.',
    phase: 'during',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'both',
  },
  {
    template_key: 'during_accommodation_manage_emergencies',
    title: 'Gestionar cualquier emergencia o cambio en las reservas',
    description: 'Reubicar o resolver solicitudes de última hora.',
    phase: 'during',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'superintendent',
  },

  // Información
  {
    template_key: 'during_info_volunteers_answer_queries',
    title: 'Atender consultas en el puesto de información',
    description: 'Dar orientación a los asistentes sobre servicios y ubicaciones.',
    phase: 'during',
    department_code: 'information-volunteers',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // Limpieza
  {
    template_key: 'during_cleaning_continuous_sweeping',
    title: 'Realizar limpieza continua de auditorio, pasillos y baños',
    description: 'Mantener la higiene impecable antes, durante y al finalizar cada sesión.',
    phase: 'during',
    department_code: 'cleaning',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
  },

  // Objetos Perdidos
  {
    template_key: 'during_lost_found_handle_items',
    title: 'Recibir, registrar y entregar objetos extraviados',
    description: 'Resguardar pertenencias encontradas y verificar identidad para su entrega.',
    phase: 'during',
    department_code: 'lost-found-cloakroom',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // ==========================================
  // 3. DESPUÉS DE LA ASAMBLEA
  // ==========================================

  // Comité
  {
    template_key: 'after_committee_handover_info',
    title: 'Entregar información pertinente a la siguiente asamblea',
    description: 'Archivar reportes y documentación para el comité del próximo año.',
    phase: 'after',
    department_code: 'committee',
    responsibility_type: 'committee',
    priority: 'normal',
    assigned_to: 'both',
  },

  // Supervisión
  {
    template_key: 'after_supervision_verify_resolved',
    title: 'Verificar que no queden incidencias abiertas',
    description: 'Confirmar resolución del 100% de incidencias del evento.',
    phase: 'after',
    department_code: 'supervision',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'both',
  },

  // Alojamiento
  {
    template_key: 'after_accommodation_key_return',
    title: 'Verificar la entrega de llaves y estado de habitaciones',
    description: 'Hacer el check-out de habitaciones de cortesía y liquidación final de gastos.',
    phase: 'after',
    department_code: 'accommodation',
    responsibility_type: 'direct_accommodation',
    priority: 'important',
    assigned_to: 'both',
  },

  // Información
  {
    template_key: 'after_info_volunteers_pack_up',
    title: 'Recoger equipos, banners y archivar registros',
    description: 'Finalizar el stand de información y salvaguardar documentos.',
    phase: 'after',
    department_code: 'information-volunteers',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // Instalación
  {
    template_key: 'after_installation_teardown',
    title: 'Desmontar estructuras, ordenar y guardar materiales',
    description: 'Desmontaje seguro de todas las instalaciones temporales.',
    phase: 'after',
    department_code: 'installation',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // Limpieza
  {
    template_key: 'after_cleaning_deep_clean',
    title: 'Hacer limpieza profunda final y entrega de llaves',
    description: 'Dejar la sede en idénticas o mejores condiciones de las que se recibió.',
    phase: 'after',
    department_code: 'cleaning',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
  },

  // Objetos Perdidos
  {
    template_key: 'after_lost_found_classify_unclaimed',
    title: 'Clasificar objetos no reclamados y coordinar su destino',
    description: 'Clasificar ropa, biblias y otros objetos de valor no reclamados.',
    phase: 'after',
    department_code: 'lost-found-cloakroom',
    responsibility_type: 'supervision',
    priority: 'normal',
    assigned_to: 'department_head',
  },

  // Transporte
  {
    template_key: 'after_transport_return_rentals',
    title: 'Retornar equipos rentados y archivar inventarios',
    description: 'Entrega de tarimas, andamios, mesas, etc., de proveedores externos.',
    phase: 'after',
    department_code: 'transport-materials',
    responsibility_type: 'supervision',
    priority: 'important',
    assigned_to: 'department_head',
  },
];
