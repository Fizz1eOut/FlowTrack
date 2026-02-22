<script setup lang="ts">
  import { computed } from 'vue';
  import { formatRelativeTime } from '@/utils/formatRelativeTime';
  import type { Notification } from '@/interface/notification.interface';
  import type { WorkspaceInvitationData } from '@/interface/notification.interface';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  interface NotificationCardProps {
    notification: Notification;
  }
  const props = defineProps<NotificationCardProps>();

  defineEmits<{
    (e: 'invitation'): void;
    (e: 'delete'): void;
    (e: 'markAsRead'): void;
  }>();

  const timeAgo = computed(() => formatRelativeTime(props.notification.created_at));

  function asInvitationData(notification: Notification) {
    return notification.data as WorkspaceInvitationData;
  }
</script>

<template>
  <div class="notification" @click="$emit('markAsRead')">
    <div class="notification__content">
      <div class="notification__row">
        <div class="notification__title">{{ notification.title }}</div>
        <app-icon 
          name="marker"
          size="8px"
          :color="notification.read ? 'var(--color-gray)' : 'var(--primary)'"
        />
      </div>
      <p v-if="notification.message" class="notification__message">{{ notification.message }}</p>

      <template v-if="notification.type === 'workspace_invitation'">
        <p class="notification__meta">
          Workspace: <span>{{ asInvitationData(notification).workspace_name }}</span>
        </p>
        <app-button 
          @click.stop="$emit('invitation')" 
          primary
          class="btn-view"
        >
          View Invitation
        </app-button>
      </template>
    </div>

    <div class="notification__bottom">
      <div class="notification__time-ago">{{ timeAgo }}</div>
      <div class="notification__btn">
        <app-button 
          @click="$emit('delete')"
          class="btn-delete"
        >
          <app-icon
            name="delete"
            size="var(--fs-md)"
            color="var(--color-black)"
          />
        </app-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .notification__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .notification__title {
    font-size: var(--fs-lg);
    color: var(--color-black);
    font-weight: var(--fw-medium);
  }
  .notification__message {
    font-size: var(--fs-sm);
    color: var(--color-gray);
    font-weight: var(--fw-normal);
  }
  .notification__meta {
    margin-top: var(--fs-sm);
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
    color: var(--color-gray)
  }
  .notification__meta span {
    font-weight: var(--fw-medium);
    color: var(--color-black);
  }
  .notification__actions {
    margin-top: var(--space-xs);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .notification__bottom {
    margin-top: var(--space-xs);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .notification__time-ago {
    font-size: var(--fs-sm);
    color: var(--color-gray);
  }
  .btn-view {
    height: var(--space-xl);
    background: var(--gradient-accent)
  }
  .btn-delete {
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .btn-delete:hover {
    border-radius: var(--radius-sm);
    background-color: var(--accent);
  }
</style>
