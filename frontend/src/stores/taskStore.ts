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
          original_task_id: null,
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

        await supabase.from('subtasks').insert(subtasksToInsert);
      }

      const { data: taskWithSubtasks } = await supabase
        .from('tasks')
        .select(`
        *,
        workspace:workspaces!workspace_id (id, name, type),
        subtasks (*)
      `)
        .eq('id', task.id)
        .single();

      await fetchTasks();

      if (input.is_recurring) {
        await checkRecurringTasks();
        await fetchTasks();
      }

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
        const { data: todayCopy, error: copyError } = await supabase
          .from('tasks')
          .select('id')
          .eq('original_task_id', task.id)
          .gte('due_date', `${today}T00:00:00.000Z`)
          .lt('due_date', `${today}T23:59:59.999Z`)
          .maybeSingle();

        if (copyError && copyError.code !== 'PGRST116') { 
          throw copyError;
        }

        if (!todayCopy) {
          const { data: newTask, error: insertError } = await supabase
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
            })
            .select()
            .single();

          if (insertError) throw insertError;

          const { data: originalSubtasks } = await supabase
            .from('subtasks')
            .select('*')
            .eq('task_id', task.id);

          if (originalSubtasks && originalSubtasks.length > 0) {
            const subtasksToInsert = originalSubtasks.map(st => ({
              task_id: newTask.id,
              title: st.title,
              completed: false,
              position: st.position
            }));

            const { error: subtaskError } = await supabase
              .from('subtasks')
              .insert(subtasksToInsert);

            if (subtaskError) throw subtaskError;
          }
        }
      }

      await fetchTasks();

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
  };
});
