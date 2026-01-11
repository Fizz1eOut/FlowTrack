<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { RouterView } from 'vue-router';
  import AppSidebar from '@/components/base/AppSidebar.vue';
  import AppHeader from '@/components/base/AppHeader.vue';
  import AppContainer from '@/components/base/AppContainer.vue';

  const isSidebarOpen = ref(false);

  const sidebarClasses = computed(() => ({
    'sidebar': true,
    'sidebar--open': isSidebarOpen.value,
  }));
</script>

<template>
  <div class="dashboard-layout">
    <div class="dashboard-layout__body">
      <app-sidebar 
        :is-open="isSidebarOpen" 
        @close="isSidebarOpen = false"
        :class="sidebarClasses"
      />
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
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .sidebar--open {
    max-width: 240px;
    width: 100%;
  }
  .dashboard-layout__content {
    width: 100%;
    padding-left: 64px;
    transition: padding-left 0.25s ease;
  }
  .sidebar--open ~ .dashboard-layout__content {
    padding-left: 240px;
  }
  
  @media (max-width: 768px) {
    .sidebar--open ~ .dashboard-layout__content {
      padding-left: 160px;
    }
  }
  @media (max-width: 480px) {
    .dashboard-layout__content {
      padding-left: 0;
    }
  }
</style>
