<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  const workspaceStore = useWorkspaceStore();

  onMounted(async () => {
    await workspaceStore.fetchWorkspaces();
  });
</script>

<template>
  <div class="workspace-switcher">
    <div class="workspace-switcher__title">
      Your workspaces
    </div>

    <div class="workspace-switcher__body">
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
        <app-icon
          v-if="workspaceStore.currentWorkspaceId === ws.id"
          name="done"
          size="var(--fs-sm)"
          color="var(--color-white)"
        />
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
  .workspace-switcher__color {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
  }
  .active {
    background: var(--gradient-accent);
  }
</style>

