import { Bot } from 'grammy';
import { type MyContext } from '../types';

async function handleHelp(ctx: MyContext): Promise<void> {
  await ctx.reply(
    '📌 *Available commands:*\n\n' +
    '/tasks — list active tasks\n' +
    '/today — tasks due today\n' +
    '/add <title> — create a task\n' +
    '/done <id> — complete a task\n' +
    '/app — open the app',
    { parse_mode: 'Markdown' }
  );
}

export function registerHelp(bot: Bot<MyContext>): void {
  bot.command('help', handleHelp);
}
