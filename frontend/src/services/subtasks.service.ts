import { supabase } from '@/utils/supabase';

export class SubtaskService {
  static async createMultiple(taskId: string, titles: string[]): Promise<void> {
    const subtasksToInsert = titles.map((title, index) => ({
      task_id: taskId,
      title,
      completed: false,
      position: index
    }));

    const { error } = await supabase.from('subtasks').insert(subtasksToInsert);
    if (error) throw error;
  }

  static async replaceAll(taskId: string, titles: string[]): Promise<void> {
    await supabase.from('subtasks').delete().eq('task_id', taskId);

    if (titles.length > 0) {
      await this.createMultiple(taskId, titles);
    }
  }
}
