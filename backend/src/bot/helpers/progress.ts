import { supabase } from './db';

function calculateTaskXP(priority: string | null, completedSubtasksCount: number): number {
  const priorityXP: Record<string, number> = {
    low: 10,
    medium: 20,
    high: 35,
    critical: 50,
  };
  const baseXP = priority ? (priorityXP[priority] ?? 20) : 20;
  const subtaskBonus = completedSubtasksCount * 5;
  return baseXP + subtaskBonus;
}

function calculateLevel(totalXP: number, levelRequirements: { level: number; xp_required: number }[]): number {
  let currentLevel = 1;
  for (const req of levelRequirements) {
    if (totalXP >= req.xp_required) {
      currentLevel = req.level;
    } else {
      break;
    }
  }
  return currentLevel;
}

export async function completeTaskProgress(
  taskId: string,
  userId: string
): Promise<{ xpEarned: number; newLevel: number; leveledUp: boolean }> {
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*, subtasks(*)')
    .eq('id', taskId)
    .single();

  if (taskError || !task) throw new Error('Task not found');

  const completedSubtasksCount = task.subtasks?.filter((st: { completed: boolean }) => st.completed).length ?? 0;
  const xpEarned = calculateTaskXP(task.priority, completedSubtasksCount);

  let { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!progress) {
    const { data: newProgress } = await supabase
      .from('user_progress')
      .insert({ user_id: userId, level: 1, total_xp: 0, tasks_completed: 0 })
      .select()
      .single();
    progress = newProgress;
  }

  if (!progress) throw new Error('Failed to get user progress');

  const { data: levelRequirements } = await supabase
    .from('level_requirements')
    .select('*')
    .order('level', { ascending: true });

  const newTotalXP = progress.total_xp + xpEarned;
  const newLevel = calculateLevel(newTotalXP, levelRequirements ?? []);
  const leveledUp = newLevel > progress.level;

  await supabase.from('completed_tasks').insert({
    task_id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    priority: task.priority,
    estimate_minutes: task.estimate_minutes,
    completed_at: new Date().toISOString(),
    xp_earned: xpEarned,
    tags: task.tags,
    workspace_id: task.workspace_id,
  });

  await supabase
    .from('user_progress')
    .update({
      level: newLevel,
      total_xp: newTotalXP,
      tasks_completed: progress.tasks_completed + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('daily_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('daily_completions')
      .update({
        tasks_completed: existing.tasks_completed + 1,
        xp_earned: existing.xp_earned + xpEarned,
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('daily_completions').insert({
      user_id: userId,
      date: today,
      tasks_completed: 1,
      xp_earned: xpEarned,
    });
  }

  return { xpEarned, newLevel, leveledUp };
}
