<script setup lang="ts">
  import type { TaskResponse } from '@/interface/task.interface';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  interface TaskCardHeaderProps {
    task: TaskResponse;
  }
  defineProps<TaskCardHeaderProps>();
</script>

<template>
  <div class="task-card-header">
    <div class="task-card-header__field">
      <div class="task-card-header__row">
        <app-checkbox />
        <div class="task-card-header__title">{{ task.title }}</div>
      </div>

      <app-button class="task-card-header__options">
        <app-icon 
          name="three-dots"
          size="var(--fs-xl)"
          color="var(--color-black)"
        />
      </app-button>
    </div>
  </div>
</template>

<style scoped>
  .task-card-header__field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  :deep(.checkbox .checkbox__checkmark) {
    top: -8px;
  }
  .task-card-header__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .task-card-header__title {
    font-size: var(--fs-xl);
    color: var(--color-black);
  }
  .task-card-header__options {
    width: 20px;
  }
</style>
