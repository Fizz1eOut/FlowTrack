<script setup lang="ts">
  import { onMounted, ref, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useTasksStore } from '@/stores/taskStore';
  import { useProfileStore } from '@/stores/profileStore';
  import type { TaskStatus, TaskPriority, Filters } from '@/interface/task.interface';
  import type { LocationQueryValue } from 'vue-router';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppLoadingSpinner from '@/components/base/AppLoadingSpinner.vue';
  import TaskFilters from '@/components/content/tasks/TaskFilters.vue';
  import AppTaskCard from '@/components/base/AppTaskCard.vue';
  
  const profileStore = useProfileStore();
  const taskStore = useTasksStore();
  const route  = useRoute();
  const router = useRouter();

  function queryToArray(val: LocationQueryValue | LocationQueryValue[] | undefined): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter((v): v is string => v !== null);
    return [val];
  }

  const filters = ref<Filters>({
    tags: queryToArray(route.query.tags),  
    statuses: queryToArray(route.query.statuses) as TaskStatus[],
    priorities: queryToArray(route.query.priorities) as TaskPriority[],
    assigned: queryToArray(route.query.assigned),
    isRecurring: route.query.isRecurring === 'true',
    hasSubtasks: route.query.hasSubtasks === 'true',
    dateRange:   (route.query.dateRange as string) ?? null,
  });

  watch(filters, (val) => {
    const q: Record<string, string | string[]> = {};  
    if (val.tags.length) q.tags = val.tags;
    if (val.statuses.length) q.statuses = val.statuses;
    if (val.priorities.length) q.priorities = val.priorities;
    if (val.assigned.length) q.assigned = val.assigned;
    if (val.isRecurring) q.isRecurring = 'true';
    if (val.hasSubtasks) q.hasSubtasks = 'true';
    if (val.dateRange) q.dateRange = val.dateRange;
    router.replace({ query: q });
  }, { deep: true });

  const availableTags = computed(() =>
    [...new Set(taskStore.tasks.flatMap(t => t.tags || []))]
  );

  const availableStatuses = computed(() => 
    [...new Set(taskStore.tasks.map(t => t.status))]
  );

  const availablePriorities = computed(() =>
    [...new Set(taskStore.tasks.map(t => t.priority))]
  );
  const availableAssigned = computed(() =>
    [...new Set(taskStore.tasks.map(t => t.assigned_to).filter((v): v is string => v !== null))]
  );

  const assignedOptions = computed(() =>
    availableAssigned.value.map(id => ({
      id,
      name: profileStore.getProfile(id)?.full_name || 'unknown'
    }))
  );

  function matchesDateFilter(dueDate: string | null, dateRange: string): boolean {
    const now = new Date();
    const due = dueDate ? new Date(dueDate) : null;

    switch (dateRange) {
      case 'overdue':   return !!due && due < now;
      case 'today':     return !!due && due.toDateString() === now.toDateString();
      case 'this_week': {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + 7);
        return !!due && due >= now && due <= weekEnd;
      }
      default: return true;
    }
  }

  const filteredTasks = computed(() => {
    return taskStore.tasks.filter(task => {
      if (filters.value.tags.length && !filters.value.tags.some(t => task.tags?.includes(t)))
        return false;
      if (filters.value.statuses.length && !filters.value.statuses.includes(task.status))
        return false;
      if (filters.value.priorities.length && !filters.value.priorities.includes(task.priority))
        return false;
      if (filters.value.assigned.length && (!task.assigned_to || !filters.value.assigned.includes(task.assigned_to)))
        return false;  
      if (filters.value.isRecurring && !task.is_recurring) return false;
      if (filters.value.hasSubtasks && !task.subtasks?.length) return false;
      if (filters.value.dateRange && !matchesDateFilter(task.due_date, filters.value.dateRange)) return false;

      return true;
    }); 
  });

  onMounted(async () => {
    await taskStore.fetchTasks();
  });
</script>

<template>
  <div class="tasks-view">  
    <div class="tasks-view__header">
      <app-subtitle>Tasks</app-subtitle>
      <p class="tasks-view__text">Manage your tasks</p>
    </div>

    <app-loading-spinner v-if="taskStore.loading" size="sm" text="Loading tasks..." />
    <p v-else-if="taskStore.tasks.length === 0">No tasks found.</p>
    <div v-else class="tasks-view__body">
      <task-filters
        v-model="filters"
        :tags="availableTags"
        :statuses="availableStatuses"
        :priorities="availablePriorities"
        :assigned="assignedOptions"
      />
      <ul class="tasks-view__list">
        <li 
          v-for="task in filteredTasks"
          :key="task.id" 
          class="tasks-view__item"
        >
          <app-task-card :task="task"/>
        </li>
        <p v-if="filteredTasks.length === 0 && taskStore.tasks.length > 0">
          No tasks match the selected filters.
        </p>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  .tasks-view__list {
    margin-top: var(--space-2xl);
  }
  .tasks-view__header {
    margin-bottom: var(--space-lg);
  }
</style>
