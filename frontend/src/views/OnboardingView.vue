<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';
  import OnboardingHeader from '@/components/content/auth/onboarding/OnboardingHeader.vue';
  import OnboardingProgress from '@/components/content/auth/onboarding/OnboardingProgress.vue';
  import OnboardingStep1 from '@/components/content/auth/onboarding/OnboardingStep1.vue';
  import OnboardingStep2 from '@/components/content/auth/onboarding/OnboardingStep2.vue';

  const router = useRouter();
  const authStore = useAuthStore();
  const user = authStore.user;
  const step = ref<number>(1);

  function finishOnboarding() {
    router.push({ name: 'dashboard' });
  }
</script>

<template>
  <div class="onboarding">
    <div class="onboarding__body">
      <onboarding-header :user="user " />
      <onboarding-progress :step="step" :total-steps="2" />

      <onboarding-step1 v-if="step === 1" @next-step="step++" />
      <onboarding-step2 v-else-if="step === 2" @finish="finishOnboarding" />
    </div>
  </div>
</template>

<style scoped>
  .onboarding {
    margin-top: 100px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
