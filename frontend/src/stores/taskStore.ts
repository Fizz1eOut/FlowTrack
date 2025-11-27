import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { TaskResponse, CreateTaskInput, UpdateTaskInput } from '@/interface/task.interface';

export const useTasksStore = defineStore('tasks', () => {
  const authStore = useAuthStore();
  const tasks = ref<TaskResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const todayTasks = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.value.filter(task => {
      if (!task.due_date) return false;

      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);

      return taskDate.getTime() === today.getTime();
    });
  });

  const todoTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'backlog');
  });

  const completedTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'done');
  });

  const createTask = async (input: CreateTaskInput): Promise<TaskResponse | null> => {
    try {
      const taskData = {
        title: input.title,
        description: input.description || null,
        user_id: authStore.userId,
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

      const { data: task, error: createError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (createError) throw createError;

      if (input.subtasks && input.subtasks.length > 0) {
        const subtasksToInsert = input.subtasks.map((title, index) => ({
          task_id: task.id,
          title,
          completed: false,
          position: index
        }));

        await supabase.from('subtasks').insert(subtasksToInsert);
      }

      if (input.is_recurring) {
        await createTodayRecurringCopy(task.id);
      }

      await fetchTasks();

      const { data: taskWithSubtasks } = await supabase
        .from('tasks')
        .select(`
          *,
          workspace:workspaces!workspace_id (id, name, type),
          subtasks (*)
        `)
        .eq('id', task.id)
        .single();

      return taskWithSubtasks;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Create error:', err);
      return null;
    }
  };

  async function createTodayRecurringCopy(templateTaskId: string): Promise<void> {
    try {
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
        console.log('[TasksStore] Today copy already exists');
        return;
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
        const subtasksToInsert = templateTask.subtasks.map((st: any) => ({
          task_id: newTask.id,
          title: st.title,
          completed: false,
          position: st.position
        }));

        await supabase.from('subtasks').insert(subtasksToInsert);
      }

      console.log('[TasksStore] Created today copy for recurring task');
    } catch (err) {
      console.error('[TasksStore] Error creating today copy:', err);
    }
  }

  async function fetchTasks(): Promise<TaskResponse[]> {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          workspace:workspaces!workspace_id (id, name, type),
          subtasks (*)
        `)
        .eq('user_id', authStore.userId)
        .or('is_recurring.eq.false,original_task_id.not.is.null')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      tasks.value = data ?? [];
      return data ?? [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Fetch error:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function checkRecurringTasks(): Promise<void> {
    if (!authStore.userId) {
      console.warn('[TasksStore] User not authenticated, skipping recurring check');
      return;
    }

    try {
      const { data: recurringTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', authStore.userId)
        .eq('is_recurring', true)
        .is('original_task_id', null);

      if (fetchError) throw fetchError;
      if (!recurringTasks || recurringTasks.length === 0) return;

      for (const task of recurringTasks) {
        await createTodayRecurringCopy(task.id);
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[TasksStore] Check recurring error:', message);
    }
  }

  async function updateSubtask(
    subtaskId: string, 
    updates: { completed?: boolean }
  ): Promise<void> {
    try {
      const { error: updateError } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', subtaskId);

      if (updateError) throw updateError;
      
      tasks.value = tasks.value.map(task => ({
        ...task,
        subtasks: task.subtasks?.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, ...updates }
            : subtask
        )
      }));
  
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Update subtask error:', err);
    }
  }

  async function updateTask(
    taskId: string, 
    input: UpdateTaskInput
  ): Promise<TaskResponse | null> {
    try {
      const { data: currentTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (!currentTask) throw new Error('Task not found');

      const isRecurringCopy = currentTask.original_task_id !== null;
      const targetTaskId = isRecurringCopy ? currentTask.original_task_id : taskId;

      const updateData: any = {
        title: input.title,
        description: input.description,
        workspace_id: input.workspace_id,
        due_time: input.due_time,
        priority: input.priority,
        estimate_minutes: input.estimate_minutes,
        tags: input.tags,
        is_recurring: input.is_recurring
      };

      if (input.is_recurring || isRecurringCopy) {
        updateData.due_date = null;
      } else {
        updateData.due_date = input.due_date;
      }

      if (isRecurringCopy && input.status !== currentTask.status) {
        await supabase
          .from('tasks')
          .update({ status: input.status })
          .eq('id', taskId);
      }

      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', targetTaskId)
        .select(`
        *,
        workspace:workspaces!workspace_id (id, name, type),
        subtasks (*)
      `)
        .single();

      if (updateError) throw updateError;

      if (input.subtasks !== undefined) {
        await supabase
          .from('subtasks')
          .delete()
          .eq('task_id', targetTaskId);

        if (input.subtasks.length > 0) {
          const subtasksToInsert = input.subtasks.map((title, index) => ({
            task_id: targetTaskId,
            title,
            completed: false,
            position: index
          }));

          await supabase.from('subtasks').insert(subtasksToInsert);
        }
      }

      if (input.is_recurring || isRecurringCopy) {
        const today = new Date().toISOString().split('T')[0];
        await supabase
          .from('tasks')
          .delete()
          .eq('original_task_id', targetTaskId)
          .gte('due_date', `${today}T00:00:00.000Z`)
          .lt('due_date', `${today}T23:59:59.999Z`);

        await createTodayRecurringCopy(targetTaskId);
      }

      await fetchTasks();

      return updatedTask;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Update error:', err);
      return null;
    }
  }

  return {
    tasks,
    loading,
    error,

    todayTasks,
    todoTasks,
    completedTasks,

    createTask,
    fetchTasks,
    checkRecurringTasks,
    updateSubtask,
    updateTask,
  };
});
