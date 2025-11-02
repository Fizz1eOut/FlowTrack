<script setup lang="ts">
  import { computed } from 'vue';

  interface AppCheckboxProps {
    modelValue?: boolean;
    value?: string | number | boolean;
  }
  const props = defineProps<AppCheckboxProps>();
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const checked = computed<boolean>({
    get: () => props.modelValue ?? false,
    set: (value) => emit('update:modelValue', value),
  });
</script>

<template>
  <label class="checkbox">
    <input
      v-model="checked"
      type="checkbox"
      :value="props.value"
    />
    <div class="checkbox__checkmark"></div>
    <div class="checkbox__body">
      <slot ></slot>
    </div>
  </label>
</template>

<style scoped>
  .checkbox {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 25px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  .checkbox input:checked ~ .checkbox__checkmark {
    background-color: var(--primary);
    border: 1px solid var(--primary);
  }
  .checkbox input:checked ~ .checkbox__checkmark:after {
    opacity: 1;
  }
  .checkbox .checkbox__checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 18px;
    width: 18px;
    background-color: var(--color-white);
    border: 1px solid var(--primary);
    transition: background-color 0.3s ease-in-out, border 0.3s ease-in-out;
    border-radius: 3px;
  }
  .checkbox .checkbox__checkmark:after {
    content: "";
    position: absolute;
    left: 5px;
    top: 1px;
    width: 6px;
    height: 10px;
    border: 1px solid var(--color-white);
    border-width: 0 1px 1px 0;
    transform: rotate(45deg);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  .checkbox .checkbox__body {
    color: var(--color-black);
    font-weight: var(--fw-medium);
    font-size: var(--fs-sm);
    }
</style>
