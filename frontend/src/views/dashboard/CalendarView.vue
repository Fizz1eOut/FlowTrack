<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import FullCalendar from '@fullcalendar/vue3';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import type { CalendarOptions, EventClickArg } from '@fullcalendar/core';
  import { useTasksStore } from '@/stores/taskStore';
  import { taskToCalendarEvent } from '@/utils/calendar';
  import { useWorkspaceStore } from '@/stores/workspaceStore';

  const workspaceStore = useWorkspaceStore();
  const tasksStore = useTasksStore();
  const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);
  const currentView = ref<'timeGridDay' | 'timeGridWeek'>('timeGridWeek');
  const currentRangeLabel = ref('');

  const views = [
    { label: 'Week', value: 'timeGridWeek' },
    { label: 'Day',  value: 'timeGridDay'  },
  ] as const;

  const tooltip = ref<{
    visible: boolean
    x: number
    y: number
    task: any
    timeRange: string
    duration: string
  }>({
    visible: false,
    x: 0,
    y: 0,
    task: null,
    timeRange: '',
    duration: '',
  });

  function buildTimeRange(start?: Date | null, end?: Date | null): string {
    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (start && end) return `${fmt(start)} — ${fmt(end)}`;
    if (start) return fmt(start);
    return '';
  }

  const calendarEvents = computed(() =>
    tasksStore.tasks
      .map(taskToCalendarEvent)
      .filter((e): e is NonNullable<typeof e> => e !== null)
  );

  const calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: currentView.value,
    firstDay: 1,
    headerToolbar: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '23:00:00',
    slotDuration: '00:30:00',
    eventMinHeight: 28,
    allDaySlot: false,
    nowIndicator: true,
    height: 'auto',
    eventClick: handleEventClick,

    dayHeaderContent: (arg) => {
      const weekday = arg.date.toLocaleDateString('en-GB', { weekday: 'short' });
      const day = String(arg.date.getDate()).padStart(2, '0');
      const month = String(arg.date.getMonth() + 1).padStart(2, '0');
      return { html: `<span>${weekday} ${day}.${month}</span>` };
    },

    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },

    datesSet: (info) => {
      currentRangeLabel.value = info.view.title;
    },

    eventContent: (arg) => {
      const task = arg.event.extendedProps.task;
      const start = arg.event.start;
      const end = arg.event.end;

      const durationMin = start && end
        ? (end.getTime() - start.getTime()) / 60_000
        : 0;

      const fmt = (d: Date) =>
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      const timeRange = start && end ? `${fmt(start)} — ${fmt(end)}` : '';
      const duration = task.estimate_minutes ? `${task.estimate_minutes}m` : '';

      if (durationMin <= 30) {
        return {
          html: `
        <div class="fc-event-compact">
          <div class="fc-event-title">${arg.event.title}</div>
        </div>
      `,
        };
      }

      if (durationMin <= 60) {
        return {
          html: `
        <div class="fc-event-compact">
          <div class="fc-event-title">${arg.event.title}</div>
          ${timeRange ? `<div class="fc-event-meta">${timeRange}</div>` : ''}
        </div>
      `,
        };
      }

      return {
        html: `
      <div class="fc-event-compact">
        <div class="fc-event-title">${arg.event.title}</div>
        ${timeRange ? `<div class="fc-event-meta">${timeRange}</div>` : ''}
        ${duration ? `<div class="fc-event-meta">Duration: ${duration}</div>` : ''}
        ${task.is_recurring ? '<div class="fc-event-recurring">↻ Repeating task</div>' : ''}
      </div>
    `,
      };
    },

    eventMouseEnter: (info) => {
      const task = info.event.extendedProps.task;
      const rect = (info.el as HTMLElement).getBoundingClientRect();
      const tooltipWidth = 226;
      const viewportWidth = window.innerWidth;

      const hasSpaceOnLeft = rect.left > tooltipWidth;
      const hasSpaceOnRight = rect.right + tooltipWidth + 8 < viewportWidth;

      let x: number;
      if (hasSpaceOnLeft) {
        x = rect.left - tooltipWidth;
      } else if (hasSpaceOnRight) {
        x = rect.right + 8;
      } else {
        x = viewportWidth - tooltipWidth - 8;
      }

      const tooltipHeight = 140;
      const y = rect.top + window.scrollY + tooltipHeight > document.body.scrollHeight
        ? rect.bottom + window.scrollY - tooltipHeight
        : rect.top + window.scrollY;

      tooltip.value = {
        visible: true,
        x,
        y,
        task,
        timeRange: buildTimeRange(info.event.start, info.event.end),
        duration: task.estimate_minutes ? `${task.estimate_minutes}m` : '',
      };
    },

    eventMouseLeave: () => {
      tooltip.value.visible = false;
    },
  }));

  function getApi() {
    return calendarRef.value?.getApi();
  }
  function goToday() { getApi()?.today(); }
  function goPrev()  { getApi()?.prev(); }
  function goNext()  { getApi()?.next(); }
  function setView(view: typeof currentView.value) {
    currentView.value = view;
    getApi()?.changeView(view);
  }

  function handleEventClick(info: EventClickArg) {
    const task = info.event.extendedProps.task;
    console.log('Task clicked:', task);
  }

  watch(calendarEvents, (newEvents) => {
    const api = getApi();
    if (!api) return;
    api.removeAllEvents();
    api.addEventSource(newEvents);
  }, { deep: true });

  watch(
    () => workspaceStore.currentWorkspaceId,
    async () => {
      const api = getApi();
      if (!api) return;
      api.removeAllEvents();
      api.addEventSource(calendarEvents.value);
    }
  );
</script>

<template>
  <div class="calendar-view">
    <div class="current-range">{{ currentRangeLabel }}</div>
    <div class="calendar-toolbar">
      <div class="toolbar-left">
        <button class="btn-today" @click="goToday">Today</button>
        <button class="btn-nav" @click="goPrev">‹</button>
        <button class="btn-nav" @click="goNext">›</button>
      </div>
      <div class="toolbar-right">
        <button
          v-for="v in views"
          :key="v.value"
          :class="['btn-view', { active: currentView === v.value }]"
          @click="setView(v.value)"
        >
          {{ v.label }}
        </button>
      </div>
    </div>

    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
      :events="calendarEvents"
    />

    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="calendar-tooltip"
        :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
      >
        <div class="tooltip-title">{{ tooltip.task?.title }}</div>
        <div v-if="tooltip.timeRange" class="tooltip-row">
          {{ tooltip.timeRange }}
        </div>
        <div v-if="tooltip.duration" class="tooltip-row">
          Duration: {{ tooltip.duration }}
        </div>
        <div v-if="tooltip.task?.priority" class="tooltip-row">
          Priority: {{ tooltip.task.priority }}
        </div>
        <div v-if="tooltip.task?.is_recurring" class="tooltip-row tooltip-recurring">
          Repeating task
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
  .calendar-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .calendar-toolbar {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .toolbar-left, .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-today, .btn-nav, .btn-view {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--surface);
    cursor: pointer;
    font-size: 14px;
    color: var(--color-black);
    transition: all 0.15s;
  }
  .btn-view.active {
    background: var(--primary);
    color: var(--color-white);
    border-color: var(--primary);
  }
  .current-range {
    font-weight: var(--fw-medium);
    font-size: var(--fs-xl);
    margin-left: 10px;
  }
  :deep(.fc-timegrid-slot) {
    height: 30px;
  }
  :deep(.fc-event) {
    border-radius: var(--radius-sm) !important;
    padding: 2px 6px !important;
    cursor: pointer;
  }

  :deep(.fc-event-title) {
    font-size: var(--fs-sm);
    font-weight: var(--fw-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-white);
    line-height: 1.3;
  }
  :deep(.fc-event-compact) {
    overflow: hidden;
    height: 100%;
  }
  :deep(.fc-col-header-cell) {
    padding: 8px 0;
    font-weight: var(--fw-medium);
    font-size: var(--fs-sm);
  }
  .calendar-tooltip {
    position: absolute;
    z-index: 9999;
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    min-width: 210px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    pointer-events: none;
  }
  .tooltip-title {
    font-weight: var(--fw-medium);
    font-size: var(--fs-md);
    color: var(--color-black);
    margin-bottom: 8px;
  }
  .tooltip-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--fs-sm);
    color: var(--color-gray);
    margin-top: 4px;
  }
  .tooltip-recurring {
    color: var(--primary);
    margin-top: 6px;
  }

</style>
