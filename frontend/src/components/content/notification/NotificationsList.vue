<script setup lang="ts">
  import { useNotificationStore } from '@/stores/notificationStore';
  import type { WorkspaceInvitationData } from '@/interface/notification.interface';
  import NotificationCard from '@/components/content/notification/NotificationCard.vue';

  const notificationStore = useNotificationStore();

  async function handleInvitation(notificationId: string, token: string) {
    await notificationStore.markAsRead(notificationId);
    window.location.href = `/invite/${token}`;
  }
</script>

<template>
  <div class="notification-list">
    <notification-card
      v-for="notification in notificationStore.notifications"
      :key="notification.id"
      :notification="notification"
      @invitation="handleInvitation(notification.id, (notification.data as WorkspaceInvitationData).token)"
      @mark-as-read="notificationStore.markAsRead(notification.id)"
      @delete="notificationStore.deleteNotification(notification.id)"
    />
  </div>
</template>

<style scoped>
  .notification-list__item:not(:last-child) {
    border: 1px solid var(--color-gray);
    padding-bottom: var(--space-xs);
  }
</style>
