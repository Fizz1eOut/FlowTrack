import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, fetchUserWorkspaces, supabase } from '../helpers/db';
import { completeTaskProgress } from '../helpers/progress';

type WorkspaceItem = { id: string; name: string; type: string }

async function completeTaskById(ctx: MyContext, taskId: string, workspaceName: string): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.reply('❌ Could not identify user.'); return; }
  const user = await findUserByTelegramId(telegramId);
  if (!user) { await ctx.reply('⚠️ Account not linked.'); return; }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, status, task_number')
    .eq('id', taskId)
    .single();

  if (!task) { await ctx.reply('❌ Task not found.'); return; }

  if (task.status === 'done') {
    await ctx.reply(
      `⚠️ *#${task.task_number} ${task.title}* is already completed.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'done', previous_status: task.status, completed_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) { await ctx.reply('❌ Failed to update task.'); return; }

  try {
    const { xpEarned, newLevel, leveledUp } = await completeTaskProgress(taskId, user.id);
    const levelUpMsg = leveledUp ? `\n🎉 *Level up! You are now level ${newLevel}!*` : '';
    await ctx.reply(
      `✅ *#${task.task_number} ${task.title}* marked as done!\n📁 ${workspaceName}\n⭐ +${xpEarned} XP${levelUpMsg}`,
      { parse_mode: 'Markdown' }
    );
  } catch {
    await ctx.reply(
      `✅ *#${task.task_number} ${task.title}* marked as done!\n📁 ${workspaceName}`,
      { parse_mode: 'Markdown' }
    );
  }
}

async function handleDone(ctx: MyContext): Promise<void> {
  const raw = ctx.match?.toString().trim().replace('#', '') ?? '';
  const taskNumber = parseInt(raw);

  if (isNaN(taskNumber)) {
    await ctx.reply('Please provide a task number: `/done 22` or `/done #22`', { parse_mode: 'Markdown' });
    return;
  }

  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.reply('❌ Could not identify user.'); return; }

  const user = await findUserByTelegramId(telegramId);
  if (!user) { await ctx.reply('⚠️ Account not linked.'); return; }

  const workspaces = await fetchUserWorkspaces(user.id) as WorkspaceItem[];
  const workspaceIds = workspaces.map(ws => ws.id);

  const { data: foundTasks } = await supabase
    .from('tasks')
    .select('id, title, status, workspace_id')
    .eq('task_number', taskNumber)
    .in('workspace_id', workspaceIds);

  if (!foundTasks?.length) {
    await ctx.reply(`❌ Task *#${taskNumber}* not found in any of your workspaces.`, { parse_mode: 'Markdown' });
    return;
  }

  if (foundTasks.length === 1) {
    const ws = workspaces.find(w => w.id === foundTasks[0].workspace_id);
    await completeTaskById(ctx, foundTasks[0].id, ws?.name ?? '');
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const task of foundTasks) {
    const ws = workspaces.find(w => w.id === task.workspace_id);
    if (!ws) continue;
    const icon = ws.type === 'personal' ? '👤' : '👥';
    keyboard.text(`${icon} ${ws.name}`, `done:${ws.id}:${taskNumber}:${ws.name}`).row();
  }

  await ctx.reply(
    `✅ *Select workspace for task #${taskNumber}:*`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
}

async function handleDoneCallback(ctx: MyContext): Promise<void> {
  const data = ctx.callbackQuery?.data ?? '';
  const parts = data.split(':');
  const workspaceId = parts[1];
  const taskNumber = parseInt(parts[2]);
  const workspaceName = parts.slice(3).join(':');

  if (!workspaceId || isNaN(taskNumber)) {
    await ctx.answerCallbackQuery('❌ Invalid data');
    return;
  }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, status')
    .eq('task_number', taskNumber)
    .eq('workspace_id', workspaceId)
    .single();

  if (!task) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `❌ Task *#${taskNumber}* not found in selected workspace.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (task.status === 'done') {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `⚠️ Task *#${taskNumber}* is already completed.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup({ reply_markup: new InlineKeyboard() });
  await completeTaskById(ctx, task.id, workspaceName);
}

export function registerDone(bot: Bot<MyContext>): void {
  bot.command('done', handleDone);
  bot.callbackQuery(/^done:/, handleDoneCallback);
}
