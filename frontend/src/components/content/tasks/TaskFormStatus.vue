<script setup lang="ts">
  import AppSelect from '@/components/inputs/AppSelect.vue';

  defineProps<{ modelValue: string }>();
  const emit = defineEmits(['update:modelValue']);

  const options = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done', value: 'done' },
    { label: 'Planned', value: 'planned' },
    { label: 'Backlog', value: 'backlog' },
  ];
</script>

<template>
  <div class="task-form-status">
    <div class="task-form-status__name">Status</div>
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
  .task-form-status__name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
</style>
