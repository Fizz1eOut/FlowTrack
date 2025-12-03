export interface UserProgress {
  id: string;
  user_id: string;
  level: number;
  current_xp: number;
  total_xp: number;
  tasks_completed: number;
  created_at: string;
  updated_at: string;
}

export interface LevelRequirement {
  level: number;
  xp_required: number;
  xp_total: number;
}

export interface CompletedTask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: string;
  estimate_minutes: number | null;
  completed_at: string;
  xp_earned: number;
  tags: string[] | null;
  workspace_id: string | null;
  created_at: string;
}

export interface XPCalculation {
  baseXP: number;
  priorityBonus: number;
  subtaskBonus: number;
  totalXP: number;
}

export interface DailyCompletion {
  id: string;
  user_id: string;
  date: string;
  tasks_completed: number;
  xp_earned: number;
  created_at: string;
}
