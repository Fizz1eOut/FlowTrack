import { supabase } from '@/utils/supabase';
import type { TaskResponse, Subtask } from '@/interface/task.interface';
import { SubtaskService } from '@/services/subtasks.service';

export class RecurringTaskService {
  static async createTodayCopy(templateTaskId: string): Promise<TaskResponse | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data: templateTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('id', templateTaskId)
      .single();

    if (fetchError) throw fetchError;

    const { data: existingCopy } = await supabase
      .from('tasks')
      .select('id')
      .eq('original_task_id', templateTaskId)
      .gte('due_date', `${today}T00:00:00.000Z`)
      .lt('due_date', `${today}T23:59:59.999Z`)
      .maybeSingle();

    if (existingCopy) {
      console.log('[RecurringTaskService] Today copy already exists');
      return null;
    }

    const { data: newTask, error: insertError } = await supabase
      .from('tasks')
      .insert({
        title: templateTask.title,
        description: templateTask.description,
        user_id: templateTask.user_id,
        workspace_id: templateTask.workspace_id,
        due_date: today,
        due_time: templateTask.due_time,
        priority: templateTask.priority,
        status: 'backlog',
        estimate_minutes: templateTask.estimate_minutes,
        tags: templateTask.tags,
        is_recurring: true,
        original_task_id: templateTaskId
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (templateTask.subtasks && templateTask.subtasks.length > 0) {
      const titles = templateTask.subtasks.map((st: Subtask) => st.title);
      await SubtaskService.createMultiple(newTask.id, titles);
    }

    console.log('[RecurringTaskService] Created today copy');
    return newTask;
  }

  static async checkAndCreateCopies(userId: string): Promise<void> {
    const { data: recurringTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .is('original_task_id', null);

    if (error) throw error;
    if (!recurringTasks || recurringTasks.length === 0) return;

    for (const task of recurringTasks) {
      await this.createTodayCopy(task.id);
    }
  }
}
