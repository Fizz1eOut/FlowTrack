<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppDropdown from '@/components/base/AppDropdown.vue';
  import NotificationsList from '@/components/content/notification/NotificationsList.vue';
  import { useNotificationStore } from '@/stores/notificationStore';

  const active = ref(false);
  const notificationRef  = ref<HTMLElement | null>(null);
  const notificationStore = useNotificationStore();

  const hasNotifications = computed(() => notificationStore.unreadCount > 0);

  function handleClickOutside(event: MouseEvent) {
    if (notificationRef.value && !notificationRef.value.contains(event.target as HTMLElement)) {
      active.value = false;
    }
  }

  function toggleDropdown() {
    if (notificationStore.notifications.length > 0) {
      active.value = !active.value;
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    notificationStore.fetchNotifications();
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div @click="toggleDropdown()" ref="notificationRef" class="notification">
    <div v-if="hasNotifications" class="notification__count">
      {{ notificationStore.unreadCount }}
    </div>

    <app-button>
      <app-icon
        name="bell"
        size="var(--fs-xl)"
        color="var(--color-dark)"
      />
    </app-button>

    <app-dropdown :active="active">
      <notifications-list />
    </app-dropdown>
  </div>
</template>

<style scoped>
  .notification {
    position: relative;
  }
  .notification__count {
    position: absolute;
    top: -6px;
    z-index: 1;
    right: -10px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    background: #ef4343;
    color: var(--color-white);
    font-size: var(--fs-xs);
    font-weight: var(--fw-semibold);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  .notification__content {
    position: relative;
  }
  :deep(.dropdown) {
    width: 300px;
    right: 0;
    left: unset;
  }
  @media (max-width: 400px) {
    :deep(.dropdown) {
      right: -80px;
    }
  }
</style>
