<script setup lang="ts">
  import { computed, watch, ref } from 'vue';
  import { useTimerStore } from '@/stores/timerStore';
  import { showToast } from '@/stores/toastStore';
  import type { TaskResponse } from '@/interface/task.interface';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import TimerConflict from '@/components/content/timer/TimerConflict.vue';

  interface TaskTimerProps {
    task: TaskResponse;
    disabled?: boolean;
  }
  const props = withDefaults(defineProps<TaskTimerProps>(), {
    disabled: false
  });

  interface Emits {
    (e: 'timer-stopped', minutesSpent: number): void;
  }
  const emit = defineEmits<Emits>();

  const timerStore = useTimerStore();
  const showConflictDialog = ref(false);

  const isRunningForThisTask = computed(() => {
    return timerStore.isTimerActiveForTask(props.task.id);
  });

  const hasConflict = computed(() => {
    return timerStore.hasActiveTimer && !isRunningForThisTask.value;
  });

  const formattedTime = computed(() => {
    if (!isRunningForThisTask.value) {
      return '0:00';
    }
    return timerStore.formattedActiveTime;
  });

  function toggleTimer() {
    if (isRunningForThisTask.value) {
      stopTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (props.disabled) return;

    if (hasConflict.value) {
      showConflictDialog.value = true;
      return;
    }

    const success = timerStore.startTimer(props.task.id, props.task.title);
    
    if (!success) {
      showToast('Failed to start timer', 'error');
    }
    showToast('The timer has started', 'success');
  }

  async function stopTimer() {
    try {
      const session = await timerStore.stopTimer(props.task.status);
    
      if (session) {
        emit('timer-stopped', session.minutesSpent);
        showToast('The timer has stopped', 'success');
      
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    } catch (error) {
      console.error('[TaskTimer] Error stopping timer:', error);
      showToast('Failed to stop timer', 'error');
    }
  }

  async function handleConflictConfirm() {
    const currentTaskStatus = props.task.status;
    await timerStore.stopTimer(currentTaskStatus);
    timerStore.startTimer(props.task.id, props.task.title);
    showConflictDialog.value = false;
  }

  function handleConflictCancel() {
    showConflictDialog.value = false;
  }

  watch(() => timerStore.activeTimer, (newTimer) => {
    if (!newTimer && isRunningForThisTask.value) {
      console.log('[TaskTimer] Timer stopped externally');
    }
  });

  defineExpose({
    isRunning: isRunningForThisTask
  });
</script>

<template>
  <div class="task-timer">
    <app-button 
      primary
      @click="toggleTimer"
      :class="['task-timer__button', { active: isRunningForThisTask }]"
      :disabled="disabled"
    >
      <app-icon
        :name="isRunningForThisTask ? 'pause' : 'play'"
        size="var(--fs-xl)"
        color="var(--color-white)"
      />
      <span class="task-timer__display">{{ formattedTime }}</span>
    </app-button>

    <timer-conflict 
      :show="showConflictDialog"
      :task-title="timerStore.activeTimer?.taskTitle || ''"
      @confirm="handleConflictConfirm"
      @cancel="handleConflictCancel"
    />
  </div>
</template>

<style scoped>
  .task-timer__button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .task-timer__button.active {
    border-color: #ff0000;
    background: #ef4343;
    color: var(--color-white);
    animation: pulse 3s ease-in-out infinite;
  }
  .task-timer__display {
    font-size: var(--fs-md);
    min-width: 50px;
    text-align: center;
  }
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(255, 0, 0, 0);
    }
  }
</style>

