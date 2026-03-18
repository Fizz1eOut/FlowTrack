<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useTasksStore } from '@/stores/taskStore';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useWorkspaceAccessStore } from '@/stores/workspaceAccessStore';
  import VueApexCharts from 'vue3-apexcharts';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppSubtitle from '@/components/base/AppSubtitle.vue';

  const taskStore = useTasksStore();
  const workspaceStore = useWorkspaceStore();
  const workspaceAccessStore = useWorkspaceAccessStore();

  const isTeamWorkspace = computed(() =>
    workspaceStore.currentWorkspace?.type === 'team'
  );

  const workspaceId = computed(() => workspaceStore.currentWorkspaceId ?? '');

  const members = computed(() =>
    workspaceAccessStore.getMembers(workspaceId.value)
  );

  const memberStats = computed(() =>
    members.value.map(member => ({
      name: member.profile?.full_name ?? 'Unknown',
      completed: taskStore.tasks.filter(t =>
        t.assigned_to === member.user_id && t.status === 'done'
      ).length,
      total: taskStore.tasks.filter(t =>
        t.assigned_to === member.user_id
      ).length,
    })).sort((a, b) => b.completed - a.completed)
  );

  const series = computed(() => [
    { name: 'Completed', data: memberStats.value.map(m => m.completed) },
    { name: 'Total', data: memberStats.value.map(m => m.total) },
  ]);

  const options = computed(() => ({
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      background: 'transparent',
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '60%',
      },
    },
    colors: ['var(--success)', 'rgba(150, 150, 150, 0.4)'],
    xaxis: {
      categories: memberStats.value.map(m => m.name),
      tickAmount: Math.max(...memberStats.value.map(m => m.total)),
      labels: {
        formatter: (val: string) => Math.round(Number(val)).toString(),
        style: {
          fontSize: 'var(--fs-sm)',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: 'var(--fs-lg)',
        },
      },
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

  onMounted(() => {
    if (workspaceId.value) {
      workspaceAccessStore.fetchMembers(workspaceId.value);
    }
  });
</script>

<template>
  <div v-if="isTeamWorkspace" class="analytics-chart">
    <app-container>
      <app-subtitle class="analytics-chart__title">Team Performance</app-subtitle>
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

