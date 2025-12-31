<script setup lang="ts">
  import AppNav from '@/components/base/AppNav.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import WorkspaceCreateModal from '@/components/content/workspace/WorkspaceCreateModal.vue';

  interface AppSidebarProps {
    isOpen?: boolean;
  }
  defineProps<AppSidebarProps>();
  const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div class="sidebar">
    <app-container class="sidebar__container">
      <div class="sidebar__body">
        <div class="sidebar__group">
          <div v-if="isOpen" class="sidebar__row">
            <app-subtitle>
              FlowTrack
            </app-subtitle>
            <app-button class="sidebar__btn" @click="emit('close')">
              <app-icon 
                name="sidebar"
                size="var(--fs-xl)"
                color="var(--color-dark)"
              />
            </app-button>
          </div>
          <app-nav @menu-click="emit('close')" :is-open="isOpen" />
        </div>

        <workspace-create-modal v-if="isOpen" />
      </div>
    </app-container>
  </div>
</template>

<style scoped>  
  .sidebar {
    border-right: 1px solid var(--border);
    height: 100vh;
  }
  .sidebar__container {
    height: 100%;
  }
  .sidebar__body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
  .sidebar__btn {
    display: none;
  }

  @media (max-width: 768px) {
    .sidebar__row {
      padding-top: 10px;
    }
    .sidebar__container {
      padding: 0;
    }
  }
  @media (max-width: 480px) {
    .sidebar__row {
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .sidebar__btn {
      margin-right: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 30px;
      height: 30px;
      background-color: var(--accent);
      border-radius: var(--radius-sm);
    }
  }
</style>
