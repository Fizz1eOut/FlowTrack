<script setup lang="ts">
  import { computed } from 'vue';
  import AppRadioButton from '@/components/inputs/AppRadioButton.vue';

  type WorkspaceType = 'personal' | 'team'

  const props = defineProps<{
    modelValue: WorkspaceType | null
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: WorkspaceType): void
  }>();

  const workspaceType = computed({
    get: () => props.modelValue,
    set: (value) => {
      if (value) emit('update:modelValue', value);
    }
  });
</script>

<template>
  <div class="workspace-type">
    <div class="workspace-type__item">
      <app-radio-button
        v-model="workspaceType"
        iconName="user"
        name="workspace"
        value="personal"
        label="Personal workspace"
        description="For individual use and personal projects"
      />
    </div>
    <div class="workspace-type__item">
      <app-radio-button
        v-model="workspaceType"
        iconName="users"
        name="workspace"
        value="team"
        label="Team workspace"
        description="For collaboration with your team on projects"
      />
    </div>
  </div>
</template>

<style scoped>
  .workspace-type__item:not(:last-child) {
    margin-bottom: var(--space-xs);
  }
</style>
