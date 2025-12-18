<script setup lang="ts">
  import { computed } from 'vue';

  interface SearchInputProps {
    modelValue: string | number;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
  }
  const props = defineProps<SearchInputProps>();

  const emit = defineEmits(['update:modelValue']);

  const inputValue = computed({
    get: () => props.modelValue,
    set: (newValue: string | number) => emit('update:modelValue', newValue),
  });

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
  };
</script>

<template>
  <div class="input-wrapper">
    <div class="icon-before">
      <slot name="icon-before"></slot>
    </div>

    <input
      v-model="inputValue"
      :type="type || 'text'"
      class="input"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="handleInput"
    />

    <div class="icon-after">
      <slot name="icon-after"></slot>
    </div>
  </div>
</template>

<style scoped>
  .input-wrapper {
    position: relative;
    width: 100%;
  }
  .input {
    width: 100%;
    padding: 10px 30px;
    font-size: var(--space-md);
    color: var(--color-black);
    background-color: var(--color-white);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    outline: none;
  }
  .input:focus {
    border-color: var(--primary);
  }
  .icon-before {
    position: absolute;
    top: 50%;
    left: 10px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  .icon-after {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  ::-webkit-input-placeholder {
    color: var(--color-gray);
  }
  :-moz-placeholder { 
    color: var(--color-gray);
  }
  ::-moz-placeholder { 
    color: var(--color-gray);
  }
  :-ms-input-placeholder {
    color: var(--color-gray);
  }
</style>
