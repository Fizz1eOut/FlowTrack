<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { useTimerStore } from '@/stores/timerStore';
  import TaskDetailHeader from '@/components/content/tasks/detail/TaskDetailHeader.vue';
  import TaskDetailActions from '@/components/content/tasks/detail/TaskDetailActions.vue';
  import TaskDetailOverview from '@/components/content/tasks/detail/TaskDetailOverview.vue';
  import TaskDetailTimerHistory from '@/components/content/tasks/detail/TaskDetailTimerHistory.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppTabs from '@/components/base/AppTabs.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  interface TaskDetailProps {
    task: TaskResponse
  }
  const props = defineProps<TaskDetailProps>();

  const timerStore = useTimerStore();
  const currentActualMinutes = ref<number>(props.task.actual_minutes || 0);

  const formattedSpentTime = computed(() => {
    const totalMinutes = currentActualMinutes.value;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    if (minutes > 0) {
      return `${minutes} min`;
    }
    return '0 min';
  });

  const isTimerActive = computed(() => {
    return timerStore.isTimerActiveForTask(props.task.id);
  });

  const displayTime = computed(() => {
    if (isTimerActive.value) {
      const currentSeconds = timerStore.currentElapsedSeconds;
      const totalSeconds = (currentActualMinutes.value * 60) + currentSeconds;
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours} h ${minutes} min ${seconds} sec`;
      }
      if (minutes > 0) {
        return `${minutes} min ${seconds} sec`;
      }
      return `${seconds} sec`;
    }
    
    return formattedSpentTime.value;
  });

  watch(() => props.task.actual_minutes, (newValue) => {
    if (newValue !== undefined && newValue !== null) {
      currentActualMinutes.value = newValue;
    }
  });

  onMounted(async () => {
    if (props.task.actual_minutes) {
      currentActualMinutes.value = props.task.actual_minutes;
    }
    if (props.task.id) {
      await timerStore.fetchHistoryByTask(props.task.id);
    }
  });

  function handleMinutesUpdated(newMinutes: number) { 
    currentActualMinutes.value = newMinutes;
  }

  const tabs = [
    { label: 'Description', slotName: 'overview' },
    { label: 'Timer History', slotName: 'timer-history' }
  ];
</script>

<template>
  <div class="task-detail">
    <div class="task-detail__header">
      <app-subtitle class="task-detail__title">
        {{ task.title }}
      </app-subtitle>
      <app-button @click="$emit('close')" class="task-detail__btn--cross">
        <app-icon 
          name="cross"
          size="var(--fs-xl)"
          color="var(--color-gray)"
        />
      </app-button>
    </div>

    <task-detail-header :task="task" />

    <app-tabs
      :tabs="tabs"
    >
      <template #overview>
        <task-detail-actions 
          :task="task"
          @minutes-updated="handleMinutesUpdated"
        />
        <task-detail-overview 
          :task="task"
          :display-time="displayTime"
          :is-timer-active="isTimerActive"
        />
      </template>

      <template #timer-history>
        <task-detail-timer-history 
          :task="task"
        />
      </template>
    </app-tabs>
  </div>
</template>

<style scoped>
  .task-detail__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .task-detail__title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }
  .task-detail__btn--cross {
    width: var(--fs-xl);
    height: var(--fs-xl);
  }
</style>
