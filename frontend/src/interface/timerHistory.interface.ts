export interface TimerHistoryRecord {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  started_at: string;
  stopped_at: string;
  duration_seconds: number;
  duration_minutes: number;
  final_status: string;
  created_at: string;
  recurring_template_id: string | null;
}

export interface CreateTimerHistoryInput {
  task_id: string;
  task_title: string;
  started_at: string;
  stopped_at: string;
  duration_seconds: number;
  duration_minutes: number;
  final_status: string;
  recurring_template_id: string | null;
}

export interface TimerHistoryStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionMinutes: number;
  longestSessionMinutes: number;
  mostProductiveDay: string | null;
}
