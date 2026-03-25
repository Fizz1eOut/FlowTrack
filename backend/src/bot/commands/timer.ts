import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, fetchUserWorkspaces, supabase } from '../helpers/db';

interface ActiveTimer {
  userId: string
  taskId: string
  taskTitle: string
  taskNumber: number
  workspaceName: string
  startTime: number
  chatId: number
  checkInMinutes: number
  checkInTimeout?: ReturnType<typeof setTimeout>
}

type WorkspaceItem = { id: string; name: string; type: string }

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
      .text('😵 Lost focus', `timer:lost:${userId}`).row()
      .text('⏹ Stop & save', `timer:stop:${userId}`);

    await bot.api.sendMessage(
      current.chatId,
      `🔔 *${elapsed} min in* — still focused on:\n*#${current.taskNumber} ${current.taskTitle}*?`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  }, timer.checkInMinutes * 60 * 1000);
}

async function startTimerForTask(
  ctx: MyContext,
  bot: Bot<MyContext>,
  userId: string,
  workspaceId: string,
  workspaceName: string,
  taskNumber: number
): Promise<void> {
  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, status, estimate_minutes')
    .eq('task_number', taskNumber)
    .eq('workspace_id', workspaceId)
    .single();

  if (!task) { await ctx.reply(`❌ Task *#${taskNumber}* not found.`, { parse_mode: 'Markdown' }); return; }

  if (task.status === 'done') {
    await ctx.reply(
      `⚠️ Task *#${taskNumber} ${task.title}* is already completed. Cannot start timer.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (task.status === 'archived') {
    await ctx.reply(
      `⚠️ Task *#${taskNumber} ${task.title}* is archived. Cannot start timer.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  await supabase.from('tasks').update({
    status: 'in_progress',
    previous_status: task.status,
  }).eq('id', task.id);

  const chatId = ctx.chat?.id;
  if (!chatId) { await ctx.reply('❌ Could not identify chat.'); return; }

  const checkInMinutes = task.estimate_minutes ?? CHECK_IN_MINUTES_DEFAULT;

  const timer: ActiveTimer = {
    userId,
    taskId: task.id,
    taskTitle: task.title,
    taskNumber,
    workspaceName,
    startTime: Date.now(),
    chatId,
    checkInMinutes,
  };

  activeTimers.set(userId, timer);
  scheduleCheckIn(userId, bot);

  await ctx.reply(
    `▶️ *Timer started!*\n\n📌 *#${taskNumber} ${task.title}*\n📁 ${workspaceName}\n⏰ Check-in in ${checkInMinutes} min`,
    {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard().text('⏹ Stop & save', `timer:stop:${userId}`)
    }
  );
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
      `⏹ Previous timer stopped.\n📌 *#${existing.taskNumber} ${existing.taskTitle}* — ${minutes} min logged.`,
      { parse_mode: 'Markdown' }
    );
  }

  if (!raw || isNaN(taskNumber)) {
    await ctx.reply('Please provide a task number: `/timer 22` or `/timer #22`', { parse_mode: 'Markdown' });
    return;
  }

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
    await startTimerForTask(ctx, bot, user.id, foundTasks[0].workspace_id, ws?.name ?? '', taskNumber);
    return;
  }

  const keyboard = new InlineKeyboard();
  for (const task of foundTasks) {
    const ws = workspaces.find(w => w.id === task.workspace_id);
    if (!ws) continue;
    const icon = ws.type === 'personal' ? '👤' : '👥';
    keyboard.text(`${icon} ${ws.name}`, `timer_ws:${ws.id}:${taskNumber}:${ws.name}`).row();
  }

  await ctx.reply(
    `▶️ *Select workspace for task #${taskNumber}:*`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
}

async function handleTimerWorkspaceCallback(ctx: MyContext, bot: Bot<MyContext>): Promise<void> {
  const data = ctx.callbackQuery?.data ?? '';
  const parts = data.split(':');
  const workspaceId = parts[1];
  const taskNumber = parseInt(parts[2]);
  const workspaceName = parts.slice(3).join(':');

  if (!workspaceId || isNaN(taskNumber)) {
    await ctx.answerCallbackQuery('❌ Invalid data');
    return;
  }

  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.answerCallbackQuery('❌ Could not identify user.'); return; }

  const user = await findUserByTelegramId(telegramId);
  if (!user) { await ctx.answerCallbackQuery('⚠️ Account not linked.'); return; }

  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup({ reply_markup: new InlineKeyboard() });
  await startTimerForTask(ctx, bot, user.id, workspaceId, workspaceName, taskNumber);
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
      `✅ *Still in focus!*\n📌 *#${timer.taskNumber} ${timer.taskTitle}*\n📁 ${timer.workspaceName}\n⏱ ${elapsed} min elapsed\n\n🔔 Next check-in in ${timer.checkInMinutes} min`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard().text('⏹ Stop & save', `timer:stop:${userId}`)
      }
    );
  } else if (action === 'lost') {
    if (timer.checkInTimeout) clearTimeout(timer.checkInTimeout);
    await ctx.answerCallbackQuery('😵 Take a break!');
    await ctx.editMessageText(
      `😵 *Lost focus after ${elapsed} min*\n📌 *#${timer.taskNumber} ${timer.taskTitle}*\n📁 ${timer.workspaceName}\n\nWhat would you like to do?`,
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
      `⏹ *Timer stopped!*\n\n📌 *#${timer.taskNumber} ${timer.taskTitle}*\n📁 ${timer.workspaceName}\n⏱ *${minutes} min* logged\n\nTotal time on task: *${newMinutes} min*`,
      { parse_mode: 'Markdown' }
    );
  }
}

export function registerTimer(bot: Bot<MyContext>): void {
  bot.command('timer', (ctx) => handleTimer(ctx, bot));
  bot.callbackQuery(/^timer_ws:/, (ctx) => handleTimerWorkspaceCallback(ctx, bot));
  bot.callbackQuery(/^timer:/, (ctx) => handleTimerCallback(ctx, bot));
}
