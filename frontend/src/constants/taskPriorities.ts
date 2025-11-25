export const TASK_PRIORITIES = {
  low: {
    label: 'Low',
    color: 'var(--primary)',
    borderColor: 'var(--primary)'
  },
  medium: {
    label: 'Medium',
    color: 'var(--warning)',
    borderColor: 'var(--warning)'
  },
  high: {
    label: 'High',
    color: 'var(--critical)',
    borderColor: 'var(--critical)'
  },
  critical: {
    label: 'Critical',
    color: 'var(--error)',
    borderColor: 'var(--error)'
  }
} as const;

export type TaskPriority = keyof typeof TASK_PRIORITIES;
