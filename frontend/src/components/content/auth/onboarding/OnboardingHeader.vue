<script setup lang="ts">
  import AppTitle from '@/components/base/AppTitle.vue';

  interface OnboardingHeaderProps {
    user: {
      user_metadata: {
        full_name?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    } | null;
  }

  const props = defineProps<OnboardingHeaderProps>();
</script>

<template>
  <div class="onboarding-header">
    <app-title class="onboarding-header__title">
      Welcome, {{ props.user?.user_metadata?.full_name ?? 'User' }}, welcome to FlowTrack!
    </app-title>
    <p class="onboarding-header__text">Let’s set up your workspace to get started.</p>
  </div>
</template>

<style scoped>
  .onboarding-header {
    text-align: center;
  }
  .onboarding-header__title {
    margin-bottom: var(--space-xs);
    color: var(--primary);
  }
  .onboarding-header__text {
    font-size: var(--space-md);
    color: var(--color-gray);
  }
</style>
