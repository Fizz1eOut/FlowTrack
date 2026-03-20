import { Bot } from 'grammy';
import { conversations } from '@grammyjs/conversations';
import { type MyContext } from './types';
import { registerStart } from './commands/start';
import { registerHelp } from './commands/help';
import { registerTasks } from './commands/tasks';
import { registerToday } from './commands/today';
import { registerAdd } from './commands/add';
import { registerDone } from './commands/done';

export function createBot(): Bot<MyContext> {
  const botToken = process.env.BOT_TOKEN ?? '';
  const bot = new Bot<MyContext>(botToken);

  bot.use(conversations());

  registerStart(bot);
  registerHelp(bot);
  registerTasks(bot);
  registerToday(bot);
  registerAdd(bot);
  registerDone(bot);

  bot.catch((err) => console.error('Bot error:', err));

  return bot;
}
