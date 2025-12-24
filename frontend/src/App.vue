<script setup lang="ts">
  import { watch } from 'vue';
  import { RouterView } from 'vue-router';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppToast from '@/components/base/AppToast.vue';
  import { useAuthStore } from '@/stores/authStore';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useTasksStore } from '@/stores/taskStore';
  import { useProgressStore } from '@/stores/progressStore';

  const authStore = useAuthStore();
  const workspaceStore = useWorkspaceStore();
  const taskStore = useTasksStore();
  const progressStore = useProgressStore();

  authStore.initialize();

  watch(
    () => authStore.isAuthenticated,
    async (isAuth) => {
      if (!isAuth) return;

      console.log('[App] User authenticated, loading data...');

      await workspaceStore.fetchWorkspaces();

      await Promise.allSettled([
        taskStore.checkRecurringTasks(),
        taskStore.fetchTasks(),
        progressStore.fetchProgress()
      ]);

      console.log('[App] Initial data loaded');
    },
    { immediate: true }
  );
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
