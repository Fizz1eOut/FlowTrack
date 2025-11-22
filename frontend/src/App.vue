<script setup lang="ts">
  import { onMounted } from 'vue';
  import { RouterView } from 'vue-router';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppToast from '@/components/base/AppToast.vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';

  const workspaceStore = useWorkspaceStore();
  onMounted(() => {
    workspaceStore.fetchWorkspaces();
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
