<script setup lang="ts">
  import AppInput from '@/components/inputs/AppInput.vue';

  interface taskFormEstimateProps {
    modelValue: number;
  }
  const props = defineProps<taskFormEstimateProps>();
  const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
  }>();
</script>

<template>
  <div class="task-form-estimate">
    <div class="task-form-estimate__name">Estimate (minutes)</div>
    <app-input
      :model-value="props.modelValue"
      type="number"
      placeholder="Estimate (minutes)"
      min="1"
      @update:model-value="value => emit('update:modelValue', Number(value))"
    />
  </div>
</template>

<style scoped>
  .task-form-estimate__name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
</style>
