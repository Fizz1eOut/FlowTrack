<script setup lang="ts">
  import AppIcon from '@/components/base/AppIcon.vue';
  
  interface Props {
    modelValue: string | number | null
    value: string | number
    label: string
    description?: string
    name?: string
    iconName?: string
  }

  defineProps<Props>();
  defineEmits(['update:modelValue']);
</script>

<template>
  <label
    class="radio-button"
    :class="{ 'radio-button--checked': modelValue === value }"
  >
    <input
      type="radio"
      class="radio-input"
      :value="value"
      :name="name"
      :checked="modelValue === value"
      @change="$emit('update:modelValue', value)"
    />
    <span class="radio-circle"></span>
    <div class="radio-content">
      <div v-if="iconName" class="radio-content__icon">
        <app-icon 
          :name="iconName"
          color="var(--primary)"
          size="var(--fs-xl)"
        />
      </div>
      <div class="radio-content__group">
        <div class="radio-content__label">{{ label }}</div>
        <div v-if="description" class="radio-content__description">{{ description }}</div>
      </div>
    </div>
  </label>
</template>

<style scoped>
  .radio-button {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    border: 2px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #fff;
  }
  .radio-input {
    display: none;
  }
  .radio-circle {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border);
    border-radius: 50%;
    position: relative;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .radio-button--checked .radio-circle {
    border-color: #10b981;
    background: radial-gradient(circle, #10b981 45%, transparent 46%);
  }
  .radio-button:hover {
    border-color: #10b981;
  }
  .radio-button--checked {
    border-color: #10b981;
    background: #ecfdf5;
  }
  .radio-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 6px;
  }
  .radio-content__label {
    font-size: var(--fs-md);
    color: var(--color-black);
  }
  .radio-content__description {
    margin-top: var(--space-xs);  
    font-size: var(--fs-sm);
    color: var(--color-gray);
  }
</style>
