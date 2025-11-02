<script setup lang="ts">
  
</script>

<template>
  <div class="link line">
    <slot></slot>
  </div>
</template>

<style scoped>
.link {
  font-family: "Roboto", sans-serif;
  font-size: var(--fs-sm);
  font-weight: var(--fw-normal);
  color: var(--primary);
  transition: all color 0.3s ease-in-out;
  cursor: pointer;
}
.link:hover {
  text-decoration: underline;
}
</style>
