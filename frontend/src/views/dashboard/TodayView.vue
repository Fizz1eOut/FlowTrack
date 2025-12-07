<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import { useTasksStore } from '@/stores/taskStore';
  import { useAuthStore } from '@/stores/authStore';
  import AppLoadingSpinner from '@/components/base/AppLoadingSpinner.vue';
  import AppTaskCard from '@/components/base/AppTaskCard.vue';
  import ProgressSection from '@/components/content/progress/ProgressSection.vue';
  import AppTitle from '@/components/base/AppTitle.vue';

  const taskStore = useTasksStore();
  const authStore = useAuthStore();

  const formattedDate = computed(() => {
    const now = new Date();
    const timezone = authStore.userProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    });
  });

  onMounted(async () => {
    await taskStore.fetchTasks();
  });
</script>

<template>
  <app-loading-spinner v-if="taskStore.loading" size="sm" text="Loading tasks..." />

  <div v-else-if="taskStore.todayTasks.length === 0" class="today__empty">You have no tasks scheduled for today.</div>

  <div v-else>
    <div class="today">
      <div class="today__group">
        <div class="today__header">
          <app-title>
            Today’s Schedule
          </app-title>
          <p class="today__date">{{ formattedDate }}</p>
        </div>
        <div class="today__body">
          <div class="today__items">
            <div 
              v-for="task in taskStore.todayTasks" 
              :key="task.id"
              class="today__item"
            >
              <app-task-card :task="task" />
            </div>
          </div>
        </div>
      </div>
      <div class="today__progress">
        <progress-section class="progress-section" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .today {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .today__empty {
    margin-top: var(--space-2xl);
    text-align: center;
    font-size: var(--fs-xl);
  }
  .today__date {
    font-size: var(--fs-lg);
    color: var(--color-black);
  }
  .today__body {
    margin-top: var(--space-xl);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .today__item:not(:last-child) {
    margin-bottom: var(--space-sm);
  }
  .today__group,
  .today__items {
    width: 100%;
  }
  .today__progress {
    max-width: 300px;
    width: 100%;
  }
  @media (max-width: 990px) {
    .today {
      flex-wrap: wrap;
      row-gap: 40px;
    }
    .today__group {
      order: 1;
    }
     .today__progress {
      max-width: 100%;
     }
  }
</style>
