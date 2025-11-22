<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { RouterView } from 'vue-router';
  import AppSidebar from '@/components/base/AppSidebar.vue';
  import AppHeader from '@/components/base/AppHeader.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
  import { useTasksStore  } from '@/stores/taskStore';

  const isSidebarOpen = ref(false);

  const sidebarClasses = computed(() => ({
    'sidebar': true,
    'sidebar--open': isSidebarOpen.value,
  }));

  const taskStore = useTasksStore ();

  onMounted(() => {
    taskStore.checkRecurringTasks();
  });
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
    max-width: 300px;
    width: 100%;
  }
  .dashboard-layout__content {
    width: 100%;
  }
  @media (max-width: 768px) {
    .sidebar--open {
      max-width: 160px;
    }
  }
  @media (max-width: 480px) {
    .sidebar--open {
      position: absolute;
      top: 0;
      left: 10px;
      z-index: 10;
      max-width: 180px;
      background-color: var(--surface);
    }
  }
</style>
