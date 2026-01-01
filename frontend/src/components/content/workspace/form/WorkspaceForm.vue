<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import WorkspaceFormHeader from '@/components/content/workspace/form/WorkspaceFormHeader.vue';
  import WorkspaceFormFields from '@/components/content/workspace/form/WorkspaceFormFields.vue';
  import WorkspaceFormActions from '@/components/content/workspace/form/WorkspaceFormActions.vue';
  import { showToast } from '@/stores/toastStore';

  const emit = defineEmits<{
    close: [];
    created: [workspaceId: string];
  }>();

  const workspaceStore = useWorkspaceStore();

  const form = ref({
    name: '',
    description: '',
    type: 'personal' as 'personal' | 'team',
    color: '#00A88E'
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  const isValid = computed(() => {
    return form.value.name.trim().length >= 3;
  });

  const isPersonalDisabled = computed(() => {
    return form.value.type === 'personal' && !workspaceStore.canCreatePersonalWorkspace;
  });

  const handleSubmit = async () => {
    if (!isValid.value) {
      error.value = 'Workspace name must be at least 3 characters';
      showToast('Workspace name must be at least 3 characters', 'error');
      return;
    }

    if (isPersonalDisabled.value) {
      error.value = 'Personal workspace already exists';
      showToast('Personal workspace already exists', 'error');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const workspace = await workspaceStore.createWorkspace({
        name: form.value.name.trim(),
        type: form.value.type,
        description: form.value.description.trim() || undefined,
        color: form.value.color,
      });

      console.log('[WorkspaceForm] Workspace created successfully:', workspace.id);
      showToast(`Workspace "${workspace.name}" created successfully`, 'success');
      
      emit('created', workspace.id);
      emit('close');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workspace';
      error.value = errorMessage;
      
      console.error('[WorkspaceForm] Failed to create workspace:', err);
      showToast(errorMessage, 'error');
    } finally {
      loading.value = false;
    }
  };

  const handleClose = () => {
    if (!loading.value) {
      emit('close');
    }
  };
</script>

<template>
  <div class="workspace-form">
    <workspace-form-header @close="handleClose" />

    <workspace-form-fields 
      v-model="form"
      :is-valid="isValid"
      :error="error"
      :can-create-personal="workspaceStore.canCreatePersonalWorkspace"
    />

    <workspace-form-actions
      :loading="loading"
      :is-valid="isValid"
      @cancel="handleClose"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.workspace-form__error {
  margin-top: var(--space-md);
  color: var(--error);
  font-size: var(--fs-sm);
}
</style>
