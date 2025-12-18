import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TimerHistoryService } from '@/services/timerHistory.service';
import type { TimerHistoryRecord, TimerHistoryStats } from '@/interface/timerHistory.interface';
import { useAuthStore } from '@/stores/authStore';

export const useTimerHistoryStore = defineStore('timerHistory', () => {
  const authStore = useAuthStore();
  const history = ref<TimerHistoryRecord[]>([]);
  const stats = ref<TimerHistoryStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const todayHistory = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!today) return [];

    return history.value.filter(record => 
      record.started_at.startsWith(today)
    );
  });

  const todayTotalMinutes = computed(() => {
    return todayHistory.value.reduce((sum, record) => sum + record.duration_minutes, 0);
  });

  async function fetchHistory(limit?: number): Promise<void> {
    const userId = authStore.userId;
    if (!userId) return;

    loading.value = true;
    error.value = null;

    try {
      history.value = await TimerHistoryService.fetchAll(userId, limit);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TimerHistoryStore] Fetch error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats(): Promise<void> {
    const userId = authStore.userId;
    if (!userId) return;

    try {
      stats.value = await TimerHistoryService.getStats(userId);
    } catch (err: unknown) {
      console.error('[TimerHistoryStore] Fetch stats error:', err);
    }
  }

  async function fetchByTask(taskId: string): Promise<TimerHistoryRecord[]> {
    try {
      return await TimerHistoryService.fetchByTask(taskId);
    } catch (err: unknown) {
      console.error('[TimerHistoryStore] Fetch by task error:', err);
      return [];
    }
  }

  async function deleteRecord(historyId: string): Promise<boolean> {
    try {
      await TimerHistoryService.delete(historyId);
      history.value = history.value.filter(record => record.id !== historyId);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[TimerHistoryStore] Delete error:', err);
      return false;
    }
  }

  return {
    history,
    stats,
    loading,
    error,
    todayHistory,
    todayTotalMinutes,

    fetchHistory,
    fetchStats,
    fetchByTask,
    deleteRecord
  };
});
