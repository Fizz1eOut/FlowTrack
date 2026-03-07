<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import { useTasksStore } from '@/stores/taskStore';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import type { TaskStatus } from '@/interface/task.interface';
  import { showToast } from '@/stores/toastStore';
  import AppLoadingSpinner from '@/components/base/AppLoadingSpinner.vue';
  import KanbanColumn from '@/components/content/kanban/KanbanColumn.vue';

  const taskStore = useTasksStore();

  const columns = TaskStatusUtils.SELECTABLE_STATUSES;

  const tasksByStatus = computed(() => {
    return columns.reduce((acc, status) => {
      acc[status] = taskStore.activeTasks.filter(task => task.status === status);
      return acc;
    }, {} as Record<TaskStatus, typeof taskStore.tasks>);
  });

  async function onTaskDropped(taskId: string, status: TaskStatus) {
    await taskStore.updateTaskStatus(taskId, status);
    showToast('Task updated successfully', 'success');
  } 

  onMounted(() => taskStore.fetchTasks());
</script>

<template>
  <app-loading-spinner v-if="taskStore.loading" size="sm" text="Loading tasks..." />

  <div v-else class="kanban-board__columns">
    <kanban-column 
      v-for="status in columns"
      :key="status"
      :status="status"
      :tasks="tasksByStatus[status]"
      @taskDropped="onTaskDropped"
    />
  </div>
</template>

<style scoped>
  .kanban-board__columns {
    display: flex;
    align-items: stretch;
    gap: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
</style>
