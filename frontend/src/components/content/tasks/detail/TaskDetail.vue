<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import { supabase } from '@/utils/supabase';
  import TaskDetailHeader from '@/components/content/tasks/detail/TaskDetailHeader.vue';
  import TaskTimer from '@/components/content/timer/TaskTimer.vue';
  import { useTimerStore } from '@/stores/timerStore';

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

  async function handleTimerStopped(minutesSpent: number) {
    const newTotal = currentActualMinutes.value + minutesSpent;
    currentActualMinutes.value = newTotal;

    await saveActualMinutes(newTotal);

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

  watch(() => props.task.actual_minutes, (newValue) => {
    if (newValue !== undefined && newValue !== null) {
      currentActualMinutes.value = newValue;
    }
  });

  onMounted(() => {
    if (props.task.actual_minutes) {
      currentActualMinutes.value = props.task.actual_minutes;
    }
  });
</script>

<template>
  <div class="task-detail">
    {{ task.title }}
    <task-detail-header />

    <task-timer 
      :task="task"
      @timer-stopped="handleTimerStopped"
    />

    <div class="task-detail__time">
      <label>Затрачено:</label>
      <input 
        type="text" 
        :value="displayTime"  
        disabled
        :class="{ 'is-running': isTimerActive }"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
