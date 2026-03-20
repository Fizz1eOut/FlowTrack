import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type TaskFilter = 'all' | 'today' | 'overdue' | 'week' | 'in_progress' | 'low' | 'medium' | 'high' | 'critical'

export async function findUserByTelegramId(telegramId: number) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('telegram_id', telegramId)
    .single();

  if (!profile) return null;

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name, type)')
    .eq('user_id', profile.id);

  type WorkspaceItem = { id: string; name: string; type: string }
  type MemberItem = { workspace_id: string; workspaces: WorkspaceItem }

  const members = (membership as unknown as MemberItem[]) ?? [];

  const personalWs = members.find(m => m.workspaces?.type === 'personal');
  const defaultMembership = personalWs ?? members[0];
  const defaultWorkspaceId = defaultMembership?.workspaces?.id ?? null;

  return { id: profile.id, full_name: profile.full_name, default_workspace_id: defaultWorkspaceId };
}

export async function fetchUserWorkspaces(userId: string) {
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name, type)')
    .eq('user_id', userId);

  type WorkspaceItem = { id: string; name: string; type: string }
  type MemberItem = { workspace_id: string; workspaces: WorkspaceItem }

  return ((data as unknown as MemberItem[]) ?? []).map(item => item.workspaces).filter(Boolean);
}
export async function fetchTasksByWorkspace(workspaceId: string, filter: TaskFilter = 'all') {
  let query = supabase
    .from('tasks')
    .select('id, task_number, title, status, due_date, priority')
    .eq('workspace_id', workspaceId)
    .neq('status', 'archived')
    .not('task_number', 'is', null);

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);

  switch (filter) {
    case 'today':
      query = query
        .gte('due_date', todayStart.toISOString())
        .lte('due_date', todayEnd.toISOString())
        .neq('status', 'done');
      break;
    case 'overdue':
      query = query
        .lt('due_date', todayStart.toISOString())
        .neq('status', 'done');
      break;
    case 'week':
      query = query
        .gte('due_date', todayStart.toISOString())
        .lte('due_date', weekEnd.toISOString())
        .neq('status', 'done');
      break;
    case 'in_progress':
      query = query.eq('status', 'in_progress');
      break;
    case 'low':
    case 'medium':
    case 'high':
    case 'critical':
      query = query.eq('priority', filter).neq('status', 'done');
      break;
    default:
      query = query.neq('status', 'done');
  }

  const { data } = await query
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(15);

  return data ?? [];
}
