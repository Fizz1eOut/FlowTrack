<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useProfileStore } from '@/stores/profileStore';
 
  interface ProfileAvatarProps {
    id: string;
    size?: 'sm' | 'md' | 'lg';
  }
  const props = withDefaults(defineProps<ProfileAvatarProps>(), {
    size: 'md'
  });

  const profileStore = useProfileStore(); 
  const avatarUrl = computed(() => profileStore.getAvatarUrl(props.id));
  const initials = computed(() => profileStore.getInitials(props.id));
  const isLoading = computed(() => profileStore.isLoading(props.id));
  const sizeClasses = computed(() => `size-${props.size}`);

  onMounted(async () => {
    if (!profileStore.getProfile(props.id)) {
      await profileStore.loadProfile(props.id);
    }
  });
</script>

<template>
  <div class="profile" :class="sizeClasses">
    <div v-if="isLoading" class="profile-loading">...</div>
    <img 
      v-else-if="avatarUrl" 
      :src="avatarUrl" 
      :alt="initials"
      class="profile-image"
      :class="sizeClasses"
    />
    <span v-else class="profile-initial">{{ initials }}</span>
  </div>
</template>

<style scoped>
 .profile {
  font-weight: var(--fw-normal);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
  flex-shrink: 0;
 }
 .profile:hover {
  transform: scale(1.1);
 }
 .size-sm {
  width: 30px;
  height: 30px;
  font-size: var(--fs-lg);
 }
 .size-md {
  width: 40px;
  height: 40px;
  font-size: var(--fs-xl);
 }
 .size-lg {
  width: 60px;
  height: 60px;
  font-size: var(--fs-2xl);
 }
</style>
