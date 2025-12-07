<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import AppContainer from '@/components/base/AppContainer.vue';
  import TaskCardHeader from '@/components/content/tasks/card/TaskCardHeader.vue';
  import TaskCardMeta from '@/components/content/tasks/card/TaskCardMeta.vue';
  import TaskCardTags from '@/components/content/tasks/card/TaskCardTags.vue';
  import AppTaskProgress from '@/components/base/AppTaskProgress.vue';
  import TaskDetailsModal from '@/components/content/tasks/TaskDetailsModal.vue';

  interface TaskCardProps {
    task: TaskResponse;
  }
  const props = defineProps<TaskCardProps>();

  const isCompleted = computed(() => TaskStatusUtils.isCompleted(props.task.status));
  const isOpen = ref(false);

  const openModal = () => {
    isOpen.value = true;
  };
  const closeModal = () => {
    isOpen.value = false;
  };
</script>

<template>
  <div class="task-card" @click="openModal">
    <app-container size="md">
      <div class="task-card__body" :class="{'completed': isCompleted}">
        <task-card-header :task="task" />
        <task-card-meta :task="task" />
        <task-card-tags :task="task" />
        <app-task-progress :task="task" />
      </div>
    </app-container>
    <task-details-modal 
      :is-open="isOpen" 
      :task="task"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
  .task-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .task-card__body > *:not(:last-child) {
    margin-bottom: var(--radius-sm);
  }
  .completed {
    opacity: 0.4;
  }
</style>
