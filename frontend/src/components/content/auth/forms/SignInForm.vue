<script setup lang="ts">
  import { ref } from 'vue';
  import AuthForm from '@/components/content/auth/AuthForm.vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppLink from '@/components/base/AppLink.vue';

  const email = ref('');
  const password = ref('');
  const remember = ref(false);

  const submit = () => {
    console.log({ email: email.value, password: password.value, remember: remember.value });
  };
</script>

<template>
  <auth-form @submit="submit">
    <div class="auth__item">
      <div class="auth__name">Email</div>
      <app-input v-model="email" type="email" placeholder="Enter your email" />
    </div>
    <div class="auth__item">
      <div class="auth__name">Password</div>
      <app-input v-model="password" type="password" placeholder="Enter your password" />
    </div>

    <div class="auth__options">
      <app-checkbox v-model="remember">Remember me</app-checkbox>
      <app-link>Forgot password?</app-link>
    </div>

    <div class="auth__submit">
      <app-button primary>Sign In</app-button>
    </div>
  </auth-form>
</template>

<style scoped>
  .auth__options { 
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px; 
  }
  .auth__name {
    color: var(--color-dark);
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
  }
</style>
