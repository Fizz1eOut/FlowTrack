<script setup lang="ts">
  import AppButton from '@/components/base/AppButton.vue';

  interface Props {
    isValid?: boolean
  }
  defineProps<Props>();

  defineEmits(['cancel', 'submit']);
</script>

<template>
  <div class="invite-modal__actions">
    <app-button secondary @click="$emit('cancel')">Cancel</app-button>
    <app-button :primary="isValid" :disabled="!isValid" @click="$emit('submit')">Send an invitation</app-button>
  </div>
</template>

<style scoped>
  .invite-modal__actions {
    margin-top: var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
</style>
