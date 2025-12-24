<script setup lang="ts">
  const emit = defineEmits<{
    submit: []
  }>();

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    emit('submit');
  };
</script>

<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <slot></slot>
  </form>
</template>

<style scoped>
  .auth-form > *:not(:last-child) {
    margin-bottom: var(--space-md);
  }
</style>
