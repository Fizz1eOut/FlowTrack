import type { TaskStatus } from '@/interface/task.interface';

export class TaskStatusUtils {
  static readonly STATUSES: TaskStatus[] = ['backlog', 'planned', 'in_progress', 'done', 'archived'];

  private static readonly ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    backlog: ['planned', 'done', 'archived'],
    planned: ['in_progress', 'done', 'backlog', 'archived'],
    in_progress: ['done', 'planned', 'archived'],
    done: ['archived', 'planned', 'backlog', 'in_progress'],
    archived: ['backlog', 'planned']
  };

  static canTransition(from: TaskStatus, to: TaskStatus): boolean {
    if (from === to) return true;
    return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static getAvailableStatuses(currentStatus: TaskStatus): TaskStatus[] {
    return this.ALLOWED_TRANSITIONS[currentStatus] || [];
  }

  static onDeadlineSet(currentStatus: TaskStatus): TaskStatus {
    if (currentStatus === 'backlog') {
      return 'planned';
    }
    return currentStatus;
  }

  static onTimerStart(currentStatus: TaskStatus): TaskStatus {
    if (currentStatus === 'backlog' || currentStatus === 'planned') {
      return 'in_progress';
    }
    return currentStatus;
  }

  static onCheckboxToggle(
    currentStatus: TaskStatus, 
    checked: boolean,
    previousStatus?: TaskStatus
  ): TaskStatus {
    if (checked) {
      if (currentStatus !== 'done' && currentStatus !== 'archived') {
        return 'done';
      }
    } else {
      if (currentStatus === 'done') {
        if (previousStatus && previousStatus !== 'done' && previousStatus !== 'archived') {
          return previousStatus;
        }
        return 'planned';
      }
    }
    return currentStatus;
  }

  static getPreviousStatus(task: { due_date: string | null; previous_status?: TaskStatus }): TaskStatus {
    if (task.previous_status && task.previous_status !== 'done') {
      return task.previous_status;
    }
    return task.due_date ? 'planned' : 'backlog';
  }

  static canCheck(status: TaskStatus): boolean {
    return status !== 'archived';
  }

  static isCompleted(status: TaskStatus): boolean {
    return status === 'done';
  }

  static isArchived(status: TaskStatus): boolean {
    return status === 'archived';
  }

  static getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      backlog: 'Backlog',
      planned: 'Planned',
      in_progress: 'In Progress',
      done: 'Done',
      archived: 'Archived'
    };
    return labels[status];
  }
}
