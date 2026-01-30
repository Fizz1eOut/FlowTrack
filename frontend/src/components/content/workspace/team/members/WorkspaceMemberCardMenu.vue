<script setup lang="ts">
  import { computed, watch } from 'vue';
  import AppDropdown from '@/components/base/AppDropdown.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import type { WorkspaceMember } from '@/interface/workspace.interface';
  import { useWorkspaceAccessStore } from '@/stores/workspaceAccessStore';
  import { WorkspacePermissions } from '@/utils/workspacePermissions';

  interface WorkspaceMemberCardMenuProps {
    active: boolean;
    member: WorkspaceMember;
  }
  const props = defineProps<WorkspaceMemberCardMenuProps>();

  const workspaceAccessStore = useWorkspaceAccessStore();

  const currentUserRole = computed(() => 
    workspaceAccessStore.getUserRole(props.member.workspace_id)
  );
  
  const canChangeRole  = computed(() => {
    const targetRole = props.member.role;

    if (targetRole === 'owner') return false;

    return WorkspacePermissions.canChangeRoles(currentUserRole.value);
  });

  const canRemove = computed(() => {
    return WorkspacePermissions.canRemoveMember(
      currentUserRole.value,
      props.member.role
    );
  });

  const roleChangeText = computed(() => {
    return props.member.role === 'member' ? 'Promote to Admin' : 'Demote to Member';
  });

  const handleRoleChange = async () => {
    try {
      const newRole = props.member.role === 'member' ? 'admin' : 'member';
    
      await workspaceAccessStore.changeMemberRole(
        props.member.workspace_id,
        props.member.user_id, 
        newRole 
      );

    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  const handleRemove = async () => {
    try {
      await workspaceAccessStore.removeMember(
        props.member.workspace_id,
        props.member.user_id 
      );

    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  watch(
    () => props.member.workspace_id,
    (workspaceId) => {
      if (!workspaceId) return;
      workspaceAccessStore.fetchUserRole(workspaceId);
    },
    { immediate: true }
  );
</script>

<template>
  <app-dropdown :active="active">
    <div class="member-card-menu">
      <app-button 
        v-if="canChangeRole"
        @click="handleRoleChange"
        class="member-card-menu__button--role"
      >
        {{ roleChangeText }}
      </app-button>

      <app-button 
        v-if="canRemove"
        @click="handleRemove"
        class="member-card-menu__button--remove"
      >
        Remove from team
      </app-button>
    </div>
  </app-dropdown>
</template>

<style scoped>
  .member-card-menu {
    width: 140px;
  }
  .member-card-menu__button--role {
    padding: 5px;
    border-radius: var(--radius-sm);
    transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out, color 0.3s ease-in-out;
  }
  .member-card-menu__button--role:hover {
    color: var(--color-white);
    background-color: var(--accent);
    box-shadow: var(--shadow-md);
  }
  .member-card-menu__button--remove {
    padding: 5px;
    border-radius: var(--radius-sm);
    color: var(--error);
    transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out, color 0.3s ease-in-out;
  }
  .member-card-menu__button--remove:hover {
    color: var(--color-white);
    background-color: var(--accent);
    box-shadow: var(--shadow-md);
  }
</style>
