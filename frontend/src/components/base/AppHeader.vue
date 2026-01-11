<script setup lang="ts">
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppSearch from '@/components/base/AppSearch.vue';
  import TimerBadge from '@/components/content/timer/TimerBadge.vue';
  import AppNotificationBell from '@/components/base/AppNotificationBell.vue';
  import AppProfile from '@/components/base/AppProfile.vue';
  import TaskCreateModal from '@/components/content/tasks/TaskCreateModal.vue';

  const emit = defineEmits<{ toggleSidebar: [] }>();
</script>

<template>
  <div class="header">
    <div class="header__body">
      <div class="header__left">
        <div class="header__item">
          <app-button class="header__sidebar-btn" @click="emit('toggleSidebar')">
            <app-icon 
              name="sidebar"
              size="var(--fs-xl)"
              color="var(--color-black)"
            />
          </app-button>
        </div>
        <div class="header__search">
          <app-search />
        </div>
      </div>

      <div class="header__right">
        <div class="header__controls">
          <div class="header__item">
            <timer-badge />
          </div>
          <div class="header__item">
            <app-notification-bell />
          </div>
        </div>

        <div class="header__actions">
          <task-create-modal />

          <app-profile />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .header {
    padding: 0 20px 10px 20px;
    border-bottom: 1px solid var(--border);
  }
  .header__body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .header__search {
    max-width: 448px;
    width: 100%;
  }
  .header__left {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  .header__right {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 10px;
  }
  .header__controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .header__actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .header__item {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
  }
  .header__item:hover {
    background-color: var(--accent);
  }
  @media (max-width: 600px) {
    .header__search {
      display: none;
    }
  }
  @media (max-width: 480px) {
    .header__item {
      min-width: 30px;
      min-height: 30px;
    }
    .header {
      padding: 0 0px 10px 0px;
    }
  }
</style>
