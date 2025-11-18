<script setup lang="ts">
  import { ref } from 'vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  const searchQuery = ref('');
</script>

<template>
  <div class="search">
    <app-input 
      v-model="searchQuery"
      placeholder="Search across all tasks…"
    >
      <template v-slot:icon-before>
        <app-icon
          name="search"
          size="var(--fs-md)"
          color="var(--color-gray)"
        />
      </template>
    </app-input>
  </div>
</template>

<style scoped>
  .search {
    width: 100%;
  }
</style>
