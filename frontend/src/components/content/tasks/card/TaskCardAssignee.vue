<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useProfileStore } from '@/stores/profileStore';
  import { useWorkspaceAccessStore } from '@/stores/workspaceAccessStore';
  import { useTasksStore } from '@/stores/taskStore';
  import { WorkspacePermissions } from '@/utils/workspacePermissions';
  import ProfileAvatar from '@/components/content/profile/ProfileAvatar.vue';
  import AppSelect from '@/components/inputs/AppSelect.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import type { TaskResponse } from '@/interface/task.interface';

  interface Props {
    task: TaskResponse;
  }
  const props = defineProps<Props>();

  const profileStore = useProfileStore();
  const workspaceAccessStore = useWorkspaceAccessStore();
  const tasksStore = useTasksStore();

  const loading = ref(false);

  const currentUserRole = computed(() =>
    workspaceAccessStore.getUserRole(props.task.workspace_id)
  );

  const canAssign = computed(() =>
    WorkspacePermissions.canManageMembers(currentUserRole.value)
  );

  const members = computed(() =>
    workspaceAccessStore.getMembers(props.task.workspace_id)
  );

  const memberOptions = computed(() => [
    { id: '', value: 'Unassigned' },
    ...members.value.map(m => ({
      id: m.user_id,
      value: m.profile?.full_name || m.profile?.email || m.user_id,
    }))
  ]);

  const selectedAssignee = computed({
    get: () => props.task.assigned_to ?? '',
    set: async (userId: string) => {
      loading.value = true;
      try {
        await tasksStore.updateTask(props.task.id, {
          ...props.task,
          description: props.task.description ?? '',
          tags: props.task.tags ?? [],
          subtasks: props.task.subtasks?.map(s => s.title) || [],
          assigned_to: userId || null,
        });
      } finally {
        loading.value = false;
      }
    }
  });

  const displayName = computed(() => {
    if (!props.task.assigned_to) return 'Unassigned';
    const profile = profileStore.getProfile(props.task.assigned_to);
    return profile?.full_name || profile?.email || 'Unassigned';
  });

  onMounted(async () => {
    if (!workspaceAccessStore.getMembers(props.task.workspace_id).length) {
      await workspaceAccessStore.fetchMembers(props.task.workspace_id);
    }
    if (props.task.assigned_to && !profileStore.getProfile(props.task.assigned_to)) {
      await profileStore.loadProfile(props.task.assigned_to);
    }
  });
</script>

<template>
  <div class="task-assignee" @click.stop>
    <template v-if="canAssign">
      <profile-avatar
        v-if="task.assigned_to"
        :id="task.assigned_to"
        size="sm"
      />
      Assignee:
      <app-select
        v-model="selectedAssignee"
        :options="memberOptions"
        value-key="id"
        label-key="value"
        :disabled="loading"
      />
    </template>

    <template v-else>
      <profile-avatar
        v-if="task.assigned_to"
        :id="task.assigned_to"
        size="sm"
      />
      <app-icon
        v-else
        name="user"
        size="var(--fs-sm)"
        color="var(--color-gray)"
      />
      <div
        class="task-assignee__name"
        :class="{ 'task-assignee__name--empty': !task.assigned_to }"
      >
        Assignee: {{ displayName }}
      </div>
    </template>
  </div>
</template>

<style scoped>
  .task-assignee {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .task-assignee__name {
    font-size: var(--fs-md);
    color: var(--color-black);
  }
  :deep(.select select) {
    padding: 6px 16px;
    height: var(--fs-3xl);
  }
</style>
