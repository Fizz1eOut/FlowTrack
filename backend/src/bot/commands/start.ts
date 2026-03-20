import { Bot, InlineKeyboard } from 'grammy';
import { type MyContext } from '../types';

async function handleStart(ctx: MyContext): Promise<void> {
  const miniAppUrl = process.env.MINI_APP_URL ?? '';
  
  const keyboard = new InlineKeyboard().webApp('📋 Open FlowTrack', miniAppUrl);
  await ctx.reply("👋 Hi! I'm the FlowTrack bot.\n\nManage your tasks directly from Telegram.", {
    reply_markup: keyboard,
  });
}

export function registerStart(bot: Bot<MyContext>): void {
  bot.command('start', handleStart);
}
