import { Bot } from 'grammy';
import { type MyContext } from '../types';
import { findUserByTelegramId, supabase } from '../helpers/db';

function calculateStreak(completions: { date: string }[]): number {
  if (!completions.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;

  for (let i = 0; i <= completions.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const found = completions.find(c => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === checkDate.getTime();
    });

    if (found) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

async function handleProgress(ctx: MyContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) { await ctx.reply('❌ Could not identify user.'); return; }

  const user = await findUserByTelegramId(telegramId);
  if (!user) { await ctx.reply('⚠️ Account not linked.'); return; }

  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!progress) {
    await ctx.reply('No progress data yet. Complete some tasks first!');
    return;
  }

  const { data: levelRequirements } = await supabase
    .from('level_requirements')
    .select('*')
    .order('level', { ascending: true });

  const currentLevelReq = levelRequirements?.find(l => l.level === progress.level);
  const nextLevelReq = levelRequirements?.find(l => l.level === progress.level + 1);

  const currentLevelXP = currentLevelReq?.xp_required ?? 0;
  const nextLevelXP = nextLevelReq?.xp_required ?? progress.total_xp;
  const progressXP = progress.total_xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const percentage = neededXP > 0 ? Math.round((progressXP / neededXP) * 100) : 100;

  const barLength = 10;
  const filled = Math.min(barLength, Math.max(0, Math.round((percentage / 100) * barLength)));
  const progressBar = '🟩'.repeat(filled) + '⬜'.repeat(barLength - filled);

  const { data: completions } = await supabase
    .from('daily_completions')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(100);

  const streak = calculateStreak(completions ?? []);

  const today = new Date().toISOString().split('T')[0];
  const { data: todayCompletion } = await supabase
    .from('daily_completions')
    .select('tasks_completed, xp_earned')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  const xpLine = nextLevelReq
    ? `✦ ${progressXP} / ${neededXP} XP → Level ${progress.level + 1}`
    : '✦ Max level reached!';

  const message = [
    `🏆 *Level ${progress.level}*`,
    `\`${progressBar}\` ${percentage}%`,
    xpLine,
    '',
    '─────────────────',
    `🔥 Streak · *${streak}* ${streak === 1 ? 'day' : 'days'}`,
    `✅ Completed · *${progress.tasks_completed}* tasks`,
    `⭐ Total XP · *${progress.total_xp}*`,
    '─────────────────',
    '*Today*',
    `✅ *${todayCompletion?.tasks_completed ?? 0}* tasks done`,
    `⭐ *${todayCompletion?.xp_earned ?? 0}* XP earned`,
  ].join('\n');

  await ctx.reply(message, { parse_mode: 'Markdown' });
}

export function registerProgress(bot: Bot<MyContext>): void {
  bot.command('progress', handleProgress);
}
