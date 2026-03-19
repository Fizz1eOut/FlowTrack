<script setup lang="ts">
  import { watch, onMounted } from 'vue';
  import { RouterView } from 'vue-router';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppToast from '@/components/base/AppToast.vue';
  import TaskCreateModal from '@/components/content/tasks/TaskCreateModal.vue';
  import { useAuthStore } from '@/stores/authStore';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useTasksStore } from '@/stores/taskStore';
  import { useProgressStore } from '@/stores/progressStore';
  import { useTimerStore } from '@/stores/timerStore';
  import { useTelegram } from '@/composables/useTelegram';
  import { linkTelegramAccount } from '@/services/telegramLink.service';


  const authStore = useAuthStore();
  const workspaceStore = useWorkspaceStore();
  const taskStore = useTasksStore();
  const progressStore = useProgressStore();
  const timerStore = useTimerStore();

  const { init, isInTelegram, telegramUser } = useTelegram();

  onMounted(() => {
    init();
  });

  watch(
    () => authStore.userId,
    async (userId) => {
      if (!userId) return;

      if (isInTelegram.value && telegramUser.value) {
        await linkTelegramAccount(userId, telegramUser.value.id);
      }
    
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
  <task-create-modal variant="fab" />
</template>

<style scoped>

</style>
