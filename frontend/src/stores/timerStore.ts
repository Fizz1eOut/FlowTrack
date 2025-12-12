import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TaskStatus } from '@/interface/task.interface';
import { useTasksStore } from '@/stores/taskStore';

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

  function loadFromStorage() {
    try {
      const storedTimer = localStorage.getItem(STORAGE_KEY);
      if (storedTimer) {
        const parsed: ActiveTimer = JSON.parse(storedTimer);
        
        const now = Date.now();
        const elapsed = Math.floor((now - parsed.startTime) / 1000);
        
        activeTimer.value = {
          ...parsed,
          elapsedSeconds: elapsed
        };

        startInterval();
      }

      const storedSession = localStorage.getItem(LAST_SESSION_KEY);
      if (storedSession) {
        lastSession.value = JSON.parse(storedSession);
      }
    } catch (error) {
      console.error('[TimerStore] Error loading from storage:', error);
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
    } catch (error) {
      console.error('[TimerStore] Error saving to storage:', error);
    }
  }

  function startInterval() {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value);
    }

    intervalId.value = window.setInterval(() => {
      if (activeTimer.value) {
        const now = Date.now();
        activeTimer.value.elapsedSeconds = Math.floor((now - activeTimer.value.startTime) / 1000);
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
    if (activeTimer.value && activeTimer.value.taskId !== taskId) {
      return false;
    }

    if (activeTimer.value && activeTimer.value.taskId === taskId) {
      return true;
    }

    activeTimer.value = {
      taskId,
      taskTitle,
      startTime: Date.now(),
      elapsedSeconds: 0
    };

    startInterval();
    saveToStorage();

    const tasksStore = useTasksStore();
    try {
      await tasksStore.updateTaskStatus(taskId, 'in_progress');
      console.log('[TimerStore] Timer started for task:', taskTitle);
    } catch (error) {
      console.error('[TimerStore] Failed to update task status:', error);
    }
    return true;
  }

  async function stopTimer(taskStatus: TaskStatus): Promise<LastSession | null> {
    if (!activeTimer.value) return null;

    stopInterval();

    const minutesSpent = Math.floor(activeTimer.value.elapsedSeconds / 60);
    
    const session: LastSession = {
      taskId: activeTimer.value.taskId,
      taskTitle: activeTimer.value.taskTitle,
      taskStatus,
      minutesSpent,
      stoppedAt: new Date().toISOString()
    };

    lastSession.value = session;
    
    const tasksStore = useTasksStore();
    try {
      await tasksStore.updateTaskStatus(activeTimer.value.taskId, taskStatus);
    } catch (error) {
      console.error('[TimerStore] Failed to update task status on stop:', error);
    }

    activeTimer.value = null;
    saveToStorage();

    console.log('[TimerStore] Timer stopped. Session:', session);
    return session;
  }

  function forceStopTimer() {
    if (!activeTimer.value) return;

    stopInterval();
    activeTimer.value = null;
    saveToStorage();

    console.log('[TimerStore] Timer force stopped');
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

  loadFromStorage();

  return {
    activeTimer: computed(() => activeTimer.value),
    lastSession: computed(() => lastSession.value),
    
    hasActiveTimer,
    activeTimerCount,
    hasLastSession,
    currentElapsedSeconds,
    formattedActiveTime,
    
    startTimer,
    stopTimer,
    forceStopTimer,
    isTimerActiveForTask,
    getActiveTimerTaskId,
    clearLastSession,
    loadFromStorage
  };
});
