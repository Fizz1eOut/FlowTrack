<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    text: ''
  });

  const sizeMap = {
    sm: { spinner: '24px', border: '3px' },
    md: { spinner: '40px', border: '4px' },
    lg: { spinner: '56px', border: '5px' }
  };

  const spinnerStyle = computed(() => ({
    width: sizeMap[props.size].spinner,
    height: sizeMap[props.size].spinner,
    borderWidth: sizeMap[props.size].border
  }));
</script>

<template>
  <div class="loading">
    <div class="loading__spinner" :style="spinnerStyle">
      <div class="loading__check"></div>
    </div>
    <span v-if="text" class="loading__text">{{ text }}</span>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading__spinner {
  position: relative;
  border-radius: 50%;
  border-style: solid;
  border-color: var(--border);
  border-top-color: var(--primary);
  animation: spin 0.8s linear infinite;
}

.loading__text {
  font-size: 14px;
  color: var(--color-gray);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
