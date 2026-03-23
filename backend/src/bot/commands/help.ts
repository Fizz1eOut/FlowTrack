import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';

async function handleHelp(ctx: MyContext): Promise<void> {
  await ctx.reply(
    '🚀 *Available commands:*\n\n' +
    '/tasks — list active tasks\n' +
    '/today — tasks due today\n' +
    '/add <title> — create a task\n' +
    '/done <id> — complete a task\n' +
    '/progress — view your level and stats\n' +
    '/app — open the app',
    { parse_mode: 'Markdown' }
  );
}

async function handleApp(ctx: MyContext): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  const keyboard = new InlineKeyboard().webApp('🚀 Open FlowTrack', miniAppUrl);
  await ctx.reply('Open FlowTrack:', { reply_markup: keyboard });
}

export function registerHelp(bot: Bot<MyContext>): void {
  bot.command('help', handleHelp);
  bot.command('app', handleApp);
}
