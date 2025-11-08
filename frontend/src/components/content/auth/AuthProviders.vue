<script setup lang="ts">
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
</script>

<template>
  <div class="auth-providers">
    <app-button secondary class="auth-providers__button">
      <app-icon 
        name="github"
        size="var(--fs-xl)"
        color="var(--color-black)"
      />
      Sign In with Google
    </app-button>
    <app-button secondary class="auth-providers__button">
      <app-icon 
        name="mail"
        size="var(--fs-xl)"
        color="var(--color-black)"
      />
      Sign In with GitHub
    </app-button>
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
  .auth-providers__button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
</style>
