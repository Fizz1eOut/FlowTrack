<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useTasksStore } from '@/stores/taskStore';
  import AppLoadingSpinner from '@/components/base/AppLoadingSpinner.vue';
  import AppTaskCard from '@/components/base/AppTaskCard.vue';

  const taskStore = useTasksStore();

  onMounted(async () => {
    await taskStore.fetchTasks();
  });
</script>

<template>
  <app-loading-spinner v-if="taskStore.loading" size="sm" text="Loading tasks..." />

  <div v-else-if="taskStore.todayTasks.length === 0" class="task-list__empty">You have no tasks scheduled for today.</div>

  <div v-else>
    <div 
      v-for="task in taskStore.todayTasks" 
      :key="task.id"
      class="task-list__item"
    >
      <app-task-card :task="task" />
    </div>
  </div>
</template>

<style scoped>
  .task-list__empty {
    margin-top: var(--space-2xl);
    text-align: center;
    font-size: var(--fs-xl);
  }
  .task-list__item:not(:last-child) {
    margin-bottom: var(--space-sm);
  }
</style>
