<script setup lang="ts">
  import AppButton from '@/components/base/AppButton.vue';

  interface Props {
    isValid?: boolean
  }
  defineProps<Props>();

  defineEmits(['cancel', 'submit']);
</script>

<template>
  <div class="workspace-form__actions">
    <app-button secondary @click="$emit('cancel')">Cancel</app-button>
    <app-button :primary="isValid" :disabled="!isValid" @click="$emit('submit')">
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
