<script setup lang="ts">
  import { ref } from 'vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppModal from '@/components/base/AppModal.vue';
  import WorkspaceForm from '@/components/content/workspace/form/WorkspaceForm.vue';

  const isOpen = ref(false);

  const openModal = ()=> {
    isOpen.value = true;
  };
  const closeModal =() => {
    isOpen.value = false;
  };
</script>

<template>
  <app-button secondary @click="openModal">
    Create Workspace
  </app-button>

  <app-modal
    :model-value="isOpen" 
    @update:model-value="isOpen = $event" 
    :scrollable="true"
  >
    <workspace-form @close="closeModal" />
  </app-modal>
</template>

<style scoped>

</style>
