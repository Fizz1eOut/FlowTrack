<script setup lang="ts">
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  const colors = ['#00A88E', '#6C5CE7', '#3B82F6', '#F97316', '#22C55E'];

  defineProps({ modelValue: String });
  const emit = defineEmits(['update:modelValue']);

  const select = (color: string) => emit('update:modelValue', color);
</script>

<template>
  <div class="workspace-color">
    <div class="workspace-color__colors">
      <app-button
        v-for="color in colors"
        :key="color"
        class="workspace-color__button"
        :style="{ backgroundColor: color }"
        :class="{ active: modelValue === color }"
        @click.prevent="select(color)"
      >
        <app-icon 
          v-if="modelValue === color"
          name="done"
          size="var(--fs-lg)"
          color="var(--color-white)"
        />
      </app-button>
    </div>
  </div>
</template>

<style scoped>
  .workspace-color__colors {
   display: flex;
   align-items: center;
   gap: 10px;
  }
  .workspace-color__button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    border: 2px solid var(--border);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }
</style>
