<script setup lang="ts">
  import { ref, computed } from 'vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
  import WorkspaceInvitationStatus from '@/components/content/workspace/team/invitations/WorkspaceInvitationStatus.vue';
  import WorkspaceMemberRoleBadge from '@/components/content/workspace/team/members/WorkspaceMemberRoleBadge.vue';
  import type { WorkspaceInvitation } from '@/interface/workspace.interface';
  import type { WorkspaceMemberRole } from '@/interface/workspace.interface';
  import { WorkspacePermissions } from '@/utils/workspacePermissions';

  interface invitationCardProps {
    invitation: WorkspaceInvitation;
    currentUserRole?: WorkspaceMemberRole;
  }
  const props = defineProps<invitationCardProps>();
  const emit = defineEmits<{
    (e: 'cancel', invitationId: string): void
  }>();

  const copiedToken = ref<string | null>(null);

  const inviteUrl = computed(() => getInviteUrl(props.invitation.token));

  const canManageInvitations = computed(() => 
    WorkspacePermissions.canManageMembers(props.currentUserRole)
  );

  const getInviteUrl = (token: string): string => {
    return `${window.location.origin}/FlowTrack/#/invite/${token}`;
  };

  const copyInviteLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(getInviteUrl(token));
      copiedToken.value = token;
      setTimeout(() => (copiedToken.value = null), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
</script>

<template>
  <div class="invitation-card">
    <app-container size="md">
      <div class="invitation-card__body">
        <div class="invitation-card__content">
          <div class="invitation-card__info">
            <div class="invitation-card__email">{{ invitation.email }}</div>
            <div class="invitation-card__meta">
              <workspace-member-role-badge :role="invitation.role" class="invitation-card__role" />
              <div class="invitation-card__date">
                Sent {{ formatDate(invitation.created_at) }}
              </div>
              <workspace-invitation-status :invitation="invitation" />
            </div>

          </div>

          <div v-if="!invitation.accepted_at && canManageInvitations" class="invitation-card__actions">
            <div class="invitation-card__group">
              <div class="invitation-card__label">Invitation link</div>
              <div class="invitation-card__link">
                <app-input 
                  v-model="inviteUrl"
                  readonly
                />
                <app-button 
                  secondary
                  @click="copyInviteLink(invitation.token)"
                  :class="{ 'invitation-card__copy--copied': copiedToken === invitation.token }"
                  class="invitation-card__btn invitation-card__btn--copy"
                >
                  <app-icon 
                    name="copy"
                    size="var(--fs-md)"
                    color="var(--color-black)"
                  />
                  <span>
                    {{ copiedToken === invitation.token ? 'Copied!' : 'Copy' }}
                  </span>
                </app-button>
              </div>
            </div>
            <app-button 
              v-if="!invitation.accepted_at"
              secondary
              @click="emit('cancel', invitation.id)"
              class="invitation-card__btn" 
            >
              <app-icon 
                name="cross"
                size="var(--fs-xs)"
                color="var(--color-black)"
              />
              Cancel
            </app-button>
          </div>
        </div>
      </div>
    </app-container>
  </div>
</template>

<style scoped>
  .invitation-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition: border 0.3s ease-in-out;
  }
  .invitation-card:hover {
     border: 1px solid var(--success);
  }
  .invitation-card__email {
    font-size: var(--space-md);
    font-weight: var(--fw-medium);
  }
  .invitation-card__meta {
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .invitation-card__group {
    width: 100%;
  }
  .invitation-card__label {
    font-size: var(--fs-sm);
    color: var(--color-black);
  }
  .invitation-card__date {
    font-size: var(--fs-sm);
    color: var(--color-gray);
  }
  .invitation-card__actions {
    margin-top: var(--space-sm);
    display: flex;
    align-items: end;
    gap: 10px;
  }
  .invitation-card__link {
    position: relative;
    width: 100%;
  }
  .invitation-card__btn--copy {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 0;
    background-color: var(--color-white);
  }
  .invitation-card__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    max-width: 80px;
    height: var(--space-xl);
  }
  :deep(.icon path) {
    transition: fill 0.4s ease-in-out;
  } 
  :deep(.input) {
    padding: 6px 12px;
    font-size: var(--space-md);
    color: var(--color-gray);
    outline-color: none;
  }
  :deep(.input:focus) {
    border-color: var(--border);
  }
  .invitation-card__btn:hover :deep(.icon path) {
    fill: var(--color-white);
  }
</style>
