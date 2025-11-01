<script setup lang="ts">
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppUnderlay from '@/components/base/AppUnderlay.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
</script>

<template>
  <div class="welcome-features">
    <ul class="welcome-features__list">
      <li class="welcome-features__item">
        <app-underlay>
          <app-container size="md">
            <div class="welcome-features__group">
              <div class="welcome-features__icon icon-primary">
                <app-icon name="sparkles" size="24" color="var(--primary)" />
              </div>
              <app-subtitle>NLP Quick-Add</app-subtitle>
              <p class="welcome-features__text">
                Add tasks using natural language. Just type “Meeting tomorrow at 10:00” — we’ll handle the rest.
              </p>
            </div>
          </app-container>
        </app-underlay>
      </li>
      <div class="welcome-features__item">
        <app-underlay>
          <app-container size="md">
            <div class="welcome-features__group">
              <div class="welcome-features__icon icon-accent">
                <app-icon name="target" size="24" color="var(--accent)" />
              </div>
              <app-subtitle>Gamification</app-subtitle>
              <p class="welcome-features__text">
                Earn XP for completed tasks, keep your streak alive, and level up your progress.
              </p>
            </div>
          </app-container>
        </app-underlay>
      </div>
      <div class="welcome-features__item">
        <app-underlay>
          <app-container size="md">
            <div class="welcome-features__group">
              <div class="welcome-features__icon icon-success">
                <app-icon name="trending-up" size="28" color="var(--success)" />
              </div>
              <app-subtitle>AI-powered planning</app-subtitle>
              <p class="welcome-features__text">
                Let AI craft the optimal daily plan based on your tasks and priorities.
              </p>
            </div>
          </app-container>
        </app-underlay>
      </div>
    </ul>
  </div>
</template>

<style scoped>
  .welcome-features {
    margin-top: var(--space-xl);
  }
  .welcome-features__list {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    gap: 10px;
  }
  .welcome-features__item {
    flex: 1 1 33.333%;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
  }
  .welcome-features__group {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-direction: column;
  }
  .welcome-features__icon {
    max-width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--radius-md);
    backdrop-filter: var(--blur-effect);
  }
  .icon-primary {
     background-color: var(--primary-bg);
  }
  .icon-accent {
    background-color: var(--accent-bg);
  }
  .icon-success {
    background-color: var(--success-bg);
  }
  .welcome-features__text {
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
  :deep(.underlay) {
    height: 100%;
  }
</style>
