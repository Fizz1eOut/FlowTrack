import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, fetchUserWorkspaces, supabase } from '../helpers/db';
import { checkAndCreateRecurringCopies } from '../helpers/recurring';

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

function formatTodayList(tasks: Awaited<ReturnType<typeof fetchTodayTasks>>, workspaceName: string): string {
  if (!tasks.length) return `📭 No tasks due today in *${workspaceName}*`;

  const done = tasks.filter(t => t.status === 'done');
  const pending = tasks.filter(t => t.status !== 'done');

  const formatTask = (t: typeof tasks[number]) => {
    const num = t.task_number ? `#${t.task_number}` : '';
    const priority = t.priority ? (priorityEmoji[t.priority] ?? '⬜') : '⬜';
    const status = t.status === 'done' ? '✅' : priority;
    return `${status} ${num} *${t.title}*`;
  };

  const lines = [
    ...pending.map(formatTask),
    ...(done.length ? ['', `_Completed (${done.length}):_`, ...done.map(formatTask)] : [])
  ];

  return `📅 *Today · ${workspaceName}* · ${done.length}/${tasks.length} completed\n\n${lines.join('\n')}`;
}

async function handleToday(ctx: MyContext): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.reply('❌ Could not identify user.'); return; }

  const user = await findUserByTelegramId(telegramId);
  if (!user) { await ctx.reply('⚠️ Account not linked.'); return; }

  await checkAndCreateRecurringCopies(user.id);

  const workspaces = await fetchUserWorkspaces(user.id);

  if (workspaces.length === 1) {
    const ws = workspaces[0] as { id: string; name: string };
    const tasks = await fetchTodayTasks(ws.id);
    await ctx.reply(formatTodayList(tasks, ws.name), {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().webApp('📅 Open today', `${miniAppUrl}#/dashboard/today`)
    });
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const ws of workspaces) {
    const workspace = ws as { id: string; name: string; type: string };
    const icon = workspace.type === 'personal' ? '👤' : '👥';
    keyboard.text(`${icon} ${workspace.name}`, `today:${workspace.id}:${workspace.name}`).row();
  }

  await ctx.reply('📅 *Select a workspace:*', {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

async function handleTodayCallback(ctx: MyContext): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const data = ctx.callbackQuery?.data ?? '';
  const parts = data.split(':');
  const workspaceId = parts[1];
  const workspaceName = parts.slice(2).join(':');

  if (!workspaceId) { await ctx.answerCallbackQuery('❌ Invalid workspace'); return; }

  const tasks = await fetchTodayTasks(workspaceId);
  await ctx.editMessageText(formatTodayList(tasks, workspaceName), {
    parse_mode: 'Markdown',
    reply_markup: new InlineKeyboard().webApp('📅 Open today', `${miniAppUrl}#/dashboard/today`)
  });
  await ctx.answerCallbackQuery();
}

export function registerToday(bot: Bot<MyContext>): void {
  bot.command('today', handleToday);
  bot.callbackQuery(/^today:/, handleTodayCallback);
}
