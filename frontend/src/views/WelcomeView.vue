<script setup lang="ts">
  import WelcomeHero from '@/components/content/welcome/WelcomeHero.vue';
  import WelcomeFeatures from '@/components/content/welcome/WelcomeFeatures.vue';
  import WelcomeGetStarted from '@/components/content/welcome/WelcomeGetStarted.vue';
</script>

<template>
  <div class="welcome">
    <welcome-hero />
    <welcome-features />
    <welcome-get-started />
  </div>
</template>

<style scoped>
  .welcome {
    max-width: 900px;
    margin: 0 auto;
  }
</style>
