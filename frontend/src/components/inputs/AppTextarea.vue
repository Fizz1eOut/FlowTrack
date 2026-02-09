<script setup lang="ts">
  import { computed } from 'vue';

  interface TextareaProps {
    modelValue: string;
    placeholder?: string;
    rows?: number;
    cols?: number;
  }

  const props = defineProps<TextareaProps>();
  const emit = defineEmits(['update:modelValue']);

  const textareaValue = computed({
    get: () => props.modelValue,
    set: (newValue: string) => emit('update:modelValue', newValue),
  });

  const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    emit('update:modelValue', target.value);
  };
</script>

<template>
  <textarea
    v-model="textareaValue"
    :placeholder="placeholder"
    :rows="rows || 4"
    :cols="cols"
    class="textarea"
    @input="handleInput"
  ></textarea>
</template>

<style scoped>
.textarea {
  width: 100%;
  padding: 10px 15px;
  font-size: var(--space-md);
  color: var(--color-black);
  background-color: var(--color-white);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  outline: none;
  resize: vertical;
  min-height: 80px;
}

::placeholder {
  color: var(--color-gray);
}
</style>
