import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, fetchUserWorkspaces, fetchTasksByWorkspace, type TaskFilter } from '../helpers/db';

const priorityEmoji: Record<string, string> = {
  low: '🟢', medium: '🟡', high: '🔴', critical: '🚨',
};

const filterLabels: Record<TaskFilter, string> = {
  all:         '📋 All',
  today:       '📅 Today',
  overdue:     '⏰ Overdue',
  week:        '📆 This week',
  in_progress: '⚡ In Progress',
  low:         '🟢 Low',
  medium:      '🟡 Medium',
  high:        '🔴 High',
  critical:    '🚨 Critical',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatTaskList(
  tasks: Awaited<ReturnType<typeof fetchTasksByWorkspace>>,
  workspaceName: string,
  filter: TaskFilter
): string {
  const filterLabel = filterLabels[filter];

  if (!tasks.length) return `🎉 No tasks found in *${workspaceName}*\nFilter: ${filterLabel}`;

  const lines = tasks.map(t => {
    const num = t.task_number ? `#${t.task_number}` : '—';
    const priority = t.priority ? (priorityEmoji[t.priority] ?? '⬜') : '⬜';
    const due = t.due_date ? `📆 ${formatDate(t.due_date)}` : '';
    const titleLine = `${priority} ${num} *${t.title}*`;
    return due ? `${titleLine}\n    ${due}` : titleLine;
  });

  return `📋 *${workspaceName}* · ${filterLabel} · ${tasks.length} tasks\n\n${lines.join('\n\n')}`;
}

function buildFilterKeyboard(workspaceId: string): InlineKeyboard {
  const cb = (f: TaskFilter) => `tf:${workspaceId}:${f}`;

  return new InlineKeyboard()
    .text('📋 All',         cb('all'))
    .text('⚡ In Progress', cb('in_progress')).row()
    .text('📅 Today',    cb('today'))
    .text('⏰ Overdue',  cb('overdue'))
    .text('📆 Week',     cb('week')).row()
    .text('🟢 Low',      cb('low'))
    .text('🟡 Medium',   cb('medium')).row()
    .text('🔴 High',     cb('high'))
    .text('🚨 Critical', cb('critical'));
}

async function showTasks(ctx: MyContext, workspaceId: string, workspaceName: string, filter: TaskFilter): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const tasks = await fetchTasksByWorkspace(workspaceId, filter);
  const text = formatTaskList(tasks, workspaceName, filter);

  const keyboard = buildFilterKeyboard(workspaceId);
  keyboard.row().webApp('🚀 Open app', `${miniAppUrl}#/dashboard/tasks`);

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
  await ctx.answerCallbackQuery();
}

async function handleTasks(ctx: MyContext): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.reply('❌ Could not identify user.'); return; }

  const user = await findUserByTelegramId(telegramId);
  if (!user) {
    await ctx.reply(
      '⚠️ Account not linked.\n\nOpen the app and link your Telegram account in profile settings.',
      { reply_markup: new InlineKeyboard().webApp('⚙️ Open App', miniAppUrl) }
    );
    return;
  }

  const workspaces = await fetchUserWorkspaces(user.id);

  if (workspaces.length === 1) {
    const ws = workspaces[0] as { id: string; name: string };
    const tasks = await fetchTasksByWorkspace(ws.id, 'all');
    const text = formatTaskList(tasks, ws.name, 'all');
    const keyboard = buildFilterKeyboard(ws.id);
    keyboard.row().webApp('🚀 Open app', `${miniAppUrl}#/dashboard/tasks`);

    await ctx.reply(text, { parse_mode: 'Markdown', reply_markup: keyboard });
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const ws of workspaces) {
    const workspace = ws as { id: string; name: string; type: string };
    const icon = workspace.type === 'personal' ? '👤' : '👥';
    keyboard.text(`${icon} ${workspace.name}`, `tasks:${workspace.id}:${workspace.name}`).row();
  }

  await ctx.reply('📋 *Select a workspace:*', { parse_mode: 'Markdown', reply_markup: keyboard });
}

async function handleWorkspaceCallback(ctx: MyContext): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const data = ctx.callbackQuery?.data ?? '';
  const parts = data.split(':');
  const workspaceId = parts[1];
  const workspaceName = parts.slice(2).join(':');

  if (!workspaceId) { await ctx.answerCallbackQuery('❌ Invalid workspace'); return; }

  const tasks = await fetchTasksByWorkspace(workspaceId, 'all');
  const text = formatTaskList(tasks, workspaceName, 'all');
  const keyboard = buildFilterKeyboard(workspaceId);
  keyboard.row().webApp('🚀 Open app', `${miniAppUrl}#/dashboard/tasks`);

  await ctx.editMessageText(text, { parse_mode: 'Markdown', reply_markup: keyboard });
  await ctx.answerCallbackQuery();
}

async function handleFilterCallback(ctx: MyContext): Promise<void> {
  const data = ctx.callbackQuery?.data ?? '';
  const parts = data.split(':');
  const workspaceId = parts[1];
  const filter = parts[2] as TaskFilter;

  if (!workspaceId || !filter) { await ctx.answerCallbackQuery('❌ Invalid filter'); return; }

  const { data: ws } = await (await import('../helpers/db')).supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single();

  await showTasks(ctx, workspaceId, ws?.name ?? 'Workspace', filter);
}

export function registerTasks(bot: Bot<MyContext>): void {
  bot.command('tasks', handleTasks);
  bot.callbackQuery(/^tasks:/, handleWorkspaceCallback);
  bot.callbackQuery(/^tf:/, handleFilterCallback);
}
