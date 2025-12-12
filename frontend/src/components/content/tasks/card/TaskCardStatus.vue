<script setup lang="ts">
  import { computed } from 'vue';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import { useTasksStore } from '@/stores/taskStore';

  interface TaskCardStatusProps {
    taskId: string;
  }
  const props = defineProps<TaskCardStatusProps>();

  const taskStore = useTasksStore();

  const task = computed(() => taskStore.getTaskById(props.taskId));
  const taskStatus = computed(() => task.value?.status);
</script>

<template>
  <span 
    v-if="taskStatus"
    class="status-badge" 
    :class="TaskStatusUtils.getStatusClass(taskStatus)"
  >
    {{ TaskStatusUtils.getStatusLabel(taskStatus) }}
  </span>
</template>

<style scoped>
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: var(--fs-sm);
    font-weight: var(--fw-medium);
    text-transform: capitalize;
  }
  .status-badge--backlog {
    background-color: #F3F4F6;
    color: #6B7280;
  }
  .status-badge--planned {
    background-color: #DBEAFE;
    color: #1E40AF;
  }
  .status-badge--in_progress {
    background-color: #FEF3C7;
    color: #B45309;
  }
  .status-badge--done {
    background-color: #D1FAE5;
    color: #065F46;
  }
  .status-badge--archived {
    background-color: #F9FAFB;
    color: #9CA3AF;
  }
</style>
