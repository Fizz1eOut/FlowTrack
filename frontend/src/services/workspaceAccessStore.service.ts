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
    const { error } = await supabase
      .from('workspace_invitations')
      .delete()
      .eq('id', invitationId);

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

    const { data: invitation, error } = await supabase
      .from('workspace_invitations')
      .select('*, workspace:workspace_id (id, name)')
      .eq('token', token)
      .single();

    if (error || !invitation) throw new Error('Invitation not found');

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation expired');
    }

    if (invitation.accepted_at) {
      throw new Error('Invitation already accepted');
    }

    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('Wrong email');
    }

    await supabase.from('workspace_members').insert({
      workspace_id: invitation.workspace_id,
      user_id: user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
    });

    await supabase
      .from('workspace_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    return {
      workspaceId: invitation.workspace_id,
      workspaceName: invitation.workspace?.name,
    };
  }
}
