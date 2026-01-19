import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import type { TaskResponse, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/interface/task.interface';
import { TaskService } from '@/services/tasks.service';
import { RecurringTaskService } from '@/services/recurring.service';
import { useProgressStore } from '@/stores/progressStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export const useTasksStore = defineStore('tasks', () => {
  const authStore = useAuthStore();
  const tasks = ref<TaskResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const workspaceStore = useWorkspaceStore();

  const todayTasks = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.value.filter(task => {
      if (task.status === 'archived') return false;

      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
  });

  const completedTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'done');
  });

  const activeTasks = computed(() => {
    return tasks.value.filter(task => task.status !== 'archived');
  });

  const archivedTasks = computed(() => {
    return tasks.value.filter(task => task.status === 'archived');
  });

  async function fetchTasks(): Promise<TaskResponse[]> {
    const workspaceId = workspaceStore.currentWorkspaceId;

    if (!workspaceId) {
      tasks.value = [];
      return [];
    }

    loading.value = true;
    error.value = null;

    try {
      const data = await TaskService.fetchAll(workspaceId);
      tasks.value = data;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      return [];
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => workspaceStore.currentWorkspaceId,
    async (workspaceId) => {
      if (!workspaceId) {
        tasks.value = [];
        return;
      }

      await fetchTasks();
    },
    { immediate: true }
  );

  async function createTask(input: CreateTaskInput): Promise<TaskResponse | null> {
    const userId = authStore.userId;
    if (!userId) {
      console.error('[TasksStore] User not authenticated');
      return null;
    }

    try {
      const task = await TaskService.create(userId, input);
      tasks.value.push(task);
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
      tasks.value = tasks.value.map(t => t.id === taskId ? task : t);
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

  async function toggleTaskCompletion(
    taskId: string, 
    currentStatus: TaskStatus
  ): Promise<{ xpEarned: number; leveledUp: boolean; newLevel: number }> {
    const previousTask = tasks.value.find(t => t.id === taskId);
    const newStatus: TaskStatus = currentStatus === 'done' ? 'backlog' : 'done';
    
    tasks.value = tasks.value.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );

    try {
      const result = await TaskService.toggleTaskCompletion(taskId, currentStatus);

      const progressStore = useProgressStore();
      progressStore.fetchProgress();
  
      return result;
    } catch (err: unknown) {
      if (previousTask) {
        tasks.value = tasks.value.map(task =>
          task.id === taskId ? previousTask : task
        );
      }
      
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Toggle completion error:', err);
      return { xpEarned: 0, leveledUp: false, newLevel: 0 };
    }
  }

  async function archiveTask(taskId: string): Promise<boolean> {
    const previousTask = tasks.value.find(t => t.id === taskId);
    
    tasks.value = tasks.value.map(task =>
      task.id === taskId ? { ...task, status: 'archived' as TaskStatus } : task
    );

    try {
      await TaskService.archiveTask(taskId);
      return true;
    } catch (err: unknown) {
      if (previousTask) {
        tasks.value = tasks.value.map(task =>
          task.id === taskId ? previousTask : task
        );
      }
      
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Archive error:', err);
      return false;
    }
  }

  async function unarchiveTask(taskId: string): Promise<boolean> {
    const previousTask = tasks.value.find(t => t.id === taskId);
    
    tasks.value = tasks.value.map(task =>
      task.id === taskId ? { ...task, status: 'backlog' as TaskStatus } : task
    );

    try {
      await TaskService.unarchiveTask(taskId);
      return true;
    } catch (err: unknown) {
      if (previousTask) {
        tasks.value = tasks.value.map(task =>
          task.id === taskId ? previousTask : task
        );
      }
      
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Unarchive error:', err);
      return false;
    }
  }

  async function updateActualMinutes(taskId: string, minutes: number): Promise<void> {
    try {
      await TaskService.updateActualMinutes(taskId, minutes);
    
      tasks.value = tasks.value.map(task => 
        task.id === taskId ? { ...task, actual_minutes: minutes } : task
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TasksStore] Update actual minutes error:', err);
    }
  }

  function getTaskById(taskId: string): TaskResponse | undefined {
    return tasks.value.find(t => t.id === taskId);
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    console.log('[TasksStore] updateTaskStatus called', { taskId, status });
    
    const previousTask = tasks.value.find(t => t.id === taskId);
    
    tasks.value = tasks.value.map(task => 
      task.id === taskId ? { ...task, status } : task
    );
  
    try {
      await TaskService.updateStatus(taskId, status);
      console.log('[TasksStore] Database updated successfully');
      console.log('[TasksStore] Local state updated');
    } catch (err) {
      if (previousTask) {
        tasks.value = tasks.value.map(task =>
          task.id === taskId ? previousTask : task
        );
      }
      
      console.error('[TasksStore] updateTaskStatus error', err);
      console.error('[TasksStore] Error details:', {
        name: err instanceof Error ? err.name : 'unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
    
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      throw err;
    }
  }

  async function markTaskInProgress(taskId: string): Promise<void> {
    console.log('[TasksStore] markTaskInProgress', taskId);
    
    const previousTask = tasks.value.find(t => t.id === taskId);

    tasks.value = tasks.value.map(task =>
      task.id === taskId ? { ...task, status: 'in_progress' as TaskStatus } : task
    );

    try {
      await TaskService.markInProgress(taskId);
    } catch (err) {
      if (previousTask) {
        tasks.value = tasks.value.map(task =>
          task.id === taskId ? previousTask : task
        );
      }
      throw err;
    }
  }

  return {
    tasks,
    loading,
    error,
    todayTasks,
    activeTasks,
    archivedTasks,
    completedTasks,

    createTask,
    fetchTasks,
    checkRecurringTasks,
    updateSubtask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    archiveTask,
    unarchiveTask,
    updateActualMinutes,
    getTaskById,
    updateTaskStatus,
    markTaskInProgress
  };
});
