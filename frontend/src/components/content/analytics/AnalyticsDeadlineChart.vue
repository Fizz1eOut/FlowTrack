<script setup lang="ts">
  import { computed } from 'vue';
  import type { TaskResponse } from '@/interface/task.interface';
  import VueApexCharts from 'vue3-apexcharts';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';

  interface AnalyticsDeadlineChartProps {
    task: TaskResponse[]
  }

  const props = defineProps<AnalyticsDeadlineChartProps>();

  const now = new Date();
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  function getWeekOfMonth(date: Date): number {
    const firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).getUTCDay();
    return Math.ceil((date.getUTCDate() + firstDay) / 7);
  }

  function getWeeksInMonth(): number {
    return getWeekOfMonth(now);
  }

  function getDueDateTime(task: TaskResponse): Date {
    const due = new Date(task.due_date as string);

    if (task.due_time) {
      const parts = task.due_time.split(':').map(Number);
      const hours = parts[0] ?? 0;
      const minutes = parts[1] ?? 0;
      const seconds = parts[2] ?? 0;
      due.setHours(hours, minutes, seconds, 0);
    } else {
      due.setHours(23, 59, 59, 999);
    }

    return due;
  }

  const weeksCount = getWeeksInMonth();

  const weeklyData = computed(() => {
    const onTime = Array(weeksCount).fill(0);
    const overdue = Array(weeksCount).fill(0);

    props.task.forEach(task => {
      if (!task.due_date) return;

      const due = getDueDateTime(task);
      if (due.getUTCMonth() !== currentMonth || due.getUTCFullYear() !== currentYear) return;

      const week = getWeekOfMonth(due) - 1;
      if (week < 0 || week >= weeksCount) return;

      if (task.status === 'done' && task.completed_at) {
        const completed = new Date(task.completed_at);
        if (completed <= due) {
          if (onTime[week] !== undefined) onTime[week]++;
        } else {
          if (overdue[week] !== undefined) overdue[week]++;
        }
      } else if (task.status !== 'done' && due < now) {
        if (overdue[week] !== undefined) overdue[week]++;
      }
    });

    return { onTime, overdue };
  });

  const series = computed(() => [
    { name: 'On-Time', data: weeklyData.value.onTime },
    { name: 'Overdue', data: weeklyData.value.overdue },
  ]);

  const options = computed(() => ({
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      background: 'transparent',
      zoom: { enabled: false },
      stacked: false,
    },
    colors: ['var(--success)', 'var(--error)'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      },
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
    dataLabels: {
      enabled: false,
    },
  }));
</script>

<template>
  <div class="analytics-chart">
    <app-container>
      <app-subtitle class="analytics-chart__title">On-Time vs Overdue</app-subtitle>
      <vue-apex-charts
        type="bar"
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
