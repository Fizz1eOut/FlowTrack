<script setup lang="ts">
  import type { TaskResponse } from '@/interface/task.interface';
  import TaskDetailStatus from '@/components/content/tasks/detail/TaskDetailStatus.vue';
  import TaskCardTags from '@/components/content/tasks/card/TaskCardTags.vue';
  

  interface TaskDetailHeaderProps {
    task: TaskResponse;
  }
  defineProps<TaskDetailHeaderProps>();
</script>

<template>
  <div class="task-detail-header">
    <task-detail-status 
      :task-id="task.id"
      :current-status="task.status"
      class="task-detail-header__status"
    />

    <task-card-tags :task="task" scrollable />
  </div>
</template>

<style scoped>
  .task-detail-header {
    margin-top: var(--space-lg);
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .task-detail-header__status {
    max-width: 180px;
    min-width: 180px;
    width: 100%;  
  }
  @media (max-width: 480px) {
    .task-detail-header {
      flex-wrap: wrap;
    }
    .task-detail-header__status {
      max-width: 100%;
    }
  }
</style>
