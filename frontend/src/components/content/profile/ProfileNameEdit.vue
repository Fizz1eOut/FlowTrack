  <script setup lang="ts">
  import { ref, computed, nextTick } from 'vue';
  import { useProfileStore } from '@/stores/profileStore';
  import { showToast } from '@/stores/toastStore';
  import * as yup from 'yup';  
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppInput from '@/components/inputs/AppInput.vue';

  interface ProfileNameEditProps {
    userId: string;
  }
  const props = defineProps<ProfileNameEditProps>();

  const profileStore = useProfileStore();

  const isEditing = ref(false);
  const fullName = ref<string>('');
  const isLoading = ref(false);
  const error = ref<string>('');

  const validationSchema = yup.object({
    name: yup.string()
      .required('Enter your name')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long (max 100 characters)')
      .matches(/^[A-ZА-Я][a-zа-яёЁA-ZА-Я]*(\s+[A-ZА-Я][a-zа-яёЁA-ZА-Я]*)*$/, 'Each word must start with a capital letter'), 
  });

  const currentName = computed(() => {
    return profileStore.getFullName(props.userId) || '';
  });

  async function startEdit(e: Event) {
    e.preventDefault();
    e.stopPropagation();
      
    console.log('startEdit called');
    fullName.value = currentName.value;
    isEditing.value = true;
    error.value = '';
      
    await nextTick();
    console.log('isEditing:', isEditing.value);
  }

  function cancelEdit(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    isEditing.value = false;
    fullName.value = '';
    error.value = '';
  }

  async function saveName(e: Event) {
    e.preventDefault();
    e.stopPropagation();
      
    error.value = '';

    try {
      await validationSchema.validate({ name: fullName.value.trim() });
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        error.value = validationError.message;
        showToast(validationError.message, 'error');
      }
      return;
    }

    isLoading.value = true;

    const success = await profileStore.updateProfile(props.userId, {
      full_name: fullName.value.trim()
    });

    isLoading.value = false;

    if (success) {
      showToast('Name updated successfully', 'success');
      isEditing.value = false;
      error.value = '';
    } else {
      showToast('Failed to update name', 'error');
    }
  }

  function handleInput() {
    if (error.value) {
      error.value = '';
    }
  }
  </script>

<template>
  <div class="profile-name-edit">
    <div v-if="!isEditing" class="profile-name-edit__row">
      <h2 class="profile-name-edit__name">{{ currentName || 'No name' }}</h2>
      <app-button 
        @click="startEdit"
        class="profile-name-edit__edit-btn"
        type="button"
      >
        <app-icon name="edit" size="var(--fs-lg)" />
      </app-button>
    </div>

    <div v-else class="profile-name-edit__form">
      <div class="profile-name-edit__input-wrapper">
        <app-input
          v-model="fullName"
          type="text"
          placeholder="Enter your full name"
          :disabled="isLoading"
          @input="handleInput"
          @keyup.enter="saveName"
          @keyup.esc="cancelEdit"
          autofocus
        />
        <span v-if="error" class="profile-name-edit__error">
          {{ error }}
        </span>
      </div>
        
      <div class="profile-name-edit__actions">
        <app-button 
          @click="saveName"
          primary
          :disabled="isLoading"
          class="profile-name-edit__save-btn"
          type="button"
        >
          {{ isLoading ? 'Saving...' : 'Save' }}
        </app-button>
          
        <app-button 
          @click="cancelEdit"
          :disabled="isLoading"
          secondary
          class="profile-name-edit__cancel-btn"
          type="button"
        >
          Cancel
        </app-button>
      </div>
    </div>
  </div>
</template>

  <style scoped>
    .profile-name-edit__row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .profile-name-edit__name {
      font-size: var(--fs-xl);
      font-weight: var(--fw-medium);
    }
    .profile-name-edit__edit-btn {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      border-radius: var(--radius-sm);
      transition: background-color 0.3s ease-in-out;
    }
    .profile-name-edit__edit-btn:hover {
      background-color: var(--accent);
    }
    :deep(.input) {
      height: var(--space-xl);
      padding: 10px 16px;
    }
    .profile-name-edit__actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: var(--space-xs);
    }
    :deep(.button) {
      height: var(--space-xl);
    }
  </style>
