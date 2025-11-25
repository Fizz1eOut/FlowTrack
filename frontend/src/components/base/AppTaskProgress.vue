<script setup lang="ts">
  import { computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { useTaskProgress } from '@/composables/useTaskProgress';

  interface TaskProgressProps {
    task: TaskResponse;
  }
  const props = defineProps<TaskProgressProps>();

  const progress = computed(() => useTaskProgress(props.task.subtasks));

  const hasSubtasks = computed(() => progress.value.total > 0);
</script>

<template>
  <div v-if="hasSubtasks" class="task-progress">
    <div class="task-progress__row">
      <div class="task-progress__title"><span>Подзадачи: {{ progress.completed }}/{{ progress.total }}</span></div>
      <div class="task-progress__percentage">{{ progress.percentage }}%</div>
    </div>

    <div class="task-progress__progress-bar progress-bar">
      <div class="task-progress__bar">
        <div class="task-progress__track"></div>
      
        <div 
          class="task-progress__fill"
          :style="{ width: progress.percentage + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .task-progress__bar {
    position: relative;
    flex: 1;
    height: 8px;
    overflow: hidden;
    border-radius: var(--radius-sm);
  }
  .task-progress__track {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #E5E7EB;
  }
  .task-progress__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: var(--success);
    transition: width 0.3s ease-in-out;
  }
  .task-progress__percentage {
    color: var(--color-gray);
    white-space: nowrap;
    min-width: 40px;
    text-align: right;
  }
</style>
