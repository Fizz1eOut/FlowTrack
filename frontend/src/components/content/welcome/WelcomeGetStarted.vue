<script setup lang="ts">
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
</script>

<template>
  <div class="get-started">
    <app-container size="xl">
      <div class="get-started__content">
        <div class="get-started__group">
          <app-icon name="done" size="30" color="var(--primary)" />
          <app-subtitle>Ready to boost your productivity?</app-subtitle>
        </div>
        <p class="get-started__text">
          Join thousands of users already achieving more with FlowTrack. Start for free today.
        </p>

        <div class="get-started__button">
          <app-button primary class="btn">
            Create account
            <app-icon name="arrow-right" size="20" color="var(--color-white)" />
          </app-button>
        </div>
      </div>
    </app-container>
  </div>
</template>

<style scoped>
  .get-started {
    margin-top: var(--space-2xl);
    background-color: var(--primary-bg);
    backdrop-filter: var(--blur-effect);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .get-started__content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-direction: column;
  }
  .get-started__group {
     margin-bottom: var(--space-xs);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .get-started__text {
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
  .get-started__button {
    margin-top: var(--space-md);
    max-width: 200px;
    width: 100%;
  }
  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  @media (max-width: 480px) {
    .get-started__button {
      max-width: 100%;
    }
  }
</style>
