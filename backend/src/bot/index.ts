import { Bot } from 'grammy';
import { registerProgress } from './commands/progress';
import { registerTimer } from './commands/timer';
import { conversations } from '@grammyjs/conversations';
import { type MyContext } from './types';
import { registerStart } from './commands/start';
import { registerHelp } from './commands/help';
import { registerTasks } from './commands/tasks';
import { registerToday } from './commands/today';
import { registerAdd } from './commands/add';
import { registerDone } from './commands/done';
import { startNotificationListener } from './helpers/notifications';
import { startDailyDigest } from './helpers/dailyDigest';

export async function createBot(): Promise<Bot<MyContext>> {
  const botToken = process.env.BOT_TOKEN ?? '';
  const bot = new Bot<MyContext>(botToken);
  
  bot.use(conversations());

  registerStart(bot);
  registerHelp(bot);
  registerTasks(bot);
  registerToday(bot);
  registerAdd(bot);
  registerDone(bot);
  registerTimer(bot);
  registerProgress(bot);

  bot.catch((err) => console.error('Bot error:', err));

  await bot.api.setMyCommands([
    { command: 'timer', description: 'Start a focus timer for a task' },
    { command: 'tasks', description: 'List active tasks' },
    { command: 'today', description: 'Tasks due today' },
    { command: 'add', description: 'Create a task' },
    { command: 'done', description: 'Complete a task' },
    { command: 'progress', description: 'View your level and stats' },
    { command: 'app', description: 'Open FlowTrack' },
    { command: 'help', description: 'Show all commands' },
  ]);

  startNotificationListener(bot);
  startDailyDigest(bot);

  return bot;
}
