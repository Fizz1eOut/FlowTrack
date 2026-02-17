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
  .task-card-tags {
    max-width: 440px;
    min-width: 0;
    overflow: hidden;
  }
  .task-card-tags__group {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    overflow: hidden;
  }
  .task-card-tags__badge {
    padding: 6px 10px;
    border-radius: var(--space-md);
    border: 1px solid;
    background: transparent;
    font-size: var(--fs-md);
    font-weight: var(--fw-medium);
    flex-shrink: 0;
  }
  .task-card-tags__tags {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .task-card-tags__tags::-webkit-scrollbar {
    display: none;
  }
  .tags__list {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: nowrap;
  }
  .tag__item {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    flex-shrink: 0;
    white-space: nowrap;
  }
  .task-card-tags__group--scroll .task-card-tags__tags {
    scrollbar-width: thin;
  }
  .task-card-tags__group--scroll .task-card-tags__tags::-webkit-scrollbar {
    display: block;
    height: 4px;
  }
  .task-card-tags__group--scroll .task-card-tags__tags::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
  }
</style>
