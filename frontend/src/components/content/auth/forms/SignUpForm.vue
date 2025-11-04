<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';
  import type { SignUpFormValues } from '@/interface/auth.interface';
  import AuthForm from '@/components/content/auth/AuthForm.vue';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppCheckbox from '@/components/inputs/AppCheckbox.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppLink from '@/components/base/AppLink.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import { useForm, useField } from 'vee-validate';
  import * as yup from 'yup';

  const router = useRouter();
  const authStore = useAuthStore();

  const validationSchema = yup.object({
    name: yup.string()
      .required('Enter your name')
      .matches(/^[A-ZА-Я][a-zа-яёЁA-ZА-Я]*$/,'Name must start with a capital letter'),
    email: yup.string()
      .required('Enter your email')
      .email('Invalid email format'),
    password: yup.string().required('Enter your password').min(6, 'At least 6 characters'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm your password'),
    acceptTerms: yup
      .boolean()
      .oneOf([true], 'You must accept the terms')
      .required('You must accept the terms'),
  });

  const signupError = ref<string | null>(null);
  const loading = ref(false);

  const { handleSubmit } = useForm<SignUpFormValues>({ 
    validationSchema 
  });

  const { value: name, errorMessage: nameError } = useField<string>('name', undefined, { initialValue: '' });
  const { value: email, errorMessage: emailError } = useField<string>('email', undefined, { initialValue: '' });
  const { value: password, errorMessage: passwordError } = useField<string>('password', undefined, { initialValue: '' });
  const { value: confirmPassword, errorMessage: confirmPasswordError } = useField('confirmPassword', undefined, { initialValue: '' });
  const { value: acceptTerms, errorMessage: acceptTermsError } = useField<boolean>('acceptTerms', undefined, { initialValue: false });
  
  const hasError = computed(() => !!nameError.value || !!emailError.value || !!passwordError.value || !!confirmPasswordError.value || !!acceptTermsError.value);

  const onSubmit = handleSubmit(async (values: SignUpFormValues) => {
    signupError.value = null;
  
    try {
      loading.value = true;
    
      const result = await authStore.signUp({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (!result.success) {
        signupError.value = result.error ?? 'Registration error';
      } else {
        if (values.acceptTerms) {
          localStorage.setItem('rememberMe', 'true');
        }
      
        router.push({ name: 'onboarding' });
      }
    } catch (err: unknown) {
      signupError.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
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
  <auth-form @submit="onSubmit">
    <div class="auth__item">
      <div class="auth__name">Name</div>
      <app-input 
        v-model="name" 
        placeholder="Enter your name"
        :class="{ 'has-error': nameError }" 
      />
    </div>
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
        @click="togglePasswordVisibility('password')"
      >
        <app-icon 
          :name="showPassword ? 'eye-off' : 'eye'" 
          size="20px" 
          style="color: var(--white)" 
        />
      </app-button>
      <span class="error-message">{{ passwordError }}</span>
    </div>
    <div class="auth__item">
      <div class="auth__name">Confirm password</div>
      <app-input 
        v-model="confirmPassword" 
        :type="showConfirmPassword ? 'text' : 'password'"
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
      <span class="error-message">{{ confirmPasswordError }}</span>
    </div>

    <div class="auth__options">
      <app-checkbox 
        v-model="acceptTerms"
        :class="{ 'has-error': acceptTermsError }"
      >
        I accept the terms of use and privacy policy
      </app-checkbox>
      <span v-if="acceptTermsError" class="error-message checkbox-error">
        {{ acceptTermsError }}
      </span>
    </div>

    <div class="auth__submit">
      <app-button 
        type="submit"
        :primary="!hasError"
        :disabled="hasError || loading"
      >
        {{ loading ? 'Signing up...' : 'Sign Up' }}
      </app-button>
      
      <div v-if="signupError" class="error-login">
        {{ signupError }}
      </div>
    </div>

    <div class="auth__footer">
      Already have an account?
      <router-link to="/signin">
        <app-link>Log in</app-link>
      </router-link>
    </div>
  </auth-form>
</template>

<style scoped>
  .auth__item {
    position: relative;
  }
  .auth__options { 
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-direction: column;
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

