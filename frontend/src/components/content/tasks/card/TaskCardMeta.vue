<script setup lang="ts">
  import { computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';  
  import AppIcon from '@/components/base/AppIcon.vue';
  import TaskCardStatus from '@/components/content/tasks/card/TaskCardStatus.vue';

  interface TaskCardMetaProps {
    task: TaskResponse;
  }
  const props = defineProps<TaskCardMetaProps>();

  function stripTime(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const formatted = computed(() => {
    if (!props.task.due_date || !props.task.due_time) return '';

    const date = new Date(props.task.due_date);
    const today = stripTime(new Date());

    const taskDay = stripTime(date);

    const diffDays = Math.round(
      (taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const [h, m] = props.task.due_time.split(':');
    const time = `${h}:${m}`;

    if (diffDays === 0) {
      return time;
    }

    if (diffDays === 1) {
      return `Tomorrow at ${time}`;
    }

    const formattedDate = date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return `${formattedDate} at ${time}`;
  });
</script>

<template>
  <div class="task-card-meta">
    <div class="task-card-meta__group">
      <div v-if="task.workspace" class="task-card-meta__workspace">
        <app-icon 
          :name="task.workspace.type === 'personal' ? 'user' : 'users'"
          size="var(--fs-md)"
          color="var(--color-gray)"
        />
        {{ task.workspace.name }}
      </div>

      <div class="task-card-meta__date-time">
        <app-icon 
          name="time"
          size="var(--fs-md)"
          color="var(--color-gray)"
        />
        {{ formatted }}
      </div>

      <task-card-status :status="task.status" />
    </div>
  </div>
</template>

<style scoped>
 .task-card-meta__group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .task-card-meta__workspace {
    font-size: var(--fs-md);
    color: var(--color-black);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .task-card-meta__date-time {
    display: flex;
    gap: 4px;
  }
  .task-card-meta__status {
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--gradient-subtle);
  }
</style>
