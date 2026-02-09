<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';
  import { vClickOutside } from '@/directives/clickOutside';
  import ProfileAvatarUpload from '@/components/content/profile/ProfileAvatarUpload.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import ProfileAvatar from '@/components/content/profile/ProfileAvatar.vue';
  import AppDropdown from '@/components/base/AppDropdown.vue';
  import ProfileNameEdit from '@/components/content/profile/ProfileNameEdit.vue';

  interface ProfileMenuProps {
    active: boolean;
  }

  defineProps<ProfileMenuProps>();
  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

  const authStore = useAuthStore();
  const router = useRouter();

  const userId = computed(() => authStore.userId);
  const userFullName = computed(() => authStore.userFullName);
  const userEmail = computed(() => authStore.userEmail);

  const handleChangePassword = () => {
    router.push('/settings/password');
    emit('close');
  };

  const handleLogout = async () => {
    await authStore.signOut();
    router.push('/login');
    emit('close');
  };

  const closeDropdown = () => {
    emit('close');
  };
</script>

<template>
  <app-dropdown :active="active" v-click-outside="closeDropdown">
    <div class="profile-menu__header">
      <div class="profile-menu__row">
        <profile-avatar 
          v-if="userId" 
          :id="userId" 
          size="lg"
        />
        <profile-avatar-upload 
          v-if="userId" 
          :user-id="userId"
          class="profile-menu__upload-avatar"
        />
      </div>
      <div class="profile-menu__info">
        <profile-name-edit  v-if="userId" :user-id="userId" />
        <div class="profile-menu__email">
          <app-icon 
            name="mail" 
            size="var(--fs-md)" 
            color="var(--color-gray)" 
          />
          <span>{{ userEmail }}</span>
        </div>
      </div>
    </div>

    <div class="profile-menu__divider"></div>

    <div class="profile-menu__item">
      <app-button 
        class="profile-menu__btn"
        @click="handleChangePassword"
      >
        <app-icon 
          name="lock" 
          size="var(--fs-md)" 
          color="var(--color-black)" 
        />
        <span>Change password</span>
      </app-button>
    </div>

    <div class="profile-menu__divider"></div>

    <div class="profile-menu__item">
      <app-button 
        class="profile-menu__btn profile-menu__btn--danger"
        @click="handleLogout"
      >
        <app-icon 
          name="logout" 
          size="var(--fs-md)" 
          color="var(--error)" 
        />
        <span>Log out</span>
      </app-button>
    </div>
  </app-dropdown>
</template>

<style scoped>
  .profile-menu__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .profile-menu__row {
    position: relative;
  }
  .profile-menu__upload-avatar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .profile-menu__email {
    margin-top: var(--space-xs);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal)
  }
  .profile-menu__divider {
    width: 100%;
    border: 1px solid var(--color-gray);
    opacity: 0.1;
  }
  .profile-menu__btn {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    transition: background-color 0.2s ease-in-out;
    padding: 10px;
    border-radius: var(--radius-sm);
  }
  .profile-menu__btn:hover {
    background-color: var(--accent);
  }
  .profile-menu__btn--danger {
    color: var(--error);
    transition: color 0.2s ease-in-out;
  }
</style>
