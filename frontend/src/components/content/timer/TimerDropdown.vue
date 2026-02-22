<script setup lang="ts">
  import { computed } from 'vue';
  import { useTimerStore } from '@/stores/timerStore';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import { formatRelativeTime } from '@/utils/formatRelativeTime';
  import AppDropdown from '@/components/base/AppDropdown.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import ActiveTimer from '@/components/content/timer/ActiveTimer.vue';

  interface TimerDropdownProps {
    active: boolean;
  }
  defineProps<TimerDropdownProps>();

  interface Emits {
    (e: 'close'): void;
  }
  defineEmits<Emits>();

  const timerStore = useTimerStore();

  const formattedStatus = computed(() => {
    if (!timerStore.lastSession) return '';
    return TaskStatusUtils.getStatusLabel(timerStore.lastSession.taskStatus);
  });

  const formattedLastSessionTime = computed(() => {
    if (!timerStore.lastSession) return '';
    const minutes = timerStore.lastSession.minutesSpent;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  });

  const stoppedAtFormatted = computed(() => {
    if (!timerStore.lastSession) return '';
    return formatRelativeTime(timerStore.lastSession.stoppedAt);
  });

  const statusColor = computed(() => {
    if (!timerStore.lastSession) return '';
    return TaskStatusUtils.getStatusColor(timerStore.lastSession.taskStatus);
  });

  function clearLastSession() {
    timerStore.clearLastSession();
  }
</script>

<template>
  <app-dropdown :active="active">
    <div class="timer-dropdown">
      <div 
        v-if="!timerStore.hasActiveTimer && !timerStore.hasLastSession" 
        class="timer-dropdown__empty"
      >
        <app-icon 
          name="timer"
          size="var(--fs-lg)"
          color="var(--color-black)"
        />
        <div class="timer-dropdown__empty-text">
          No active timers
        </div>
      </div>

      <active-timer />

      <div 
        v-if="timerStore.hasActiveTimer && timerStore.hasLastSession" 
        class="timer-dropdown__divider"
      ></div>

      <div v-if="timerStore.hasLastSession" class="timer-dropdown__section">
        <div class="timer-dropdown__header">
          <div class="timer-dropdown__title">
            Last session
          </div>
          <app-button 
            class="timer-dropdown__close-btn"
            @click="clearLastSession"
            type="button"
          >
            <app-icon 
              name="delete"
              color="var(--color-black)"
              size="var(--fs-lg)"
            />
          </app-button>
        </div>

        <div class="timer-dropdown__content">
          <div class="timer-dropdown__task-title">
            {{ timerStore.lastSession?.taskTitle }}
          </div>

          <div class="timer-dropdown__meta">
            <div class="timer-dropdown__status">
              Status:
              <span :style="{ color: statusColor }">{{ formattedStatus }}</span>
            </div>
            <div class="timer-dropdown__row">
              <div class="timer-dropdown__time-spent">
                Spent: {{ formattedLastSessionTime }}
              </div>
              <div class="timer-dropdown__stopped-at">
                {{ stoppedAtFormatted }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </app-dropdown>
</template>

<style scoped>
  .timer-dropdown__empty {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .timer-dropdown__empty-text {
    font-size: var(--fs-md);
    color: var(--color-black);
  }
  .timer-dropdown__divider {
    margin: 16px 0;
    border: 1px solid var(--border);
    width: 100%;
  }
  .timer-dropdown__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .timer-dropdown__title {
    font-size: var(--fs-lg);
    color: var(--color-black);
    font-weight: var(--fw-medium);
  }
  .timer-dropdown__close-btn {
    width: 18px;
    height: 18px;
  }
  .timer-dropdown__task-title {
    margin-top: var(--space-xs);
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
  }
  .timer-dropdown__status {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    color: var(--color-black);
  }
  .timer-dropdown__row {
    margin-top: var(--space-xs);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .timer-dropdown__time-spent {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    color: var(--color-gray);
  }
  .timer-dropdown__stopped-at {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    color: var(--color-gray);
  }
</style>
