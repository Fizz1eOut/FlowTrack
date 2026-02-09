<script setup lang="ts">
  import { computed, watch } from 'vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useWorkspaceAccessStore } from '@/stores/workspaceAccessStore';
  import WorkspaceInvitationCard from '@/components/content/workspace/team/invitations/WorkspaceInvitationCard.vue';
  import AppLoadingSpinner from '@/components/base/AppLoadingSpinner.vue';

  const workspaceStore = useWorkspaceStore();
  const workspaceAccessStore = useWorkspaceAccessStore();

  const loading = computed(() => workspaceAccessStore.loading);
  const currentWorkspaceId = computed(() => workspaceStore.currentWorkspace?.id);
  
  const currentUserRole = computed(() => {
    if (!currentWorkspaceId.value) return undefined;
    return workspaceAccessStore.getUserRole(currentWorkspaceId.value);
  });

  const invitations = computed(() => {
    if (!currentWorkspaceId.value) return [];
    return workspaceAccessStore.getPendingInvitations(currentWorkspaceId.value);
  });

  const expiredInvitations = computed(() => {
    if (!currentWorkspaceId.value) return [];

    return workspaceAccessStore
      .getInvitations(currentWorkspaceId.value)
      .filter(inv => {
        const notAccepted = !inv.accepted_at;
        const expired = new Date(inv.expires_at) <= new Date();
        return notAccepted && expired;
      });
  });

  const acceptedInvitations = computed(() => {
    if (!currentWorkspaceId.value) return [];

    return workspaceAccessStore
      .getInvitations(currentWorkspaceId.value)
      .filter(inv => inv.accepted_at !== null && inv.accepted_at !== undefined);
  });

  const isEmpty = computed(() => {
    return (
      invitations.value.length === 0 &&
      expiredInvitations.value.length === 0 &&
      acceptedInvitations.value.length === 0
    );
  });

  watch(
    currentWorkspaceId,
    (id) => {
      if (!id) return;
      workspaceAccessStore.fetchInvitations(id);
      workspaceAccessStore.fetchUserRole(id);
    },
    { immediate: true }
  );

  const handleCancelInvitation = async (invitationId: string) => {
    if (!currentWorkspaceId.value) return;
    try {
      await workspaceAccessStore.cancelInvitation(
        invitationId,
        currentWorkspaceId.value
      );
    } catch (e) {
      console.error('Failed to cancel invitation:', e);
    }
  };
</script>

<template>
  <app-loading-spinner 
    v-if="loading"
    text="Loading invitations..."
  />
  <div v-else class="invitations-list">
    <div v-if="isEmpty" class="invitations-list__empty">
      <div class="invitations-list__row">
        <p>No pending invitations</p>
        <p>Invite team members to collaborate on this workspace</p>
      </div>
    </div>

    <div class="invitations-list__group">
      <div class="invitations-list__items" v-if="invitations.length > 0">
        <div class="title">Pending ({{ invitations.length }})</div>
        <div class="invitations-list__item">
          <workspace-invitation-card 
            v-for="invitation in invitations"
            :key="invitation.id"
            :invitation="invitation" 
            @cancel="handleCancelInvitation"
            :currentUserRole="currentUserRole"
          />
        </div>
      </div>

      <div class="expired-invitations__items" v-if="expiredInvitations.length > 0">
        <div class="title">Expired ({{ expiredInvitations.length }})</div>
        <div class="expired-invitations__item">
          <workspace-invitation-card 
            v-for="expired in expiredInvitations"
            :invitation="expired"
            :key="expired.id"
            @cancel="handleCancelInvitation"
            :currentUserRole="currentUserRole"
          />
        </div>
      </div>

      <div class="accepted-invitations__items" v-if="acceptedInvitations.length > 0">
        <div class="title">Accepted ({{ acceptedInvitations.length }})</div>
        <div class="accepted-invitations__item">
          <workspace-invitation-card 
            v-for="accepted in acceptedInvitations"
            :invitation="accepted"
            :key="accepted.id"
            :currentUserRole="currentUserRole"
          />  
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .title {
    font-size: var(--fs-lg);
    color: var(--color-gray);
    margin-bottom: var(--space-md);
  }
  .invitations-list__group > *:not(:last-child) {
    margin-bottom: var(--space-lg) 
  }
  .accepted-invitations__item:not(:last-child) {
    margin-bottom: var(--space-xs);
  }
  .invitations-list__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    text-align: center;
    min-height: 100px;
  }
  .invitations-list__item:not(:last-child) {
    margin-bottom: var(--space-xs);
  }
</style>
