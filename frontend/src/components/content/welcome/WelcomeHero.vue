<script setup lang="ts">
  import AppTitle from '@/components/base/AppTitle.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppButton from '@/components/base/AppButton.vue';
</script>

<template>
  <div class="welcome-hero">
    <div class="welcome-hero__body">
      <app-title class="welcome-hero__title">Welcome to FlowTrack</app-title>
      <app-subtitle class="welcome-hero__subtitle">Smart task tracker with gamification</app-subtitle>
      <p class="welcome-hero__text">Turn everyday tasks into an exciting game. Earn XP, maintain your streak, and achieve your goals with FlowTrack.</p>

      <div class="welcome-hero__button">
        <app-button to="/" primary class="btn">Get Started</app-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .welcome-hero {
    margin-top: var(--space-2xl);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    text-align: center;
  }
  .welcome-hero__body > *:not(:last-child) {
    margin-bottom: var(--space-md);
  }
  .welcome-hero__title {
    font-size: 48px;
    color: var(--primary);
  }
  .welcome-hero__subtitle {
    color: var(--color-gray);
  }
  .welcome-hero__text {
    max-width: 600px;
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
  .btn {
    max-width: 200px;
  }
  @media (max-width: 768px) {
    .welcome-hero__title {
      font-size: 36px;
    }
  }
  @media (max-width: 480px) {
    .welcome-hero__title {
      font-size: 28px;
    }
    .btn {
      max-width: 100%;
    }
  }
</style>
