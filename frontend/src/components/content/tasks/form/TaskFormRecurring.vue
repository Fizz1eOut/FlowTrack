<script setup lang="ts">
  import { computed } from 'vue';
  import AppSwitch from '@/components/inputs/AppSwitch.vue';

  interface TaskFormRecurringProps {
    modelValue: boolean
  }
  const props = defineProps<TaskFormRecurringProps>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const model = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val)
  });
</script>

<template>
  <div class="task-form-recurring">
    <div class="task-form-recurring__field">
      <div class="task-form-recurring__name">Recurring Task</div>
      <app-switch 
        v-model="model"
      />
    </div>
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
</style>
