<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppTitle from '@/components/base/AppTitle.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AuthContainer from '@/components/content/auth/AuthContainer.vue';
  import { supabase } from '@/utils/supabase';
  import { useRouter } from 'vue-router';
  import { useForm, useField } from 'vee-validate';
  import * as yup from 'yup';
  import { showToast } from '@/stores/toastStore';

  const validationSchema = yup.object({
    password: yup.string().required('Enter your password').min(6, 'At least 6 characters'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm your password'),
  });

  const { handleSubmit } = useForm({ validationSchema });
  const { value: password, errorMessage: passwordError } = useField('password', undefined, { initialValue: '' });
  const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword', undefined, { initialValue: '' });

  const hasError = computed(() => !!passwordError.value || !!confirmPasswordError.value);

  const router = useRouter();
  const sessionReady = ref(false);
  const error = ref('');
  const isInitialized = ref(false);
  const isSubmitting = ref(false);
  
  const resetTokens = ref<{ accessToken: string; refreshToken: string } | null>(null);

  interface ResetParams {
    accessToken: string | null;
    refreshToken: string | null;
    type: string | null;
    error: string | null;
    errorCode: string | null;
    errorDescription: string | null;
  }

  function getResetParams(): ResetParams {
    const fullHash = window.location.hash.slice(1);
    const parts = fullHash.split('#');
    const queryString = parts[parts.length - 1];
    const hashParams = new URLSearchParams(queryString);

    return {
      accessToken: hashParams.get('access_token'),
      refreshToken: hashParams.get('refresh_token'),
      type: hashParams.get('type'),
      error: hashParams.get('error'),
      errorCode: hashParams.get('error_code'),
      errorDescription: hashParams.get('error_description'),
    };
  }

  async function validateResetLink() {
    if (isInitialized.value) return;
    isInitialized.value = true;

    const params = getResetParams();

    if (params.error) {
      error.value = params.errorDescription || 'Reset link has expired. Please request a new one.';
      showToast('Reset link has expired. Please request a new one.', 'error');
      return;
    }

    if (params.type === 'recovery' && params.accessToken && params.refreshToken) {
      resetTokens.value = {
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
      };
      
      sessionReady.value = true;
    } else {
      error.value = 'Invalid reset link format.';
      showToast('Invalid reset link format.', 'error');
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (isSubmitting.value || !resetTokens.value) return;
    
    isSubmitting.value = true;
    error.value = '';
    
    try {
      const setSessionPromise = supabase.auth.setSession({
        access_token: resetTokens.value.accessToken,
        refresh_token: resetTokens.value.refreshToken,
      });

      const sessionTimeoutPromise = new Promise<{ error: any }>((resolve) => {
        setTimeout(() => resolve({ error: null }), 2000);
      });

      await Promise.race([setSessionPromise, sessionTimeoutPromise]);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const updatePromise = supabase.auth.updateUser({
        password: values.password,
      });

      const updateTimeoutPromise = new Promise<{ error: any }>((resolve) => {
        setTimeout(() => resolve({ error: null }), 5000);
      });

      const updateResult = await Promise.race([updatePromise, updateTimeoutPromise]);

      if (updateResult.error) {
        error.value = updateResult.error.message;
        showToast(updateResult.error.message, 'error');
        isSubmitting.value = false;
        return;
      }

      showToast('Password updated successfully!', 'success');
      
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('SignOut error:', signOutError);
      }
      
      router.push('/signin');
    } catch (err: any) {
      error.value = 'Failed to update password. Please try again.';
      showToast('Failed to update password. Please try again.', 'error');
      isSubmitting.value = false;
    }
  });

  onMounted(() => {
    validateResetLink();
  });

  const showPassword = ref(false);
  const showConfirmPassword = ref(false);
  
  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      showPassword.value = !showPassword.value;
    } else {
      showConfirmPassword.value = !showConfirmPassword.value;
    }
  };
</script>

<template>
  <auth-container>
    <form @submit.prevent="onSubmit" class="reset-password">
      <app-title>Set new password</app-title>

      <div v-if="error" class="reset-password__error">
        {{ error }}
      </div>

      <div v-if="!sessionReady && !error" class="reset-password__loading">
        Loading...
      </div>

      <div v-if="sessionReady" class="reset-password__items">
        <div class="reset-password__item">
          <app-input
            :type="showPassword ? 'text' : 'password'" 
            v-model="password"
            placeholder="New password"
            :class="{ 'has-error': passwordError }"
          />
          <app-button 
            type="button"
            class="toggle-password" 
            @click="togglePasswordVisibility('password')"
          >
            <app-icon 
              :name="showPassword ? 'eye-off' : 'eye'" 
              size="20px" 
              style="color: var(--white)" 
            />
          </app-button>
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <div class="reset-password__item">
          <app-input
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            placeholder="Confirm password"
            :class="{ 'has-error': confirmPasswordError }"
          />
          <app-button 
            type="button"
            class="toggle-password" 
            @click="togglePasswordVisibility('confirmPassword')"
          >
            <app-icon 
              :name="showConfirmPassword ? 'eye-off' : 'eye'" 
              size="20px" 
              style="color: var(--white)" 
            />
          </app-button>
          <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
        </div>

        <div class="reset-password__button">
          <app-button 
            :primary="!hasError && !isSubmitting"
            :disabled="hasError || isSubmitting"
            type="submit"
          >
            {{ isSubmitting ? 'Updating...' : 'Update password' }}
          </app-button>
        </div>
      </div>
    </form>
  </auth-container>
</template>

<style scoped>
  .reset-password {
    margin-top: var(--space-md);
  }
  .reset-password__error {
    color: var(--red-500);
  }
  .reset-password__items {
    margin-top: var(--space-md);
  }
  .reset-password__items > *:not(:last-child) {
    margin-bottom: var(--space-sm);
  }
  .reset-password__item {
    position: relative;
  }
  .toggle-password {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 20px;
    height: 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
  }
  .has-error :deep(.input) {
    border: 1px solid var(--red-500);
    border-radius: var(--radius-sm);
  }
  .error-message {
    color: var(--red-500);
    font-size: 12px;
  }
</style>
