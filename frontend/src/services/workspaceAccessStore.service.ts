import { supabase } from '@/utils/supabase';
import type {
  WorkspaceInvitation,
  InviteMemberInput,
  WorkspaceMember,
} from '@/interface/workspace.interface';

export class WorkspaceMembersService {
  static async fetchInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  static async inviteMember(input: InviteMemberInput): Promise<WorkspaceInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authorized');

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 86400000);

    const { data, error } = await supabase
      .from('workspace_invitations')
      .insert({
        workspace_id: input.workspace_id,
        email: input.email.toLowerCase().trim(),
        role: input.role || 'member',
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async cancelInvitation(invitationId: string): Promise<void> {
    const { data, error } = await supabase
      .from('workspace_invitations')
      .delete()
      .eq('id', invitationId)
      .select();

    console.log('deleted rows:', data);

    if (error) throw error;
  }

  static async fetchMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await supabase
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

    if (error) throw error;
    return data ?? [];
  }

  static async acceptInvitation(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('[Service] Accepting invitation, token:', token);

    const { data: invitation, error: invError } = await supabase
      .from('workspace_invitations')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (invError) {
      console.error('[Service] Error fetching invitation:', invError);
      throw new Error(`Database error: ${invError.message}`);
    }

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    console.log('[Service] Invitation found:', invitation);

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('This invitation has expired');
    }

    if (invitation.accepted_at) {
      throw new Error('This invitation has already been accepted');
    }

    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('This invitation is for a different email address');
    }

    console.log('[Service] Adding to workspace_members...');
  
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: invitation.workspace_id,
        user_id: user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
      });

    if (memberError) {
      console.error('[Service] Error adding member:', memberError);
    
      if (memberError.code === '23505') {
        throw new Error('You are already a member of this workspace');
      }
      throw new Error(`Failed to add member: ${memberError.message}`);
    }

    console.log('[Service] Member added successfully');

    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('id, name')
      .eq('id', invitation.workspace_id)
      .single();

    if (wsError) {
      console.warn('[Service] Could not fetch workspace name:', wsError);
    }

    await supabase
      .from('workspace_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    console.log('[Service] Invitation accepted successfully');

    return {
      workspaceId: invitation.workspace_id,
      workspaceName: workspace?.name || 'Workspace',
    };
  }
}
