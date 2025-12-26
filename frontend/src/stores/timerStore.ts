import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TaskStatus } from '@/interface/task.interface';
import { useTasksStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { TimerService } from '@/services/timer.service';
import { supabase } from '@/utils/supabase';
import type { 
  TimerHistoryRecord, 
  TimerHistoryStats,
  CreateTimerHistoryInput 
} from '@/interface/timerHistory.interface';

interface ActiveTimer {
  taskId: string;
  taskTitle: string;
  startTime: number;
  elapsedSeconds: number;
}

interface LastSession {
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  minutesSpent: number;
  stoppedAt: string;
}

const STORAGE_KEY = 'app_active_timer';
const LAST_SESSION_KEY = 'app_last_timer_session';

export const useTimerStore = defineStore('timer', () => {
  const activeTimer = ref<ActiveTimer | null>(null);
  const lastSession = ref<LastSession | null>(null);
  const intervalId = ref<number | null>(null);
  const isStopping = ref(false);

  const history = ref<TimerHistoryRecord[]>([]);
  const stats = ref<TimerHistoryStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasActiveTimer = computed(() => activeTimer.value !== null);
  const activeTimerCount = computed(() => hasActiveTimer.value ? 1 : 0);
  const hasLastSession = computed(() => lastSession.value !== null);

  const currentElapsedSeconds = computed(() => {
    if (!activeTimer.value) return 0;
    return activeTimer.value.elapsedSeconds;
  });

  const formattedActiveTime = computed(() => {
    const seconds = currentElapsedSeconds.value;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  });

  const todayHistory = computed(() => {
    const today = new Date().toISOString().substring(0, 10);
    return history.value.filter(r => r.started_at.startsWith(today));
  });

  const todayTotalMinutes = computed(() =>
    todayHistory.value.reduce((sum, r) => sum + r.duration_minutes, 0)
  );

  function loadFromStorage() {
    try {
      const storedTimer = localStorage.getItem(STORAGE_KEY);
      if (storedTimer) {
        const parsed: ActiveTimer = JSON.parse(storedTimer);
        const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);

        activeTimer.value = { ...parsed, elapsedSeconds: elapsed };
        startInterval();
      }

      const storedSession = localStorage.getItem(LAST_SESSION_KEY);
      if (storedSession) {
        lastSession.value = JSON.parse(storedSession);
      }
    } catch {
      /* ignore */
    }
  }

  function saveToStorage() {
    try {
      if (activeTimer.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeTimer.value));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }

      if (lastSession.value) {
        localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(lastSession.value));
      }
    } catch {
      /* ignore */
    }
  }

  function startInterval() {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
    }

    intervalId.value = window.setInterval(() => {
      if (activeTimer.value) {
        activeTimer.value.elapsedSeconds = Math.floor(
          (Date.now() - activeTimer.value.startTime) / 1000
        );
        saveToStorage();
      }
    }, 1000);
  }

  function stopInterval() {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  }

  async function startTimer(taskId: string, taskTitle: string): Promise<boolean> {
    if (activeTimer.value && activeTimer.value.taskId !== taskId) return false;
    if (activeTimer.value && activeTimer.value.taskId === taskId) return true;

    activeTimer.value = {
      taskId,
      taskTitle,
      startTime: Date.now(),
      elapsedSeconds: 0
    };

    startInterval();
    saveToStorage();

    try {
      await useTasksStore().markTaskInProgress(taskId);
    } catch {
      /* ignore */
    }

    return true;
  }

  async function stopTimer(): Promise<LastSession | null> {
    if (!activeTimer.value || isStopping.value) return null;
    isStopping.value = true;

    const timerData = { ...activeTimer.value };
    const durationSeconds = Math.floor((Date.now() - timerData.startTime) / 1000);
    const minutesSpent = Math.max(1, Math.round(durationSeconds / 60));

    const tasksStore = useTasksStore();
    const authStore = useAuthStore();

    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        await supabase.auth.refreshSession().catch(() => {});
      }

      const task = tasksStore.getTaskById(timerData.taskId);
      if (!task) throw new Error('Task not found');

      const sessionData: LastSession = {
        taskId: timerData.taskId,
        taskTitle: timerData.taskTitle,
        taskStatus: task.status,
        minutesSpent,
        stoppedAt: new Date().toISOString()
      };

      let recurringTemplateId: string | null = null;
      if (task.original_task_id) recurringTemplateId = task.original_task_id;
      else if (task.is_recurring) recurringTemplateId = task.id;

      if (authStore.userId && minutesSpent > 0) {
        const historyInput: CreateTimerHistoryInput = {
          task_id: timerData.taskId,
          task_title: timerData.taskTitle,
          started_at: new Date(timerData.startTime).toISOString(),
          stopped_at: sessionData.stoppedAt,
          duration_seconds: durationSeconds,
          duration_minutes: minutesSpent,
          final_status: task.status,
          recurring_template_id: recurringTemplateId
        };

        await TimerService.createHistory(authStore.userId, historyInput)
          .then(() => fetchHistoryByTask(timerData.taskId))
          .catch(() => {});
      }

      stopInterval();
      activeTimer.value = null;
      lastSession.value = sessionData;
      saveToStorage();

      return sessionData;
    } finally {
      isStopping.value = false;
    }
  }

  function forceStopTimer() {
    if (!activeTimer.value) return;
    stopInterval();
    activeTimer.value = null;
    saveToStorage();
    isStopping.value = false;
  }

  function isTimerActiveForTask(taskId: string): boolean {
    return activeTimer.value?.taskId === taskId;
  }

  function getActiveTimerTaskId(): string | null {
    return activeTimer.value?.taskId || null;
  }

  function clearLastSession() {
    lastSession.value = null;
    localStorage.removeItem(LAST_SESSION_KEY);
  }

  async function fetchHistory(limit?: number) {
    const userId = useAuthStore().userId;
    if (!userId) return;

    loading.value = true;
    error.value = null;

    try {
      history.value = await TimerService.fetchAllHistory(userId, limit);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  }

  async function fetchHistoryByTask(taskId: string) {
    try {
      history.value = await TimerService.fetchHistoryByTaskOrTemplate(taskId);
    } catch {
      history.value = [];
    }
  }

  async function fetchStats() {
    const userId = useAuthStore().userId;
    if (!userId) return;

    try {
      stats.value = await TimerService.getStats(userId);
    } catch {
      /* ignore */
    }
  }

  async function deleteHistoryRecord(historyId: string, taskId?: string): Promise<boolean> {
    try {
      await TimerService.deleteHistory(historyId);
      if (taskId) await fetchHistoryByTask(taskId);
      else history.value = history.value.filter(r => r.id !== historyId);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      return false;
    }
  }

  loadFromStorage();

  return {
    activeTimer: computed(() => activeTimer.value),
    lastSession: computed(() => lastSession.value),
    isStopping: computed(() => isStopping.value),
    hasActiveTimer,
    activeTimerCount,
    hasLastSession,
    currentElapsedSeconds,
    formattedActiveTime,

    history: computed(() => history.value),
    stats: computed(() => stats.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    todayHistory,
    todayTotalMinutes,

    startTimer,
    stopTimer,
    forceStopTimer,
    isTimerActiveForTask,
    getActiveTimerTaskId,
    clearLastSession,
    loadFromStorage,

    fetchHistory,
    fetchHistoryByTask,
    fetchStats,
    deleteHistoryRecord
  };
});
