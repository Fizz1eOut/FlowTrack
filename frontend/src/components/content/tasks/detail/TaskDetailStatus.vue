  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import TaskFormStatus from '@/components/content/tasks/form/TaskFormStatus.vue';
  import { useTasksStore } from '@/stores/taskStore';
  import { useTimerStore } from '@/stores/timerStore';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import { showToast } from '@/stores/toastStore';
  import type { TaskStatus } from '@/interface/task.interface';

  interface TaskDetailStatusProps {
    taskId: string;
    currentStatus: TaskStatus;
  }
  const props = defineProps<TaskDetailStatusProps>();

  const emit = defineEmits<{
    change: [status: TaskStatus];
  }>();

  const taskStore = useTasksStore();
  const timerStore = useTimerStore();

  const localStatus = ref<TaskStatus>(props.currentStatus);

  watch(
    () => props.currentStatus,
    (newStatus) => {
      localStatus.value = newStatus;
    }
  );

  async function handleStatusChange(newStatus: TaskStatus) {
    if (newStatus === props.currentStatus) {
      return;
    }

    if (timerStore.isTimerActiveForTask(props.taskId)) {
      showToast('Stop the timer to change status', 'error');
      localStatus.value = props.currentStatus;
      return;
    }

    if (!TaskStatusUtils.canTransition(props.currentStatus, newStatus)) {
      showToast('Invalid status transition', 'error');
      localStatus.value = props.currentStatus;
      return;
    }

    try {
      await taskStore.updateTaskStatus(props.taskId, newStatus);
      emit('change', newStatus);
      showToast(`Status changed to ${TaskStatusUtils.getStatusLabel(newStatus)}`, 'success');
    } catch (error) {
      console.error('[TaskStatusChanger] Failed to update status:', error);
      showToast('Failed to update status', 'error');
      localStatus.value = props.currentStatus;
    }
  }
</script>

<template>
  <div class="task-detail-status">
    <task-form-status 
      v-model="localStatus"
      @update:model-value="handleStatusChange"
    />
  </div>
</template>

<style scoped>
</style>
