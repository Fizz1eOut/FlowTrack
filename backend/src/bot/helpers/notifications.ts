import { Bot } from 'grammy';
import { type MyContext } from '../types';
import { supabase } from './db';

type NotificationType =
  | 'workspace_invitation'
  | 'task_assigned'
  | 'task_deadline'
  | 'task_completed'
  | 'member_joined'
  | 'mention'

interface NotificationRecord {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
}

let lastCheckedAt: string = new Date().toISOString();

async function getTelegramId(userId: string): Promise<number | null> {
  const { data } = await supabase
    .from('profiles')
    .select('telegram_id')
    .eq('id', userId)
    .single();

  return data?.telegram_id ?? null;
}

async function fetchNewNotifications(): Promise<NotificationRecord[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .gt('created_at', lastCheckedAt)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Notifications] Fetch error:', error);
    return [];
  }

  return data ?? [];
}

function formatNotification(notification: NotificationRecord): string {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const data = notification.data ?? {};

  switch (notification.type) {
    case 'task_assigned': {
      const taskTitle = data.task_title as string ?? '';
      const workspaceName = data.workspace_name as string ?? '';
      const assignedByName = data.assigned_by_name as string ?? '';
      return (
        '📌 *Task assigned to you*\n\n' +
        `*${taskTitle}*\n` +
        `📁 ${workspaceName}\n` +
        `👤 Assigned by: ${assignedByName}\n\n` +
        `[Open app](${miniAppUrl}#/dashboard/tasks)`
      );
    }

    case 'workspace_invitation': {
      const workspaceName = data.workspace_name as string ?? '';
      const invitedBy = data.invited_by as string ?? '';
      return (
        '🎉 *You\'ve been invited\\!*\n\n' +
        `Workspace: *${workspaceName}*\n` +
        `Invited by: ${invitedBy}\n\n` +
        `[Open app to accept](${miniAppUrl})`
      );
    }

    case 'member_joined': {
      const workspaceName = data.workspace_name as string ?? '';
      const acceptedBy = data.accepted_by_email as string ?? '';
      return (
        '👋 *New member joined*\n\n' +
        `${acceptedBy} joined *${workspaceName}*`
      );
    }

    case 'task_deadline': {
      const taskTitle = data.task_title as string ?? '';
      const deadline = data.deadline as string ?? '';
      const date = deadline ? new Date(deadline).toLocaleDateString('en', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : '';
      return (
        '⏰ *Deadline approaching\\!*\n\n' +
        `*${taskTitle}*\n` +
        `📅 Due: ${date}\n\n` +
        `[Open app](${miniAppUrl}#/dashboard/today)`
      );
    }

    case 'task_completed': {
      const taskTitle = data.task_title as string ?? '';
      return `✅ *Task completed:* ${taskTitle}`;
    }

    case 'mention': {
      return `💬 *You were mentioned*\n\n${notification.message ?? ''}`;
    }

    default:
      return `🔔 *${notification.title}*\n${notification.message ?? ''}`;
  }
}

async function pollNotifications(bot: Bot<MyContext>): Promise<void> {
  const notifications = await fetchNewNotifications();

  if (notifications.length === 0) return;

  lastCheckedAt = notifications[notifications.length - 1].created_at;

  for (const notification of notifications) {
    try {
      const telegramId = await getTelegramId(notification.user_id);
      if (!telegramId) {
        console.log('[Notifications] No telegram_id for user:', notification.user_id);
        continue;
      }

      const text = formatNotification(notification);

      await bot.api.sendMessage(telegramId, text, {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
      });

      console.log('[Notifications] Sent:', notification.type, '→ telegram_id:', telegramId);
    } catch (err) {
      console.error('[Notifications] Failed to send:', notification.id, err);
    }
  }
}

export function startNotificationListener(bot: Bot<MyContext>): void {
  const POLL_INTERVAL_MS = 5000;

  console.log('[Notifications] Starting polling, interval:', POLL_INTERVAL_MS, 'ms');

  setInterval(() => {
    pollNotifications(bot).catch(err => {
      console.error('[Notifications] Poll error:', err);
    });
  }, POLL_INTERVAL_MS);
}
