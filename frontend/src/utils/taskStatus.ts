import type { TaskStatus } from '@/interface/task.interface';

export class TaskStatusUtils {
  static readonly STATUSES: TaskStatus[] = ['backlog', 'planned', 'in_progress', 'done', 'archived'];
  
  static readonly SELECTABLE_STATUSES: TaskStatus[] = ['backlog', 'planned', 'in_progress', 'done'];

  private static readonly ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    backlog: ['planned', 'in_progress', 'done'],
    planned: ['in_progress', 'done', 'backlog'],
    in_progress: ['done', 'planned', 'backlog'],
    done: ['planned', 'backlog', 'in_progress'],
    archived: ['backlog', 'planned', 'in_progress']
  };

  static canTransition(from: TaskStatus, to: TaskStatus): boolean {
    if (from === to) return true;
    return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static getAvailableStatuses(currentStatus: TaskStatus): TaskStatus[] {
    if (currentStatus === 'archived') {
      return ['backlog', 'planned', 'in_progress'];
    }
    return this.ALLOWED_TRANSITIONS[currentStatus] || [];
  }

  static canArchive(currentStatus: TaskStatus): boolean {
    return currentStatus !== 'archived';
  }

  static canUnarchive(currentStatus: TaskStatus): boolean {
    return currentStatus === 'archived';
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
    if (currentStatus === 'archived') {
      return currentStatus;
    }

    if (checked) {
      if (currentStatus !== 'done') {
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
    if (task.previous_status && task.previous_status !== 'done' && task.previous_status !== 'archived') {
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

  static getStatusColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
      backlog: '#6B7280',
      planned: '#3B82F6',
      in_progress: '#F59E0B',
      done: '#10B981',
      archived: '#9CA3AF'
    };
    return colors[status];
  }

  static getStatusBackground(status: TaskStatus): string {
    const backgrounds: Record<TaskStatus, string> = {
      backlog: '#F3F4F6',
      planned: '#DBEAFE',
      in_progress: '#FEF3C7',
      done: '#D1FAE5',
      archived: '#F9FAFB'
    };
    return backgrounds[status];
  }

  static getStatusClass(status: TaskStatus): string {
    return `status-badge--${status}`;
  }
}
