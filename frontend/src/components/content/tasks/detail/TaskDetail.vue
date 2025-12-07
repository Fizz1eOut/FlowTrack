<script setup lang="ts">
  import type { TaskResponse } from '@/interface/task.interface';

  interface TaskDetailProps {
    task: TaskResponse
  }
  defineProps<TaskDetailProps>();
</script>

<template>
  <div>
    {{ task.title }}
  </div>
</template>

<style scoped>

</style>
