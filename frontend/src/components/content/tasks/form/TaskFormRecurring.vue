<script setup lang="ts">
  import { computed } from 'vue';
  import AppSwitch from '@/components/inputs/AppSwitch.vue';

  interface TaskFormRecurringProps {
    modelValue: boolean
    recurringDays?: number[] | null;
  }
  const props = defineProps<TaskFormRecurringProps>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'update:recurringDays', value: number[]): void;
  }>();

  const model = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val)
  });

  const weekDays = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
  ];

  function toggleDay(value: number) {
    const current = props.recurringDays ?? [];
    const updated = current.includes(value)
      ? current.filter(d => d !== value)
      : [...current, value];
    emit('update:recurringDays', updated);
  }

  function isActive(value: number) {
    return (props.recurringDays ?? []).includes(value);
  }
</script>

<template>
  <div class="task-form-recurring">
    <div class="task-form-recurring__field">
      <div class="task-form-recurring__name">Recurring Task</div>
      <app-switch 
        v-model="model"
      />
    </div>
    <transition name="fade">
      <div v-if="model" class="task-form-recurring__days">
        <button
          v-for="day in weekDays"
          :key="day.value"
          type="button"
          class="task-form-recurring__day"
          :class="{ active: isActive(day.value) }"
          @click="toggleDay(day.value)"
        >
          {{ day.label }}
        </button>
        <div class="task-form-recurring__hint">
          {{ (recurringDays ?? []).length === 0 ? 'Every day' : '' }}
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
  .task-form-recurring {
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .task-form-recurring__field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .task-form-recurring__name {
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
  }
  .task-form-recurring__days {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: var(--space-md);
    align-items: center;
  }
  .task-form-recurring__day {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-primary);
    font-size: var(--fs-sm);
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .task-form-recurring__day:hover {
    color: var(--primary-hover);
    border-color: var(--primary-hover);
  }
  .task-form-recurring__day.active {
    background: transparent;
    color: var(--primary);
    border-color: var(--primary);
  }
  .task-form-recurring__hint {
    font-size: var(--fs-sm);
    color: var(--color-gray);
    width: 100%;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
