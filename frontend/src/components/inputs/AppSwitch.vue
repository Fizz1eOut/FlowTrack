<script setup lang="ts">
  const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label class="switch">
    <input type="checkbox" class="switch__checkbox" v-model="model" />
    <span class="switch__slider"></span>
  </label>
</template>

<style scoped>
  .switch {
    position: relative;
    display: inline-block;
    width: 42px;
    height: 22px;
    cursor: pointer;
  }
  .switch__checkbox {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .switch__slider {
    position: absolute;
    inset: 0;
    background-color: var(--color-gray);
    border-radius: 22px;
    transition: 0.3s;
  }
  .switch__slider::before {
    content: "";
    position: absolute;
    height: 18px;
    width: 18px;
    left: 2px;
    top: 2px;
    background-color: var(--color-white);
    border-radius: 50%;
    transition: 0.3s;
  }
  .switch__checkbox:checked + .switch__slider {
    background-color: var(--primary);
  }
  .switch__checkbox:checked + .switch__slider::before {
    transform: translateX(20px);
  }
</style>
