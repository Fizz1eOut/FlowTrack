import { Bot } from 'grammy';
import { registerProgress } from './commands/progress';
import { conversations } from '@grammyjs/conversations';
import { type MyContext } from './types';
import { registerStart } from './commands/start';
import { registerHelp } from './commands/help';
import { registerTasks } from './commands/tasks';
import { registerToday } from './commands/today';
import { registerAdd } from './commands/add';
import { registerDone } from './commands/done';

export async function createBot(): Promise<Bot<MyContext>> {
  const botToken = process.env.BOT_TOKEN ?? '';
  const bot = new Bot<MyContext>(botToken);
  registerProgress(bot);

  bot.use(conversations());

  registerStart(bot);
  registerHelp(bot);
  registerTasks(bot);
  registerToday(bot);
  registerAdd(bot);
  registerDone(bot);

  bot.catch((err) => console.error('Bot error:', err));

  await bot.api.setMyCommands([
    { command: 'tasks',  description: 'List active tasks' },
    { command: 'today',  description: 'Tasks due today' },
    { command: 'add',    description: 'Create a task' },
    { command: 'done',   description: 'Complete a task' },
    { command: 'app',    description: 'Open FlowTrack' },
    { command: 'progress', description: 'View your level and stats' },
    { command: 'help',   description: 'Show all commands' },
  ]);

  return bot;
}
