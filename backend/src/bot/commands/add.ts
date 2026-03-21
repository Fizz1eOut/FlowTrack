import { type Conversation, createConversation } from '@grammyjs/conversations';
import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, fetchUserWorkspaces, supabase } from '../helpers/db';

type MyConversation = Conversation<MyContext, MyContext>

const priorityOptions = [
  { label: '🟢 Low',      value: 'low' },
  { label: '🟡 Medium',   value: 'medium' },
  { label: '🔴 High',     value: 'high' },
  { label: '🚨 Critical', value: 'critical' },
];

const statusOptions = [
  { label: '📋 Backlog',     value: 'backlog' },
  { label: '⚡ In Progress', value: 'in_progress' },
];

function getDateFromOption(option: string): Date | null {
  const today = new Date();
  if (option === 'today') return today;
  if (option === 'tomorrow') {
    today.setDate(today.getDate() + 1);
    return today;
  }
  if (option === 'week') {
    today.setDate(today.getDate() + 7);
    return today;
  }
  return null;
}

async function addTaskConversation(conversation: MyConversation, ctx: MyContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.reply('❌ Could not identify user.'); return; }

  const user = await conversation.external(() => findUserByTelegramId(telegramId));
  if (!user) { await ctx.reply('⚠️ Account not linked.'); return; }

  const match = ctx.match;
  let title = (typeof match === 'string' ? match : match?.[0] ?? '').trim();

  if (!title) {
    await ctx.reply('📝 *Step 1/6* — Enter task title:', { parse_mode: 'Markdown' });
    const titleCtx = await conversation.wait();
    title = titleCtx.message?.text?.trim() ?? '';
    if (!title) { await ctx.reply('❌ Title is required. Task not created.'); return; }
  }

  const priorityKeyboard = new InlineKeyboard();
  for (const p of priorityOptions) {
    priorityKeyboard.text(p.label, `priority:${p.value}`);
  }

  await ctx.reply(
    `📝 *${title}*\n\n🎯 *Step 2/6* — Select priority:`,
    { parse_mode: 'Markdown', reply_markup: priorityKeyboard }
  );

  const priorityCtx = await conversation.waitForCallbackQuery(/^priority:/);
  const priority = priorityCtx.callbackQuery.data.split(':')[1];
  const priorityLabel = priorityOptions.find(p => p.value === priority)?.label ?? '';
  await priorityCtx.answerCallbackQuery();

  const statusKeyboard = new InlineKeyboard();
  for (const s of statusOptions) {
    statusKeyboard.text(s.label, `status:${s.value}`);
  }

  await priorityCtx.editMessageText(
    `📝 *${title}*\n${priorityLabel}\n\n📌 *Step 3/6* — Select status:`,
    { parse_mode: 'Markdown', reply_markup: statusKeyboard }
  );

  const statusCtx = await conversation.waitForCallbackQuery(/^status:/);
  const status = statusCtx.callbackQuery.data.split(':')[1];
  const statusLabel = statusOptions.find(s => s.value === status)?.label ?? '';
  await statusCtx.answerCallbackQuery();

  const dateKeyboard = new InlineKeyboard()
    .text('📅 Today',    'date:today')
    .text('📅 Tomorrow', 'date:tomorrow').row()
    .text('📆 This week', 'date:week');

  await statusCtx.editMessageText(
    `📝 *${title}*\n${priorityLabel} · ${statusLabel}\n\n📅 *Step 4/6* — Select due date:`,
    { parse_mode: 'Markdown', reply_markup: dateKeyboard }
  );

  const dateCtx = await conversation.waitForCallbackQuery(/^date:/);
  const dateValue = dateCtx.callbackQuery.data.split(':')[1];
  const selectedDate = getDateFromOption(dateValue);
  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  await dateCtx.answerCallbackQuery();

  const timeKeyboard = new InlineKeyboard()
    .text('09:00', 'time:9')
    .text('12:00', 'time:12').row()
    .text('15:00', 'time:15')
    .text('18:00', 'time:18').row()
    .text('20:00', 'time:20')
    .text('22:00', 'time:22');

  await dateCtx.editMessageText(
    `📝 *${title}*\n${priorityLabel} · ${statusLabel} · 📅 ${dateLabel}\n\n⏰ *Step 5/6* — Select time:`,
    { parse_mode: 'Markdown', reply_markup: timeKeyboard }
  );

  const timeCtx = await conversation.waitForCallbackQuery(/^time:/);
  const hours = parseInt(timeCtx.callbackQuery.data.split(':')[1]);
  await timeCtx.answerCallbackQuery();

  const finalDate = selectedDate ?? new Date();
  finalDate.setHours(hours, 0, 0, 0);
  const dueDate = finalDate.toISOString();
  const dueDateLabel = `📅 ${dateLabel} ${String(hours).padStart(2, '0')}:00`;

  const workspaces = await conversation.external(() => fetchUserWorkspaces(user.id));
  let workspaceId = user.default_workspace_id;
  let workspaceName = 'Personal';

  if (workspaces.length > 1) {
    const wsKeyboard = new InlineKeyboard();
    for (const ws of workspaces) {
      const workspace = ws as { id: string; name: string; type: string };
      const icon = workspace.type === 'personal' ? '👤' : '👥';
      wsKeyboard.text(`${icon} ${workspace.name}`, `ws:${workspace.id}:${workspace.name}`).row();
    }

    await timeCtx.editMessageText(
      `📝 *${title}*\n${priorityLabel} · ${statusLabel} · ${dueDateLabel}\n\n📁 *Step 6/6* — Select workspace:`,
      { parse_mode: 'Markdown', reply_markup: wsKeyboard }
    );

    const wsCtx = await conversation.waitForCallbackQuery(/^ws:/);
    const wsParts = wsCtx.callbackQuery.data.split(':');
    workspaceId = wsParts[1];
    workspaceName = wsParts.slice(2).join(':');
    await wsCtx.answerCallbackQuery();

    await wsCtx.editMessageText(`⏳ Creating task *${title}*...`, { parse_mode: 'Markdown' });
  } else {
    const ws = workspaces[0] as { id: string; name: string } | undefined;
    if (ws) { workspaceId = ws.id; workspaceName = ws.name; }

    await timeCtx.editMessageText(`⏳ Creating task *${title}*...`, { parse_mode: 'Markdown' });
  }

  const { data: task, error } = await conversation.external(() =>
    supabase
      .from('tasks')
      .insert({
        title,
        status,
        priority,
        workspace_id: workspaceId,
        user_id: user.id,
        due_date: dueDate,
      })
      .select('id, task_number, title')
      .single()
  );

  console.log('[ADD] task:', task);
  console.log('[ADD] error:', error);

  const summary = [
    '✅ *Task created!*',
    '',
    `📌 ${task?.title ?? title}`,
    task?.task_number ? `🔢 #${task.task_number}` : '',
    priorityLabel,
    statusLabel,
    dueDateLabel,
    `📁 ${workspaceName}`,
  ].filter(Boolean).join('\n');

  await ctx.reply(
    error ? '❌ Failed to create task.' : summary,
    { parse_mode: 'Markdown' }
  );
}

export function registerAdd(bot: Bot<MyContext>): void {
  bot.use(createConversation(addTaskConversation));
  bot.command('add', async (ctx) => {
    await ctx.conversation.enter('addTaskConversation');
  });
}
