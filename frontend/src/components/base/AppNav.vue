<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import WorkspaceSwitcher from '@/components/content/workspace/WorkspaceSwitcher.vue';

  interface AppNavProps {
    isOpen?: boolean;
  }
  defineProps<AppNavProps>();

  const emit = defineEmits<{
    (e: 'menu-click', path: string): void
  }>();

  const router = useRouter();
  const route = useRoute();

  const menuItems = [
    { name: 'Today', icon: 'calendar-today', path: '/dashboard/today' },
    { name: 'Inbox', icon: 'inbox', path: '/dashboard/inbox' },
    { name: 'Tasks', icon: 'tasks', path: '/dashboard/tasks' },
    { name: 'Projects', icon: 'project', path: '/dashboard/projects' },
    { name: 'Calendar', icon: 'calendar', path: '/dashboard/calendar' },
    { name: 'Analytics', icon: 'analytics', path: '/dashboard/analytics' },
    { name: 'Goals', icon: 'target', path: '/dashboard/goals' },
    { name: 'Team', icon: 'team', path: '/dashboard/team' },
    { name: 'Documents', icon: 'file-text', path: '/dashboard/docs' },
    { name: 'Settings', icon: 'settings', path: '/dashboard/settings' },
  ];

  const handleClick = (path: string) => {
    emit('menu-click', path);
    router.push(path);
  };
</script>

<template>
  <div class="wrapper">
    <nav class="nav">
      <workspace-switcher v-if="isOpen" />
      
      <app-button
        v-for="item in menuItems"
        :key="item.path"
        @click="handleClick(item.path)"
        class="nav__button"
        :class="{ active: route.path === item.path }"
      >
        <app-icon
          :name="item.icon"
          color="var(--color-dark)"
          size="var(--fs-xl)"
        />
        <transition name="fade-slide">
          <span v-if="isOpen" class="nav__name">{{ item.name }}</span>
        </transition>
      </app-button>
    </nav>
  </div>
</template>

<style scoped>
  .nav__button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: var(--radius-sm);
    transition: background-color 0.3s ease-in-out;
  }
  .nav__button:hover {
    background-color: var(--color-gray);
  }
  .nav__name {
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
    color: var(--color-black);
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.25s ease;
  }

  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-6px);
    max-width: 0;
  }

  .fade-slide-enter-to,
  .fade-slide-leave-from {
    opacity: 1;
    transform: translateX(0);
    max-width: 200px;
  }
</style>
