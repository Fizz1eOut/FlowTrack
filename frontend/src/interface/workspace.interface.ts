export type WorkspaceType = 'personal' | 'team';
export type WorkspaceMemberRole = 'owner' | 'admin' | 'member';

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

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceMemberRole;
  invited_by?: string;
  joined_at: string;
  profile?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceMemberRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
}

export interface InviteMemberInput {
  workspace_id: string;
  email: string;
  role?: WorkspaceMemberRole;
}

export interface WorkspaceWithMembers extends WorkspaceResponse {
  members?: WorkspaceMember[];
  member_count?: number;
  user_role?: WorkspaceMemberRole;
  pending_invitations?: WorkspaceInvitation[];
}
