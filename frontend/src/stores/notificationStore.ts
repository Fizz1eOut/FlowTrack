import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { Notification, NotificationType } from '@/interface/notification.interface';
import { NotificationService } from '@/services/notification.service';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

  function filterByType(type: NotificationType) {
    return notifications.value.filter(n => n.type === type && !n.read);
  }

  const workspaceInvitations = computed(() => filterByType('workspace_invitation'));

  async function fetchNotifications() {
    loading.value = true;
    error.value = null;
    try {
      notifications.value = await NotificationService.fetchNotifications();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(notificationId: string) {
    await NotificationService.markAsRead(notificationId);
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification) notification.read = true;
  }
  async function deleteNotification(notificationId: string) {
    await NotificationService.deleteNotification(notificationId);
    notifications.value = notifications.value.filter(n => n.id !== notificationId);
  }

  return {
    notifications: readonly(notifications),
    loading: readonly(loading),
    error: readonly(error),
    unreadCount,
    workspaceInvitations,
    fetchNotifications,
    markAsRead,
    deleteNotification,
  };
});
