<script setup lang="ts">
  import { computed } from 'vue';
  import WorkspaceInvitationsList from '@/components/content/workspace/team/invitations/WorkspaceInvitationsList.vue';
  import WorkspaceInviteButton from '@/components/content/workspace/invite/WorkspaceInviteButton.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useWorkspaceAccessStore } from '@/stores/workspaceAccessStore';
  import { WorkspacePermissions } from '@/utils/workspacePermissions';


  const workspaceStore = useWorkspaceStore();
  const workspaceAccessStore = useWorkspaceAccessStore();

  const currentWorkspaceId = computed(() => workspaceStore.currentWorkspace?.id);

  const currentUserRole = computed(() => {
    if (!currentWorkspaceId.value) return undefined;
    return workspaceAccessStore.getUserRole(currentWorkspaceId.value);
  });

  const canInviteMembers = computed(() => 
    WorkspacePermissions.canManageMembers(currentUserRole.value)
  );
</script>

<template>
  <div class="team">
    <div class="team__header">
      <div class="team__row">
        <app-subtitle>
          Team Management
        </app-subtitle>
        <p class="team__description">Manage team members and invitations</p>
      </div>
      <workspace-invite-button v-if="canInviteMembers" />
    </div>
    <div class="team__body">
      <workspace-invitations-list />
    </div>
  </div>
</template>

<style scoped>
  .team {
    margin-top: var(--space-xl);
  }
  .team__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .team__description {
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
  .team__body {
    margin-top: var(--space-lg);
  }
  :deep(.workspace-invite) {
    max-width: 180px;
    width: 100%;
  }
  :deep(.workspace-invite .button) {
    background: var(--gradient-accent);
  }
  @media (max-width: 420px) {
    .team__header {
      flex-direction: column;
      align-items: flex-start;
    }
    :deep(.workspace-invite) {
      max-width: 100%;
    }
  }
</style>
