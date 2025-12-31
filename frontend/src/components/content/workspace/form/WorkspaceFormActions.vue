<script setup lang="ts">
  import AppButton from '@/components/base/AppButton.vue';

  defineEmits(['cancel', 'submit']);
</script>

<template>
  <div class="workspace-form__actions">
    <app-button secondary @click="$emit('cancel')">Cancel</app-button>
    <app-button primary @click="$emit('submit')">
      Create Workspace
    </app-button>
  </div>
</template>

<style scoped>
  .workspace-form__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
  }
</style>
