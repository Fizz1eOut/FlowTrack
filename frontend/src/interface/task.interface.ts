export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'backlog' | 'in_progress' | 'done' | 'planned' | 'archived';

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
}

export interface TaskWorkspace {
  id: string;
  name: string;
  type: 'personal' | 'team';
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  workspace_id: string;
  due_date: string | null;
  due_time: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimate_minutes: number;
  tags: string[] | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  workspace?: TaskWorkspace;
  subtasks?: Subtask[];
  is_recurring: boolean;
  original_task_id: string | null;
  previous_status?: TaskStatus;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  workspace_id: string;
  due_date: string | null;
  due_time: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimate_minutes: number;
  tags: string[];
  is_recurring: boolean;
  original_task_id?: string | null;
  subtasks: string[];
}

export interface UpdateTaskInput {
  title: string;
  description: string;
  workspace_id: string;
  due_date: string | null;
  due_time: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  estimate_minutes: number;
  tags: string[];
  is_recurring: boolean;
  original_task_id?: string | null;
  subtasks: string[];
}

export interface CreateSubtaskInput {
  task_id: string;
  title: string;
}

export interface UpdateSubtaskInput {
  title?: string;
  completed?: boolean;
  position?: number;
}
