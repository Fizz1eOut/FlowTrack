<script setup lang="ts">
  
</script>
<template>
  <h2 class="title">
    <slot></slot>
  </h2>
</template>
<style scoped>
  .title {
    font-family: "Roboto", sans-serif;
    font-size: var(--fs-3xl);
    font-weight: var(--fw-bold);
    color: var(--color-white);  
  } 
  @media (max-width: 768px) {
    .title {
      font-size: var(--fs-2xl);
    }
  }
</style>
