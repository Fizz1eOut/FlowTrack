<script setup lang="ts">
  import { computed } from 'vue';
  import WorkspaceInvitationsList from '@/components/content/workspace/team/invitations/WorkspaceInvitationsList.vue';
  import WorkspaceInviteButton from '@/components/content/workspace/invite/WorkspaceInviteButton.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import WorkspaceMembersList from '@/components/content/workspace/team/members/WorkspaceMembersList.vue';
  import AppTabs from '@/components/base/AppTabs.vue';
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

  const tabs = [
    { label: 'Members', slotName: 'members' },
    { label: 'Invitations', slotName: 'invitations' }
  ];
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
      <app-tabs
        :tabs="tabs"
      >
        <template #members>
          <workspace-members-list />
        </template>

        <template #invitations>
          <workspace-invitations-list />
        </template>
      </app-tabs>
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
  :deep(.tab__headers) {
    gap: var(--fs-3xl);
  }
  :deep(.tab__button.active) {
    border-bottom: none;
    color: var(--primary);
  }
  :deep(.tab__button) {
    font-size: var(--fs-xl);
    width: auto;
  }
  :deep(.invitations-list) {
    margin-top: var(--space-xl);
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
