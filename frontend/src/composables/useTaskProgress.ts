import type { Subtask } from '@/interface/task.interface';

export function useTaskProgress(subtasks: Subtask[] | undefined) {
  if (!subtasks || subtasks.length === 0) {
    return {
      total: 0,
      completed: 0,
      percentage: 0
    };
  }

  const completed = subtasks.filter(s => s.completed).length;
  const total = subtasks.length;
  const percentage = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    percentage
  };
}
