<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    primary?: boolean;
    secondary?: boolean;
    disabled?: boolean;
  }>();

  const classes = computed(() => ({
    'button-primary': props.primary,
    'button-secondary': props.secondary,
    'button-disabled': props.disabled,
  }));
</script>

<template>
  <button
    type="button"
    class="button"
    :class="classes"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
  .button {
    width: 100%;
    height: 100%;
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    color: var(--color-black);
    background-color: transparent;
    cursor: pointer;
    border-radius: 0;
    border: none;
    padding: 0;
    font-family: "Roboto", sans-serif;
  }
  .button:hover {
    background-color: transparent
  }

  .button-primary {
    height: var(--space-2xl);
    color: var(--color-white);
    background-color: var(--primary);
    border-radius: var(--radius-sm);
    transition: background-color 0.4s ease-in-out, box-shadow 0.4s ease-in-out;
  }
  .button-primary:hover {
    background-color: var(--primary-hover);
    box-shadow: var(--shadow-glow);
  }

  .button-secondary {
    height: var(--space-2xl);
    border: 1px solid var(--border);
    color: var(--color-black);
    background-color: var(--red-500);
    transition: color 0.4s ease-in-out, box-shadow 0.4s ease-in-out, background-color 0.4s ease-in-out;
    border-radius: var(--radius-sm);
  }
  .button-secondary:hover {
    background-color: var(--accent);
    color: var(--color-white);
    border: 1px solid var(--accent);
    box-shadow: var(--shadow-lg);
  }

  .button-disabled {
    height: 36px;
    background-color: var(--color-gray);
    border-radius: 10px;
    opacity: 0.3;
    transition: background-color 0.4s ease-in-out, opacity 0.4s ease-in-out;
    cursor: not-allowed;
  }
  .button-disabled:hover {
    opacity: 0.4;
    background-color: var(--color-gray);
  }
</style>
