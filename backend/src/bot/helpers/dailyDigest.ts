import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';
import { supabase, fetchUserWorkspaces } from './db';
import { checkAndCreateRecurringCopies } from './recurring'; // ✅ добавили

const priorityEmoji: Record<string, string> = {
  low: '🟢', medium: '🟡', high: '🔴', critical: '🚨',
};

async function fetchTodayTasks(workspaceId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data } = await supabase
    .from('tasks')
    .select('id, task_number, title, status, due_date, priority')
    .eq('workspace_id', workspaceId)
    .neq('status', 'archived')
    .not('task_number', 'is', null)
    .gte('due_date', todayStart.toISOString())
    .lte('due_date', todayEnd.toISOString())
    .order('status');

  return data ?? [];
}

function formatDigestMessage(
  workspacesWithTasks: Array<{
    ws: { id: string; name: string; type: string };
    tasks: Awaited<ReturnType<typeof fetchTodayTasks>>;
  }>
): string {
  const today = new Date().toLocaleDateString('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const totalTasks = workspacesWithTasks.reduce(
    (sum, { tasks }) => sum + tasks.length,
    0
  );

  if (totalTasks === 0) {
    return `☀️ *Good morning!*\n📅 ${today}\n\n🎉 No tasks due today. Enjoy your day!`;
  }

  const lines: string[] = [
    '☀️ *Good morning!*',
    `📅 ${today}`,
    '',
    `You have *${totalTasks}* task${totalTasks === 1 ? '' : 's'} due today:`,
  ];

  for (const { ws, tasks } of workspacesWithTasks) {
    if (tasks.length === 0) continue;

    const icon = ws.type === 'personal' ? '👤' : '👥';
    const done = tasks.filter((t) => t.status === 'done');
    const pending = tasks.filter((t) => t.status !== 'done');

    lines.push(
      '',
      `${icon} *${ws.name}* · ${done.length}/${tasks.length} completed`
    );

    const formatTask = (t: typeof tasks[number]) => {
      const num = t.task_number ? `#${t.task_number}` : '';
      const priority = t.priority
        ? priorityEmoji[t.priority] ?? '⬜'
        : '⬜';
      const status = t.status === 'done' ? '✅' : priority;
      return `${status} ${num} *${t.title}*`;
    };

    pending.forEach((t) => lines.push(formatTask(t)));

    if (done.length) {
      lines.push(`_Completed (${done.length}):_`);
      done.forEach((t) => lines.push(formatTask(t)));
    }
  }

  return lines.join('\n');
}

export async function sendDailyDigest(
  bot: Bot<MyContext>,
  telegramId: number,
  userId: string
): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';

  await checkAndCreateRecurringCopies(userId);

  const workspaces = await fetchUserWorkspaces(userId);

  type Ws = { id: string; name: string; type: string };

  const workspacesWithTasks = await Promise.all(
    (workspaces as Ws[]).map(async (ws) => ({
      ws,
      tasks: await fetchTodayTasks(ws.id),
    }))
  );

  const text = formatDigestMessage(workspacesWithTasks);

  await bot.api.sendMessage(telegramId, text, {
    parse_mode: 'Markdown',
    link_preview_options: { is_disabled: true },
    reply_markup: new InlineKeyboard().webApp(
      '📅 Open today',
      `${miniAppUrl}#/dashboard/today`
    ),
  });
}

export function startDailyDigest(bot: Bot<MyContext>): void {
  const DIGEST_HOUR = 7;
  const DIGEST_MINUTE = 0;

  function scheduleNext(): void {
    const now = new Date();
    const next = new Date();

    next.setUTCHours(DIGEST_HOUR, DIGEST_MINUTE, 0, 0);

    if (next <= now) {
      next.setUTCDate(next.getUTCDate() + 1);
    }

    const delay = next.getTime() - now.getTime();

    console.log(
      `[DailyDigest] Next digest at ${next.toISOString()} (in ${Math.round(
        delay / 60000
      )} min)`
    );

    setTimeout(async () => {
      await runDigestForAllUsers(bot);
      scheduleNext();
    }, delay);
  }

  scheduleNext();
}

async function runDigestForAllUsers(
  bot: Bot<MyContext>
): Promise<void> {
  console.log('[DailyDigest] Running digest...');

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, telegram_id')
    .not('telegram_id', 'is', null);

  if (!profiles?.length) {
    console.log('[DailyDigest] No users with telegram_id');
    return;
  }

  for (const profile of profiles) {
    try {
      await sendDailyDigest(
        bot,
        profile.telegram_id,
        profile.id
      );

      console.log(
        '[DailyDigest] Sent to telegram_id:',
        profile.telegram_id
      );
    } catch (err) {
      console.error(
        '[DailyDigest] Failed for telegram_id:',
        profile.telegram_id,
        err
      );
    }
  }
}
