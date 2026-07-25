import type { Task } from '../types/tracking.types';

export interface ProgressData {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
  overdue: number;
  urgent: number;
  percentage: number;
}

export function calculateProgress(tasks: Task[]): ProgressData {
  const activeTasks = tasks.filter((t) => t.status !== 'not_applicable');
  const completed = activeTasks.filter((t) => t.status === 'completed').length;
  const inProgress = activeTasks.filter((t) => t.status === 'in_progress').length;
  const pending = activeTasks.filter((t) => t.status === 'pending').length;
  const blocked = activeTasks.filter((t) => t.status === 'blocked').length;

  // Fecha actual local en formato YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const overdue = activeTasks.filter(
    (t) => t.status !== 'completed' && t.due_date && t.due_date < todayStr
  ).length;

  const urgent = activeTasks.filter(
    (t) => t.status !== 'completed' && t.priority === 'urgent'
  ).length;

  const percentage = activeTasks.length > 0 ? Math.round((completed / activeTasks.length) * 100) : 0;

  return {
    total: activeTasks.length,
    completed,
    inProgress,
    pending,
    blocked,
    overdue,
    urgent,
    percentage,
  };
}
export default calculateProgress;
