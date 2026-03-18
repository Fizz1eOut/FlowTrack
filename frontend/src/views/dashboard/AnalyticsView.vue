<script setup lang="ts">
  import { useTasksStore } from '@/stores/taskStore';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import ProgressSection from '@/components/content/progress/ProgressSection.vue';
  import AnalyticsTaskChart from '@/components/content/analytics/AnalyticsTaskChart.vue';
  import AnalyticsDeadlineChart from '@/components/content/analytics/AnalyticsDeadlineChart.vue';
  import AnalyticsTeamChart from '@/components/content/analytics/AnalyticsTeamChart.vue';
  
  const taskStore = useTasksStore();
</script>

<template>
  <div class="analytics">
    <div class="analytics__header">
      <app-subtitle>
        Analytics
      </app-subtitle>
      <p class="analytics__text">Your productivity statistics</p>
    </div>
    <div class="analytics__body">
      <progress-section />
      <div class="analytics__chart">
        <div class="analytics__item">
          <analytics-task-chart 
            v-if="!taskStore.loading && taskStore.tasks.length"
            :task="taskStore.tasks" 
          />
        </div>
        <div class="analytics__item">
          <analytics-deadline-chart  
            v-if="!taskStore.loading && taskStore.tasks.length" 
            :task="taskStore.tasks"
          />
        </div>
      </div>
      <analytics-team-chart />
    </div>
  </div>
</template>

<style scoped>
  .analytics__header {
    margin-bottom: var(--space-2xl)
  }
  .analytics__chart {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .analytics__item {
    width: 100%;
  }
  :deep(.progress-section__items) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  :deep(.progress-section__item) {
    width: 100%;
  }
  @media (max-width: 1024px) {
    .analytics__chart {
      flex-direction: column;
    }
  }
  @media (max-width: 768px) {
    :deep(.progress-section__items) {
      flex-wrap: wrap;
    }
  }
</style>
