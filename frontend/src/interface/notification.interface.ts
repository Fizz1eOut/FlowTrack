export type NotificationType = 
  | 'workspace_invitation' 
  | 'task_deadline'
  | 'invitation_accepted'
  | 'task_assigned'
  | 'member_joined';

export interface BaseNotificationData {
  [key: string]: unknown;
}

export interface WorkspaceInvitationData extends BaseNotificationData {
  workspace_id: string;
  invitation_id: string;
  workspace_name: string;
  invited_by: string;
  token: string;
}

export interface TaskDeadlineData extends BaseNotificationData {
  task_id: string;
  task_title: string;
  deadline: string;
}

export interface InvitationAcceptedData extends BaseNotificationData {
  workspace_id: string;
  workspace_name: string;
  accepted_by: string;
  accepted_by_email: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  data: BaseNotificationData | null;
  read: boolean;
  created_at: string;
}
