<script setup lang="ts">
  import { ref } from 'vue';
  import AppTitle from '@/components/base/AppTitle.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import TaskForm from '@/components/content/tasks/form/TaskForm.vue';
  import { showToast } from '@/stores/toastStore';
  import { useTasksStore } from '@/stores/taskStore';
  import type { CreateTaskInput } from '@/interface/task.interface';

  const emit = defineEmits<{
    close: []
  }>();

  const taskStore = useTasksStore();
  const formData = ref<CreateTaskInput | null>(null);
  const formValid = ref(false);

  function handleFormUpdate(data: CreateTaskInput) {
    formData.value = data;
  }

  async function handleCreateTask() {
    if (!formValid.value) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (!formData.value) {
      showToast('No form data', 'error');
      return;
    }

    try {
      const task = await taskStore.createTask(formData.value);
    
      if (task) {
        console.log('The task was created successfully.:', task);
        showToast('The task was created successfully.', 'success');
        emit('close');
      } else {
        console.error('Error creating task');
        showToast('Error creating task.', 'error');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  function handleFormValidation(isValid: boolean) {
    formValid.value = isValid;
  }
</script>

<template>
  <div class="task-create-form">
    <div class="task-create-form__header">
      <app-title>Create new task</app-title>

      <app-button @click="$emit('close')" class="task-create-form__btn--cross">
        <app-icon 
          name="cross"
          size="var(--fs-xl)"
          color="var(--color-gray)"
        />
      </app-button>
    </div>

    <div class="task-create-form__body">
      <task-form 
        @update="handleFormUpdate"
        @validation="handleFormValidation"
      />
    </div>

    <div class="task-create-form__actions">
      <app-button 
        secondary 
        @click="$emit('close')"
        type="button"
      >
        Cancel
      </app-button>
      <app-button 
        primary 
        @click="handleCreateTask" 
        :disabled="!formValid"
        type="button"
      >
        Create Task
      </app-button>
    </div>
  </div>
</template>

<style scoped>
  .task-create-form__header {
    margin-bottom: var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .task-create-form__actions {
    margin-top: var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .task-create-form__btn--cross {
    max-width: 20px;
  }
</style>
