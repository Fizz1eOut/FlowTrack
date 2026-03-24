import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, supabase } from '../helpers/db';

interface ActiveTimer {
  userId: string
  taskId: string
  taskTitle: string
  taskNumber: number
  startTime: number
  chatId: number
  checkInMinutes: number
  checkInTimeout?: ReturnType<typeof setTimeout>
}

const activeTimers = new Map<string, ActiveTimer>();

const CHECK_IN_MINUTES_DEFAULT = 25;

async function saveTimerHistory(timer: ActiveTimer): Promise<number> {
  const stoppedAt = new Date();
  const durationSeconds = Math.floor((stoppedAt.getTime() - timer.startTime) / 1000);
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

  await supabase.from('timer_history').insert({
    user_id: timer.userId,
    task_id: timer.taskId,
    task_title: timer.taskTitle,
    started_at: new Date(timer.startTime).toISOString(),
    stopped_at: stoppedAt.toISOString(),
    duration_seconds: durationSeconds,
    duration_minutes: durationMinutes,
    final_status: 'in_progress',
  });

  return durationMinutes;
}

function scheduleCheckIn(userId: string, bot: Bot<MyContext>): void {
  const timer = activeTimers.get(userId);
  if (!timer) return;

  if (timer.checkInTimeout) clearTimeout(timer.checkInTimeout);

  timer.checkInTimeout = setTimeout(async () => {
    const current = activeTimers.get(userId);
    if (!current) return;

    const elapsed = Math.round((Date.now() - current.startTime) / 60000);

    const keyboard = new InlineKeyboard()
      .text('✅ Still focused', `timer:focus:${userId}`)
      .text('😵 Lost focus',   `timer:lost:${userId}`).row()
      .text('⏹ Stop & save',  `timer:stop:${userId}`);

    await bot.api.sendMessage(
      current.chatId,
      `🔔 *${elapsed} min in* — still focused on:\n*${current.taskTitle}*?`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  }, timer.checkInMinutes * 60 * 1000);
}

async function handleTimer(ctx: MyContext, bot: Bot<MyContext>): Promise<void> {
  const raw = ctx.match?.toString().trim().replace('#', '') ?? '';
  const taskNumber = parseInt(raw);

  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.reply('❌ Could not identify user.'); return; }

  const user = await findUserByTelegramId(telegramId);
  if (!user) { await ctx.reply('⚠️ Account not linked.'); return; }

  const existing = activeTimers.get(user.id);
  if (existing) {
    if (existing.checkInTimeout) clearTimeout(existing.checkInTimeout);
    const minutes = await saveTimerHistory(existing);
    activeTimers.delete(user.id);
    await ctx.reply(
      `⏹ Previous timer stopped.\n⏱ *${existing.taskTitle}* — ${minutes} min logged.`,
      { parse_mode: 'Markdown' }
    );
  }

  if (!raw || isNaN(taskNumber)) {
    await ctx.reply('Please provide a task number: `/timer 22` or `/timer #22`', { parse_mode: 'Markdown' });
    return;
  }

  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, status, estimate_minutes')
    .eq('task_number', taskNumber)
    .eq('workspace_id', user.default_workspace_id)
    .single();

  if (!task) { await ctx.reply(`❌ Task #${taskNumber} not found.`); return; }

  await supabase.from('tasks').update({
    status: 'in_progress',
    previous_status: task.status,
  }).eq('id', task.id);

  const chatId = ctx.chat?.id;
  if (!chatId) { await ctx.reply('❌ Could not identify chat.'); return; }

  const timer: ActiveTimer = {
    userId: user.id,
    taskId: task.id,
    taskTitle: task.title,
    taskNumber,
    startTime: Date.now(),
    chatId,
    checkInMinutes: task.estimate_minutes ?? CHECK_IN_MINUTES_DEFAULT,
  };

  activeTimers.set(user.id, timer);
  scheduleCheckIn(user.id, bot);

  const keyboard = new InlineKeyboard()
    .text('⏹ Stop & save', `timer:stop:${user.id}`);

  await ctx.reply(
    `▶️ *Timer started!*\n\n📌 ${task.title}\n⏰ Check-in in ${timer.checkInMinutes} min`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
}

async function handleTimerCallback(ctx: MyContext, bot: Bot<MyContext>): Promise<void> {
  const data = ctx.callbackQuery?.data ?? '';
  const parts = data.split(':');
  const action = parts[1];
  const userId = parts[2];

  const timer = activeTimers.get(userId);

  if (!timer) {
    await ctx.answerCallbackQuery('⚠️ No active timer found.');
    await ctx.editMessageText('⚠️ Timer already stopped.');
    return;
  }

  const elapsed = Math.round((Date.now() - timer.startTime) / 60000);

  if (action === 'focus') {
    scheduleCheckIn(userId, bot);
    await ctx.answerCallbackQuery('💪 Keep it up!');
    await ctx.editMessageText(
      `✅ *Still in focus!*\n📌 ${timer.taskTitle}\n⏱ ${elapsed} min elapsed\n\n🔔 Next check-in in ${timer.checkInMinutes} min`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().text('⏹ Stop & save', `timer:stop:${userId}`)
      }
    );
  } else if (action === 'lost') {
    if (timer.checkInTimeout) clearTimeout(timer.checkInTimeout);
    await ctx.answerCallbackQuery('😵 Take a break!');
    await ctx.editMessageText(
      `😵 *Lost focus after ${elapsed} min*\n📌 ${timer.taskTitle}\n\nWhat would you like to do?`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('▶️ Resume', `timer:focus:${userId}`)
          .text('⏹ Stop & save', `timer:stop:${userId}`)
      }
    );
  } else if (action === 'stop') {
    if (timer.checkInTimeout) clearTimeout(timer.checkInTimeout);

    const minutes = await saveTimerHistory(timer);
    activeTimers.delete(userId);

    const { data: taskData } = await supabase
      .from('tasks')
      .select('actual_minutes')
      .eq('id', timer.taskId)
      .single();

    const newMinutes = (taskData?.actual_minutes ?? 0) + minutes;
    await supabase.from('tasks').update({ actual_minutes: newMinutes }).eq('id', timer.taskId);

    await ctx.answerCallbackQuery('⏹ Timer stopped!');
    await ctx.editMessageText(
      `⏹ *Timer stopped!*\n\n📌 ${timer.taskTitle}\n⏱ *${minutes} min* logged\n\nTotal time on task: *${newMinutes} min*`,
      { parse_mode: 'Markdown' }
    );
  }
}

export function registerTimer(bot: Bot<MyContext>): void {
  bot.command('timer', (ctx) => handleTimer(ctx, bot));
  bot.callbackQuery(/^timer:/, (ctx) => handleTimerCallback(ctx, bot));
}
