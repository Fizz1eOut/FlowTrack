<script setup lang="ts">
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
</script>

<template>
  <div class="auth-providers">
    <div class="auth-providers__item">
      <app-button secondary class="auth-providers__button">
        <app-icon 
          name="github"
          size="var(--fs-xl)"
          color="var(--color-black)"
        />
        Sign In with Google
      </app-button>
      <div class="auth-providers__text">We’re working on this feature — stay tuned!</div>
    </div>
    <div class="auth-providers__item">
      <app-button secondary class="auth-providers__button">
        <app-icon 
          name="mail"
          size="var(--fs-xl)"
          color="var(--color-black)"
        />
        Sign In with GitHub
      </app-button>
      <div class="auth-providers__text">We’re working on this feature — stay tuned!</div>
    </div>
  </div>
</template>

<style scoped>
  .auth-providers {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-direction: column;
  }
  .auth-providers__item {
    width: 100%;
    position: relative;
    display: inline-block;
  }
  .auth-providers__item:hover .auth-providers__text {
    display: block;
  }
  .auth-providers__button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  .auth-providers__button:hover {
    cursor: not-allowed;
  }
  .auth-providers__text {
    display: none;
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-white);
    color: var(--error);
    font-size: var(--fs-sm);
    padding: 4px 8px;
    border-radius: 6px;
    box-shadow: var(--shadow-sm);
    white-space: nowrap;
    z-index: 10;
  }
</style>
