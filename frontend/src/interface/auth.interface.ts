import type { User, Session } from '@supabase/supabase-js';

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface CustomAuthResponse {
  success: boolean;
  data?: string | { user: User | null; session: Session | null } | null;
  error?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface OnboardingData {
  workspaceType: 'personal' | 'team';
  workspaceName?: string;
  workHoursStart?: string;
  workHoursEnd?: string;
  timezone: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  work_hours_start: string | null;
  work_hours_end: string | null;
  xp: number;
}
