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
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          workspaces:workspace_id (
            id,
            name,
            type,
            owner_id,
            description,
            color,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: true });

      if (dbError) throw dbError;
      
      const workspacesData = data
        ?.map(item => item.workspaces)
        .filter(Boolean)
        .flat() as WorkspaceResponse[];

      workspaces.value = workspacesData ?? [];
      
      if (!currentWorkspaceId.value && workspacesData && workspacesData.length > 0) {
        const personal = workspacesData.find(w => w.type === 'personal');
        const targetWorkspace = personal ?? workspacesData[0];
  
        if (targetWorkspace) {
          currentWorkspaceId.value = targetWorkspace.id;
          localStorage.setItem('currentWorkspaceId', targetWorkspace.id);
        }
      }
      
      return workspacesData ?? [];
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      error.value = err;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  const canCreatePersonalWorkspace = computed((): boolean => {
    return !workspaces.value.some(w => w.type === 'personal');
  });

  async function createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceResponse> {
    loading.value = true;
    error.value = null;
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('The user is not authorized');

      if (input.type === 'personal' && !canCreatePersonalWorkspace.value) {
        throw new Error('Personal workspace already exists');
      }

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: input.name,
          type: input.type || 'team',
          description: input.description || null,
          color: input.color || '#3b82f6',
          owner_id: user.id,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

    
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

type WorkspaceUpdateData = Partial<Pick<WorkspaceResponse, 'name' | 'type' | 'description' | 'color'>>;

async function updateWorkspace(
  workspaceId: string, 
  input: UpdateWorkspaceInput
): Promise<WorkspaceResponse> {
  loading.value = true;
  error.value = null;

  try {
    const updateData: WorkspaceUpdateData = {};
  
    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.color !== undefined) updateData.color = input.color;

    const { data, error: dbError } = await supabase
      .from('workspaces')
      .update(updateData)
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
  canCreatePersonalWorkspace,
    
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
