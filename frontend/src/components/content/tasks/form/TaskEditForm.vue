<script setup lang="ts">
  import { ref } from 'vue';
  import AppTitle from '@/components/base/AppTitle.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import TaskForm from '@/components/content/tasks/form/TaskForm.vue';
  import { showToast } from '@/stores/toastStore';
  import { useTasksStore } from '@/stores/taskStore';
  import type { CreateTaskInput, TaskResponse } from '@/interface/task.interface';

  interface TaskEditFormProps {
    task: TaskResponse;
  }
  const props = defineProps<TaskEditFormProps>();

  const emit = defineEmits<{
    close: []
  }>();

  const taskStore = useTasksStore();
  const formData = ref<CreateTaskInput>();
  const formValid = ref(false);

  function handleFormUpdate(data: CreateTaskInput) {
    formData.value = data;
  }

  async function handleUpdateTask() {
    if (!formValid.value) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (!formData.value) {
      showToast('No form data', 'error');
      return;
    }

    try {
      const updatedTask = await taskStore.updateTask(props.task.id, formData.value);
    
      if (updatedTask) {
        console.log('Task updated successfully:', updatedTask);
        showToast('Task updated successfully', 'success');
        emit('close');
      } else {
        console.error('Error updating task');
        showToast('Error updating task', 'error');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  function handleFormValidation(isValid: boolean) {
    formValid.value = isValid;
  }
</script>

<template>
  <div class="task-edit-form">
    <div class="task-edit-form__header">
      <app-title>Edit task</app-title>

      <app-button @click="$emit('close')" class="task-edit-form__btn--cross">
        <app-icon 
          name="cross"
          size="var(--fs-xl)"
          color="var(--color-gray)"
        />
      </app-button>
    </div>

    <div class="task-edit-form__body">
      <task-form 
        :task="task"
        @update="handleFormUpdate"
        @validation="handleFormValidation"
      />
    </div>

    <div class="task-edit-form__actions">
      <app-button 
        secondary 
        @click="$emit('close')"
        type="button"
      >
        Cancel
      </app-button>
      <app-button 
        primary 
        @click="handleUpdateTask" 
        :disabled="!formValid"
        type="button"
      >
        Save Changes
      </app-button>
    </div>
  </div>
</template>

<style scoped>
  .task-edit-form__header {
    margin-bottom: var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .task-edit-form__actions {
    margin-top: var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .task-edit-form__btn--cross {
    max-width: 20px;
  }
</style>
