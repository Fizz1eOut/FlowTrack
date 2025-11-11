<script setup lang="ts">
  import AppNav from '@/components/base/AppNav.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppContainer from '@/components/base/AppContainer.vue';

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
          <app-subtitle v-if="isOpen" class="title">
            FlowTrack
          </app-subtitle>
          <app-nav @menu-click="emit('close')" :is-open="isOpen" />
        </div>

        <app-button v-if="isOpen" secondary>
          Create Workspace
        </app-button>
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
</style>
