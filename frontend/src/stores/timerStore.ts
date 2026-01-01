import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
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
  const isStopping = ref(false);
  const tickTrigger = ref(0);

  const history = ref<TimerHistoryRecord[]>([]);
  const stats = ref<TimerHistoryStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let rafId: number | null = null;
  let lastUpdateTime = 0;

  const hasActiveTimer = computed(() => activeTimer.value !== null);
  const activeTimerCount = computed(() => hasActiveTimer.value ? 1 : 0);
  const hasLastSession = computed(() => lastSession.value !== null);

  const currentElapsedSeconds = computed(() => {
    if (!activeTimer.value) return 0;
    return Math.floor((Date.now() - activeTimer.value.startTime) / 1000) + tickTrigger.value * 0;
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
        activeTimer.value = JSON.parse(storedTimer);
      }

      const storedSession = localStorage.getItem(LAST_SESSION_KEY);
      if (storedSession) {
        lastSession.value = JSON.parse(storedSession);
      }
    } catch {
    }
  }

  function saveToStorage() {
    try {
      if (activeTimer.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeTimer.value));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
    }
  }

  function saveLastSessionToStorage() {
    try {
      if (lastSession.value) {
        localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(lastSession.value));
      } else {
        localStorage.removeItem(LAST_SESSION_KEY);
      }
    } catch {
    }
  }

  function startUIUpdate() {
    if (rafId !== null) return;

    const update = (timestamp: number) => {
      if (!activeTimer.value) {
        stopUIUpdate();
        return;
      }

      if (timestamp - lastUpdateTime >= 1000) {
        tickTrigger.value++;
        lastUpdateTime = timestamp;
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
  }

  function stopUIUpdate() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
      lastUpdateTime = 0;
    }
  }

  watch(
    () => activeTimer.value,
    (newVal) => {
      if (newVal) {
        startUIUpdate();
      } else {
        stopUIUpdate();
      }
    },
    { immediate: true }
  );

  watch(
    () => activeTimer.value,
    () => {
      saveToStorage();
    },
    { deep: true }
  );

  watch(
    () => lastSession.value,
    () => {
      saveLastSessionToStorage();
    },
    { deep: true }
  );

  async function startTimer(taskId: string, taskTitle: string): Promise<boolean> {
    if (activeTimer.value && activeTimer.value.taskId !== taskId) return false;
    if (activeTimer.value && activeTimer.value.taskId === taskId) return true;

    activeTimer.value = {
      taskId,
      taskTitle,
      startTime: Date.now()
    };

    try {
      await useTasksStore().markTaskInProgress(taskId);
    } catch {
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

      activeTimer.value = null;
      lastSession.value = sessionData;

      return sessionData;
    } finally {
      isStopping.value = false;
    }
  }

  function forceStopTimer() {
    if (!activeTimer.value) return;
    activeTimer.value = null;
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
