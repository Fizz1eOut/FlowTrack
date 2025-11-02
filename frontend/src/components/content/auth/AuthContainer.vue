<script setup lang="ts">
  import AppTitle from '@/components/base/AppTitle.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
</script>

<template>
  <div class="auth">
    <div class="auth__body">
      <div class="auth__header">
        <app-title class="auth__title">FlowTrack</app-title>
        <p class="auth__subtitle">Smart task tracker with gamification</p>
      </div>

      <div class="auth__content">
        <app-container size="lg">
          <div class="auth__group">
            <slot ></slot>
          </div>
        </app-container>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .auth {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .auth__body {
    max-width: 448px;
    width: 100%;
  }
  .auth__header {
    margin-bottom: var(--space-xl);
    text-align: center;
  }
  .auth__content {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .auth__group > *:not(:last-child) {
    margin-bottom: var(--space-lg);
  }
  .auth__title {
    color: var(--primary);
  }
  .auth__subtitle {
    color: var(--color-gray);
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
  }
</style>
