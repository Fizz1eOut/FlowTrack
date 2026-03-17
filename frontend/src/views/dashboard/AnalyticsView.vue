<script setup lang="ts">
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import ProgressSection from '@/components/content/progress/ProgressSection.vue';
  import AnalyticsTaskChart from '@/components/content/analytics/AnalyticsTaskChart.vue';
  import { useTasksStore } from '@/stores/taskStore';
  
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
      <analytics-task-chart 
        v-if="!taskStore.loading && taskStore.tasks.length"
        :task="taskStore.tasks" 
      />
    </div>
  </div>
</template>

<style scoped>
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
  @media (max-width: 768px) {
    :deep(.progress-section__items) {
      flex-wrap: wrap;
    }
  }
</style>
