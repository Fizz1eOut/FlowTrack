<script setup lang="ts">
  import AppDropdown from '@/components/base/AppDropdown.vue';
  import AppButton from '@/components/base/AppButton.vue';
  
  interface WorkspaceSwitcherMenuProps {
    active: boolean;
    workspaceId?: string;
  }
  defineProps<WorkspaceSwitcherMenuProps>();
</script>

<template>
  <app-dropdown :active="active">
    <ul>
      <li class="workspace-switcher-menu__item">
        <app-button @click="$emit('delete')" class="workspace-switcher-menu__btn workspace-switcher-menu__btn--delete">
          Delete
        </app-button>
      </li>
    </ul>
  </app-dropdown>
</template>

<style scoped>
  .workspace-switcher-menu__btn {
    padding: 5px;
    border-radius: var(--radius-sm);
    transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out, color 0.3s ease-in-out
  }
  .workspace-switcher-menu__btn:hover {
    color: var(--color-white);
    background-color: var(--accent);
    box-shadow: var(--shadow-md);
  }
  .workspace-switcher-menu__btn--delete {
    color: var(--error);
    transition: color 0.2s ease-in-out;
  }
</style>
