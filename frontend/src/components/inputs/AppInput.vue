<script setup lang="ts">
  import { computed } from 'vue';

  interface SearchInputProps {
    modelValue: string;
    placeholder?: string;
    type?: string;
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
    <slot name="icon-before"></slot>
    <input 
      v-model="inputValue"
      :type="type || 'text'"
      class="input" 
      :placeholder="placeholder"
      @input="handleInput"
    />
    <label for="#" class="label" ></label>
    <slot name="icon-after"></slot>
  </div>
</template>

<style scoped>
  .input {
    width: 100%;
    padding: 10px 30px;
    font-size: var(--space-md);
    font-weight: var(--fw-normal);
    color: var(--color-black);
    background-color: var(--color-white);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    outline: none;
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
