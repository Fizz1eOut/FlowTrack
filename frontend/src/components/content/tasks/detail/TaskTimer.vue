<script setup lang="ts">
  import { computed, watch, ref } from 'vue';
  import { useTimerStore } from '@/stores/timerStore';
  import { showToast } from '@/stores/toastStore';
  import type { TaskResponse } from '@/interface/task.interface';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  interface AppTaskTimerProps {
    task: TaskResponse;
    disabled?: boolean;
  }
  const props = withDefaults(defineProps<AppTaskTimerProps>(), {
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
      showToast(`You already have a timer running for the task:"${timerStore.activeTimer?.taskTitle}"`, 'error');
      return;
    }

    const success = timerStore.startTimer(props.task.id, props.task.title);
    
    if (!success) {
      showToast('Failed to start timer', 'error');
    }
    showToast('The timer has started', 'success');
  }

  function stopTimer() {
    const session = timerStore.stopTimer(props.task.status);
    
    if (session) {
      emit('timer-stopped', session.minutesSpent);
      showToast('The timer has stopped', 'success');
    }
  }

  function handleConflictStopAndStart() {
    const currentTaskStatus = props.task.status;
    timerStore.stopTimer(currentTaskStatus);
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

    <div v-if="showConflictDialog" class="task-timer-conflict">
      <div class="task-timer-conflict__overlay" @click="handleConflictCancel"></div>
      <div class="task-timer-conflict__dialog">
        <h3 class="task-timer-conflict__title">Таймер уже запущен</h3>
        <p class="task-timer-conflict__text">
          У вас уже запущен таймер для задачи 
          <strong>"{{ timerStore.activeTimer?.taskTitle }}"</strong>.
          Остановить его и запустить новый?
        </p>
        <div class="task-timer-conflict__actions">
          <app-button @click="handleConflictCancel">
            Отмена
          </app-button>
          <app-button primary @click="handleConflictStopAndStart">
            Остановить и запустить новый
          </app-button>
        </div>
      </div>
    </div>
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

