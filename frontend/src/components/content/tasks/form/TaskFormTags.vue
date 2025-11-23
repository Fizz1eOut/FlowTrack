<script setup lang="ts">
  import { ref, computed } from 'vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppButton from '@/components/base/AppButton.vue';

  interface TaskFormTagsProps {
    modelValue: string[]
  }
  const props = defineProps<TaskFormTagsProps>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void;
  }>();

  const newTag = ref('');
  const suggestions = [
    'team',
    'code-review',
    'work',
    'release',
    'personal',
    'dev',
    'refactor'
  ];

  const addTag = (tag?: string) => {
    const value = (tag ?? newTag.value).trim();

    if (!value) return;
    if (props.modelValue.includes(value)) return;

    emit('update:modelValue', [...props.modelValue, value]);

    newTag.value = '';
  };

  const removeTag = (tag: string) => {
    emit(
      'update:modelValue',
      props.modelValue.filter((t) => t !== tag)
    );
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const filteredSuggestions = computed(() => {
    const q = newTag.value.toLowerCase();

    return suggestions
      .filter(s => !props.modelValue.includes(s))
      .filter(s => s.toLowerCase().includes(q));
  });
</script>

<template>
  <div class="task-from-tags">
    <div class="task-from-tags__name">Tags</div>

    <div class="task-from-tags__input">
      <app-input
        v-model="newTag"
        placeholder="Add a tag"
        @keydown="handleKeydown"
      />
    </div>

    <div class="task-from-tags__list">
      <app-button
        v-for="tag in props.modelValue"
        :key="tag"
        class="task-from-tags__item"
        @click="removeTag(tag)"
      >
        {{ tag }}
        <app-icon 
          name="cross"
          size="8px"
          color="var(--color-black)"
        />
      </app-button>
    </div>

    <div class="task-from-tags__suggestions">
      <app-button
        v-for="tag in filteredSuggestions"
        :key="tag"
        class="task-from-tags__suggestion--btn"
        @click="addTag(tag)"
      >
        <app-icon 
          name="plus"
          size="var(--fs-xs)"
          color="var(--color-black)"
        />
        {{ tag }}
      </app-button>
    </div>
  </div>
</template>

<style scoped>
  .task-from-tags {
    width: 100%;
  }
  .task-from-tags__name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
  .task-from-tags__list {
    margin-top: var(--space-xs);
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 600px;
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow-x: auto;
  }
  .task-from-tags__item {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: auto;
    padding: 5px;
    font-size: var(--fs-xs);
    font-weight: var(--fw-normal);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background-color: var(--color-white);
    transition: box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out;
  }
  .task-from-tags__item:hover {
    background-color: var(--surface);
    box-shadow: var(--shadow-md);
  }
  .task-from-tags__suggestions {
    margin-top: var(--space-xs);
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 600px;
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow-x: auto;
  }
  .task-from-tags__suggestion--btn {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: auto;
    padding: 5px;
    font-size: var(--fs-xs);
    font-weight: var(--fw-normal);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    transition: box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out;
  }
  .task-from-tags__suggestion--btn:hover {
    background-color: var(--color-white);
    box-shadow: var(--shadow-md);
  }
</style>
