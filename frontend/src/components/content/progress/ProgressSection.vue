<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useProgressStore } from '@/stores/progressStore';
  import AppLoadingSpinner from '@/components/base/AppLoadingSpinner.vue';
  import ProgressCard from '@/components/content/progress/ProgressCard.vue';
  import ProgressStatCard from '@/components/content/progress/ProgressStatCard.vue';


  const progressStore = useProgressStore();

  onMounted(() => {
    progressStore.fetchProgress();
  });

  defineExpose({
    refresh: () => progressStore.refreshProgress()
  });
</script>

<template>
  <app-loading-spinner v-if="progressStore.loading"  text="Loading..." />
  <div v-else-if="progressStore.userProgress" class="progress-section">
    <div class="progress-section__card">
      <progress-card 
        :current-level="progressStore.currentLevel"
        :tasks-completed="progressStore.tasksCompleted"
        :current-streak="progressStore.currentStreak"
        :tasks-today="progressStore.tasksCompletedToday"
        :progress-info="progressStore.progressInfo"
        :next-level-xp="progressStore.nextLevelXPRequired"
      />
    </div>
    <div class="progress-section__items">
      <div class="progress-section__item">
        <progress-stat-card 
          title="Current streak"
          :subtitle="progressStore.currentStreak > 1 ? 'Days' : 'Day'"
          icon="fire"
          color="var(--warning)"
        >
          <template #value>
            {{ progressStore.currentStreak }}
          </template>
        </progress-stat-card>
      </div>
      <div class="progress-section__item">
        <progress-stat-card 
          title="Tasks completed"
          :subtitle="progressStore.tasksCompleted > 1 ? 'Tasks' : 'Task'"
          icon="completed"
          color="var(--success)"
        >
          <template #value>
            {{ progressStore.tasksCompleted }}
          </template>
        </progress-stat-card>
      </div>
      <div class="progress-section__item">
        <progress-stat-card 
          title="Completed today"
          :subtitle="progressStore.tasksCompletedToday > 1 ? 'Tasks' : 'Task'"
          icon="completed"
          color="var(--primary)"
        >
          <template #value>
            {{ progressStore.tasksCompletedToday }}
          </template>
        </progress-stat-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .progress-section {
    width: 100%;
  }
  @media (max-width: 990px) {
    .progress-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .progress-section__items {
      display: flex;
      justify-content: space-between;
      align-items: center;
      column-gap: 10px;
      row-gap: 20px;
      width: 100%;
    }
    .progress-section__item {
      width: 100%;
    }
    .progress-section__card {
      width: 100%;
    }
  }
  @media (max-width: 680px) {
    .progress-section__items {
      flex-wrap: wrap;
    }
    .progress-section__card {
      margin-bottom: 20px;
    }
  }
</style>
