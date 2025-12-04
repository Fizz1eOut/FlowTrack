<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { useTasksStore } from '@/stores/taskStore';
  import { showToast } from '@/stores/toastStore';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import AppButton from '@/components/base/AppButton.vue';
  import AppDropdown from '@/components/base/AppDropdown.vue';
  import TaskEditForm from '@/components/content/tasks/form/TaskEditForm.vue';
  import AppModal from '@/components/base/AppModal.vue';

  interface TaskCardMenuProps {
    active: boolean;
    task: TaskResponse;
  }
  const props = defineProps<TaskCardMenuProps>();

  const isEditModalOpen = ref(false);
  const taskStore = useTasksStore();

  const canArchive = computed(() => TaskStatusUtils.canArchive(props.task.status));
  const canUnarchive = computed(() => TaskStatusUtils.canUnarchive(props.task.status));

  function openEditModal() {
    isEditModalOpen.value = true;
  }

  function closeEditModal() {
    isEditModalOpen.value = false;
  }

  const handleDelete = async () => {
    const success = await taskStore.deleteTask(props.task.id);
  
    if (success) {
      showToast('The task was deleted successfully.', 'success');
      console.log('The task was deleted successfully:', props.task);
    } else {
      showToast('Failed to delete the task.', 'error');
      console.error('Failed to delete the task');
    }
  };

  const handleArchive = async () => {
    const success = await taskStore.archiveTask(props.task.id);
  
    if (success) {
      showToast('Task archived successfully.', 'success');
    } else {
      showToast('Failed to archive the task.', 'error');
    }
  };

  const handleUnarchive = async () => {
    const success = await taskStore.unarchiveTask(props.task.id);
  
    if (success) {
      showToast('Task restored successfully.', 'success');
    } else {
      showToast('Failed to restore the task.', 'error');
    }
  };
</script>

<template>
  <app-dropdown :active="active">
    <div class="task-card-menu">
      <ul class="task-card-menu__list">
        <li class="task-card-menu__item">
          <app-button @click="openEditModal" class="task-card-menu__btn">
            Edit
          </app-button>
          <app-modal 
            :model-value="isEditModalOpen" 
            @update:model-value="isEditModalOpen = $event" 
            :scrollable="true"
          >
            <task-edit-form :task="task" @close="closeEditModal" />
          </app-modal>
        </li>

        <li v-if="canArchive" class="task-card-menu__item">
          <app-button @click="handleArchive" class="task-card-menu__btn">Archive</app-button>
        </li>

        <li v-if="canUnarchive" class="task-card-menu__item">
          <app-button @click="handleUnarchive" class="task-card-menu__btn">Restore</app-button>
        </li>

        <li class="task-card-menu__item">
          <app-button @click="handleDelete" class="task-card-menu__btn task-card-menu__btn--delete">
            Delete
          </app-button>
        </li>
      </ul>
    </div>
  </app-dropdown>
</template>

<style scoped>
  .task-card-menu {
    min-width: 80px;
  }
  .task-card-menu__list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-direction: column;
  }
  .task-card-menu__item {
    width: 100%;
  }
  .task-card-menu__btn {
    padding: 5px;
    border-radius: var(--radius-sm);
    transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out, color 0.3s ease-in-out
  }
  .task-card-menu__btn:hover {
    color: var(--color-white);
    background-color: var(--accent);
    box-shadow: var(--shadow-md);
  }
  .task-card-menu__btn--delete {
    color: var(--error);
    transition: color 0.2s ease-in-out;
  }
  .task-card-menu__btn:hover.task-card-menu__btn--delete {
    color: var(--color-white);
  }
</style>
