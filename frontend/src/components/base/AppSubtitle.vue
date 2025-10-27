<script setup lang="ts">
  
</script>
<template>
  <h2 class="subtitle">
    <slot></slot>
  </h2>
</template>
<style scoped>
  .subtitle {
    font-family: "Roboto", sans-serif;
    font-size: var(--fs-2xl);
    font-weight: var(--fw-semibold);
    color: var(--color-white);  
  } 
  @media (max-width: 768px) {
    .subtitle {
      font-size: var(--fs-xl);
    }
  }
</style>
