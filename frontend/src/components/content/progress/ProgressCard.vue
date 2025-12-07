<script setup lang="ts">
  import AppProgressBar from '@/components/base/AppProgressBar.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppContainer from '@/components/base/AppContainer.vue';

  interface ProgressInfo {
    currentLevelXP: number;
    nextLevelXP: number;
    progressXP: number;
    progressPercentage: number;
  }

  interface ProgressCardProps {
    currentLevel: number;
    tasksCompleted: number;
    currentStreak: number;
    tasksToday: number;
    nextLevelXp: number;
    progressInfo: ProgressInfo;
  }
  defineProps<ProgressCardProps>();
</script>

<template>
  <div class="progress-card">
    <div  class="progress-card__content">
      <app-container size="sm">
        <div class="progress-card__header">
          <div class="progress-card__level">
            <app-icon 
              name="cup"
              size="var(--fs-2xl)"
              color="var(--color-white)"
            />
            <div class="progress-card__title">
              Your Level
              <span class="progress-card__number">{{ currentLevel }}</span>
            </div>
          </div>
        </div>

        <div class="progress-card__progress">
          <div class="progress-card__progress-bar">
            <app-progress-bar
              :percentage="progressInfo.progressPercentage"
            />
          </div>

          <div class="progress-card__info">
            <span class="progress-card__xp--current">
              XP: {{ progressInfo.progressXP }} / {{ progressInfo.nextLevelXP }}
            </span>
            <span class="progress-card__xp--percentage">
              Progress: {{ progressInfo.progressPercentage }}%
            </span>
          </div>
        </div>
      </app-container>
    </div>
  </div>
</template>

<style scoped>
  .progress-card {
    width: 100%;
    background: var(--gradient-accent);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }
  .progress-card__level {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .progress-card__title {
    font-size: var(--fs-md);
    color: var(--color-white);
  }
  .progress-card__number {
    font-size: var(--fs-lg);
  }
  .progress-card__stats {
    margin-top: var(--space-xs);
  }
  .progress-card__stat {
    font-size: var(--fs-md);
    color: var(--color-white);
  }
  .progress-card__progress {
    margin-top: var(--space-xs);
  }
  .progress-card__info {
    margin-top: var(--space-xs);
    font-size: var(--fs-md);
    color: var(--color-white);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
</style>
