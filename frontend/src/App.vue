<script setup lang="ts">
  import { onMounted } from 'vue';
  import { RouterView } from 'vue-router';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppToast from '@/components/base/AppToast.vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useTasksStore  } from '@/stores/taskStore';

  const workspaceStore = useWorkspaceStore();
  const taskStore = useTasksStore ();

  onMounted(async () => {
    try {
      await workspaceStore.fetchWorkspaces();
      await taskStore.checkRecurringTasks();
      await taskStore.fetchTasks();
      
      console.log('[App] Initial data loaded');
    } catch (error) {
      console.error('[App] Error loading initial data:', error);
    }
  });
</script>

<template>
  <main>
    <app-container>
      <router-view />
      <app-toast />
    </app-container>
  </main>
</template>

<style scoped>

</style>
