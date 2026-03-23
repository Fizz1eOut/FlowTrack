import { Bot } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, supabase } from '../helpers/db';
import { completeTaskProgress } from '../helpers/progress';

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

  const { data: task, error: findError } = await supabase
    .from('tasks')
    .select('id, title, status')
    .eq('task_number', taskNumber)
    .eq('workspace_id', user.default_workspace_id)
    .single();

  if (findError || !task) {
    await ctx.reply(`❌ Task #${taskNumber} not found.`);
    return;
  }

  if (task.status === 'done') {
    await ctx.reply(`⚠️ Task #${taskNumber} is already completed.`);
    return;
  }

  const { error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'done',
      previous_status: task.status,
      completed_at: new Date().toISOString(),
    })
    .eq('id', task.id);

  if (updateError) { await ctx.reply('❌ Failed to update task.'); return; }

  try {
    const { xpEarned, newLevel, leveledUp } = await completeTaskProgress(task.id, user.id);

    const levelUpMsg = leveledUp ? `\n🎉 *Level up! You are now level ${newLevel}!*` : '';

    await ctx.reply(
      `✅ *${task.title}* marked as done!\n⭐ +${xpEarned} XP${levelUpMsg}`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('[Done] Progress update error:', err);
    await ctx.reply(`✅ *${task.title}* marked as done!`, { parse_mode: 'Markdown' });
  }
}

export function registerDone(bot: Bot<MyContext>): void {
  bot.command('done', handleDone);
}
