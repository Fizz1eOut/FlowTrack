<script setup lang="ts">
  import { shallowRef, watch, defineAsyncComponent, type Component } from 'vue';

  export interface AppIconProps {
    name: string;
    size?: string;
  }
  const props = defineProps<AppIconProps>();

  const component = shallowRef<Component | null>(null);
  const icons = import.meta.glob<{ default: Component }>('@/assets/icons/**/*.svg');

  watch(
    () => props.name,
    () => {
      const iconPath = Object.entries(icons).find(([k]) =>
        k.endsWith(`/assets/icons/${props.name}.svg`)
      );
      if (iconPath) {
        const [, value] = iconPath;
        component.value = defineAsyncComponent(() =>
          (value as () => Promise<{ default: Component }>)()
        );
      } else {
        console.warn(`Icon "${props.name}" not found. Available icons:`, Object.keys(icons));
        component.value = null; 
      }
    },
    { immediate: true }
  );
</script>

<template>
  <component
    v-if="component"
    :is="component"
    class="icon"
    :style="{ width: size, height: size }"
  />
  <div v-else class="icon-placeholder">Icon not found</div>
</template>

<style>
  .icon {
    fill: currentColor;
    display: inline-block;
  }
  .icon path {
    fill: currentColor;
  }
</style>
