<script setup lang="ts">
  import { computed } from 'vue';
  import type { WorkspaceMemberRole } from '@/interface/workspace.interface';

  const props = withDefaults(
    defineProps<{
      role: WorkspaceMemberRole;
    }>(), 
    {
      role: 'member',
    }
  );

  const memberRole = computed(() => {
    return `role-${props.role}`;
  });
</script>

<template>
  <div class="member-role">
    <div :class="memberRole" class="member-role__label">
      {{ role }}
    </div>
  </div>
</template>

<style scoped>
  .member-role__label {
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    color: var(--color-white);
    font-size: var(--fs-sm);
  }
  .role-admin { 
    background-color: #3B82F6;
  }
  .role-member {
    background-color: var(--color-gray);
  }
  .role-owner {
    background: var(--gradient-accent);
  }
</style>
