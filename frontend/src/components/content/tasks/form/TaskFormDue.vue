<script setup lang="ts">
  import { onMounted } from 'vue';
  import AppInput from '@/components/inputs/AppInput.vue';

  interface Props {
    dueDate: string | null;
    dueTime: string | null;
    recurring: boolean
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    'update:dueDate': [value: string | null];
    'update:dueTime': [value: string | null];
  }>();

  onMounted(() => {
    if (props.recurring) return;

    if (!props.dueDate) {
      const now = new Date();
      const parts = now.toISOString().split('T');
      const defaultDate = parts[0] ?? '';
      emit('update:dueDate', defaultDate);
    }

    if (!props.dueTime) {
      emit('update:dueTime', '12:00');
    }
  });

  function handleDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:dueDate', target.value || null);
  }

  function handleTimeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:dueTime', target.value || null);
  }
</script>

<template>
  <div class="task-form-due">
    <div v-if="!recurring" class="task-form-due__field">
      <div class="task-form-due__name">Date</div>
      <app-input
        type="date"
        :model-value="dueDate || ''"
        @input="handleDateChange"
        placeholder="Select date"
      />
    </div>
    <div class="task-form-due__field">
      <div class="task-form-due__name">Time</div>
      <app-input
        type="time"
        :model-value="dueTime || ''"
        @input="handleTimeChange"
        placeholder="Select time"
      />
    </div>
  </div>
</template>

<style scoped>
  .task-form-due {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .task-form-due__field {
    width: 100%;
  }
  .task-form-due__name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
  @media (max-width: 380px) {
    .task-form-due {
      flex-direction: column;
    }
  }
</style>
