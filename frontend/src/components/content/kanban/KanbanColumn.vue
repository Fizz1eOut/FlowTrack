<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import type { TaskStatus, TaskResponse } from '@/interface/task.interface';
  import { TaskStatusUtils } from '@/utils/taskStatus';
  import { VueDraggable } from 'vue-draggable-plus';
  import KanbanCard from '@/components/content/kanban/KanbanCard.vue';
  import AppButton from '@/components/base/AppButton.vue';

  interface KanbanColumnProps {
    status: TaskStatus;
    tasks: TaskResponse[];
  }

  const props = defineProps<KanbanColumnProps>();
  const emit = defineEmits<{
    taskDropped: [taskId: string, status: TaskStatus]
  }>();

  const localTasks = ref([...props.tasks]);
  const isExpanded  = ref(false);

  const visibleTasks = computed(() =>
    isExpanded.value ? localTasks.value : localTasks.value.slice(0, 2)
  );

  const hasMore = computed(() => localTasks.value.length > 2);

  watch(() => props.tasks, (newTasks) => {
    localTasks.value = [...newTasks];
  });

  function onEnd(event: { item: HTMLElement; to: HTMLElement }) {
    const taskId = event.item.dataset.taskId;
    const targetStatus = event.to.dataset.status as TaskStatus;

    if (!taskId || !targetStatus) return;
    if (targetStatus === props.status) return;

    emit('taskDropped', taskId, targetStatus);
  }
</script>

<template>  
  <div class="kanban__column">
    <div
      class="kanban__column-header"
      :style="{ borderTop: `3px solid ${TaskStatusUtils.getStatusColor(status)}` }"
    >
      <div class="kanban-column__status">{{ TaskStatusUtils.getStatusLabel(status) }}</div>
      <div 
        class="kanban-column__count" 
        :style="{ background: `${TaskStatusUtils.getStatusColor(status)}` }"
      >
        {{ localTasks.length }}
      </div>
    </div>

    <vue-draggable
      v-model="localTasks"
      group="tasks"
      :animation="150"
      :data-status="status"
      @end="onEnd"
      class="kanban__cards"
    >
      <kanban-card
        v-for="task in visibleTasks"
        :key="task.id"
        :task="task"
        :data-task-id="task.id"
      />

      <div class="kanban__btn">
        <app-button 
          v-if="hasMore" 
          @click="isExpanded = !isExpanded"
          :primary="!isExpanded"
          :secondary="isExpanded"
          class="btn"
        >
          {{ isExpanded ? 'Show less' : `Show more (${localTasks.length - 2})` }}
        </app-button>
      </div>
    </vue-draggable>
  </div>
</template>

<style scoped>
  .kanban__column {
    flex: 1 1 25%;
    min-width: 430px;
    width: 0;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);

    display: flex;
  flex-direction: column;
  }
  .kanban__column-header {
    padding: var(--space-sm) 0; 
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .kanban-column__status {
    font-size: var(--fs-md);
    font-weight: var(--fw-medium);
    color: var(--color-black);
  }
  .kanban-column__count {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    font-size: var(--fs-md);
    color: var(--color-white);
    background-color: var(--color-gray);
  }
  .kanban__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: var(--space-sm);
  }
  .btn {
    max-width: 160px;
  }
  .kanban__cards {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
    height: 100%; 
  }
  @media (max-width: 768px) {
    .kanban__column {
      min-width: 320px;
    } 
  }
</style>
