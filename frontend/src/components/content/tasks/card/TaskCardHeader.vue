<script setup lang="ts">
  import { ref } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import TaskCardMenu from '@/components/content/tasks/card/TaskCardMenu.vue';

  interface TaskCardHeaderProps {
    task: TaskResponse;
  }
  defineProps<TaskCardHeaderProps>();

  const isOpen = ref(false);
</script>

<template>
  <div class="task-card-header">
    <div class="task-card-header__field">
      <div class="task-card-header__row">
        <app-checkbox />
        <div class="task-card-header__title">{{ task.title }}</div>
      </div>

      <div class="task-card-header__options">
        <app-button @click="isOpen = !isOpen">
          <app-icon 
            name="three-dots"
            size="var(--fs-xl)"
            color="var(--color-black)"
          />
        </app-button>
        <task-card-menu :active="isOpen" :task="task" />
      </div>
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
    position: relative;
    width: 40px;
    height: 40px;
    transition: background-color 0.3s ease-in-out;
    border-radius: var(--radius-sm);
  }
  .task-card-header__options:hover {
    background-color: var(--accent);
  }
  :deep(.dropdown) {
    width: auto;
    right: 0;
    left: unset;
  }
</style>
