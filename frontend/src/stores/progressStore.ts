import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { ProgressService } from '@/services/progress.service';
import { XPCalculator } from '@/utils/xpCalculator';
import type { UserProgress, LevelRequirement, DailyCompletion } from '@/interface/progress.interface';

export const useProgressStore = defineStore('progress', () => {
  const authStore = useAuthStore();
  
  const userProgress = ref<UserProgress | null>(null);
  const levelRequirements = ref<LevelRequirement[]>([]);
  const dailyCompletions = ref<DailyCompletion[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const progressInfo = computed(() => {
    if (!userProgress.value || !levelRequirements.value.length) {
      return {
        currentLevelXP: 0,
        nextLevelXP: 0,
        progressXP: 0,
        progressPercentage: 0
      };
    }

    return XPCalculator.getProgressToNextLevel(
      userProgress.value.total_xp,
      userProgress.value.level,
      levelRequirements.value
    );
  });

  const nextLevelXPRequired = computed(() => {
    if (!levelRequirements.value.length || !userProgress.value) return 0;
  
    const currentUserLevel = userProgress.value.level;
    const nextLevel = levelRequirements.value.find(
      lr => lr.level === currentUserLevel + 1
    );
  
    return nextLevel?.xp_required || 0;
  });

  const currentLevel = computed(() => userProgress.value?.level || 1);
  const tasksCompleted = computed(() => userProgress.value?.tasks_completed || 0);
  const totalXP = computed(() => userProgress.value?.total_xp || 0);

  const currentStreak = computed(() => {
    return ProgressService.calculateStreak(dailyCompletions.value);
  });

  const tasksCompletedToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompletion = dailyCompletions.value.find(
      completion => completion.date === today
    );
    return todayCompletion?.tasks_completed || 0;
  });

  const xpEarnedToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompletion = dailyCompletions.value.find(
      completion => completion.date === today
    );
    return todayCompletion?.xp_earned || 0;
  });

  async function fetchProgress(): Promise<void> {
    if (!authStore.userId) {
      console.warn('[ProgressStore] User not authenticated, skipping fetch');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      console.log('[ProgressStore] Fetching progress for user:', authStore.userId);
    
      const requirements = await ProgressService.getLevelRequirements();
      levelRequirements.value = requirements;
    
      let retries = 5;
      let lastError: Error | null = null;
    
      while (retries > 0) {
        try {
          const [progress, completions] = await Promise.all([
            ProgressService.ensureUserProgress(authStore.userId),
            ProgressService.getDailyCompletions(authStore.userId)
          ]);
        
          userProgress.value = progress;
          dailyCompletions.value = completions;
        
          console.log('[ProgressStore] Progress loaded successfully');
          return;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          retries--;
        
          if (retries > 0) {
            console.warn(`[ProgressStore] Retry ${5 - retries}/5 after error:`, lastError.message);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    
      throw lastError || new Error('Failed to fetch progress');
    
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      error.value = message;
      console.error('[ProgressStore] Fetch error after all retries:', err);
    
    } finally {
      loading.value = false;
    }
  }

  async function refreshProgress(): Promise<void> {
    await fetchProgress();
  }

  function reset(): void {
    userProgress.value = null;
    levelRequirements.value = [];
    dailyCompletions.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    userProgress,
    levelRequirements,
    dailyCompletions,
    loading,
    error,

    progressInfo,
    nextLevelXPRequired,
    currentLevel,
    tasksCompleted,
    totalXP,
    currentStreak,
    tasksCompletedToday,
    xpEarnedToday,

    fetchProgress,
    refreshProgress,
    reset
  };
});
