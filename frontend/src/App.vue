<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import AppContainer from '@/components/base/AppContainer.vue';
</script>

<template>
  <main class="main">
    <app-container>
      <router-view />
    </app-container>
  </main>
</template>

<style scoped>
.main {
  padding-bottom: 80px;
}
</style>
