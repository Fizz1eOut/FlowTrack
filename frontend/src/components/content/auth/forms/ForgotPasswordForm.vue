<script setup lang="ts">
  import { ref, computed } from 'vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import { showToast } from '@/stores/toastStore';
  import { useAuthStore } from '@/stores/authStore';
  import { useForm, useField } from 'vee-validate';
  import * as yup from 'yup';

  const emit = defineEmits<{
    (e: 'email-sent', email: string): void
  }>();

  const validationSchema = yup.object({
    email: yup.string()
      .required('Enter your email')
      .email('Invalid email format'),
  });
  const { handleSubmit } = useForm({ validationSchema });
  const { value: email, errorMessage: emailError } = useField<string>('email', undefined, { initialValue: '' });
  const hasError = computed(() => !!emailError.value);

  const loading = ref(false);
  const authStore = useAuthStore();

  const onSubmit = handleSubmit(async () => {
    try {
      loading.value = true;

      const emailValue = email.value.trim();

      const res = await authStore.resetPassword(emailValue);

      if (!res.success) {
        showToast(res.error ?? 'Password reset error', 'error');
        return;
      }

      showToast('Password reset email sent!', 'success');

      emit('email-sent', emailValue);

    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Password reset error', 'error');
    } finally {
      loading.value = false;
    }
  });

</script>

<template>
  <form 
    @submit.prevent="onSubmit"
    class="forgot-password"
  >
    <div class="forgot-password__item">
      <app-input 
        v-model="email" 
        type="email"
        placeholder="Email" 
        :disabled="loading"
        :class="{ 'has-error': emailError }" 
      />
      <span class="error-message">{{ emailError }}</span>
    </div>
          
    <div class="forgot-password__buttons">
      <app-button 
        type="submit" 
        :primary="!hasError"
        :disabled="hasError"
      >
        {{ loading ? 'Sending...' : 'Send Reset Link' }}
      </app-button>
    </div>
  </form>
</template>

<style scoped>

</style>
