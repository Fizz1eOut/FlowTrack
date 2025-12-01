import { supabase } from '@/utils/supabase';
import type { UserProgress, LevelRequirement, CompletedTask } from '@/interface/progress.interface';
import type { TaskResponse } from '@/interface/task.interface';
import { XPCalculator } from '@/utils/xpCalculator';

export class ProgressService {

  static async getUserProgress(userId: string): Promise<UserProgress> {
    let { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) {
      const { data: created, error: createError } = await supabase
        .from('user_progress')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) throw createError;
      data = created;
    }
    return data;
  }

  static async getLevelRequirements(): Promise<LevelRequirement[]> {
    const { data, error } = await supabase
      .from('level_requirements')
      .select('*')
      .order('level', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async completeTask(task: TaskResponse, userId: string): Promise<{
    xpEarned: number;
    newLevel: number;
    leveledUp: boolean;
  }> {
    const completedSubtasksCount = task.subtasks?.filter(st => st.completed).length || 0;
    const xpEarned = XPCalculator.calculateTaskXP(task.priority, completedSubtasksCount);

    const currentProgress = await this.getUserProgress(userId);
    const levelRequirements = await this.getLevelRequirements();

    const newTotalXP = currentProgress.total_xp + xpEarned;
    const newLevel = XPCalculator.calculateLevel(newTotalXP, levelRequirements);
    const leveledUp = newLevel > currentProgress.level;

    const { error: completedTaskError } = await supabase
      .from('completed_tasks')
      .insert({
        task_id: task.id,
        user_id: userId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimate_minutes: task.estimate_minutes,
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
        tags: task.tags,
        workspace_id: task.workspace_id
      });

    if (completedTaskError) throw completedTaskError;

    const { error: progressError } = await supabase
      .from('user_progress')
      .update({
        level: newLevel,
        current_xp: newTotalXP,
        total_xp: newTotalXP,
        tasks_completed: currentProgress.tasks_completed + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (progressError) throw progressError;

    return {
      xpEarned,
      newLevel,
      leveledUp
    };
  }

  static async uncompleteTask(task: TaskResponse, userId: string): Promise<number> {
    const { data: completedTask, error: fetchError } = await supabase
      .from('completed_tasks')
      .select('*')
      .eq('task_id', task.id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[ProgressService] Fetch completed task error:', fetchError);
      throw fetchError;
    }

    if (!completedTask) {
      console.warn('[ProgressService] Completed task not found:', task.id);
      return 0;
    }

    const xpToRemove = completedTask.xp_earned;

    const { error: deleteError } = await supabase
      .from('completed_tasks')
      .delete()
      .eq('task_id', task.id)
      .eq('user_id', userId)
      .select();

    if (deleteError) {
      console.error('[ProgressService] Delete completed task error:', deleteError);
      throw deleteError;
    }

    const currentProgress = await this.getUserProgress(userId);
    const levelRequirements = await this.getLevelRequirements();

    const newTotalXP = Math.max(0, currentProgress.total_xp - xpToRemove);
    const newLevel = XPCalculator.calculateLevel(newTotalXP, levelRequirements);

    const { error: progressError } = await supabase
      .from('user_progress')
      .update({
        level: newLevel,
        current_xp: newTotalXP,
        total_xp: newTotalXP,
        tasks_completed: Math.max(0, currentProgress.tasks_completed - 1),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (progressError) throw progressError;

    return xpToRemove;
  }

  static async getCompletedTasks(
    userId: string,
    limit: number = 50
  ): Promise<CompletedTask[]> {
    const { data, error } = await supabase
      .from('completed_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getStats(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('completed_tasks')
      .select('xp_earned, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', startDate)
      .lte('completed_at', endDate);

    if (error) throw error;

    const totalXP = data?.reduce((sum, task) => sum + task.xp_earned, 0) || 0;
    const tasksCount = data?.length || 0;

    return {
      totalXP,
      tasksCount,
      averageXP: tasksCount > 0 ? Math.floor(totalXP / tasksCount) : 0
    };
  }
}
