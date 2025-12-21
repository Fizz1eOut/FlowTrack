<script setup lang="ts">
  import { ref } from 'vue';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import type { TaskResponse } from '@/interface/task.interface';

  interface TaskDetailSubtasksProps {
    task: TaskResponse;
  }
  const props = defineProps<TaskDetailSubtasksProps>();

  const subtasksStatus = ref<boolean[]>(
    props.task.subtasks?.map(s => s.completed || false) || []
  );
</script>

<template>
  <div class="task-detail-subtasks">
    <div class="task-detail-subtasks__name">Subtasks</div>

    <div v-if="task.subtasks && task.subtasks.length > 0" class="subtasks-list">
      <div
        v-for="(subtask, index) in task.subtasks"
        :key="subtask.id || index"
        class="subtasks-list__item"
      >
        <app-checkbox 
          v-model="subtasksStatus[index]"
          :disabled="true"
        >
          <div 
            :class="{ checked: subtasksStatus[index] }" 
            class="subtasks-list__title"
          >
            {{ subtask.title || subtask }}
          </div>
        </app-checkbox>
      </div>
    </div>

    <div v-else class="subtasks-empty">
      No subtasks
    </div>
  </div>
</template>

<style scoped>
.task-detail-subtasks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.task-detail-subtasks__name {
  font-size: var(--fs-sm);
  color: var(--color-gray);
  font-weight: var(--fw-medium);
}
.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.subtasks-list__item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--color-white);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}
.subtasks-list__title {
  transition: all 0.3s ease-in-out;
}
.subtasks-list__title.checked {
  text-decoration: line-through;
  opacity: 0.6;
}
.subtasks-empty {
  color: var(--color-gray);
  font-style: italic;
}
</style>
