<script setup lang="ts">
  import { ref, watch } from 'vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  interface TaskFormSubtasksProps {
    modelValue: string[];
  }
  const props = defineProps<TaskFormSubtasksProps>();

  const emit = defineEmits(['update:modelValue']);

  const subtasks = ref<string[]>([...props.modelValue]);
  const newSubtaskTitle = ref('');
  const checked = ref<boolean[]>(subtasks.value.map(() => false));

  watch(() => props.modelValue, (newVal) => {
    subtasks.value = [...newVal];
    checked.value = newVal.map(() => false);
  }, { deep: true });

  watch(subtasks, (newVal) => {
    emit('update:modelValue', newVal);
  }, { deep: true });

  const addSubtask = () => {
    const title = newSubtaskTitle.value.trim();
    if (title) {
      subtasks.value.push(title);
      newSubtaskTitle.value = '';
      checked.value.push(false);
    }
  };

  const removeSubtask = (index: number) => {
    subtasks.value.splice(index, 1);
    checked.value.splice(index, 1);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubtask();
    }
  };
</script>

<template>
  <div class="task-form-subtasks">
    <div class="task-form-subtasks__name">Subtasks</div>

    <div v-if="subtasks.length > 0" class="subtasks-list">
      <div
        v-for="(subtask, index) in subtasks"
        :key="index"
        class="subtasks-list__item"
      >
        <div class="subtasks-list__row">
          <app-checkbox v-model="checked[index]">
            <div :class="{ checked: checked[index] }" class="subtasks-list__title">
              {{ subtask }}
            </div>
          </app-checkbox>
        </div>
        <app-button
          type="button"
          @click="removeSubtask(index)"
          class="subtasks-list__remove"
          secondary
        >
          <app-icon 
            name="delete"
            size="var(--fs-xl)"
            color="var(--color-black)"
          />
        </app-button>
      </div>
    </div>

    <div class="subtasks-form">
      <app-input
        v-model="newSubtaskTitle"
        type="text"
        placeholder="Add a subtask"
        class="subtasks-form__input"
        @keydown="handleKeydown"
      />
      <app-button
        type="button"
        @click="addSubtask"
        :disabled="!newSubtaskTitle.trim()"
        secondary
        class="subtasks-form__btn"
      >
        <app-icon
          name="plus"
          size="var(--fs-xl)"
          color="var(--color-black)"
        />
      </app-button>
    </div>
  </div>
</template>

<style scoped>
  .task-form-subtasks__name {
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
    margin-bottom: var(--space-xs);
  }
  .subtasks-list {
    margin-top: var(--space-md);
  }
  .subtasks-list__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .subtasks-list__item:not(:last-child) {
    margin-bottom: var(--space-sm);
  }
  .subtasks-list__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .subtasks-list__title {
    font-size: var(--space-sm);
    color: var(--color-black);
  }
  .checked {
    text-decoration: line-through;
    color: var(--color-gray);
  }
  .subtasks-list__remove {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .subtasks-form {
    margin-top: var(--space-md);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .subtasks-form__btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
