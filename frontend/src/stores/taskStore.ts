import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import type { TaskResponse, CreateTaskInput, UpdateTaskInput } from '@/interface/task.interface';
import { TaskService } from '@/services/tasks.service';
import { RecurringTaskService } from '@/services/recurring.service';

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

  async function fetchTasks(): Promise<TaskResponse[]> {
    const userId = authStore.userId;
    if (!userId) {
      console.warn('[TasksStore] User not authenticated');
      return [];
    }

    loading.value = true;
    error.value = null;

    try {
      const data = await TaskService.fetchAll(userId);
      tasks.value = data;
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Fetch error:', err);
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function createTask(input: CreateTaskInput): Promise<TaskResponse | null> {
    const userId = authStore.userId;
    if (!userId) {
      console.error('[TasksStore] User not authenticated');
      return null;
    }

    try {
      const task = await TaskService.create(userId, input);
      await fetchTasks();
      return task;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Create error:', err);
      return null;
    }
  }

  async function updateTask(taskId: string, input: UpdateTaskInput): Promise<TaskResponse | null> {
    try {
      const task = await TaskService.update(taskId, input);
      await fetchTasks();
      return task;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Update error:', err);
      return null;
    }
  }

  async function deleteTask(taskId: string): Promise<boolean> {
    try {
      await TaskService.delete(taskId);
      tasks.value = tasks.value.filter(task => task.id !== taskId);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Delete error:', err);
      return false;
    }
  }

  async function updateSubtask(subtaskId: string, updates: { completed?: boolean }): Promise<void> {
    try {
      await TaskService.updateSubtask(subtaskId, updates);
      
      tasks.value = tasks.value.map(task => ({
        ...task,
        subtasks: task.subtasks?.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
        )
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Update subtask error:', err);
    }
  }

  async function checkRecurringTasks(): Promise<void> {
    if (!authStore.userId) {
      console.warn('[TasksStore] User not authenticated, skipping recurring check');
      return;
    }

    try {
      await RecurringTaskService.checkAndCreateCopies(authStore.userId);
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
    updateSubtask,
    updateTask,
    deleteTask
  };
});
