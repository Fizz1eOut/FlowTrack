<script setup lang="ts">
  import AppSubtitle from '@/components/base/AppSubtitle.vue';

  interface AuthFormProps {
    title: string;
    description: string;
  }
  defineProps<AuthFormProps>();
</script>

<template>
  <div class="auth-intro">
    <app-subtitle>{{ title }}</app-subtitle>
    <p class="auth-intro__description">{{ description }}</p>
  </div>
</template>

<style scoped>
  .auth-intro__description {
    margin-top: var(--space-xs);
    color: var(--color-gray);
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
  }
</style>
