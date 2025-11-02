<script setup lang="ts">
  import AuthContainer from '@/components/content/auth/AuthContainer.vue';
  import AuthIntro from '@/components/content/auth/AuthIntro.vue';
  import AuthProviders from '@/components/content/auth/AuthProviders.vue';
  import SignInForm from '@/components/content/auth/forms/SignInForm.vue';

</script>

<template>
  <auth-container>
    <auth-intro title="Sign In" description="Continue working on your tasks" />
    <auth-providers />
    <sign-in-form />
  </auth-container>
</template>

<style scoped>
</style>
