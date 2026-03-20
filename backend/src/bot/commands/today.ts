import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, supabase } from '../helpers/db';

const priorityEmoji: Record<string, string> = {
  low: '🟢', medium: '🟡', high: '🔴', critical: '🚨',
};

async function handleToday(ctx: MyContext): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.reply('❌ Could not identify user.'); return; }

  const user = await findUserByTelegramId(telegramId);
  if (!user) { await ctx.reply('⚠️ Account not linked.'); return; }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: allTasks, error } = await supabase
    .from('tasks')
    .select('id, task_number, title, status, due_date, priority')
    .eq('workspace_id', user.default_workspace_id)
    .neq('status', 'archived')
    .not('task_number', 'is', null)
    .gte('due_date', todayStart.toISOString())
    .lte('due_date', todayEnd.toISOString());

  console.log('[TODAY] tasks:', allTasks);
  console.log('[TODAY] error:', error);

  const tasks = allTasks ?? [];

  if (!tasks.length) {
    await ctx.reply('📭 No tasks due today.');
    return;
  }

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

  await ctx.reply(
    `📅 *Today's tasks* · ${done.length}/${tasks.length} completed\n\n${lines.join('\n')}`,
    {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .webApp('📅 Open today', `${miniAppUrl}#/dashboard/today`)
    }
  );
}

export function registerToday(bot: Bot<MyContext>): void {
  bot.command('today', handleToday);
}
