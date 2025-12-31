<script setup lang="ts">
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  defineEmits(['close']);
</script>

<template>
  <div class="workspace-form__header">
    <div class="workspace-form__row">
      <app-subtitle>
        Create a new Workspace
      </app-subtitle>
      <p class="workspace-form__description">Workspace helps organize tasks and projects in one place</p>
    </div>
    <app-button @click="$emit('close')" class="workspace-form__btn--cross">
      <app-icon 
        name="cross"
        size="var(--fs-xl)"
        color="var(--color-gray)"
      />
    </app-button>
  </div>
</template>

<style scoped>
  .workspace-form__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .workspace-form__description {
    font-size: var(--fs-sm);
    color: var(--color-gray);
  }
  .workspace-form__btn--cross {
    max-width: 34px;
  }
</style>
