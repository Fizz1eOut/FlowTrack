<script setup lang="ts">
  import { toasts, removeToast } from '@/stores/toastStore';
  import AppIcon from '@/components/base/AppIcon.vue';

</script>

<template>
  <div class="toast">
    <transition-group name="fade" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast__item"
        :class="toast.type"
        @click="removeToast(toast.id)"
      >
        <app-icon
          :name="toast.type === 'success' ? 'done' : 'error'"
          :color="toast.type === 'success' ? 'var(--primary)' : 'var(--error)'"
          size="var(--fs-2xl)"
        />
        <span>{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 1000;
  }
  .toast__item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--background);
    border-radius: var(--space-xs);
    cursor: pointer;
    max-width: 240px;
    width: 100%;
    padding: 12px 20px;
    font-size: var(--fs-sm);
    font-weight: var(--fw-medium);
  }
  .toast__item.success {
    border: 1px solid var(--primary);
    color: var(--primary);
    box-shadow: var(--shadow-glow);
  }
  .toast__item.error {
    border: 1px solid var(--error);
    color: var(--error);
    box-shadow: var(--shadow-lg);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.3s ease-in-out;
  }
  .fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
  }
  .fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>


