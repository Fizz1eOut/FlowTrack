<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';
  import type { LoginFormValues } from '@/interface/auth.interface';
  import AuthForm from '@/components/content/auth/AuthForm.vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppLink from '@/components/base/AppLink.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import { useForm, useField } from 'vee-validate';
  import * as yup from 'yup';

  const rememberMe = ref();
  const router = useRouter();
  const authStore = useAuthStore();

  const validationSchema = yup.object({
    email: yup.string()
      .required('Enter your email')
      .email('Invalid email format'),
    password: yup.string().required('Enter your password').min(6, 'At least 6 characters'),
  });

  const loginError = ref<string | null>(null);
  const loading = ref(false);

  const { handleSubmit } = useForm<LoginFormValues>({ 
    validationSchema 
  });

  const { value: email, errorMessage: emailError } = useField<string>('email', undefined, { initialValue: '' });
  const { value: password, errorMessage: passwordError } = useField<string>('password', undefined, { initialValue: '' });

  const hasError = computed(() => !!emailError.value || !!passwordError.value);

  const onSubmit = handleSubmit(async (values: LoginFormValues) => {
    loginError.value = null;
  
    try {
      loading.value = true;
    
      const result = await authStore.signIn({
        email: values.email,
        password: values.password,
      });

      if (!result.success) {
        loginError.value = result.error ?? 'Login error';
      } else {
        if (rememberMe.value) {
          localStorage.setItem('rememberMe', 'true');
        }
      
        router.push({ name: 'dashboard' });
      }
    } catch (err: unknown) {
      loginError.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  });

  const showPassword = ref(false);
  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };
</script>

<template>
  <auth-form @submit="onSubmit">
    <div class="auth__item">
      <div class="auth__name">Email</div>
      <app-input 
        v-model="email"
        placeholder="Email"
        :class="{ 'has-error': emailError }" 
      />
      <span class="error-message">{{ emailError }}</span>
    </div>
    <div class="auth__item">
      <div class="auth__name">Password</div>
      <app-input 
        v-model="password" 
        :type="showPassword ? 'text' : 'password'" 
        placeholder="Password" 
        :class="{ 'has-error': passwordError }" 
      />
      <app-button 
        type="button"
        class="toggle-password" 
        @click="togglePasswordVisibility"
      >
        <app-icon 
          :name="showPassword ? 'eye-off' : 'eye'" 
          size="20px" 
          color="var(--color-black)" 
        />
      </app-button>
      <span class="error-message">{{ passwordError }}</span>
    </div>

    <div class="auth__item">
      <div class="auth__row">
        <app-checkbox 
          v-model="rememberMe"
        >
          Remember me
        </app-checkbox>

        <router-link to="/forgot-password">
          <app-link>
            Forgot password?
          </app-link>
        </router-link>
      </div>
    </div>

    <div class="auth__submit">
      <app-button 
        type="submit"
        :primary="!hasError"
        :disabled="hasError || loading"
      >
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </app-button>
      
      <div v-if="loginError" class="error-login">
        {{ loginError }}
      </div>
    </div>

    <div class="auth__footer">
      Don't have an account?
      <router-link to="/signup">
        <app-link>Create an account</app-link>
      </router-link>
    </div>
  </auth-form>
</template>

<style scoped>
  .auth__item {
    position: relative;
  }
  .auth__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
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
  .auth__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    font-size: var(--fs-sm);
    font-weight: var(--fw-normal);
  }
  .toggle-password {
    position: absolute;
    right: 10px;
    top: 28px;
    width: 20px;
    height: 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
  }
  .has-error :deep(.input) {
    border: 1px solid var(--error);
    border-radius: var(--radius-sm);
  }
   .has-error :deep(.checkbox__checkmark) {
    border: 1px solid var(--error);
  }
  .error-message {
    color: var(--error);
    font-size: 12px;
  }
  .error-login {
    text-align: center;
    color: var(--error);
    font-size: 16px;
  }
</style>
