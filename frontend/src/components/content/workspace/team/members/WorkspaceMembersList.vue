<script setup lang="ts">
  import { computed, watch } from 'vue';
  import { useWorkspaceAccessStore } from '@/stores/workspaceAccessStore';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import AppLoadingSpinner from '@/components/base/AppLoadingSpinner.vue';
  import WorkspaceMemberCard from '@/components/content/workspace/team/members/WorkspaceMemberCard.vue';

  const workspaceAccessStore = useWorkspaceAccessStore();
  const workspaceStore = useWorkspaceStore();

  const loading = computed(() => workspaceAccessStore.loading);
  const currentWorkspaceId = computed(() => workspaceStore.currentWorkspace?.id);
  const currentUserRole = computed(() => {
    if (!currentWorkspaceId.value) return undefined;
    return workspaceAccessStore.getUserRole(currentWorkspaceId.value);
  });

  const members = computed(() => {
    if (!currentWorkspaceId.value) return [];
    return workspaceAccessStore.getMembers(currentWorkspaceId.value);
  });
  console.log('members', members.value);
  
  watch(
    currentWorkspaceId,
    (id) => {
      if (!id) return;
      workspaceAccessStore.fetchMembers(id);
    },
    { immediate: true }
  );
</script>

<template>
  <app-loading-spinner 
    v-if="loading"
    text="Loading invitations..."
  />

  <div v-else class="members-list">
    <div v-if="members.length === 0" class="members-list__empty">
      <div class="members-list__row">
        <p>No pending invitations</p>
        <p>Invite team members to collaborate on this workspace</p>
      </div>
    </div>

    <div class="members-list__items">
      <div 
        v-for="member in members" 
        :key="member.id"
        class="members-list__item"
      >
        <workspace-member-card 
          :member="member"
          :current-user-role="currentUserRole"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .members-list {
    margin-top: var(--space-xl);
  }
  .members-list__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    text-align: center;
    min-height: 100px;
  }
  .members-list__items {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .members-list__item {
    width: 100%;
  }
</style>
