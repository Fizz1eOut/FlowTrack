export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  timezone: string;
  work_hours_start: string;
  work_hours_end: string;
  xp: number;
  level: number;
  current_streak: number;
}

export interface ProfileUpdateData {
  full_name?: string;
  timezone?: string;
  work_hours_start?: string;
  work_hours_end?: string;
}
