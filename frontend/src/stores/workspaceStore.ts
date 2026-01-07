import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { 
  WorkspaceResponse, 
  CreateWorkspaceInput, 
  UpdateWorkspaceInput,
  WorkspaceInvitation,
  InviteMemberInput,
  WorkspaceMember, 
} from '@/interface/workspace.interface';
import { WorkspaceService } from '@/services/workspace.service';

export const useWorkspaceStore = defineStore('workspaces', () => {
  const workspaces = ref<WorkspaceResponse[]>([]);
  const currentWorkspaceId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const invitations = ref<Record<string, WorkspaceInvitation[]>>({});
  const members = ref<Record<string, WorkspaceMember[]>>({});

  const currentWorkspace = computed((): WorkspaceResponse | null => {
    return workspaces.value.find(w => w.id === currentWorkspaceId.value) || null;
  });

  const personalWorkspace = computed((): WorkspaceResponse | null => {
    return workspaces.value.find(w => w.type === 'personal') || null;
  });

  const teamWorkspaces = computed((): WorkspaceResponse[] => {
    return workspaces.value.filter(w => w.type === 'team');
  });

  const canCreatePersonalWorkspace = computed((): boolean => {
    return !workspaces.value.some(w => w.type === 'personal');
  });
  
  const currentWorkspaceInvitations = computed((): WorkspaceInvitation[] => {
    if (!currentWorkspaceId.value) return [];
    return invitations.value[currentWorkspaceId.value] || [];
  });

  const currentWorkspaceMembers = computed((): WorkspaceMember[] => {
    if (!currentWorkspaceId.value) return [];
    return members.value[currentWorkspaceId.value] || [];
  });

  const pendingInvitations = computed((): WorkspaceInvitation[] => {
    return currentWorkspaceInvitations.value.filter(inv => {
      const notAccepted = !inv.accepted_at;
      const notExpired = new Date(inv.expires_at) > new Date();
      return notAccepted && notExpired;
    });
  });
  
  async function fetchWorkspaces(): Promise<WorkspaceResponse[]> {
    loading.value = true;
    error.value = null;

    try {
      const data = await WorkspaceService.fetchUserWorkspaces();
      workspaces.value = data;
      restoreCurrentWorkspace();
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function restoreCurrentWorkspace(): void {
    const savedId = localStorage.getItem('currentWorkspaceId');

    if (savedId && workspaces.value.some(w => w.id === savedId)) {
      currentWorkspaceId.value = savedId;
      return;
    }

    const personal = workspaces.value.find(w => w.type === 'personal');
    const fallback = personal ?? workspaces.value[0];

    if (fallback) {
      setCurrentWorkspace(fallback.id);
    } else {
      currentWorkspaceId.value = null;
      localStorage.removeItem('currentWorkspaceId');
    }
  }

  async function createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceResponse> {
    loading.value = true;
    error.value = null;
  
    try {
      if (input.type === 'personal' && !canCreatePersonalWorkspace.value) {
        throw new Error('Personal workspace already exists');
      }

      const workspace = await WorkspaceService.createWorkspace(input);
      workspaces.value.push(workspace);
      setCurrentWorkspace(workspace.id);
      
      return workspace;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateWorkspace(
    workspaceId: string, 
    input: UpdateWorkspaceInput
  ): Promise<WorkspaceResponse> {
    loading.value = true;
    error.value = null;

    try {
      const data = await WorkspaceService.updateWorkspace(workspaceId, input);

      const index = workspaces.value.findIndex(w => w.id === workspaceId);
      if (index !== -1) {
        workspaces.value[index] = data;
      }
    
      return data;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteWorkspace(workspaceId: string): Promise<void> {
    loading.value = true;
    error.value = null;
      
    try {
      const workspace = workspaces.value.find(w => w.id === workspaceId);
      if (workspace?.type === 'personal') {
        throw new Error('You can`t delete your personal workspace.');
      }

      await WorkspaceService.deleteWorkspace(workspaceId);
      workspaces.value = workspaces.value.filter(w => w.id !== workspaceId);
        
      if (currentWorkspaceId.value === workspaceId) {
        const personalWs = personalWorkspace.value;

        if (personalWs) {
          setCurrentWorkspace(personalWs.id);
        } else if (workspaces.value.length > 0) {
          const first = workspaces.value[0];
          if (first) setCurrentWorkspace(first.id);
        } else {
          currentWorkspaceId.value = null;
        }
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function setCurrentWorkspace(workspaceId: string): void {
    const workspace = workspaces.value.find(w => w.id === workspaceId);
    if (workspace) {
      currentWorkspaceId.value = workspaceId;
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
  }

  async function getWorkspaceWithStats(workspaceId: string): Promise<WorkspaceResponse> {
    loading.value = true;
    error.value = null;
      
    try {
      const workspace = workspaces.value.find(w => w.id === workspaceId);
      if (!workspace) throw new Error('Workspace not found');

      const stats = await WorkspaceService.getWorkspaceStats(workspaceId);

      return {
        ...workspace,
        ...stats,
      };
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchWorkspacesWithStats(): Promise<WorkspaceResponse[]> {
    await fetchWorkspaces();
      
    const workspacesWithStats = await Promise.all(
      workspaces.value.map(ws => getWorkspaceWithStats(ws.id))
    );
      
    workspaces.value = workspacesWithStats;
    return workspacesWithStats;
  }

  function clearWorkspaces(): void {
    workspaces.value = [];
    currentWorkspaceId.value = null;
    invitations.value = {};
    members.value = {};
    localStorage.removeItem('currentWorkspaceId');
  }

  async function fetchInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await WorkspaceService.fetchInvitations(workspaceId);
      invitations.value[workspaceId] = data;
      return data;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      console.error('[WorkspaceStore] fetchInvitations error:', err);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function inviteMember(input: InviteMemberInput): Promise<WorkspaceInvitation> {
    loading.value = true;
    error.value = null;
  
    try {
      const workspace = workspaces.value.find(w => w.id === input.workspace_id);
      if (!workspace) throw new Error('Workspace not found');

      const isOwner = await WorkspaceService.checkOwnership(input.workspace_id);
      if (!isOwner) {
        throw new Error('Only workspace owner can invite members');
      }

      const hasInvite = await WorkspaceService.hasActiveInvitation(
        input.workspace_id,
        input.email
      );

      if (hasInvite) {
        throw new Error('User is already invited');
      }


      const data = await WorkspaceService.inviteMember(input);

      const workspaceId = input.workspace_id;
      if (!invitations.value[workspaceId]) {
        invitations.value[workspaceId] = [];
      }
      invitations.value[workspaceId].unshift(data);

      console.log('[WorkspaceStore] Invitation created:', {
        id: data.id,
        email: data.email,
        token: data.token,
        workspace: workspace.name
      });

      return data;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      console.error('[WorkspaceStore] inviteMember error:', err);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function cancelInvitation(invitationId: string): Promise<void> {
    loading.value = true;
    error.value = null;
    
    try {
      await WorkspaceService.cancelInvitation(invitationId);

      for (const workspaceId in invitations.value) {
        if (invitations.value[workspaceId]) {
          invitations.value[workspaceId] = invitations.value[workspaceId]
            .filter(inv => inv.id !== invitationId);
        }
      }

      console.log('[WorkspaceStore] Invitation cancelled:', invitationId);
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      console.error('[WorkspaceStore] cancelInvitation error:', err);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await WorkspaceService.fetchMembers(workspaceId);
      members.value[workspaceId] = data;
      return data;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      console.error('[WorkspaceStore] fetchMembers error:', err);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    workspaces: readonly(workspaces),
    currentWorkspaceId: readonly(currentWorkspaceId),
    loading: readonly(loading),
    error: readonly(error),
    invitations: readonly(invitations),
    members: readonly(members),
    
    currentWorkspace,
    personalWorkspace,
    teamWorkspaces,
    canCreatePersonalWorkspace,
    currentWorkspaceInvitations,
    currentWorkspaceMembers,
    pendingInvitations,
    
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    getWorkspaceWithStats,
    fetchWorkspacesWithStats,
    restoreCurrentWorkspace,
    clearWorkspaces,
    fetchInvitations,
    inviteMember,
    cancelInvitation,
    fetchMembers,
  };
});
