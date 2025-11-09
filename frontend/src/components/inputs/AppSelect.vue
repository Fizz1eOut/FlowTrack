<script setup lang="ts" generic="T extends Record<string, unknown>">
  import { computed } from 'vue';

  interface Props<T> {
    modelValue: string | number | T | T[] | null | undefined;
    options: T[];
    valueKey?: keyof T;
    labelKey?: keyof T;
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<Props<T>>(), {
    modelValue: null,
    valueKey: 'id',
    labelKey: 'value',
    disabled: false
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Props<T>['modelValue']): void;
  }>();

  const selectedOption = computed({
    get: () => props.modelValue,
    set: (newValue) => emit('update:modelValue', newValue)
  });

  const getOptionKey = (option: T): PropertyKey =>
    option[props.valueKey] as PropertyKey;
</script>

<template>
  <div class="select">
    <select v-model="selectedOption" :disabled="props.disabled">
      <option 
        v-for="option in props.options"
        :key="getOptionKey(option)"
        :value="option[props.valueKey]"
        :disabled="option[props.valueKey] === ''"
      >
        {{ option[props.labelKey] }}
      </option>
    </select>
  </div>
</template>

<style scoped>
  .select {
    width: 100%;
    position: relative;
  }
  .select:after {
    content: "";
    border-style: solid;
    border-width: 8px 8px 0 8px;
    border-color: var(--border) transparent transparent transparent;
    border-radius: var(--radius-sm);
    pointer-events: none;
    position: absolute;
    top: 47%;
    right: 15px;
    z-index: 1;
    margin-top: -2px;
  }
  .select select {
    -webkit-appearance: none;
    -moz-appearance: none;
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
  .select select::-ms-expand {
    display: none;
  }
  .select select:focus {
    outline: 0;
    border-color: var(--border);
  }
  .select select:hover {
    cursor: pointer;
  }
  .select select option:checked {
    color: var(--color-light-gray);
  }
  option {
    background-color: var(--color-white);
    color: var(--color-black);
    font-weight: var(--fw-normal);
    font-size: var(--fs-md);
  }
</style>
