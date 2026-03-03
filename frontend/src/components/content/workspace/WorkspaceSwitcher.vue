<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useWorkspaceAccessStore } from '@/stores/workspaceAccessStore';
  import { WorkspacePermissions } from '@/utils/workspacePermissions';
  import { showToast } from '@/stores/toastStore';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import WorkspaceSwitcherMenu from '@/components/content/workspace/WorkspaceSwitcherMenu.vue';

  const activeMenuId = ref<string | null>(null);
  const menuRef = ref<HTMLElement | null>(null);
  const workspaceStore = useWorkspaceStore();
  const workspaceAccessStore = useWorkspaceAccessStore();

  const currentUserRole = computed(() =>
    workspaceAccessStore.getUserRole(workspaceStore.currentWorkspaceId as string)
  );

  const canAccessSettings = computed(() =>
    WorkspacePermissions.canEditWorkspace(currentUserRole.value)
  );

  const handleDelete = async () => {
    try {
      await workspaceStore.deleteWorkspace(workspaceStore.currentWorkspaceId as string);
      showToast('The workspace was deleted successfully.', 'success');
    } catch {
      showToast('Failed to delete the workspace.', 'error');
    }
  };

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (menuRef.value && !menuRef.value.contains(target)) {
      activeMenuId.value = null;
    }
  }

  onMounted(async() => {
    await workspaceStore.fetchWorkspaces();
    document.addEventListener('click', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div class="workspace-switcher">
    <div class="workspace-switcher__title">
      Your workspaces
    </div>

    <div class="workspace-switcher__body" ref="menuRef">
      <app-button
        v-if="workspaceStore.personalWorkspace"
        class="workspace-switcher__item"
        :class="{ active: workspaceStore.currentWorkspaceId === workspaceStore.personalWorkspace.id }"
        @click="workspaceStore.setCurrentWorkspace(workspaceStore.personalWorkspace.id)"
      >
        <div class="workspace-switcher__row">
          <span
            class="workspace-switcher__color"
            :style="{
              backgroundColor: workspaceStore.personalWorkspace?.color || '#3b82f6'
            }"
          ></span>
          {{ workspaceStore.personalWorkspace.name }}
        </div>
        <app-icon
          v-if="workspaceStore.currentWorkspaceId === workspaceStore.personalWorkspace.id"
          name="done"
          size="var(--fs-sm)"
          color="var(--color-white)"
        />
      </app-button>

      <app-button
        v-for="ws in workspaceStore.teamWorkspaces"
        :key="ws.id"
        class="workspace-switcher__item"
        :class="{ active: workspaceStore.currentWorkspaceId === ws.id }"
        @click="workspaceStore.setCurrentWorkspace(ws.id)"
      >
        <div class="workspace-switcher__row">
          <span
            class="workspace-switcher__color"
            :style="{ backgroundColor: ws.color || '#3b82f6' }"
          ></span>

          {{ ws.name }}
        </div>
        <app-button @click.stop="activeMenuId = activeMenuId === ws.id ? null : ws.id"  class="workspace-switcher__menu">
          <app-icon
            v-if="workspaceStore.currentWorkspaceId === ws.id"
            :name="canAccessSettings ? 'three-dots' : 'done'"
            size="var(--fs-sm)"
            color="var(--color-white)"
            class="workspace-switcher__icon"
          />

          <workspace-switcher-menu v-if="canAccessSettings" :active="activeMenuId === ws.id"  @delete="handleDelete" />
        </app-button>
      </app-button>
    </div>
  </div>
</template>

<style scoped>
  .workspace-switcher {
    margin: var(--space-md) 0;
  }
  .workspace-switcher__title {
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
  .workspace-switcher__body {
    margin-top: var(--space-xs);
  }
  .workspace-switcher__item {
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-radius: var(--radius-sm);
  }
  .workspace-switcher__invite {
    margin-top: var(--space-xs);
  }
  .workspace-switcher__color {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
  }
  .active {
    background: var(--gradient-accent);
  }
  .workspace-switcher__menu {
    max-width: 20px;
    position: relative;
  }
  .workspace-switcher__icon {
    transition: transform 0.3s ease-in-out; 
  }
  .workspace-switcher__icon:hover {
    transform: rotate(90deg); 
  }
  :deep(.dropdown) {
    width: auto;
    right: 0;
    left: unset;
  }
</style>

