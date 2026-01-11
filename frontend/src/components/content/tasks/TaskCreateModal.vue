<script setup lang="ts">
  import { ref } from 'vue';
  import AppModal from '@/components/base/AppModal.vue';
  import TaskCreateForm from '@/components/content/tasks/form/TaskCreateForm.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  withDefaults(
    defineProps<{
      variant?: 'full' | 'fab';
    }>(),
    {
      variant: 'full',
    }
  );

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
    <app-button 
      primary
      :class="['task-create-modal__btn', `task-create-modal__btn--${variant}`]"
      @click="openModal"
    >
      <app-icon 
        name="plus"
        size="var(--fs-md)"
        color="var(--color-dark)"
      />
      <span v-if="variant === 'full'">Create</span>
    </app-button>

    <app-modal 
      v-model="isOpen"
      :scrollable="true"
    >
      <task-create-form @close="closeModal" />
    </app-modal>
  </div>
</template>

<style scoped>
.task-create-modal__btn {
  display: flex;
  justify-content: center;
  align-items: center;
}

.task-create-modal__btn--full {
  gap: 10px;
  width: 100px;
}

.task-create-modal__btn--fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .task-create-modal__btn--full {
    display: none;
  }
}
</style>
