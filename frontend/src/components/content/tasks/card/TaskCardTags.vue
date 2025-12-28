<script setup lang="ts">
  import { computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';

  import { TASK_PRIORITIES } from '@/constants/taskPriorities';

  interface TaskCardTagsProps {
    task: TaskResponse;
    scrollable?: boolean;
  }
  const props = withDefaults(defineProps<TaskCardTagsProps>(), {
    scrollable: false
  });


  const priorityInfo = computed(() => {
    return TASK_PRIORITIES[props.task.priority] || TASK_PRIORITIES.medium;
  });
</script>

<template>
  <div class="task-card-tags">
    <div class="task-card-tags__group" :class="{ 'task-card-tags__group--scroll': scrollable }">
      <div class="task-card-tags__meta">
        <div 
          class="task-card-tags__badge"
          :style="{
            color: priorityInfo.color,
            borderColor: priorityInfo.borderColor
          }"
        >
          {{ priorityInfo.label }}
        </div>
      </div>

      <div v-if="task.tags && task.tags.length > 0" class="task-card-tags__tags">
        <ul class="tags__list">
          <li v-for="tag in task.tags" :key="tag" class="tag__item"># {{ tag }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .task-card-tags__group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .task-card-tags__badge {
    padding: 6px 10px;
    border-radius: var(--space-md);
    border: 1px solid;
    background: transparent;
    font-size: var(--fs-md);
    font-weight: var(--fw-medium);
  }
  .tags__list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .tag__item {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    flex-shrink: 0; 
    width: max-content;
    white-space: nowrap;   
  }
  .task-card-tags__group--scroll {
    overflow-x: auto;
    max-width: 430px;
  }
  .task-card-tags__group--scroll .tag__item {
    flex-shrink: 0; 
    width: max-content;
    white-space: nowrap; 
  }

  @media (max-width: 500px) {
    .task-card-tags__group,
    .task-card-tags__tags {
      flex-wrap: wrap;
      justify-content: flex-start;
    }
  }
</style>
