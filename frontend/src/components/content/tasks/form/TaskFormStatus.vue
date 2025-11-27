<script setup lang="ts">
  import { watch } from 'vue';
  import AppSelect from '@/components/inputs/AppSelect.vue';

  const props = defineProps<{ modelValue: string }>();
  const emit = defineEmits(['update:modelValue']);

  const allowedStatuses = ['backlog', 'planned', 'in_progress', 'done'];

  watch(
    () => props.modelValue,
    (val) => {
      if (!allowedStatuses.includes(val)) {
        emit('update:modelValue', 'backlog');
      }
    },
    { immediate: true }
  );

  const options = [
    { label: 'Backlog', value: 'backlog' },
    { label: 'Planned', value: 'planned' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done', value: 'done' }
  ];

  function onChange(val: unknown) {
    const str = typeof val === 'string' ? val : 'backlog';
    emit(
      'update:modelValue',
      allowedStatuses.includes(str) ? str : 'backlog'
    );
  }
</script>

<template>
  <div class="task-form-status">
    <div class="task-form-status__name">Status</div>
    <app-select
      :model-value="modelValue"
      :options="options"
      label-key="label"
      value-key="value"
      @update:model-value="onChange"
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
