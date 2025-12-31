export type WorkspaceType = 'personal' | 'team';

export interface WorkspaceResponse {
  id: string;
  name: string;
  type: WorkspaceType;
  owner_id: string;
  created_at: string;
  description?: string | null;
  color?: string | null;
  tasks_count?: number;
  completed_tasks?: number;
}

export interface CreateWorkspaceInput {
  name: string;
  type?: WorkspaceType;
  description?: string;
  color?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  type?: WorkspaceType;
  description?: string;
  color?: string;
}
