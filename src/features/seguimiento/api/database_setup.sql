-- ==========================================
-- 1. EXTENSIONES Y LIMPIEZA
-- ==========================================
create extension if not exists "uuid-ossp";

-- ==========================================
-- 2. TABLAS PRINCIPALES
-- ==========================================

-- Tabla de perfiles vinculados a auth.users de Supabase
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text unique not null,
  role text not null check (role in ('admin', 'accommodation_superintendent', 'accommodation_assistant', 'department_superintendent', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de eventos (asambleas)
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  year integer not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de tareas (checklist)
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  template_key text,
  source text default 'official' check (source in ('official', 'custom')),
  title text not null,
  description text,
  phase text not null check (phase in ('before', 'during', 'after')),
  department_code text not null check (department_code in ('accommodation', 'information-volunteers', 'installation', 'cleaning', 'lost-found-cloakroom', 'transport-materials', 'committee', 'supervision')),
  responsibility_type text not null check (responsibility_type in ('committee', 'supervision', 'direct_accommodation')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'blocked', 'completed', 'not_applicable')),
  priority text not null default 'normal' check (priority in ('normal', 'important', 'urgent')),
  assigned_to text not null default 'both' check (assigned_to in ('superintendent', 'assistant', 'both', 'department_head')),
  due_date date,
  completed_at timestamp with time zone,
  completed_by uuid references public.profiles(id) on delete set null,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint tasks_event_template_key_unique unique (event_id, template_key)
);

-- Tabla de subtareas
create table if not exists public.subtasks (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  is_completed boolean default false not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de incidencias
create table if not exists public.issues (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  department_code text not null,
  task_id uuid references public.tasks(id) on delete set null,
  description text not null,
  level text not null default 'normal' check (level in ('normal', 'important', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  reported_by text not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  action_taken text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de historial (auditoría)
create table if not exists public.task_activity (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  user_name text not null,
  action text not null,
  previous_status text,
  new_status text,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Configuración de departamentos excluidos/opcionales
create table if not exists public.department_configs (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  department_code text not null check (department_code in ('installation', 'transport-materials')),
  status text not null default 'active' check (status in ('active', 'not_required', 'not_applicable')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ==========================================
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.issues enable row level security;
alter table public.task_activity enable row level security;
alter table public.department_configs enable row level security;

-- ==========================================
-- 4. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Perfiles (Los usuarios pueden ver todos los perfiles de la asamblea, pero solo editar el propio)
create policy "Permitir lectura de perfiles a todos los autenticados" on public.profiles
  for select to authenticated using (true);

create policy "Permitir actualización de perfil propio" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Eventos
create policy "Permitir lectura de eventos a todos" on public.events
  for select using (true);

-- Tareas (Permitir lectura, inserción y actualización completa)
create policy "Permitir lectura de tareas a todos" on public.tasks
  for select using (true);

create policy "Permitir insercion de tareas a todos" on public.tasks
  for insert with check (true);

create policy "Permitir actualizacion de tareas a todos" on public.tasks
  for update using (true);

create policy "Permitir eliminacion de tareas a todos" on public.tasks
  for delete using (true);

-- Subtareas (Políticas heredadas de tareas)
create policy "Acceso completo a subtareas para personal de alojamiento" on public.subtasks
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role in ('admin', 'accommodation_superintendent', 'accommodation_assistant')
    )
  );

create policy "Lectura de subtareas para todos los autenticados" on public.subtasks
  for select to authenticated using (true);

-- Incidencias
create policy "Acceso completo a incidencias para personal de alojamiento" on public.issues
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role in ('admin', 'accommodation_superintendent', 'accommodation_assistant')
    )
  );

create policy "Crear incidencias y verlas para otros usuarios" on public.issues
  for select to authenticated using (true);

create policy "Crear incidencias para todos los autenticados" on public.issues
  for insert to authenticated with check (true);

-- Historial de actividades (Solo lectura para todos)
create policy "Lectura del historial para todos los autenticados" on public.task_activity
  for select to authenticated using (true);

-- Configuración de departamentos
create policy "Acceso completo a configs de departamento para alojamiento" on public.department_configs
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role in ('admin', 'accommodation_superintendent', 'accommodation_assistant')
    )
  );

create policy "Lectura de configs de departamento para todos los autenticados" on public.department_configs
  for select to authenticated using (true);

-- ==========================================
-- 5. FUNCIONES Y TRIGGERS AUTOMÁTICOS
-- ==========================================

-- Trigger para crear perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    case 
      when lower(new.email) = 'dartjfe@gmail.com' then 'accommodation_superintendent'
      when lower(new.email) = 'benjaminmaestre@gmail.com' then 'accommodation_assistant'
      else 'viewer'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger para registrar actividad al modificar tareas
create or replace function public.log_task_activity()
returns trigger as $$
declare
  current_user_id uuid;
  current_user_name text;
begin
  current_user_id := auth.uid();
  
  if current_user_id is not null then
    select full_name into current_user_name from public.profiles where id = current_user_id;
  end if;
  
  if current_user_name is null then
    current_user_name := 'Sistema';
  end if;

  if (TG_OP = 'UPDATE') then
    if (old.status is distinct from new.status) then
      insert into public.task_activity (task_id, user_id, user_name, action, previous_status, new_status, comment)
      values (new.id, current_user_id, current_user_name, 'update_status', old.status, new.status, new.notes);
    elsif (old.notes is distinct from new.notes) then
      insert into public.task_activity (task_id, user_id, user_name, action, previous_status, new_status, comment)
      values (new.id, current_user_id, current_user_name, 'update_notes', new.status, new.status, new.notes);
    elsif (old.assigned_to is distinct from new.assigned_to) then
      insert into public.task_activity (task_id, user_id, user_name, action, previous_status, new_status, comment)
      values (new.id, current_user_id, current_user_name, 'update_assignment', new.status, new.status, 'Asignación modificada a: ' || new.assigned_to);
    end if;
  elsif (TG_OP = 'INSERT') then
    insert into public.task_activity (task_id, user_id, user_name, action, previous_status, new_status, comment)
    values (new.id, current_user_id, current_user_name, 'create_task', null, new.status, 'Tarea creada');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_task_change
  after insert or update on public.tasks
  for each row execute procedure public.log_task_activity();

-- ==========================================
-- 6. PRECARGAR EVENTO Y CHECKLIST BASE
-- ==========================================

-- Insertar evento base
insert into public.events (id, name, year, is_active)
values ('11111111-1111-1111-1111-111111111111', 'Medellín 4 • Felices Para Siempre', 2026, true);

-- Insertar configuraciones de departamentos opcionales
insert into public.department_configs (event_id, department_code, status)
values 
  ('11111111-1111-1111-1111-111111111111', 'installation', 'active'),
  ('11111111-1111-1111-1111-111111111111', 'transport-materials', 'active');

-- Insertar tareas del checklist
-- ANTES DE LA ASAMBLEA
insert into public.tasks (event_id, title, description, phase, department_code, responsibility_type, status, priority, assigned_to, due_date)
values
  -- Comité
  ('11111111-1111-1111-1111-111111111111', 'Confirmar documentos e instrucciones vigentes', 'Estudiar y repasar todas las cartas y manuales de asamblea actualizados para alojamiento.', 'before', 'committee', 'committee', 'pending', 'important', 'both', '2026-07-15'),
  ('11111111-1111-1111-1111-111111111111', 'Participar en la selección de superintendentes y auxiliares', 'Proponer y evaluar nombres de hermanos capacitados para liderar los 6 departamentos bajo nuestra supervisión.', 'before', 'committee', 'committee', 'pending', 'important', 'both', '2026-06-30'),
  ('11111111-1111-1111-1111-111111111111', 'Confirmar los departamentos necesarios', 'Definir si se requieren los departamentos opcionales (Instalación y Transporte y Materiales).', 'before', 'committee', 'committee', 'pending', 'normal', 'both', '2026-07-05'),
  ('11111111-1111-1111-1111-111111111111', 'Participar en la ubicación de los departamentos', 'Alinear con el Comité de Asamblea dónde se situará físicamente cada departamento en la sede.', 'before', 'committee', 'committee', 'pending', 'normal', 'both', '2026-07-10'),
  ('11111111-1111-1111-1111-111111111111', 'Participar en la reunión preasamblea', 'Asistir a la reunión general de organización del Comité de Asamblea con todos los superintendentes de sección.', 'before', 'committee', 'committee', 'pending', 'important', 'both', '2026-07-28'),
  ('11111111-1111-1111-1111-111111111111', 'Participar en la asignación de habitaciones de cortesía y hospedaje particular', 'Revisar y autorizar el listado final de asignación de habitaciones para oradores e invitados especiales.', 'before', 'accommodation', 'direct_accommodation', 'pending', 'urgent', 'both', '2026-07-25'),
  -- Supervisión General
  ('11111111-1111-1111-1111-111111111111', 'Reunirse con cada superintendente de departamento y su auxiliar', 'Reunión preasamblea individual con los responsables de Alojamiento, Voluntarios, Limpieza, etc.', 'before', 'supervision', 'supervision', 'pending', 'important', 'both', '2026-07-24'),
  ('11111111-1111-1111-1111-111111111111', 'Confirmar que conocen sus instrucciones', 'Verificar que cada superintendente bajo supervisión tenga copias de las guías correspondientes.', 'before', 'supervision', 'supervision', 'pending', 'normal', 'both', '2026-07-24'),
  ('11111111-1111-1111-1111-111111111111', 'Revisar organización, personal y horarios de los departamentos', 'Verificar que los cuadrantes de turnos y la cantidad de voluntarios asignada a cada departamento sean adecuados.', 'before', 'supervision', 'supervision', 'pending', 'important', 'both', '2026-07-25'),
  ('11111111-1111-1111-1111-111111111111', 'Revisar necesidades de equipos y materiales', 'Asegurar que Limpieza, Instalación y Transporte tengan sus herramientas antes del montaje.', 'before', 'supervision', 'supervision', 'pending', 'normal', 'both', '2026-07-20'),
  ('11111111-1111-1111-1111-111111111111', 'Confirmar canales de comunicación', 'Definir cómo nos comunicaremos durante el evento (teléfonos, radioteléfonos, etc.).', 'before', 'supervision', 'supervision', 'pending', 'normal', 'both', '2026-07-29'),
  ('11111111-1111-1111-1111-111111111111', 'Identificar necesidades de personal y resolver faltantes', 'Ayudar a los departamentos que reporten déficit de voluntarios a solicitar más apoyo de las congregaciones.', 'before', 'supervision', 'supervision', 'pending', 'important', 'both', '2026-07-26'),
  ('11111111-1111-1111-1111-111111111111', 'Inspeccionar las instalaciones durante el montaje', 'Hacer un recorrido por el campus y coliseo durante el montaje de departamentos.', 'before', 'supervision', 'supervision', 'pending', 'normal', 'both', '2026-07-30'),
  -- Departamentos Específicos
  ('11111111-1111-1111-1111-111111111111', 'Coordinar con hoteles y hospedajes locales', 'Confirmar reservas y acuerdos logísticos para delegados.', 'before', 'accommodation', 'direct_accommodation', 'pending', 'important', 'both', '2026-07-20'),
  ('11111111-1111-1111-1111-111111111111', 'Reclutar y programar personal voluntario', 'Confirmar la base de datos de voluntarios de Información y Servicio Voluntario.', 'before', 'information-volunteers', 'supervision', 'pending', 'normal', 'department_head', '2026-07-25'),
  ('11111111-1111-1111-1111-111111111111', 'Revisar herramientas y materiales requeridos para el montaje', 'Verificar que el equipo de instalación tenga andamios, tornillería y herramientas listas.', 'before', 'installation', 'supervision', 'pending', 'normal', 'department_head', '2026-07-28'),
  ('11111111-1111-1111-1111-111111111111', 'Confirmar personal suficiente, insumos de limpieza y plan de basura', 'Verificar el stock de bolsas, desinfectantes y contenedores del departamento de Limpieza.', 'before', 'cleaning', 'supervision', 'pending', 'important', 'department_head', '2026-07-27'),
  ('11111111-1111-1111-1111-111111111111', 'Establecer área segura para guardar ropa y objetos perdidos', 'Delimitar y señalizar el módulo de objetos perdidos en la sede.', 'before', 'lost-found-cloakroom', 'supervision', 'pending', 'normal', 'department_head', '2026-07-29'),
  ('11111111-1111-1111-1111-111111111111', 'Coordinar vehículos de carga y materiales pesados', 'Garantizar que el camión o vehículos de transporte de materiales cuenten con permisos de acceso.', 'before', 'transport-materials', 'supervision', 'pending', 'important', 'department_head', '2026-07-28');

-- DURANTE LA ASAMBLEA
insert into public.tasks (event_id, title, description, phase, department_code, responsibility_type, status, priority, assigned_to)
values
  -- Alojamiento Supervisión General
  ('11111111-1111-1111-1111-111111111111', 'Visitar todos los departamentos supervisados al menos una vez cada día (Viernes)', 'Hacer ronda por los 6 departamentos para validar operatividad y levantar necesidades del Viernes.', 'during', 'supervision', 'supervision', 'pending', 'important', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Visitar todos los departamentos supervisados al menos una vez cada día (Sábado)', 'Hacer ronda por los 6 departamentos para validar operatividad y levantar necesidades del Sábado.', 'during', 'supervision', 'supervision', 'pending', 'important', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Visitar todos los departamentos supervisados al menos una vez cada día (Domingo)', 'Hacer ronda por los 6 departamentos para validar operatividad y levantar necesidades del Domingo.', 'during', 'supervision', 'supervision', 'pending', 'important', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Buscar aspectos por los cuales felicitar', 'Promover el buen ánimo en el voluntariado mediante palabras de aprecio espiritual y felicitaciones.', 'during', 'supervision', 'supervision', 'pending', 'normal', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Ayudar a mejorar el desempeño cuando sea necesario', 'Resolver cuellos de botella o desvíos menores en el desempeño de los departamentos.', 'during', 'supervision', 'supervision', 'pending', 'normal', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Confirmar que cada departamento funciona correctamente', 'Validar con los superintendentes de departamento que no tengan faltantes de insumos o personal en turnos.', 'during', 'supervision', 'supervision', 'pending', 'important', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Informar al Comité sobre asuntos graves', 'Reportar incidentes mayores de inmediato a la Coordinación del Comité de Asamblea.', 'during', 'committee', 'committee', 'pending', 'urgent', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Dar seguimiento a incidencias abiertas', 'Revisar activamente el panel de incidencias para asegurar la resolución de problemas pendientes.', 'during', 'supervision', 'supervision', 'pending', 'important', 'both'),
  -- Departamentos Específicos Durante
  ('11111111-1111-1111-1111-111111111111', 'Atender a los delegados e invitados especiales al llegar', 'Coordinar registro de llegada y asignación definitiva de habitaciones.', 'during', 'accommodation', 'direct_accommodation', 'pending', 'important', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Instalar el stand de información y atender dudas', 'Atender a delegados, coordinar asignaciones de última hora y resolver quejas.', 'during', 'information-volunteers', 'supervision', 'pending', 'normal', 'department_head'),
  ('11111111-1111-1111-1111-111111111111', 'Estar disponible para resolver fallas en las estructuras del evento', 'Atender reparaciones de carpas, tarimas y señalizaciones.', 'during', 'installation', 'supervision', 'pending', 'normal', 'department_head'),
  ('11111111-1111-1111-1111-111111111111', 'Inspeccionar baños y áreas comunes continuamente', 'Supervisar el mantenimiento y limpieza periódica de las instalaciones sanitarias.', 'during', 'cleaning', 'supervision', 'pending', 'important', 'department_head'),
  ('11111111-1111-1111-1111-111111111111', 'Registrar objetos recibidos y entregados', 'Atender recepción de pertenencias y reclamos del auditorio.', 'during', 'lost-found-cloakroom', 'supervision', 'pending', 'normal', 'department_head'),
  ('11111111-1111-1111-1111-111111111111', 'Estar disponible para traslados logísticos urgentes', 'Movilización de equipos, materiales y apoyo al montaje/desmontaje imprevisto.', 'during', 'transport-materials', 'supervision', 'pending', 'important', 'department_head');

-- DESPUÉS DE LA ASAMBLEA
insert into public.tasks (event_id, title, description, phase, department_code, responsibility_type, status, priority, assigned_to)
values
  -- Alojamiento Supervisión General Después
  ('11111111-1111-1111-1111-111111111111', 'Confirmar el cierre de cada departamento', 'Verificar que todos los departamentos bajo supervisión hayan finalizado su labor y entregado sus zonas.', 'after', 'supervision', 'supervision', 'pending', 'important', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Participar en la inspección final', 'Acompañar al Comité y al administrador del local en el recorrido final para verificar que no haya daños.', 'after', 'committee', 'committee', 'pending', 'important', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Reunirse con los superintendentes de departamento', 'Reunión de balance final de la superintendencia para registrar lecciones aprendidas.', 'after', 'supervision', 'supervision', 'pending', 'normal', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Registrar lo que funcionó bien, dificultades y recomendaciones', 'Redactar informe consolidado de la Superintendencia de Alojamiento.', 'after', 'supervision', 'supervision', 'pending', 'normal', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Identificar hermanos que recibieron capacitación', 'Listar voluntarios con potencial de desarrollo para asignaciones futuras en 2027.', 'after', 'supervision', 'supervision', 'pending', 'normal', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Entregar información pertinente a la siguiente asamblea', 'Archivar reportes y documentación para el comité del próximo año.', 'after', 'committee', 'committee', 'pending', 'normal', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Verificar que no queden incidencias abiertas', 'Confirmar resolución del 100% de incidencias del evento.', 'after', 'supervision', 'supervision', 'pending', 'important', 'both'),
  -- Departamentos Específicos Después
  ('11111111-1111-1111-1111-111111111111', 'Verificar la entrega de llaves y estado de habitaciones', 'Hacer el check-out de habitaciones de cortesía y liquidación final de gastos.', 'after', 'accommodation', 'direct_accommodation', 'pending', 'important', 'both'),
  ('11111111-1111-1111-1111-111111111111', 'Recoger equipos, banners y archivar registros', 'Finalizar el stand de información y salvaguardar los documentos de voluntarios.', 'after', 'information-volunteers', 'supervision', 'pending', 'normal', 'department_head'),
  ('11111111-1111-1111-1111-111111111111', 'Desmontar estructuras, ordenar y guardar materiales', 'Desmontaje seguro de todas las instalaciones temporales.', 'after', 'installation', 'supervision', 'pending', 'normal', 'department_head'),
  ('11111111-1111-1111-1111-111111111111', 'Hacer limpieza profunda final y entrega de llaves', 'Dejar la sede en idénticas o mejores condiciones de limpieza en las que se recibió.', 'after', 'cleaning', 'supervision', 'pending', 'important', 'department_head'),
  ('11111111-1111-1111-1111-111111111111', 'Clasificar objetos no reclamados y coordinar su destino', 'Clasificar ropa, biblias y otros objetos de valor no reclamados.', 'after', 'lost-found-cloakroom', 'supervision', 'pending', 'normal', 'department_head'),
  ('11111111-1111-1111-1111-111111111111', 'Retornar equipos rentados y archivar inventarios', 'Entrega de tarimas, andamios, mesas, etc., de proveedores externos.', 'after', 'transport-materials', 'supervision', 'pending', 'important', 'department_head');
