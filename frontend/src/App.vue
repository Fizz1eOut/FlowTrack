<script setup lang="ts">
  import { watch } from 'vue';
  import { RouterView } from 'vue-router';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppToast from '@/components/base/AppToast.vue';
  import { useAuthStore } from '@/stores/authStore';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useTasksStore } from '@/stores/taskStore';
  import { useProgressStore } from '@/stores/progressStore';
  import { useTimerStore } from '@/stores/timerStore';

  const authStore = useAuthStore();
  const workspaceStore = useWorkspaceStore();
  const taskStore = useTasksStore();
  const progressStore = useProgressStore();
  const timerStore = useTimerStore();

  authStore.initialize();

  watch(
    () => authStore.userId,
    async (userId) => {
      if (!userId) return;

      await workspaceStore.fetchWorkspaces();

      await Promise.allSettled([
        taskStore.fetchTasks(),
        progressStore.fetchProgress(),
        taskStore.checkRecurringTasks(),
      ]);
  
      timerStore.loadFromStorage();
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
