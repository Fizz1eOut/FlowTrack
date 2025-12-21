<script setup lang="ts">
  import { computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import AppInput from '@/components/inputs/AppInput.vue';
  import TaskDetailSubtasks from '@/components/content/tasks/detail/TaskDetailSubtasks.vue';

  interface TaskDetailFieldsProps {
    task: TaskResponse;
    displayTime: string;
    isTimerActive: boolean;
  }
  const props = defineProps<TaskDetailFieldsProps>();

  const timeModel = computed({
    get: () => props.displayTime,
    set: () => {}
  });

  const estimateMinutes = computed({
    get: () => {
      const minutes = props.task.estimate_minutes?.toString() || '';
      return minutes ? `${minutes} min` : '';
    },
    set: () => {}
  });

  const dueDate = computed({
    get: () => {
      if (!props.task.due_date) return '';
      
      const date = new Date(props.task.due_date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      let timeString = '';
      if (props.task.due_time) {
        timeString = props.task.due_time.slice(0, 5);
      } else {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        timeString = `${hours}:${minutes}`;
      }
      
      return `${day}.${month}.${year} ${timeString}`;
    },
    set: () => {}
  });
  console.log(props.task);
  
</script>

<template>
  <div class="task-detail-wrapper">
    <div class="task-detail__fields">
      <div class="task-detail-fields__field">
        <div class="field__name">Deadline</div>
        <app-input
          v-model="dueDate"
          :disabled="true"
          :class="{ 'is-running': isTimerActive }"
          class="field__input"
        />
      </div>

      <div class="task-detail-fields__field">
        <div class="field__name">Estimated time</div>
        <app-input
          v-model="estimateMinutes"
          :disabled="true"
          :class="{ 'is-running': isTimerActive }"
          class="field__input"
        />
      </div>

      <div class="task-detail-fields__field">
        <div class="field__name">Time spent</div>
        <app-input
          v-model="timeModel"
          :disabled="true"
          :class="{ 'is-running': isTimerActive }"
          class="field__input"
        />
      </div>
    </div>
    <div class="task-detail__row">
      <div class="task-detail__name field__name">Task description</div>
      <div class="task-detail__description">
        {{ task.description || 'No description provided.' }}
      </div>
    </div>

    <task-detail-subtasks :task="task" class="subtasks" />
  </div>
</template>

<style scoped>
  .task-detail-wrapper {
    margin-top: var(--space-xl);
  }
  .task-detail__fields {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .task-detail-fields__field {
    max-width: 200px;
    width: 100%;
  }
  .task-detail__row {
    margin-top: var(--space-xl)
  }
  .task-detail__description {
    padding: 10px 20px;
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    color: var(--color-gray);
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    background-color: var(--color-white);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
  }
  .field__input :deep(.input) {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .field__name {
    font-size: var(--fs-sm);
    color: var(--color-black);
    font-weight: var(--fw-medium);
  }
  .is-running :deep(.input) {
    animation: pulse-input 2.5s ease-in-out infinite;
  }
  .subtasks {
    margin-top: var(--space-xl);
  }

  @keyframes pulse-input {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(15, 157, 138, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(15, 157, 138, 0);
    }
  }
  @media (max-width: 768px) {
   .task-detail__fields {
    justify-content: flex-start;
    flex-wrap: wrap;
   }
  }
  @media (max-width: 480px) {
  .task-detail-fields__field {
    max-width: 100%;
   }
  }
</style>
