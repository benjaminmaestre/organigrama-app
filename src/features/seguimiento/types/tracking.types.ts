export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'accommodation_superintendent' | 'accommodation_assistant' | 'department_superintendent' | 'viewer';
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  year: number;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  event_id: string;
  template_key?: string;
  source?: 'official' | 'custom';
  title: string;
  description?: string;
  phase: 'before' | 'during' | 'after';
  department_code: 'accommodation' | 'information-volunteers' | 'installation' | 'cleaning' | 'lost-found-cloakroom' | 'transport-materials' | 'committee' | 'supervision';
  responsibility_type: 'committee' | 'supervision' | 'direct_accommodation';
  status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'not_applicable';
  priority: 'normal' | 'important' | 'urgent';
  assigned_to: 'superintendent' | 'assistant' | 'both' | 'department_head';
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  updated_at: string;
  created_at: string;
  subtasks_count?: number;
  subtasks_completed_count?: number;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface Issue {
  id: string;
  event_id: string;
  department_code: string;
  task_id?: string;
  description: string;
  level: 'normal' | 'important' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  reported_by: string;
  assigned_to?: string;
  action_taken?: string;
  resolved_at?: string;
  created_at: string;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id?: string;
  user_name: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  comment?: string;
  created_at: string;
}

export interface DepartmentConfig {
  id: string;
  event_id: string;
  department_code: 'installation' | 'transport-materials';
  status: 'active' | 'not_required' | 'not_applicable';
  updated_at: string;
}
