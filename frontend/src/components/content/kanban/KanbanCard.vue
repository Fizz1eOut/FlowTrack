<script setup lang="ts">
  import type { TaskResponse } from '@/interface/task.interface';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppTaskCard from '@/components/base/AppTaskCard.vue';

  interface KanbanCardProps {
    task: TaskResponse;
  }

  defineProps<KanbanCardProps>();
</script>

<template>
  <div class="kanban-card" draggable="true">
    <div class="kanban-card__drag-handle">
      <app-icon 
        name="drag"
        size="var(--fs-lg)"
        color="var(--color-black)"
      />
    </div>
    <div class="kanban-card__content">
      <app-task-card :task="task" />
    </div>
  </div>
</template>

<style scoped>
  .kanban-card {
    display: flex;
    align-items: flex-start;
    max-width: 400px;
  }
  .kanban-card__drag-handle {
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }
  .kanban-card__content {
    width: 100%;
  }
  :deep(.task-card__body .task-card-tags) {
    max-width: 360px;
  }
  :deep(.task-card__body .task-card-header__title, .task-card-header__number) {
    font-size: var(--fs-lg);
    font-weight: var(--fw-medium);
  }
  @media (max-width: 768px) {
    :deep(.task-card__body .task-card-tags) { 
      max-width: 360px;
    }
    :deep(.task-card) {
      max-width: 280px;
    }
  }

 </style>
