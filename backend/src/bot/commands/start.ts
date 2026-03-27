import { Bot, InlineKeyboard, Keyboard } from 'grammy';
import { type MyContext } from '../types';
import { supabase } from '../helpers/db';

async function handleStart(ctx: MyContext): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const telegramId = ctx.from?.id;

  // payload — UUID пользователя, если пришёл по deep link t.me/bot?start=USER_ID
  const payload = ctx.match as string | undefined;

  if (payload && telegramId) {
    const { error } = await supabase
      .from('profiles')
      .update({ telegram_id: telegramId })
      .eq('id', payload);

    if (!error) {
      console.log('[Start] Linked telegram_id', telegramId, 'to user', payload);
    }
  }

  const replyKeyboard = new Keyboard()
    .text('📌 All commands')
    .resized()
    .persistent();

  const inlineKeyboard = new InlineKeyboard()
    .webApp('🚀 Open FlowTrack', miniAppUrl);

  await ctx.reply(
    "👋 Hi! I'm the FlowTrack bot.\n\nManage your tasks directly from Telegram.",
    { reply_markup: inlineKeyboard }
  );

  await ctx.reply(
    '⬇️ Use the button below to see all commands:',
    { reply_markup: replyKeyboard }
  );
}

export function registerStart(bot: Bot<MyContext>): void {
  bot.command('start', handleStart);

  bot.hears('📌 All commands', async ctx => {
    await ctx.reply(
      '🚀 *Available commands:*\n\n' +
      '/timer <id> — start a focus timer\n' +
      '/tasks — list active tasks\n' +
      '/today — tasks due today\n' +
      '/add <title> — create a task\n' +
      '/done <id> — complete a task\n' +
      '/progress — view your level and stats\n' +
      '/app — open the app',
      { parse_mode: 'Markdown' }
    );
  });
}
