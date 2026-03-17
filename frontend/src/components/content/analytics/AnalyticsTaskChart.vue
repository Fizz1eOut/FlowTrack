<script setup lang="ts">
  import { computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import VueApexCharts from 'vue3-apexcharts';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';
  import AppContainer from '@/components/base/AppContainer.vue';

  interface AnalyticsTaskChart {
    task: TaskResponse[]
  }
  const props = defineProps<AnalyticsTaskChart>();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  function getWeekOfMonth(date: Date): number {
    const firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).getUTCDay();
    return Math.ceil((date.getUTCDate() + firstDay) / 7);
  }

  function getWeeksInMonth(): number {
    const today = new Date();;
    const currentWeek = getWeekOfMonth(today);
    return currentWeek;
  }

  const weeksCount = getWeeksInMonth();

  const weeklyData = computed(() => {
    const weeks = Array(weeksCount).fill(0);
    const planned = Array(weeksCount).fill(0);

    props.task.forEach(task => {
      const created = new Date(task.created_at);
      const taskMonth = created.getUTCMonth();
      const taskYear = created.getUTCFullYear();

      if (taskMonth !== currentMonth || taskYear !== currentYear) return;

      const week = getWeekOfMonth(created) - 1;
      if (week < 0 || week >= weeksCount) return;

      if (planned[week] !== undefined) planned[week]++;

      if (task.completed_at) {
        const completed = new Date(task.completed_at);
        if (completed.getUTCMonth() === currentMonth && completed.getUTCFullYear() === currentYear) {
          const completedWeek = getWeekOfMonth(completed) - 1;
          if (completedWeek >= 0 && completedWeek < weeksCount && weeks[completedWeek] !== undefined) {
            weeks[completedWeek]++;
          }
        }
      }
    });

    return { completed: weeks, planned };
  });

  const series = computed(() => [
    { name: 'Completed', data: weeklyData.value.completed },
    { name: 'Planned', data: weeklyData.value.planned },
  ]);
  
  console.log(series.value);
  console.log(props.task.map(t => ({ created_at: t.created_at, completed_at: t.completed_at })));
  const options = computed(() => ({
    chart: {
      type: 'line' as const,
      toolbar: { show: false },
      background: 'transparent',
      zoom: { enabled: false },
    },
    colors: ['var(--success)', 'var(--color-gray)'],
    stroke: {
      curve: 'smooth' as const,
      width: [2, 2],
      dashArray: [0, 6],
    },
    markers: {
      size: 5,
    },
    xaxis: {
      categories: Array.from({ length: weeksCount }, (_, i) => `Week ${i + 1}`),
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
    },
    legend: {
      position: 'bottom' as const,
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.1)',
    },
  }));
</script>

<template>
  <div class="analytics-chart">
    <app-container>
      <app-subtitle class="analytics-chart__title">Completing tasks</app-subtitle>
      <vue-apex-charts
        type="line"
        height="300"
        :options="options"
        :series="series"
      />
    </app-container>
  </div>
</template>

<style scoped>
  .analytics-chart {
    margin-top: var(--space-2xl);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .analytics-chart__title {
    margin-bottom: var(--space-xs);
  }
</style>
