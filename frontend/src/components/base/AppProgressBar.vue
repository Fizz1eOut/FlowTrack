<script setup lang="ts">
  interface ProgressBarProps {
    percentage: number;
  }
  
  defineProps<ProgressBarProps>();
</script>

<template>
  <div class="progress-bar">
    <div class="progress-bar__container">
      <div class="progress-bar__bar">
        <div class="progress-bar__track"></div>
        <div 
          class="progress-bar__fill"
          :style="{ width: percentage + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .progress-bar__bar {
    position: relative;
    width: 100%;
    height: 8px;
    overflow: hidden;
    border-radius: var(--radius-sm);
  }
  .progress-bar__track {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #E5E7EB;
  }
  .progress-bar__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: var(--success);
    transition: width 0.3s ease-in-out;
  }
</style>
