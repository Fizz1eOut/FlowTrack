<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import type { WorkspaceMemberRole } from '@/interface/workspace.interface';
  import WorkspaceInviteHeader from '@/components/content/workspace/invite/WorkspaceInviteHeader.vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import WorkspaceInviteRole from '@/components/content/workspace/invite/WorkspaceInviteRole.vue';
  import WorkspaceInviteActions from '@/components/content/workspace/invite/WorkspaceInviteActions.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  const emit = defineEmits<{
    (e: 'close'): void
  }>();

  const workspaceStore = useWorkspaceStore();
  const email = ref('');
  const role = ref<WorkspaceMemberRole>('member');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  const currentWorkspace = computed(() => workspaceStore.currentWorkspace);

  const isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.value.trim());
  });

  const canSubmit = computed(() => {
    return isValidEmail.value && !loading.value;
  });

  const handleSubmit = async () => {
    if (!canSubmit.value || !currentWorkspace.value) return;

    loading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      await workspaceStore.inviteMember({
        workspace_id: currentWorkspace.value.id,
        email: email.value.trim(),
        role: role.value,
      });

      emit('close');
      successMessage.value = `Invitation sent to ${email.value}`;

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send invitation';
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="invite-modal">
    <workspace-invite-header 
      @close="$emit('close')"
    />

    <div class="invite-modal__body">
      <div v-if="currentWorkspace" class="invite-modal__info info-workspace">
        <div class="info-workspace__content">
          <div class="info-workspace__text">
            <app-icon 
              name="team"
              size="var(--fs-md)"
              color="var(--color-gray)"
            />
            Team: <span>{{ currentWorkspace.name }}</span>
          </div>
        </div>
      </div>

      <div class="invite-modal__form form-workspace">
        <div class="form-workspace__item">
          <div class="form-workspace__name">
            Email
          </div>
          <app-input 
            v-model="email"
            type="email"
            class="form-workspace__input"
            :class="{ error: !isValidEmail }"
            placeholder="Email"
            :disabled="loading"
            @keyup.enter="handleSubmit"
          />
          <p v-if="email && !isValidEmail" class="error--text">
            Please enter a valid email address.
          </p>
        </div>

        <div class="form-workspace__item">
          <div class="form-workspace__name">Role in the workspace</div>
          <workspace-invite-role v-model="role" />
        </div>
      </div>

      <workspace-invite-actions 
        :loading="loading"
        :is-valid="isValidEmail"
        @cancel="$emit('close')"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<style scoped>
  .info-workspace {
    margin-top: var(--space-md);
  }
  .info-workspace__text {
    display: flex;
    align-items: center;
    gap: 6px;  
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
  .info-workspace__text span {
    font-size: var(--fs-md);
    color: var(--color-black);
    font-weight: var(--fw-medium);
  }
  .invite-modal__form {
    margin-top: var(--space-lg)
  }
  .form-workspace__item:not(:last-child) {
    margin-bottom: var(--space-md)
  }
  .error--text {
    color: var(--error);
  }
  .error {
    border: 1px solid var(--error);
    border-radius: var(--radius-sm);
  }
</style>
