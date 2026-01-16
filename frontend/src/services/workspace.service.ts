import { supabase } from '@/utils/supabase';
import type {
  WorkspaceResponse,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceInvitation,
  InviteMemberInput,
  WorkspaceMember,
} from '@/interface/workspace.interface';

export class WorkspaceService {
  static async fetchUserWorkspaces(): Promise<WorkspaceResponse[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
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

    const workspaces = data
      ?.map(item => item.workspaces)
      .filter(Boolean)
      .flat() as WorkspaceResponse[];

    return workspaces ?? [];
  }

  static async createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authorized');

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

    return workspace;
  }

  static async updateWorkspace(
    workspaceId: string,
    input: UpdateWorkspaceInput
  ): Promise<WorkspaceResponse> {
    const updateData: Partial<WorkspaceResponse> = {};

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

    return data;
  }

  static async deleteWorkspace(workspaceId: string): Promise<void> {
    const { error: dbError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (dbError) throw dbError;
  }

  static async getWorkspaceStats(workspaceId: string): Promise<{
    tasks_count: number;
    completed_tasks: number;
  }> {
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
      tasks_count: totalTasks ?? 0,
      completed_tasks: completedTasks ?? 0,
    };
  }

  static async fetchInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const { data, error: dbError } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    return data ?? [];
  }

  static async inviteMember(input: InviteMemberInput): Promise<WorkspaceInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authorized');

    const normalizedEmail = input.email.toLowerCase().trim();

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error: insertError } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: input.workspace_id,
        email: normalizedEmail,
        role: input.role || 'member',
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return data;
  }

  static async cancelInvitation(invitationId: string): Promise<void> {
    const { error: deleteError } = await supabase
      .from('workspace_invitations')
      .delete()
      .eq('id', invitationId);

    if (deleteError) throw deleteError;
  }

  static async fetchMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error: dbError } = await supabase
      .from('workspace_members')
      .select(`
        *,
        profile:user_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('joined_at', { ascending: false });

    if (dbError) throw dbError;

    return data ?? [];
  }

  static async checkOwnership(workspaceId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();

    if (error) return false;

    return data.owner_id === user.id;
  }

  static async hasActiveInvitation(
    workspaceId: string,
    email: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc(
      'has_active_invitation',
      {
        ws_id: workspaceId,
        email
      }
    );

    if (error) throw error;
    return data === true;
  }

  static async acceptInvitation(token: string): Promise<{
    workspaceId: string;
    workspaceName: string;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: invitation, error: fetchError } = await supabase
      .from('workspace_invitations')
      .select(`
      *,
      workspace:workspace_id (
        id,
        name
      )
    `)
      .eq('token', token)
      .single();

    if (fetchError || !invitation) {
      throw new Error('Invitation not found');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('This invitation has expired');
    }

    if (invitation.accepted_at) {
      throw new Error('This invitation has already been accepted');
    }

    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('This invitation is for a different email address');
    }

    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: invitation.workspace_id,
        user_id: user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
      });

    if (memberError) {
      if (memberError.code === '23505') {
        throw new Error('You are already a member of this workspace');
      }
      throw memberError;
    }

    const { error: updateError } = await supabase
      .from('workspace_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (updateError) {
      console.warn('Failed to update invitation status:', updateError);
    }

    return {
      workspaceId: invitation.workspace_id,
      workspaceName: invitation.workspace?.name || 'Unknown Workspace',
    };
  }
}
