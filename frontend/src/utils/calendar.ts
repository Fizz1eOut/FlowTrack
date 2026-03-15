import type { EventInput } from '@fullcalendar/core';
import type { TaskResponse } from '@/interface/task.interface';
import { TASK_PRIORITIES } from '@/constants/taskPriorities';

export function taskToCalendarEvent(task: TaskResponse): EventInput | null {
  if (!task.due_date || !task.due_time) return null;

  const dateOnly = task.due_date.split('T')[0];
  const start = new Date(`${dateOnly}T${task.due_time}`);

  const end = task.estimate_minutes
    ? new Date(start.getTime() + task.estimate_minutes * 60_000)
    : new Date(start.getTime() + 30 * 60_000);

  const priority = TASK_PRIORITIES[task.priority as keyof typeof TASK_PRIORITIES];

  return {
    id: task.id,
    title: task.title,
    start,
    end,
    backgroundColor: priority?.color ?? 'var(--primary)',
    borderColor: priority?.borderColor ?? 'var(--primary)',
    extendedProps: { task },
  };
}
