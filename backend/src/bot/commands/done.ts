import { Bot } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, supabase } from '../helpers/db';

async function handleDone(ctx: MyContext): Promise<void> {
  const raw = ctx.match?.toString().trim().replace('#', '') ?? '';
  const taskNumber = parseInt(raw);

  if (isNaN(taskNumber)) {
    await ctx.reply('Please provide a task number: `/done 22` or `/done #22`', { parse_mode: 'Markdown' });
    return;
  }

  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.reply('❌ Could not identify user.');
    return;
  }

  const user = await findUserByTelegramId(telegramId);
  if (!user) {
    await ctx.reply('⚠️ Account not linked.');
    return;
  }

  // Ищем по task_number + workspace_id
  const { data: task, error: findError } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('task_number', taskNumber)
    .eq('workspace_id', user.default_workspace_id)
    .single();

  if (findError || !task) {
    await ctx.reply(`❌ Task #${taskNumber} not found.`);
    return;
  }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({ status: 'done' })
    .eq('id', task.id);

  if (updateError) {
    await ctx.reply('❌ Failed to update task.');
    return;
  }

  await ctx.reply(`✅ *${task.title}* marked as done!`, { parse_mode: 'Markdown' });
}

export function registerDone(bot: Bot<MyContext>): void {
  bot.command('done', handleDone);
}
