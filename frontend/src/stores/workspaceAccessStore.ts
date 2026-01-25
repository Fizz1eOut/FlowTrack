import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';
import type {
  WorkspaceInvitation,
  InviteMemberInput,
  WorkspaceMember,
  WorkspaceMemberRole,
} from '@/interface/workspace.interface';
import { WorkspaceMembersService } from '@/services/workspaceAccessStore.service';

export const useWorkspaceAccessStore = defineStore('workspaceAccess', () => {
  const invitations = ref<Record<string, WorkspaceInvitation[]>>({});
  const members = ref<Record<string, WorkspaceMember[]>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  const userRoles = ref<Record<string, WorkspaceMemberRole | undefined>>({});


  const getInvitations = (workspaceId: string) =>
    invitations.value[workspaceId] || [];

  const getMembers = (workspaceId: string) =>
    members.value[workspaceId] || [];

  function getUserRole(workspaceId: string): WorkspaceMemberRole | undefined {
    return userRoles.value[workspaceId];
  }

  async function fetchUserRole(workspaceId: string): Promise<WorkspaceMemberRole | undefined> {
    const role = await WorkspaceMembersService.getUserRole(workspaceId);
    userRoles.value[workspaceId] = role;
    return role;
  }

  const getPendingInvitations = (workspaceId: string) => {
    return (invitations.value[workspaceId] || []).filter(inv => {
      const notAccepted = !inv.accepted_at;
      const notExpired = new Date(inv.expires_at) > new Date();
      return notAccepted && notExpired;
    });
  };

  async function fetchInvitations(workspaceId: string) {
    loading.value = true;
    try {
      invitations.value[workspaceId] =
        await WorkspaceMembersService.fetchInvitations(workspaceId);
    } finally {
      loading.value = false;
    }
  }

  async function inviteMember(input: InviteMemberInput) {
    loading.value = true;
    error.value = null;

    try {
      const invite = await WorkspaceMembersService.inviteMember(input);
  
      (invitations.value[input.workspace_id] ??= []).unshift(invite);
  
      return invite;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function cancelInvitation(invitationId: string, workspaceId: string) {
    loading.value = true;
    error.value = null;
  
    try {
      await WorkspaceMembersService.cancelInvitation(invitationId, workspaceId);

      invitations.value[workspaceId] = (invitations.value[workspaceId] || []).filter(
        inv => inv.id !== invitationId
      );
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeMember(workspaceId: string, userId: string) {
    loading.value = true;
    error.value = null;
  
    try {
      await WorkspaceMembersService.removeMember(workspaceId, userId);

      if (members.value[workspaceId]) {
        members.value[workspaceId] = members.value[workspaceId].filter(
          m => m.user_id !== userId
        );
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMembers(workspaceId: string) {
    members.value[workspaceId] =
      await WorkspaceMembersService.fetchMembers(workspaceId);
  }

  async function acceptInvitation(token: string) {
    return WorkspaceMembersService.acceptInvitation(token);
  }

  return {
    invitations: readonly(invitations),
    members: readonly(members),
    loading: readonly(loading),
    error: readonly(error),

    getInvitations,
    getMembers,
    getPendingInvitations,
    getUserRole,

    fetchUserRole,
    fetchInvitations,
    inviteMember,
    cancelInvitation,
    removeMember,
    fetchMembers,
    acceptInvitation,
  };
});
