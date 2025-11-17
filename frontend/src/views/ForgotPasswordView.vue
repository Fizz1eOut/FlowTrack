<script setup lang="ts">
  import { ref, computed } from 'vue';
  import AuthContainer from '@/components/content/auth/AuthContainer.vue';
  import AuthIntro from '@/components/content/auth/AuthIntro.vue';
  import ForgotPasswordForm from '@/components/content/auth/forms/ForgotPasswordForm.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';

  const emailSent = ref(false);
  const sentEmail = ref('');

  function onEmailSent(email: string) {
    sentEmail.value = email;
    emailSent.value = true;
  }

  const title = computed(() =>
    emailSent.value ? 'The letter has been sent!' : 'Forgot your password?'
  );

  const description = computed(() =>
    emailSent.value
      ? `We've sent a password reset link to ${sentEmail.value}. Please check your email.`
      : 'Enter your email and we will send you password reset instructions.'
  );
</script>

<template>
  <auth-container>
    <router-link v-if="!emailSent" to="/signin">
      <app-button secondary class="btn">
        <app-icon 
          name="arrow-right"
          color="var(--color-black)"
          size="var(--fs-xl)"
          class="arrow-icon"
        />
        Back
      </app-button>
    </router-link>

    <auth-intro
      :title="title"
      :description="description"
      html-description
    />

    <app-button v-if="emailSent" @click="$router.push('/login')" secondary>
      Return to the entrance
    </app-button>
    <forgot-password-form
      v-if="!emailSent"
      @email-sent="onEmailSent"
    />
  </auth-container>
</template>

<style scoped>
  .btn {
    margin-bottom: var(--space-lg);
    max-width: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  .arrow-icon {
    transform: rotate(180deg)
  }
</style>
