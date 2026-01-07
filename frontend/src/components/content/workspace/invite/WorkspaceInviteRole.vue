<script setup lang="ts">
  import { computed } from 'vue';
  import AppRadioButton from '@/components/inputs/AppRadioButton.vue';
  import type { WorkspaceMemberRole } from '@/interface/workspace.interface';

  const props = defineProps<{
    modelValue: WorkspaceMemberRole;

  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: WorkspaceMemberRole): void;
  }>();

  const selectedRole = computed({
    get: () => props.modelValue,
    set: (value) => {
      emit('update:modelValue', value);
    }
  });
</script>

<template>
  <div class="workspace-role">
    <div class="workspace-role__item">
      <app-radio-button
        v-model="selectedRole"
        name="role"
        value="member"
        label="Member"
        description="Can view and create tasks"
      />
    </div>
    <div class="workspace-role__item">
      <app-radio-button
        v-model="selectedRole"
        name="role"
        value="admin"
        label="Administrator"
        description="Can manage workspace and invite members"
      />
    </div>
  </div>
</template>

<style scoped>
 .workspace-role__item:not(:last-child) {
    margin-bottom: var(--space-xs);
  }
</style>
