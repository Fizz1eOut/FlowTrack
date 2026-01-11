<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { useTimerStore } from '@/stores/timerStore';
  import TimerDropdown from '@/components/content/timer/TimerDropdown.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppButton from '@/components/base/AppButton.vue';

  const timerStore = useTimerStore();
  const isDropdownOpen = ref(false);
  const timerBadgeRef = ref<HTMLElement | null>(null);

  const badgeCount = computed(() => {
    return timerStore.activeTimerCount;
  });

  const hasNotification = computed(() => {
    return timerStore.hasLastSession;
  });

  function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value;
  }

  function closeDropdown() {
    isDropdownOpen.value = false;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (timerBadgeRef.value && !timerBadgeRef.value.contains(target)) {
      closeDropdown();
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div class="timer-badge" ref="timerBadgeRef">
    <app-button 
      class="timer-badge__button"
      :class="{ 
        'has-active': timerStore.hasActiveTimer,
        'is-open': isDropdownOpen 
      }"
      @click="toggleDropdown"
      type="button"
    >
      <span class="timer-badge__icon">
        <app-icon
          name="timer"
          size="var(--fs-xl)"
          color="var(--color-dark)"
        />
      </span>
      
      <span 
        v-if="badgeCount > 0" 
        class="timer-badge__count"
      >
        {{ badgeCount }}
      </span>

      <span 
        v-else-if="hasNotification" 
        class="timer-badge__dot"
      ></span>
    </app-button>

    <timer-dropdown :active="isDropdownOpen" @close="closeDropdown" />
  </div>
</template>

<style scoped>
  .timer-badge {
    position: relative;
    display: inline-block;
  }
  .timer-badge__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }
  .timer-badge__button.is-open {
    background: var(--accent);
  }
  .timer-badge__button.has-active {
    animation: pulse-soft 3s ease-in-out infinite;
  }
  .timer-badge__icon {
    font-size: 20px;
  }
  .timer-badge__count {
    position: absolute;
    top: 2px;
    right: 2px;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    background: #ef4343;
    color: var(--color-white);
    font-size: var(--fs-xs);
    font-weight: var(--fw-semibold);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  .timer-badge__dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 10px;
    height: 10px;
    background: #ef4343;
    border-radius: var(--radius-full);
    border: 1px solid var(--border);
  }
  :deep(.dropdown) {
    width: 300px;
    left: 50%;
    transform: translateX(-50%);
    left: auto;
  }
  @keyframes pulse-soft {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
</style>
