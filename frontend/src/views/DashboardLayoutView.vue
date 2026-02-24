<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { RouterView } from 'vue-router';
  import AppSidebar from '@/components/base/AppSidebar.vue';
  import AppHeader from '@/components/base/AppHeader.vue';
  import AppContainer from '@/components/base/AppContainer.vue';

  const isSidebarOpen = ref(false);
  const sidebarRef = ref<InstanceType<typeof AppSidebar> | null>(null);

  function handleClickOutside(event: MouseEvent) {
    const el = sidebarRef.value?.$el as HTMLElement | undefined;
    if (el && !el.contains(event.target as Node)) {
      isSidebarOpen.value = false;
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });
</script>

<template>
  <div class="dashboard-layout">
    <div class="dashboard-layout__body" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-wrapper">
        <app-sidebar 
          :is-open="isSidebarOpen" 
          @close="isSidebarOpen = false"
          :class="{ 'sidebar-open': isSidebarOpen }"
          ref="sidebarRef"
        />
      </div>
      <div class="dashboard-layout__content">
        <app-header @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
        <app-container>
          <router-view />
        </app-container>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .dashboard-layout__body {
    display: grid;
    grid-template-columns: 64px 1fr;
    transition: grid-template-columns 0.25s ease;
  }
  .dashboard-layout__body.sidebar-open {
    grid-template-columns: 240px 1fr;
  }
  .sidebar-wrapper {
    overflow: hidden;
  }
  .dashboard-layout__content {
    min-width: 0;
  }
  .sidebar.sidebar-open {
    width: 240px;
  }

  @media (max-width: 768px) {
    .dashboard-layout__body.sidebar-open {
      grid-template-columns: 64px 1fr;
    }
  }
  @media (max-width: 480px) {
    .dashboard-layout__body {
      grid-template-columns: 100% 1fr;
    }
    .sidebar-wrapper {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      z-index: 1000;
      width: 240px;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
    }
    .dashboard-layout__body.sidebar-open .sidebar-wrapper {
      transform: translateX(0);
    }
    .dashboard-layout__body.sidebar-open {
      grid-template-columns: 100% 1fr;
    }
  }
</style>
