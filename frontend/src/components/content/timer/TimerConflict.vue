<script setup lang="ts">
  import AppModal from '@/components/base/AppModal.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';

  interface TimerConflictProps {
    show: boolean;
    taskTitle: string;
  }
  defineProps<TimerConflictProps>();

  interface Emits {
    (e: 'cancel'): void;
    (e: 'confirm'): void;
  }
  const emit = defineEmits<Emits>();

  function handleCancel() {
    emit('cancel');
  }

  function handleConfirm() {
    emit('confirm');
  }
</script>

<template>
  <app-modal :model-value="show">
    <div class="timer-conflict">
      <div class="timer-conflict__overlay" @click="handleCancel"></div>
      <div class="timer-conflict__dialog">
        <app-subtitle>Timer Already Running</app-subtitle>
        <p class="timer-conflict__text">
          You already have a timer running for the task 
          <span>"{{ taskTitle }}"</span>.
          Stop it and start a new one?
        </p>
        <div class="timer-conflict__actions">
          <app-button secondary @click="handleCancel">
            Cancel
          </app-button>
          <app-button primary @click="handleConfirm">
            Stop and Start New
          </app-button>
        </div>
      </div>
    </div>
  </app-modal>
</template>

<style scoped>
  .timer-conflict__dialog {
    text-align: center;
  }
  .timer-conflict__dialog > *:not(:last-child) {
    margin-bottom: var(--space-sm);
  }
  .timer-conflict__text {
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
    color: var(--color-black);
  }
  .timer-conflict__text span {
    font-weight: var(--fw-semibold);
  }
  .timer-conflict__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
</style>
