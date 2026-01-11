<script setup lang="ts">
  import { computed } from 'vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppTextarea from '@/components/inputs/AppTextarea.vue';
  import WorkspaceTypeSelector from '@/components/content/workspace/invite/WorkspaceTypeSelector.vue';
  import WorkspaceColorPicker from '@/components/content/workspace/form/WorkspaceColorPicker.vue';

  type WorkspaceForm = {
    name: string
    description: string
    type: 'personal' | 'team'
    color: string
  }

  const props = defineProps<{
    modelValue: WorkspaceForm
    isValid: boolean
    error: string | null
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: WorkspaceForm): void
  }>();

  const form = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
</script>

<template>
  <div>
    <div class="workspace-form__body">
      <div class="workspace-form__field">
        <div class="workspace-form__label">Workspace name</div>
        <app-input 
          v-model="form.name"
          placeholder="Enter workspace name"
          :class="{ error: !isValid }"
        />
        <div v-if="!isValid" class="name-error">{{ error }}</div>
      </div>

      <div class="workspace-form__field">
        <div class="workspace-form__label">Workspace type</div>
        <workspace-type-selector v-model="form.type" />
      </div>

      <div class="workspace-form__field">
        <div class="workspace-form__label">Workspace describe</div>
        <app-textarea v-model="form.description" placeholder="Describe your workspace" />
      </div>

      <div class="workspace-form__field">
        <div class="workspace-form__label">Workspace color</div>
        <workspace-color-picker v-model="form.color" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .workspace-form__body {
    margin-top: var(--space-lg);
  }
  .workspace-form__field:not(:last-child) {
    margin-bottom: var(--space-md);
  }
  .workspace-form__label {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
  .error {
    border: 1px solid var(--error);
    border-radius: var(--radius-sm);
  }
  .name-error {
    color: var(--error);
  }
</style>
