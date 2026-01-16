import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type {
  WorkspaceResponse,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
} from '@/interface/workspace.interface';
import { WorkspaceService } from '@/services/workspace.service';

export const useWorkspaceStore = defineStore('workspaces', () => {
  const workspaces = ref<WorkspaceResponse[]>([]);
  const currentWorkspaceId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const currentWorkspace = computed<WorkspaceResponse | null>(() =>
    workspaces.value.find(w => w.id === currentWorkspaceId.value) || null
  );

  const personalWorkspace = computed<WorkspaceResponse | null>(() =>
    workspaces.value.find(w => w.type === 'personal') || null
  );

  const teamWorkspaces = computed<WorkspaceResponse[]>(() =>
    workspaces.value.filter(w => w.type === 'team')
  );

  const canCreatePersonalWorkspace = computed<boolean>(() =>
    !workspaces.value.some(w => w.type === 'personal')
  );

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

    const fallback =
      workspaces.value.find(w => w.type === 'personal') ??
      workspaces.value[0];

    if (fallback) {
      setCurrentWorkspace(fallback.id);
    } else {
      currentWorkspaceId.value = null;
      localStorage.removeItem('currentWorkspaceId');
    }
  }

  function setCurrentWorkspace(workspaceId: string): void {
    if (workspaces.value.some(w => w.id === workspaceId)) {
      currentWorkspaceId.value = workspaceId;
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
  }

  async function createWorkspace(
    input: CreateWorkspaceInput
  ): Promise<WorkspaceResponse> {
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
      const updated = await WorkspaceService.updateWorkspace(workspaceId, input);
      const index = workspaces.value.findIndex(w => w.id === workspaceId);
      if (index !== -1) {
        workspaces.value[index] = updated;
      }
      return updated;
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
        throw new Error('You can’t delete personal workspace');
      }

      await WorkspaceService.deleteWorkspace(workspaceId);
      workspaces.value = workspaces.value.filter(w => w.id !== workspaceId);

      if (currentWorkspaceId.value === workspaceId) {
        restoreCurrentWorkspace();
      }
    } finally {
      loading.value = false;
    }
  }

  async function getWorkspaceWithStats(
    workspaceId: string
  ): Promise<WorkspaceResponse> {
    const workspace = workspaces.value.find(w => w.id === workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const stats = await WorkspaceService.getWorkspaceStats(workspaceId);

    return {
      ...workspace,
      ...stats,
    };
  }

  async function fetchWorkspacesWithStats(): Promise<WorkspaceResponse[]> {
    await fetchWorkspaces();

    const result = await Promise.all(
      workspaces.value.map(ws => getWorkspaceWithStats(ws.id))
    );

    workspaces.value = result;
    return result;
  }

  return {
    workspaces: readonly(workspaces),
    currentWorkspaceId: readonly(currentWorkspaceId),
    loading: readonly(loading),
    error: readonly(error),

    currentWorkspace,
    personalWorkspace,
    teamWorkspaces,
    canCreatePersonalWorkspace,

    fetchWorkspaces,
    fetchWorkspacesWithStats,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    restoreCurrentWorkspace,
    getWorkspaceWithStats,
  };
});
