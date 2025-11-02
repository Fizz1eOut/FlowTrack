<script setup lang="ts">
  import AppButton from '@/components/base/AppButton.vue';
</script>

<template>
  <div class="auth-providers">
    <app-button secondary>Sign In with Google</app-button>
    <app-button secondary>Sign In with GitHub</app-button>
  </div>
</template>

<style scoped>
  .auth-providers {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-direction: column;
  }
</style>
