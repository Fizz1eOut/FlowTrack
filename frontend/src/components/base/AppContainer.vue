<script setup lang="ts">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    }>(),
    {
      size: 'xs',
    }
  );

  const container = computed(() => `size-${props.size}`);
</script>

<template>
  <div :class="container" class="container">
    <slot ></slot>
  </div>
</template>

<style scoped>
  .size-xl {
    padding: 32px;
  }
  .size-lg {
    padding: 24px;
  }
  .size-md {
    padding: 20px;
  }
  .size-sm {
    padding: 16px;
  }
  .size-xs {
    padding: 12px;
  }
  @media (max-width: 768px) {
    .size-xl {
      padding: 24px;
    }
    .size-lg {
      padding: 20px;
    }
  }
  @media (max-width: 499px) {
    .size-xl,
    .size-lg,
    .size-md {
      padding: 16px;
    }
    .size-sm {
      padding: 12px;
    }
  }
</style>
