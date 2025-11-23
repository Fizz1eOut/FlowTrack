import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { TaskResponse, CreateTaskInput } from '@/interface/task.interface';

export const useTasksStore = defineStore('tasks', () => {
  const authStore = useAuthStore();
  const tasks = ref<TaskResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const todayTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.value.filter(task => task.due_date === today);
  });

  // Задачи по статусу
  const todoTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'todo');
  });

  const completedTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'done');
  });

  const createTask = async (input: CreateTaskInput): Promise<TaskResponse | null> => {
    try {
      const { data: task, error: createError } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description || null,
          user_id: authStore.userId,
          workspace_id: input.workspace_id,
          due_date: input.due_date || null,
          due_time: input.due_time || null,
          priority: input.priority || 'medium',
          status: input.status || 'todo',
          estimate_minutes: input.estimate_minutes || null,
          tags: input.tags || null,
          is_recurring: input.is_recurring || false,
          original_task_id: input.original_task_id || null,
        })
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

        const { error: subtasksError } = await supabase
          .from('subtasks')
          .insert(subtasksToInsert);

        if (subtasksError) {
          console.error('[TasksStore] Subtasks create error:', subtasksError);
        }
      }

      const { data: taskWithSubtasks, error: fetchError } = await supabase
        .from('tasks')
        .select(`
        *,
        workspace:workspaces!workspace_id (
          id,
          name,
          type
        ),
        subtasks (*)
      `)
        .eq('id', task.id)
        .single();

      if (fetchError) throw fetchError;

      tasks.value.unshift(taskWithSubtasks);
      return taskWithSubtasks;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Create error:', err);
      return null;
    }
  };

  async function fetchTasks(): Promise<TaskResponse[]> {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
        *,
        workspace:workspaces!workspace_id (
          id,
          name,
          type
        ),
        subtasks (*)
      `)
        .eq('user_id', authStore.userId)
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
      const today = new Date().toISOString().split('T')[0];

      const { data: recurringTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', authStore.userId)
        .eq('is_recurring', true)
        .is('original_task_id', null);

      if (fetchError) throw fetchError;
      if (!recurringTasks || recurringTasks.length === 0) return;

      for (const task of recurringTasks) {
        const { data: todayCopy } = await supabase
          .from('tasks')
          .select('id')
          .eq('original_task_id', task.id)
          .eq('due_date', today)
          .single();

        if (!todayCopy) {
          await supabase
            .from('tasks')
            .insert({
              title: task.title,
              description: task.description,
              user_id: task.user_id,
              workspace_id: task.workspace_id,
              due_date: today,
              due_time: task.due_time,
              priority: task.priority,
              status: 'todo',
              estimate_minutes: task.estimate_minutes,
              tags: task.tags,
              is_recurring: true,
              original_task_id: task.id
            });
        }
      }

      await fetchTasks();
    
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[TasksStore] Check recurring error:', message);
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
  };
});
