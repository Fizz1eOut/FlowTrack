<script setup lang="ts">
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppContainer from '@/components/base/AppContainer.vue';

  interface ProgressCardStatProps {
    title: string
    subtitle: string
    icon: string
    color: string
  }
  defineProps<ProgressCardStatProps>();
</script>

<template>
  <div class="stat-card" :style="{ '--stat-color': color }">
    <app-container size="md">
      <div class="stat-card__title">
        <app-icon 
          :name="icon"
          size="var(--fs-lg)"
          :color="color"
        />
        {{ title }}
      </div>
      <div class="stat-card__content">
        <div class="stat-card__value">
          <slot name="value"></slot>
        </div>
        <div class="stat-card__subtitle">
          {{ subtitle }}
        </div>
      </div>
    </app-container>
  </div>
</template>

<style scoped>
  .stat-card {
    border: var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }
  .stat-card__title {
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .stat-card__content {
    margin-top: var(--space-xs);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 8px;
  }
  .stat-card__value {
    font-size: var(--fs-3xl);
    font-weight: var(--fw-medium);
    color: var(--stat-color);
  } 
  .stat-card__subtitle {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    color: var(--color-gray);
  }
</style>
