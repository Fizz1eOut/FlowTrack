<script setup lang="ts">
</script>

<template>
  <div class="underlay">
    <slot ></slot>
  </div>
</template>


<style scoped>
  .underlay {
    background-color: var(--surface);
    border-radius: var(--radius-sm);
  }
</style>
