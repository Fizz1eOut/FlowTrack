<script setup lang="ts">
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  defineEmits(['close']);
</script>

<template>
  <div class="invite-modal__header">
    <div class="invite-modal__row">
      <app-subtitle>Invite a participant</app-subtitle>
      <p class="invite-modal__description">
        Send an invitation to collaborate
      </p>
    </div>
    <app-button @click="$emit('close')" class="invite-modal__btn--cross">
      <app-icon 
        name="cross"
        size="var(--fs-xl)"
        color="var(--color-gray)"
      />
    </app-button>
  </div>
</template>

<style scoped>
  .invite-modal__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .invite-modal__description {
    font-size: var(--fs-sm);
    color: var(--color-gray);
  }
  .invite-modal__btn--cross {
    width: 36px;
    height: 20px;
  }
</style>
