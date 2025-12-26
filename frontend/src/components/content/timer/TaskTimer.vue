<script setup lang="ts">
  import { computed, watch, ref, onMounted } from 'vue';
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

  function toggleTimer(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('[TaskTimer] toggleTimer called', {
      isRunning: isRunningForThisTask.value,
      taskId: props.task.id,
      isStopping: timerStore.isStopping
    });

    if (isRunningForThisTask.value) {
      stopTimer();
    } else {
      startTimer();
    }
  }

  async function startTimer() {
    console.log('[TaskTimer] startTimer called');
    
    if (props.disabled) {
      console.log('[TaskTimer] Timer disabled, ignoring');
      return;
    }

    if (hasConflict.value) {
      console.log('[TaskTimer] Has conflict, showing dialog');
      showConflictDialog.value = true;
      return;
    }

    const success = await timerStore.startTimer(props.task.id, props.task.title);
  
    if (!success) {
      console.error('[TaskTimer] Failed to start timer');
      showToast('Failed to start timer', 'error');
      return;
    }

    console.log('[TaskTimer] Timer started successfully');
    showToast('The timer has started', 'success');
  }

  async function stopTimer() {
    console.log('[TaskTimer] stopTimer called', {
      isStopping: timerStore.isStopping,
      taskId: props.task.id
    });

    if (timerStore.isStopping) return;

    try {
      const session = await timerStore.stopTimer();

      if (session) {
        emit('timer-stopped', session.minutesSpent);
        showToast('The timer has stopped', 'success');
      }
    } catch (error) {
      console.error('[TaskTimer] Error stopping timer:', error);
      showToast('Failed to stop timer', 'error');
    }
  }

  async function handleConflictConfirm() {
    console.log('[TaskTimer] Conflict confirmed, switching timers');

    await timerStore.stopTimer();
    await timerStore.startTimer(props.task.id, props.task.title);

    showConflictDialog.value = false;
  }

  function handleConflictCancel() {
    console.log('[TaskTimer] Conflict cancelled');
    showConflictDialog.value = false;
  }

  watch(() => timerStore.activeTimer?.taskId, (newTaskId) => {
    if (!newTaskId && isRunningForThisTask.value) {
      console.log('[TaskTimer] Timer stopped externally');
    }
  });

  defineExpose({
    isRunning: isRunningForThisTask
  });

  onMounted(async () => {
    if (props.task.id) {
      await timerStore.fetchHistoryByTask(props.task.id);
    }
  });
</script>

<template>
  <div class="task-timer">
    <app-button 
      primary
      @click="toggleTimer"
      :class="['task-timer__button', { active: isRunningForThisTask }]"
      :disabled="disabled || timerStore.isStopping"
    >
      <app-icon
        :name="isRunningForThisTask ? 'pause' : 'play'"
        size="var(--fs-xl)"
        color="var(--color-white)"
      />
      <span class="task-timer__display">
        {{ timerStore.isStopping ? 'Stopping...' : formattedTime }}
      </span>
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

