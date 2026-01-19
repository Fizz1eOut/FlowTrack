import { supabase } from '@/utils/supabase';
import type { TaskResponse, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/interface/task.interface';
import { RecurringTaskService } from '@/services/recurring.service';
import { SubtaskService } from '@/services/subtasks.service';
import { TaskStatusUtils } from '@/utils/taskStatus';
import { useAuthStore } from '@/stores/authStore';
import { ProgressService } from '@/services/progress.service';

export class TaskService {
  static async fetchAll(workspaceId: string): Promise<TaskResponse[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        workspace:workspaces!workspace_id (id, name, type),
        subtasks (*)
      `)
      .eq('workspace_id', workspaceId)
      .or('is_recurring.eq.false,original_task_id.not.is.null')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async create(userId: string, input: CreateTaskInput): Promise<TaskResponse> {
    const taskData = {
      title: input.title,
      description: input.description || null,
      user_id: userId,
      workspace_id: input.workspace_id,
      due_date: input.is_recurring ? null : (input.due_date || null),
      due_time: input.due_time || null,
      priority: input.priority || 'medium',
      status: input.status || 'backlog',
      estimate_minutes: input.estimate_minutes || null,
      tags: input.tags || null,
      is_recurring: input.is_recurring || false,
      original_task_id: null,
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;

    if (input.subtasks && input.subtasks.length > 0) {
      await SubtaskService.createMultiple(task.id, input.subtasks);
    }

    let taskToReturn = task;
    if (input.is_recurring) {
      const todayCopy = await RecurringTaskService.createTodayCopy(task.id);
      if (todayCopy) {
        taskToReturn = todayCopy;
      }
    }

    return await this.getById(taskToReturn.id);
  }

  static async update(taskId: string, input: UpdateTaskInput): Promise<TaskResponse> {
    const currentTask = await this.getById(taskId);
    const isRecurringCopy = currentTask.original_task_id !== null;
    
    if (isRecurringCopy && currentTask.original_task_id) {
      return await this.updateRecurringCopy(taskId, currentTask.original_task_id, input);
    } else {
      return await this.updateRegularTask(taskId, input);
    }
  }

  private static async updateRecurringCopy(
    copyId: string, 
    templateId: string, 
    input: UpdateTaskInput
  ): Promise<TaskResponse> {
    const templateData = {
      title: input.title,
      description: input.description,
      workspace_id: input.workspace_id,
      due_time: input.due_time,
      priority: input.priority,
      estimate_minutes: input.estimate_minutes,
      tags: input.tags,
      is_recurring: input.is_recurring,
      due_date: null
    };

    const { error: templateError } = await supabase
      .from('tasks')
      .update(templateData)
      .eq('id', templateId);

    if (templateError) throw templateError;

    if (input.subtasks !== undefined) {
      await SubtaskService.replaceAll(templateId, input.subtasks);
    }

    const copyData = {
      title: input.title,
      description: input.description,
      workspace_id: input.workspace_id,
      due_time: input.due_time,
      priority: input.priority,
      estimate_minutes: input.estimate_minutes,
      tags: input.tags,
      status: input.status
    };

    const { data: updatedCopy, error: copyError } = await supabase
      .from('tasks')
      .update(copyData)
      .eq('id', copyId)
      .select(`
        *,
        workspace:workspaces!workspace_id (id, name, type),
        subtasks (*)
      `)
      .single();

    if (copyError) throw copyError;

    if (input.subtasks !== undefined) {
      await SubtaskService.replaceAll(copyId, input.subtasks);
    }

    return updatedCopy;
  }

  private static async updateRegularTask(taskId: string, input: UpdateTaskInput): Promise<TaskResponse> {
    const updateData: Partial<TaskResponse> = {
      title: input.title,
      description: input.description,
      workspace_id: input.workspace_id,
      due_time: input.due_time,
      priority: input.priority,
      estimate_minutes: input.estimate_minutes,
      tags: input.tags,
      is_recurring: input.is_recurring,
      due_date: input.is_recurring ? null : input.due_date,
      status: input.status
    };

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        workspace:workspaces!workspace_id (id, name, type),
        subtasks (*)
      `)
      .single();

    if (error) throw error;

    if (input.subtasks !== undefined) {
      await SubtaskService.replaceAll(taskId, input.subtasks);
    }

    if (input.is_recurring) {
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('tasks')
        .delete()
        .eq('original_task_id', taskId)
        .gte('due_date', `${today}T00:00:00.000Z`)
        .lt('due_date', `${today}T23:59:59.999Z`);

      await RecurringTaskService.createTodayCopy(taskId);
    }

    return updatedTask;
  }

  static async delete(taskId: string): Promise<void> {
    const { data: task } = await supabase
      .from('tasks')
      .select('original_task_id, is_recurring')
      .eq('id', taskId)
      .single();

    if (!task) throw new Error('Task not found');

    const isRecurringTemplate = task.is_recurring && !task.original_task_id;
  
    const isRecurringCopy = task.original_task_id !== null;

    if (isRecurringTemplate) {
      await supabase.from('tasks').delete().eq('original_task_id', taskId);
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    } else if (isRecurringCopy && task.original_task_id) {
      await supabase.from('tasks').delete().eq('original_task_id', task.original_task_id);
      const { error: templateError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.original_task_id);
      if (templateError) throw templateError;
    } else {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    }
  }

  static async updateSubtask(subtaskId: string, updates: { completed?: boolean }): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', subtaskId);

    if (error) throw error;
  }

  static async getById(taskId: string): Promise<TaskResponse> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        workspace:workspaces!workspace_id (id, name, type),
        subtasks (*)
      `)
      .eq('id', taskId)
      .single();

    if (error) throw error;
    return data;
  }

  static async toggleTaskCompletion(
    taskId: string, 
    currentStatus: TaskStatus
  ): Promise<{ xpEarned: number; leveledUp: boolean; newLevel: number }> {
    const userId = useAuthStore().userId;
    if (!userId) throw new Error('User not authenticated');

    const task = await this.getById(taskId);
  
    console.log('[TaskService] Toggle completion:', {
      taskId,
      currentStatus,  
      taskTitle: task.title
    });

    const newStatus = TaskStatusUtils.onCheckboxToggle(
      currentStatus, 
      !TaskStatusUtils.isCompleted(currentStatus),
      task.previous_status
    );

    console.log('[TaskService] New status:', newStatus);

    if (newStatus === currentStatus) {
      return { xpEarned: 0, leveledUp: false, newLevel: 0 };
    }

    const updateData: Partial<TaskResponse> = {
      status: newStatus,
      previous_status: currentStatus
    };

    if (newStatus === 'done') {
      updateData.completed_at = new Date().toISOString();

      if (task.subtasks && task.subtasks.length > 0) {
        await supabase
          .from('subtasks')
          .update({ completed: true })
          .eq('task_id', taskId);
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      const progressResult = await ProgressService.completeTask(task, userId);

      return progressResult;
    }

    console.log('[TaskService] Uncompleting task, removing from completed_tasks');
    updateData.completed_at = null;

    if (task.subtasks && task.subtasks.length > 0) {
      await supabase
        .from('subtasks')
        .update({ completed: false })
        .eq('task_id', taskId);
    }

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) throw error;

    const xpRemoved = await ProgressService.uncompleteTask(task, userId);
    console.log('[TaskService] Task uncompleted successfully');

    return { xpEarned: -xpRemoved, leveledUp: false, newLevel: 0 };
  }

  static async archiveTask(taskId: string): Promise<void> {
    const { data: task } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', taskId)
      .single();

    if (!task) throw new Error('Task not found');

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'archived' as TaskStatus,
        previous_status: task.status
      })
      .eq('id', taskId);

    if (error) throw error;
  }

  static async unarchiveTask(taskId: string): Promise<void> {
    const { data: task } = await supabase
      .from('tasks')
      .select('previous_status, due_date')
      .eq('id', taskId)
      .single();

    if (!task) throw new Error('Task not found');

    const newStatus = task.previous_status || (task.due_date ? 'planned' : 'backlog');

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) throw error;
  }

  static async updateActualMinutes(taskId: string, minutes: number): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ actual_minutes: minutes })
      .eq('id', taskId);

    if (error) throw error;
  }

  static async updateStatus(taskId: string, status: TaskStatus): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);

    if (error) throw error;
  }

  static async markInProgress(taskId: string): Promise<void> {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    if (!task || task.status === 'in_progress') return;

    await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        previous_status: task.status
      })
      .eq('id', taskId);
  }
}
