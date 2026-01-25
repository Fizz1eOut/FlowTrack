import type { WorkspaceMemberRole } from '@/interface/workspace.interface';

export class WorkspacePermissions {
  static canManageMembers(userRole?: WorkspaceMemberRole): boolean {
    return userRole === 'owner' || userRole === 'admin';
  }

  static canEditWorkspace(userRole?: WorkspaceMemberRole): boolean {
    return userRole === 'owner' || userRole === 'admin';
  }

  static canChangeRoles(userRole?: WorkspaceMemberRole): boolean {
    return userRole === 'owner';
  }
  static canDeleteWorkspace(userRole?: WorkspaceMemberRole): boolean {
    return userRole === 'owner';
  }

  static canRemoveMember(
    currentUserRole?: WorkspaceMemberRole,
    targetMemberRole?: WorkspaceMemberRole
  ): boolean {
    if (targetMemberRole === 'owner') {
      return false;
    }

    return currentUserRole === 'owner' || currentUserRole === 'admin';
  }
}
