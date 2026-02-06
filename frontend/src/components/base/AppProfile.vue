<script setup lang="ts">
  import { ref, computed } from 'vue';
  import ProfileAvatar from '@/components/content/profile/ProfileAvatar.vue';
  import ProfileMenu from '@/components/content/profile/ProfileMenu.vue';
  import { useAuthStore } from '@/stores/authStore';

  const authStore = useAuthStore();
  const isOpen = ref(false);

  const currentUserId = computed(() => authStore.userId);

  const toggleMenu = (e?: MouseEvent) => {
    e?.stopPropagation();
    isOpen.value = !isOpen.value;
  };
</script>

<template>
  <div class="profile">
    <profile-avatar 
      v-if="currentUserId" 
      :id="currentUserId" 
      @click="toggleMenu" 
      class="profile-avatar"
    />
    <profile-menu :active="isOpen" @close="toggleMenu($event)" />
  </div>
</template>

<style scoped>
  .profile {
    position: relative;
  }
  :deep(.dropdown) {
    width: auto;
    right: 0;
    left: unset;
  }
</style>
