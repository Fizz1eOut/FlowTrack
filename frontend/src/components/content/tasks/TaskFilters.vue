<script setup lang="ts">
  import type { TaskStatus, TaskPriority, Filters } from '@/interface/task.interface';
  import AppButton from '@/components/base/AppButton.vue';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import AppSwitch from '@/components/inputs/AppSwitch.vue';
  import AppContainer from '@/components/base/AppContainer.vue';

  const props = defineProps<{
    modelValue: Filters
    tags: string[]
    statuses: TaskStatus[]
    priorities: TaskPriority[]
    assigned: { id: string; name: string }[]
  }>();
  const emit = defineEmits<{ 'update:modelValue': [filters: Filters] }>();

  const dateOptions: { value: string; label: string }[] = [
    { value: 'overdue',    label: 'Overdue' },
    { value: 'today',      label: 'Today' },
    { value: 'this_week',  label: 'This week' },
  ];

  function toggleArray(key: | 'tags' | 'statuses' | 'priorities' | 'assigned', value: string) {
    const current = props.modelValue[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    emit('update:modelValue', { ...props.modelValue, [key]: updated });
  }

  function toggleBool(key: 'isRecurring' | 'hasSubtasks', value: boolean) {
    emit('update:modelValue', { ...props.modelValue, [key]: value });
  }

  function setDateRange(value: string) {
    const next = props.modelValue.dateRange === value ? null : value;
    emit('update:modelValue', { ...props.modelValue, dateRange: next });
  }
</script>

<template>
  <div class="filters">
    <app-container size="md">
      <div class="filters__body">
        <div v-if="statuses" class="filter-group__status filter-group__item">
          <div class="filter-group__name">Status</div>
          <app-checkbox
            v-for="status in statuses"
            :key="status"
            :model-value="modelValue.statuses.includes(status)"
            @update:model-value="toggleArray('statuses', status)"
            class="filter-group__content"
          >
            {{ status }}
          </app-checkbox>
        </div>

        <div v-if="priorities" class="filter-group__priority filter-group__item">
          <div class="filter-group__name">Priority</div>
          <app-checkbox
            v-for="priority in priorities"
            :key="priority"
            :model-value="modelValue.priorities.includes(priority)"
            @update:model-value="toggleArray('priorities', priority)"
            class="filter-group__content"
          >
            {{ priority }}
          </app-checkbox>
        </div>

        <div v-if="assigned.length > 0" class="filter-group__priority filter-group__item">
          <div class="filter-group__name">Assigned</div>
          <app-checkbox
            v-for="a in assigned"
            :key="a.id"
            :model-value="modelValue.assigned.includes(a.id)"
            @update:model-value="toggleArray('assigned', a.id)"
            class="filter-group__content"
          >
            {{ a.name }}
          </app-checkbox>
        </div>

        <div v-if="tags" class="filter-group__tags filter-group__item">
          <div class="filter-group__name">Tags</div>
          <div class="tags__group">
            <app-button
              v-for="tag in tags"
              :key="tag"
              :class="{ active: modelValue.tags.includes(tag) }"
              @click="toggleArray('tags', tag)"
              class="tags"
            >
              #{{ tag }}
            </app-button>
          </div>
        </div>

        <div v-if="dateOptions.length > 0" class="filter-group__date filter-group__item">
          <div class="filter-group__name">Due date</div>
          <div class="tags__group">
            <app-button
              v-for="opt in dateOptions"
              :key="opt.value"
              :class="{ active: modelValue.dateRange === opt.value }"
              @click="setDateRange(opt.value)"
              class="tags"
            >
              {{ opt.label }}
            </app-button>
          </div>
        </div>
      </div>

      <div class="filter-toggles">         
        <div class="filter-toggle__item">
          <app-switch
            :model-value="modelValue.isRecurring"
            @update:model-value="(v) => toggleBool('isRecurring', v)"
          />
          <span>Recurring tasks</span>
        </div>
        <div class="filter-toggle__item">
          <app-switch
            :model-value="modelValue.hasSubtasks"
            @update:model-value="(v) => toggleBool('hasSubtasks', v)"
          />
          <span>With subtasks</span>
        </div>
      </div>
    </app-container>
  </div>
</template>

<style scoped>
  .filters {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .filters__body {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }
  .filter-group__item {
    flex: 1;
  }
   .filter-group__item:not(:last-child) {
    border-right: 1px solid var(--border);
   }
  .filter-toggles {
    padding-top: 20px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .filter-toggle__item {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .filter-group__name {
    margin-bottom: var(--space-xs);
    font-size: var(--fs-lg);
    font-weight: var(--fw-medium);
  }
  .tags__group {
    display: flex;
    flex-wrap: wrap;
    row-gap: 10px;
    margin-bottom: var(--space-xs);
  }
  .tags {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: auto;
    max-height: 30px;
    padding: 5px 10px;
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    transition: box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out, color 0.3s ease-in-out;
  }
  .tags.active {
    background-color: var(--primary);
    color: var(--color-white);
    box-shadow: var(--shadow-glow);
  }
  .filter-group__content:not(:last-child) {
    margin-bottom: var(--space-xs);
  }
  @media (max-width: 960px) {
    .filter-group__item {
      flex: 1 0 auto;
    }
    .filter-group__item:not(:last-child) {
      border-right: none;
    }
  }
  @media (max-width: 768px) {
    .filter-group__item {
      flex: 0 1 auto;
    }
  }
  @media (max-width: 400px) {
    .filter-toggles {
      flex-wrap: wrap;
    }
    .tags__group {
      max-width: 280px;
    }
  }
</style>
