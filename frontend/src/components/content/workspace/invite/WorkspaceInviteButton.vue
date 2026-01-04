<script setup lang="ts">
  import { ref } from 'vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppModal from '@/components/base/AppModal.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import WorkspaceInviteModal from '@/components/content/workspace/invite/WorkspaceInviteModal.vue';

  const isOpen = ref(false);

  const openModal = () => {
    isOpen.value = true;
  };

  const closeModal = () => {
    isOpen.value = false;
  };
</script>

<template>
  <div class="workspace-invite">
    <app-button primary @click="openModal" class="workspace-invite__btn">
      <app-icon 
        name="plus"
        size="var(--fs-sm)"
        color="var(--color-white)"
      />
      Add participant
    </app-button>

    <app-modal
      :model-value="isOpen" 
      @update:model-value="isOpen = $event" 
      :scrollable="true"
    >
      <workspace-invite-modal @close="closeModal" />
    </app-modal>
  </div>
</template>

<style scoped>
  .workspace-invite__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--space-xl);
    gap: 10px;
  }
</style>
