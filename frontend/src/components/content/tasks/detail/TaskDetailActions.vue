<script setup lang="ts">
  import { ref } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { supabase } from '@/utils/supabase';
  import TaskTimer from '@/components/content/timer/TaskTimer.vue';

  interface TaskDetailActionsProps  {
    task: TaskResponse;
  }
  const props = defineProps<TaskDetailActionsProps>();
  
  const emit = defineEmits<{
    'minutes-updated': [minutes: number]
  }>();

  const currentActualMinutes = ref<number>(props.task.actual_minutes || 0);

  async function handleTimerStopped(minutesSpent: number) {
    const newTotal = currentActualMinutes.value + minutesSpent;
    currentActualMinutes.value = newTotal;

    await saveActualMinutes(newTotal);
    emit('minutes-updated', newTotal);

    console.log('[TaskDetail] Timer stopped, total minutes:', newTotal);
  }

  async function saveActualMinutes(minutes: number) {
    if (!props.task.id) return;
  
    const { error } = await supabase
      .from('tasks')
      .update({ actual_minutes: minutes })
      .eq('id', props.task.id);
    
    if (error) {
      console.error('[TaskDetail] Saving error:', error);
    } else {
      console.log('[TaskDetail] Saved actual_minutes:', minutes);
    }
  }
</script>

<template>
  <div class="task-detail-actions">
    <task-timer 
      :task="task"
      @timer-stopped="handleTimerStopped"
    />
  </div>
</template>

<style scoped>
  .task-detail-actions {
    margin-top: var(--space-lg)
  }
</style>
