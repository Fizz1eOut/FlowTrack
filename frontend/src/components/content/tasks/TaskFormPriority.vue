<script setup lang="ts">
  import AppSelect from '@/components/inputs/AppSelect.vue';

  interface TaskFormPriorityProps {
    modelValue: string;
  }
  defineProps<TaskFormPriorityProps>();
  const emit = defineEmits(['update:modelValue']);

  const options = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' },
  ];
</script>

<template>
  <div class="task-form-priority">
    <div class="task-form-priority__name">Priority</div>
    <app-select
      :model-value="modelValue"
      :options="options"
      label-key="label"
      value-key="value"
      @update:model-value="val => emit('update:modelValue', val)"
    />
  </div>
</template>

<style scoped>
  .task-form-priority__name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
</style>
