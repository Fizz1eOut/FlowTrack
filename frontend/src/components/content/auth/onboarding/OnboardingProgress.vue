<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    step: number
    totalSteps: number
  }

  const props = defineProps<Props>();

  const progressPercent = computed(() => {
    if (props.totalSteps === 0) return 0;
    return (props.step / props.totalSteps) * 100;
  });
</script>

<template>
  <div class="onboarding-progress">
    <div class="onboarding-progress__header">
      <span>step {{ step }} of {{ totalSteps }}</span>
    </div>

    <div class="onboarding-progress__bar">
      <div
        class="onboarding-progress__fill"
        :style="{ width: progressPercent + '%' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
  .onboarding-progress {
    margin: var(--fs-md);
  }
  .onboarding-progress__header {
    font-size: var(--fs-md);
    color: var(--color-gray);
    margin-bottom: var(--space-sm);
  }
  .onboarding-progress__bar {
    width: 100%;
    height: 6px;
    background-color: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
  }
  .onboarding-progress__fill {
    height: 100%;
    background-color: var(--success);
    transition: width 0.3s ease-in-out;
  }
</style>
