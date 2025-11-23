<script setup lang="ts">
  import { reactive, watchEffect, computed } from 'vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppTextarea from '@/components/inputs/AppTextarea.vue';
  import TaskFormProject from '@/components/content/tasks/TaskFormProject.vue';
  import TaskFormStatus from '@/components/content/tasks/TaskFormStatus.vue';
  import TaskFormPriority from '@/components/content/tasks/TaskFormPriority.vue';
  import TaskFormEstimate from '@/components/content/tasks/TaskFormEstimate.vue';
  import TaskFormDue from '@/components/content/tasks/TaskFormDue.vue';
  import TaskFormTags from '@/components/content/tasks/TaskFormTags.vue';
  import TaskFormRecurring from '@/components/content/tasks/TaskFormRecurring.vue';
  import TaskFormSubtasks from '@/components/content/tasks/TaskFormSubtasks.vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import type { CreateTaskInput } from '@/interface/task.interface';

  const emit = defineEmits<{
    update: [data: CreateTaskInput]
    validation: [isValid: boolean]
  }>();

  const workspaceStore = useWorkspaceStore();

  const formData = reactive<CreateTaskInput>({
    title: '',
    description: '',
    workspace_id: workspaceStore.currentWorkspaceId || '',
    due_date: null,
    due_time: null,
    priority: 'medium',
    status: 'todo',
    estimate_minutes: 120,
    tags: [],
    is_recurring: false,
    subtasks: []
  });

  const isValid = computed(() => {
    return !!(
      formData.title.trim() && 
      formData.description.trim() &&
      formData.workspace_id
    );
  });

  watchEffect(() => {
    emit('update', formData);
    emit('validation', !!isValid.value);
  });
</script>

<template>
  <form @submit.prevent class="task-form">
    <div class="task-form__header">
      <div class="task-form__item">
        <div class="task-form__name">Task name</div>
        <div v-if="!formData.title.trim()" class="task-form__error-text">Required field</div>
        <app-input 
          v-model="formData.title"
          placeholder="Enter task name"
          :class="{error: !formData.title.trim()}"
        />
      </div>
      <div class="task-form__item">
        <div class="task-form__name">Description</div>
        <div v-if="!formData.description.trim()" class="task-form__error-text">Required field</div>
        <app-textarea 
          v-model="formData.description"
          placeholder="Enter task description"
          :rows="4"
          :class="{error: !formData.description.trim()}"
        />
      </div>
    </div>
    <div class="task-form__body">
      <div class="task-form__field">
        <div class="task-form__item">
          <task-form-project v-model="formData.workspace_id" />
        </div>
        <div class="task-form__item">
          <task-form-status v-model="formData.status" />
        </div>
      </div>

      <div class="task-form__field">
        <div class="task-form__item">
          <task-form-priority v-model="formData.priority" />
        </div>
        <div class="task-form__item">
          <task-form-estimate v-model="formData.estimate_minutes" />
        </div>
      </div>

      <div class="task-form__item">
        <task-form-due 
          v-model:due-date="formData.due_date" 
          v-model:due-time="formData.due_time"
        />
      </div>

      <div class="task-form__item">
        <task-form-tags v-model="formData.tags" />
      </div>

      <div class="task-form__item">
        <task-form-recurring 
          v-model="formData.is_recurring" 
        />
      </div>

      <div class="task-form__item">
        <task-form-subtasks v-model="formData.subtasks" />
      </div>
    </div>
  </form>
</template>

<style scoped>
  .task-form__header > *:not(:last-child) {
    margin-bottom: var(--space-md);
  }
  .task-form__body {
    margin-top: var(--space-lg);
  }
  .task-form__body > *:not(:last-child) {
    margin-bottom: var(--space-md);
  }
  .task-form__field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .task-form__name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
  .task-form__item {
    width: 100%;
  }
  .error {
    border: 1px solid var(--error);
    border-radius: var(--radius-sm);
  }
  .task-form__error-text {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
    color: var(--error);
  }
  @media (max-width: 480px) {
    .task-form__field {
      flex-direction: column;
    }
  }
</style>
