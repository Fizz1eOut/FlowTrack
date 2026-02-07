<script setup lang="ts">
  import { ref } from 'vue';
  import { useProfileStore } from '@/stores/profileStore';
  import { showToast } from '@/stores/toastStore';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  interface ProfileAvatarUploadProps {
    userId: string;
  }
  const props = defineProps<ProfileAvatarUploadProps>();

  const profileStore = useProfileStore();
  const fileInput = ref<HTMLInputElement | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; 
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  function openFileDialog() {
    fileInput.value?.click();
  }

  async function handleAvatarUpdate(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Please select a valid image (JPEG, PNG, WebP, GIF)', 'error');
      input.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`, 'error');
      input.value = '';
      return;
    }

    const avatarUrl = await profileStore.updateAvatar(props.userId, file);

    if (avatarUrl) {
      showToast('Avatar updated successfully', 'success');
    } else {  
      showToast('Failed to update avatar', 'error');
    }

    input.value = '';
  }
</script>

<template>
  <div class="camera">
    <input 
      ref="fileInput"  
      type="file" 
      accept="image/*"
      @change="handleAvatarUpdate" 
      style="display: none;"
    />
    
    <app-button 
      class="camera__button"
      @click="openFileDialog"
    >
      <app-icon 
        name="camera"
        size="var(--fs-xl)"
        color="var(--color-white)"
      />
    </app-button>
  </div>
</template>

<style scoped>
 .camera {
    display: inline-block;
  }
  .camera__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    box-shadow: var(--shadow-lg);
    opacity: 0;
  }
  .camera__button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-xl);
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
