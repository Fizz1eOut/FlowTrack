<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { useTasksStore } from '@/stores/taskStore';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import { showToast } from '@/stores/toastStore';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import TaskCardMenu from '@/components/content/tasks/card/TaskCardMenu.vue';

  interface TaskCardHeaderProps {
    task: TaskResponse;
  }
  const props = defineProps<TaskCardHeaderProps>();

  const emit = defineEmits<{
    completedChange: [boolean];
  }>();

  const taskStore = useTasksStore();
  const isOpen = ref(false);
  const timerBadgeRef = ref<HTMLElement | null>(null);

  const isCompleted = computed(() => TaskStatusUtils.isCompleted(props.task.status));
  const canCheck = computed(() => TaskStatusUtils.canCheck(props.task.status));

  async function handleCheckboxToggle() {
    if (!canCheck.value) return;

    const wasCompleted = isCompleted.value;
  
    const result = await taskStore.toggleTaskCompletion(props.task.id, props.task.status);

    emit('completedChange', isCompleted.value);

    if (!wasCompleted && result.xpEarned > 0) {
      if (result.leveledUp) {
        showToast(
          `Level Up! You reached level ${result.newLevel} and earned ${result.xpEarned} XP!`,
          'success'
        );
      } else {
        showToast(`Task completed! +${result.xpEarned} XP`, 'success');
      }
    } else if (wasCompleted && result.xpEarned < 0) {
      const xpLost = Math.abs(result.xpEarned);
      showToast(`Task marked as incomplete. ${xpLost} XP removed`, 'success');
    }
    else if (wasCompleted && result.xpEarned === 0) {
      showToast('Task marked as incomplete', 'success');
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (timerBadgeRef.value && !timerBadgeRef.value.contains(target)) {
      isOpen.value = false;
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div class="task-card-header">
    <div class="task-card-header__field">
      <div class="task-card-header__row" @click.stop> 
        <app-checkbox 
          :model-value="isCompleted"
          :disabled="!canCheck"
          @update:model-value="handleCheckboxToggle"
        />
        <div class="task-card-header__title" :class="{ 'completed': isCompleted }">{{ task.title }}</div>
      </div>

      <div 
        v-if="!isCompleted"
        ref="timerBadgeRef"
        @click.stop
        class="task-card-header__options"
      >
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
    min-width: 0;
  }
  .completed {
    opacity: 0.6;
    text-decoration: line-through;
  }
  .task-card-header__title {
    font-size: var(--fs-xl);
    color: var(--color-black);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%
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
