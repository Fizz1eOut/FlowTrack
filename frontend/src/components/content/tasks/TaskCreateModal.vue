<script setup lang="ts">
  import { ref } from 'vue';
  import AppModal from '@/components/base/AppModal.vue';
  import TaskCreateForm from '@/components/content/tasks/TaskCreateForm.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  const isOpen = ref(false);

  const openModal = () => {
    isOpen.value = true;
  };

  const closeModal = () => {
    isOpen.value = false;
  };
</script>

<template>
  <div class="task-create-modal">
    <app-button primary class="task-create-modal__btn" @click="openModal">
      <app-icon 
        name="plus"
        size="var(--fs-md)"
        color="var(--color-dark)"
      />
      Create
    </app-button>

    <app-modal 
      :model-value="isOpen" 
      @update:model-value="isOpen = $event" 
      :scrollable="true"
    >
      <task-create-form @close="closeModal"  />
    </app-modal>
  </div>
</template>

<style scoped>
  .task-create-modal__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100px;
  }
  @media (max-width: 768px) {
    .task-create-modal__btn {
      display: none;
    }
  }
</style>
