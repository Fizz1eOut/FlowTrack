<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import AppSelect from '@/components/inputs/AppSelect.vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';

  defineProps<{ modelValue: string }>();
  const emit = defineEmits(['update:modelValue']);

  const workspaceStore = useWorkspaceStore();

  onMounted(() => {
    if (!workspaceStore.workspaces.length) {
      workspaceStore.fetchWorkspaces();
    }
  });

  const workspaceOptions = computed(() => [
    ...workspaceStore.workspaces.map(ws => ({
      label: ws.name,
      value: ws.id
    }))
  ]);

</script>

<template>
  <div class="task-form-project">
    <div class="task-form-project__name">Project</div>
    <app-select
      :model-value="modelValue"
      :options="workspaceOptions"
      label-key="label"
      value-key="value"
      @update:model-value="val => emit('update:modelValue', val)"
    />
  </div>
</template>

<style scoped>
  .task-form-project__name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
</style>
