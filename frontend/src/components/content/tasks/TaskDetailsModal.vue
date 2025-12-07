<script setup lang="ts">
  import { computed } from 'vue';
  import AppModal from '@/components/base/AppModal.vue';
  import TaskDetail from '@/components/content/tasks/detail/TaskDetail.vue';
  import type { TaskResponse } from '@/interface/task.interface';


  interface TaskDetailsModalProips {
    isOpen: boolean;
    task: TaskResponse;
  }
  const props = defineProps<TaskDetailsModalProips>();

  const emit = defineEmits<{
    close: []
  }>();

  const modalValue = computed({
    get: () => props.isOpen,
    set: (value: boolean) => {
      if (!value) {
        emit('close');
      }
    }
  });

  const handleClose = () => {
    emit('close');
  };
</script>

<template>
  <app-modal 
    v-model="modalValue" 
    :scrollable="true"
  >
    <task-detail :task="task" @close="handleClose" />
  </app-modal>
</template>

<style scoped>

</style>
