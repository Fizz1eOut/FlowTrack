<script setup lang="ts">
  import { useTimerStore } from '@/stores/timerStore';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  interface Emits {
    (e: 'close'): void;
    (e: 'open-task', taskId: string): void;
  }
  const emit = defineEmits<Emits>();

  const timerStore = useTimerStore();

  async function stopActiveTimer(e?: Event) {
    e?.preventDefault();
    e?.stopPropagation();

    console.log('[ActiveTimer] stopActiveTimer called', {
      hasActiveTimer: !!timerStore.activeTimer,
      isStopping: timerStore.isStopping,
      taskId: timerStore.activeTimer?.taskId
    });

    if (!timerStore.activeTimer?.taskId || timerStore.isStopping) return;

    try {
      console.log('[ActiveTimer] Stopping timer...');
      await timerStore.stopTimer();
      emit('close');
    } catch (error) {
      console.error('[ActiveTimer] Error stopping timer:', error);
    }
  }


  function openTask() {
    if (!timerStore.activeTimer) return;
    console.log('[ActiveTimer] Opening task:', timerStore.activeTimer.taskId);
    emit('open-task', timerStore.activeTimer.taskId);
  }
</script>

<template>
  <div v-if="timerStore.hasActiveTimer" class="timer-dropdown__section">
    <div class="timer-dropdown__header">
      <div class="timer-dropdown__title">
        Active Timer
      </div>
    </div>

    <div class="timer-dropdown__content">
      <div 
        class="timer-dropdown__task-title"
        @click="openTask"
      >
        {{ timerStore.activeTimer?.taskTitle }}
      </div>

      <div class="timer-dropdown__time">
        <app-icon 
          name="timer"
          color="var(--color-black)"
          size="var(--fs-lg)"
        />
        <span class="timer-dropdown__time-value">
          {{ timerStore.formattedActiveTime }}
        </span>
      </div>

      <app-button 
        class="timer-dropdown__stop-btn"
        :disabled="timerStore.isStopping"
        @click.stop="stopActiveTimer"
      >
        {{ timerStore.isStopping ? 'Stopping...' : 'Stop' }}
      </app-button>
    </div>
  </div>
</template>

<style scoped>
  .timer-dropdown__title {
    font-size: var(--fs-lg);
    color: var(--color-black);
    font-weight: var(--fw-medium);
  }
  .timer-dropdown__task-title {
    margin-top: var(--space-xs);
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
  }
  .timer-dropdown__time {
    margin-top: var(--space-xs);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .timer-dropdown__time-value {
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
    color: var(--color-black);
  }
  .timer-dropdown__stop-btn {
    margin-top: var(--space-xs);
    border-radius: var(--radius-sm);
    height: var(--space-lg);
    border-color: #ff0000;
    background: #ef4343;
    color: var(--color-white);
    animation: pulse 3s ease-in-out infinite;
  }
  .timer-dropdown__stop-btn:hover {
    background-color: #ff0000;
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
