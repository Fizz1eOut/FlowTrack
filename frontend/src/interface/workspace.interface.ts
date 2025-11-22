export type WorkspaceType = 'personal' | 'team';

export interface WorkspaceResponse {
  id: string;
  name: string;
  type: WorkspaceType;
  owner_id: string;
  created_at: string;
  tasks_count?: number;
  completed_tasks?: number;
}

export interface CreateWorkspaceInput {
  name: string;
  type?: WorkspaceType;
}

export interface UpdateWorkspaceInput {
  name?: string;
  type?: WorkspaceType;
}
