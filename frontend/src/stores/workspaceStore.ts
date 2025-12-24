import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  WorkspaceResponse, 
  CreateWorkspaceInput, 
  UpdateWorkspaceInput 
} from '@/interface/workspace.interface';
import { supabase } from '@/utils/supabase';

export const useWorkspaceStore = defineStore('workspaces', () => {
  const workspaces = ref<WorkspaceResponse[]>([]);
  const currentWorkspaceId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const currentWorkspace = computed((): WorkspaceResponse | null => {
    return workspaces.value.find(w => w.id === currentWorkspaceId.value) || null;
  });

  const personalWorkspace = computed((): WorkspaceResponse | null => {
    return workspaces.value.find(w => w.type === 'personal') || null;
  });

  const teamWorkspaces = computed((): WorkspaceResponse[] => {
    return workspaces.value.filter(w => w.type === 'team');
  });
  
  async function fetchWorkspaces(): Promise<WorkspaceResponse[]> {
    loading.value = true;
    error.value = null;
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.warn('[WorkspaceStore] User not ready yet, skip fetchWorkspaces');
        return [];
      }


      const { data, error: dbError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true });

      if (dbError) throw dbError;
      
      workspaces.value = data ?? [];
      
      if (!currentWorkspaceId.value && data && data.length > 0) {
        const personal = data.find(w => w.type === 'personal');
        currentWorkspaceId.value = personal?.id ?? data[0].id;

        if (currentWorkspaceId.value) {
          localStorage.setItem('currentWorkspaceId', currentWorkspaceId.value);
        }
      }
      
      return data ?? [];
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceResponse> {
    loading.value = true;
    error.value = null;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('The user is not authorized');

      const { data, error: dbError } = await supabase
        .from('workspaces')
        .insert({
          ...input,
          owner_id: user.id,
          type: input.type || 'team'
        })
        .select()
        .single();

      if (dbError) throw dbError;
      
      workspaces.value.push(data);
      return data;
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
      const { data, error: dbError } = await supabase
        .from('workspaces')
        .update(input)
        .eq('id', workspaceId)
        .select()
        .single();

      if (dbError) throw dbError;

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

      const { error: dbError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (dbError) throw dbError;

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

      const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);

      const { count: completedTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('status', 'done');

      return {
        ...workspace,
        tasks_count: totalTasks ?? 0,
        completed_tasks: completedTasks ?? 0
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

  function initializeCurrentWorkspace(): void {
    const saved = localStorage.getItem('currentWorkspaceId');
    if (saved) {
      currentWorkspaceId.value = saved;
    }
  }

  function clearWorkspaces(): void {
    workspaces.value = [];
    currentWorkspaceId.value = null;
    localStorage.removeItem('currentWorkspaceId');
  }

  return {
    workspaces,
    currentWorkspaceId,
    loading,
    error,
    
    currentWorkspace,
    personalWorkspace,
    teamWorkspaces,
    
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    getWorkspaceWithStats,
    fetchWorkspacesWithStats,
    initializeCurrentWorkspace,
    clearWorkspaces
  };
});
