<script setup lang="ts">
  import AuthContainer from '@/components/content/auth/AuthContainer.vue';
  import AuthIntro from '@/components/content/auth/AuthIntro.vue';
  import AuthProviders from '@/components/content/auth/AuthProviders.vue';
  import SignUpForm from '@/components/content/auth/forms/SignUpForm.vue';

</script>

<template>
  <auth-container>
    <auth-intro title="Sign Up" description="Start tracking your tasks more effectively" />
    <auth-providers />
    <sign-up-form />
  </auth-container>
</template>

<style scoped>
</style>
