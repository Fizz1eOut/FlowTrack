import { supabase } from '@/utils/supabase';
import type {
  WorkspaceInvitation,
  InviteMemberInput,
  WorkspaceMember,
  WorkspaceMemberRole,
} from '@/interface/workspace.interface';
import { WorkspacePermissions } from '@/utils/workspacePermissions';

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

  static async getUserRole(workspaceId: string): Promise<WorkspaceMemberRole | undefined> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return undefined;

    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) return undefined;

    return data.role as WorkspaceMemberRole;
  }

  static async inviteMember(input: InviteMemberInput): Promise<WorkspaceInvitation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authorized');

    const userRole = await this.getUserRole(input.workspace_id);
    if (!WorkspacePermissions.canManageMembers(userRole)) {
      throw new Error('Only workspace owner and admins can invite members');
    }

    const normalizedEmail = input.email.toLowerCase().trim();

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', input.workspace_id)
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingMember) {
        throw new Error('This user is already a member of this workspace');
      }
    }

    const { data: existingInvitation } = await supabase
      .from('workspace_invitations')
      .select('id, accepted_at, expires_at')
      .eq('workspace_id', input.workspace_id)
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingInvitation) {
      if (existingInvitation.accepted_at) {
        throw new Error('This invitation has already been accepted');
      }

      if (new Date(existingInvitation.expires_at) > new Date()) {
        throw new Error('An active invitation for this email already exists');
      }

      await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', existingInvitation.id);
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 86400000);

    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  }

  static async cancelInvitation(
    invitationId: string,
    workspaceId: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authorized');

    const userRole = await this.getUserRole(workspaceId);
    if (!WorkspacePermissions.canManageMembers(userRole)) {
      throw new Error('Only workspace owner and admins can cancel invitations');
    }

    const { data: invitation } = await supabase
      .from('workspace_invitations')
      .select('accepted_at, workspace_id')
      .eq('id', invitationId)
      .maybeSingle();

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.workspace_id !== workspaceId) {
      throw new Error('Invitation does not belong to this workspace');
    }

    if (invitation.accepted_at) {
      throw new Error('Cannot cancel accepted invitation. Remove the member instead.');
    }

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

  static async removeMember(
    workspaceId: string,
    userId: string
  ): Promise<void> {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('Not authenticated');

    const currentUserRole = await this.getUserRole(workspaceId);
    if (!WorkspacePermissions.canManageMembers(currentUserRole)) {
      throw new Error('Only workspace owner and admins can remove members');
    }

    const { data: targetMember } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!targetMember) {
      throw new Error('Member not found');
    }

    if (!WorkspacePermissions.canRemoveMember(currentUserRole, targetMember.role)) {
      throw new Error('Cannot remove workspace owner');
    }

    if (userId === currentUser.id) {
      throw new Error('You cannot remove yourself. Use "Leave workspace" instead.');
    }

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) throw error;
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

  static async changeMemberRole(
    workspaceId: string,
    userId: string,
    newRole: WorkspaceMemberRole
  ): Promise<void> {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('Not authenticated');

    const currentUserRole = await this.getUserRole(workspaceId);
  
    if (!WorkspacePermissions.canChangeRoles(currentUserRole)) {
      throw new Error('Only workspace owner can change member roles');
    }

    const { data: targetMember } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!targetMember) {
      throw new Error('Member not found');
    }

    if (targetMember.role === 'owner') {
      throw new Error('Cannot change the role of workspace owner');
    }

    if (userId === currentUser.id) {
      throw new Error('You cannot change your own role');
    }

    const { error } = await supabase
      .from('workspace_members')
      .update({ role: newRole })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
