import { defineStore } from 'pinia';
import { ref, readonly } from 'vue';
import type {
  WorkspaceInvitation,
  InviteMemberInput,
  WorkspaceMember,
} from '@/interface/workspace.interface';
import { WorkspaceMembersService } from '@/services/workspaceAccessStore.service';

export const useWorkspaceAccessStore = defineStore('workspaceAccess', () => {
  const invitations = ref<Record<string, WorkspaceInvitation[]>>({});
  const members = ref<Record<string, WorkspaceMember[]>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getInvitations = (workspaceId: string) =>
    invitations.value[workspaceId] || [];

  const getMembers = (workspaceId: string) =>
    members.value[workspaceId] || [];

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
    try {
      const invite = await WorkspaceMembersService.inviteMember(input);
      invitations.value[input.workspace_id]?.unshift(invite);
      return invite;
    } finally {
      loading.value = false;
    }
  }

  async function cancelInvitation(invitationId: string, workspaceId: string) {
    console.log('cancelInvitation', invitationId);

    await WorkspaceMembersService.cancelInvitation(invitationId);

    console.log('before', invitations.value[workspaceId]);

    invitations.value[workspaceId] =
    (invitations.value[workspaceId] || []).filter(
      inv => inv.id !== invitationId
    );

    console.log('after', invitations.value[workspaceId]);
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

    fetchInvitations,
    inviteMember,
    cancelInvitation,
    fetchMembers,
    acceptInvitation,
  };
});
