<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { useTimerStore } from '@/stores/timerStore';
  import TaskCardStatus from '@/components/content/tasks/card/TaskCardStatus.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  interface TaskDetailTimerHistoryProps {
    task: TaskResponse;
  }
  const props = defineProps<TaskDetailTimerHistoryProps>();

  const timerStore = useTimerStore();
  const history = computed(() => timerStore.history);

  const totalMinutes = computed(() => {
    return history.value.reduce((sum, r) => sum + r.duration_minutes, 0);
  });

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;  
  }

  const sessionsLabel = computed(() => 
    history.value.length === 1 ? 'Session' : 'Sessions'
  );

  watch(() => timerStore.lastSession, async (newSession) => {
    if (newSession && newSession.taskId === props.task.id) {
      console.log('[TaskDetailTimerHistory] Detected new session, refreshing history');
      
      // Даем небольшую задержку для завершения записи
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await timerStore.fetchHistoryByTask(props.task.id);
      console.log('[TaskDetailTimerHistory] History refreshed, records:', history.value.length);
    }
  }, { deep: true });

  onMounted(async () => {
    if (props.task.id) {
      await timerStore.fetchHistoryByTask(props.task.id);
    }
  });
</script>

<template>
  <div class="timer-history">
    <div class="timer-history__header">
      <div class="timer-history__card">
        <div class="timer-history__content">
          <div class="timer-history__label">  
            <app-icon 
              name="completed"
              size="var(--fs-lg)"
              color="var(--accent)"
            />
            {{ sessionsLabel  }}
          </div>
          <div class="timer-history__value value--sessions">{{ history.length }}</div>
        </div>
      </div>
      <div class="timer-history__card">
        <div class="timer-history__content">
          <div class="timer-history__label">
            <app-icon 
              name="timer"
              size="var(--fs-lg)"
              color="var(--primary)"
            />
            Total Time
          </div>
          <div class="timer-history__value value--time">{{ formatDuration(totalMinutes) }}</div>
        </div>
      </div>
    </div>

    <div class="timer-history__timeline timeline">
      <div v-for="h in history" :key="h.id" class="timeline-item">
        <div class="timeline-item__marker"></div>
        <div class="timeline-item__content">
          <div class="timeline-item__header">
            <div class="timeline-item__time"><span>Start:</span> {{ formatDate(h.started_at) }}</div>
            <task-card-status :task-id="task.id" />
          </div>
          <div class="timeline-item__duration"><span>Duration:</span> {{ formatDuration(h.duration_minutes) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .timer-history {
    margin-top: var(--space-lg);
  } 
  .timer-history__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .timer-history__card {
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    max-width: 100%;
    width: 100%;
    background-color: var(--color-white);
    box-shadow: var(--shadow-lg);
  }
  .timer-history__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 10px;
  }
  .timer-history__value {
    font-size: var(--fs-3xl);
    font-weight: var(--fw-medium);  
  }
  .timer-history__label {
    font-size: var(--fs-md);
    color: var(--color-black);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .value--sessions {
    color: var(--accent);
  }
  .value--time {
    color: var(--primary);
  }
  .timeline {
    margin-top: var(--space-lg);
    position: relative;
    padding-left: 30px;
  }
  .timeline::before {
    content: '';
    position: absolute;
    left: 9px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background-color: var(--border);
  }
  .timeline-item {
    position: relative;
  }
  .timeline-item:not(:last-child) {
    margin-bottom: 20px;
  }
  .timeline-item__marker {
    position: absolute;
    left: -26px;
    top: 6px;
    width: 12px;
    height: 12px;
    background-color: var(--primary);
    border: 2px solid var(--color-white);
    border-radius: var(--radius-full);
    box-shadow: 0 0 0 2px var(--primary);
  }
  .timeline-item__content {
    background-color: var(--color-white);
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
  }
  .timeline-item__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .timeline-item__time {
    font-size: var(--fs-sm);
    color: var(--color-gray);
    font-weight: var(--fw-medium);
  }
  .timeline-item__duration {
    font-size: var(--fs-lg);
    font-weight: var(--fw-semibold);
    color: var(--primary);
  }
  .timeline-item__duration span {
    font-size: var(--fs-sm);
    color: var(--color-gray);
    font-weight: var(--fw-medium);
  }
   .badge--backlog {
    background-color: #F3F4F6;
    color: #6B7280;
  }
  .badge--planned {
    background-color: #DBEAFE;
    color: #1E40AF;
  }
  .badge--in_progress {
    background-color: #FEF3C7;
    color: #B45309;
  }
  .badge--done {
    background-color: #D1FAE5;
    color: #065F46;
  }
  .badge--archived {
    background-color: #F9FAFB;
    color: #9CA3AF;
  }
  @media (max-width: 380px) {
    .timer-history__header {
      flex-direction: column;
    }
  }
</style>
