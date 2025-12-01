<script setup lang="ts">
  import { computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import AppContainer from '@/components/base/AppContainer.vue';
  import TaskCardHeader from '@/components/content/tasks/card/TaskCardHeader.vue';
  import TaskCardMeta from '@/components/content/tasks/card/TaskCardMeta.vue';
  import TaskCardTags from '@/components/content/tasks/card/TaskCardTags.vue';
  import AppTaskProgress from '@/components/base/AppTaskProgress.vue';

  interface TaskCardProps {
    task: TaskResponse;
  }
  const props = defineProps<TaskCardProps>();

  const isCompleted = computed(() => TaskStatusUtils.isCompleted(props.task.status));
</script>

<template>
  <div class="task-card">
    <app-container size="md">
      <div class="task-card__body" :class="{'completed': isCompleted}">
        <task-card-header :task="task" />
        <task-card-meta :task="task" />
        <task-card-tags :task="task" />
        <app-task-progress :task="task" />
      </div>
    </app-container>
  </div>
</template>

<style scoped>
  .task-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .task-card__body > *:not(:last-child) {
    margin-bottom: var(--radius-sm);
  }
  .completed {
    opacity: 0.4;
  }
</style>
