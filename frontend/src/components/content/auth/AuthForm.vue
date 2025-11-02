<script setup lang="ts"></script>

<template>
  <form class="auth-form" @submit.prevent="$emit('submit')">
    <slot ></slot>
  </form>
</template>

<style scoped>
  .auth-form > *:not(:last-child) {
    margin-bottom: var(--space-md);
  }
</style>
