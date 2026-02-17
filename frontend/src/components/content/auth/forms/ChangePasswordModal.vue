<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useForm, useField } from 'vee-validate';
  import * as yup from 'yup';
  import { supabase } from '@/utils/supabase';
  import { showToast } from '@/stores/toastStore';
  import AppInput from '@/components/inputs/AppInput.vue';
  import AppButton from '@/components/base/AppButton.vue';
  import AppIcon from '@/components/base/AppIcon.vue';
  import AppTitle from '@/components/base/AppTitle.vue';

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'success'): void;
  }>();

  const validationSchema = yup.object({
    currentPassword: yup.string().required('Enter your current password'),
    newPassword: yup.string()
      .required('Enter a new password')
      .min(6, 'Minimum 6 characters')
      .notOneOf([yup.ref('currentPassword')], 'The new password must be different from the current one.'),
    confirmPassword: yup.string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Repeat the new password'),
  });

  const { handleSubmit } = useForm({ validationSchema });
  const { value: currentPassword, errorMessage: currentPasswordError } = useField<string>('currentPassword', undefined, { initialValue: '' });
  const { value: newPassword, errorMessage: newPasswordError } = useField<string>('newPassword', undefined, { initialValue: '' });
  const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword', undefined, { initialValue: '' });

  const hasError = computed(() => 
    !!currentPasswordError.value || !!newPasswordError.value || !!confirmPasswordError.value
  );

  const loading = ref(false);

  const onSubmit = handleSubmit(async (values) => {
    try {
      loading.value = true;

      const { data: { user } } = await supabase.auth.getUser();
    
      if (!user?.email) {
        showToast('User not found', 'error');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      });

      if (signInError) {
        showToast('Incorrect current password', 'error');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        showToast(updateError.message, 'error');
        return;
      }

      showToast('Password changed successfully!', 'success');
      emit('success');
      emit('close');

    } catch (err) {
      showToast('Error changing password', 'error');
    } finally {
      loading.value = false;
    }
  });

  const showCurrentPassword = ref(false);
  const showNewPassword = ref(false);
  const showConfirmPassword = ref(false);

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') showCurrentPassword.value = !showCurrentPassword.value;
    else if (field === 'new') showNewPassword.value = !showNewPassword.value;
    else showConfirmPassword.value = !showConfirmPassword.value;
  };
</script>

<template>
  <div class="change-password" @click.stop>
    <div class="change-password__header">
      <div class="change-password__row">
        <app-title>Change password</app-title>
        <p class="change-password__text">Enter your current password and create a new one.</p>
      </div>

      <app-button @click="$emit('close')" class="change-password__btn--cross">
        <app-icon 
          name="cross"
          size="var(--fs-xl)"
          color="var(--color-gray)"
        />
      </app-button>
    </div>

    <div class="change-password__body">
      <div class="change-password__item">
        <div class="change-password__name">Current Password</div>
        <app-input 
          v-model="currentPassword" 
          :type="showCurrentPassword ? 'text' : 'password'" 
          placeholder="Enter current password"
          :class="{ 'has-error': currentPasswordError }"
          autocomplete="new-password"
        />
        <app-button 
          type="button"
          class="toggle-password" 
          @click="togglePasswordVisibility('current')"
        >
          <app-icon 
            :name="showCurrentPassword ? 'eye-off' : 'eye'" 
            size="20px" 
            style="color: var(--white)" 
          />
        </app-button>
        <span v-if="currentPasswordError" class="error-message">{{ currentPasswordError }}</span>
      </div>

      <div class="change-password__item">
        <div class="change-password__name">New Password</div>
        <app-input 
          v-model="newPassword" 
          :type="showNewPassword ? 'text' : 'password'"
          placeholder="Enter new password"
          :class="{ 'has-error': newPasswordError }"
          autocomplete="new-password"
        />
        <app-button 
          type="button"
          class="toggle-password" 
          @click="togglePasswordVisibility('new')"
        >
          <app-icon 
            :name="showNewPassword ? 'eye-off' : 'eye'" 
            size="20px" 
            style="color: var(--white)" 
          />
        </app-button>
        <span v-if="newPasswordError" class="error-message">{{ newPasswordError }}</span>
      </div>

      <div class="change-password__item">
        <div class="change-password__name">Confirm Password</div>
        <app-input 
          v-model="confirmPassword" 
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Confirm new password"
          :class="{ 'has-error': confirmPasswordError }"
          autocomplete="new-password"
        />
        <app-button 
          type="button"
          class="toggle-password" 
          @click="togglePasswordVisibility('confirm')"
        >
          <app-icon 
            :name="showConfirmPassword ? 'eye-off' : 'eye'" 
            size="20px" 
            style="color: var(--white)" 
          />
        </app-button>
        <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
      </div>

      <div class="change-password__submit">
        <app-button secondary @click="emit('close')">Cancel</app-button>
        <app-button 
          @click="onSubmit"
          :disabled="hasError"
          primary
        >
          Accept
        </app-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .change-password__header {
    margin-bottom: var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }
  .change-password__text {
    font-size: var(--fs-md);
    color: var(--color-gray);
  }
  .change-password__btn--cross {
    width: 20px;
    height: 20px;
  }
  .change-password__body > *:not(:last-child) {
    margin-bottom: var(--space-lg);
  }
  .change-password__item {
    position: relative;
  }
  .change-password__name {
    font-size: var(--fs-md);
    color: var(--color-black);
    margin-bottom: var(--space-xs);
  }
  .toggle-password {
    position: absolute;
    right: 10px;
    top: 37px;
    width: 20px;
    height: 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
  }
  .error-message {
    color: var(--error);
    font-size: 12px;
  }
  .has-error :deep(.input) {
    border: 1px solid var(--error);
    border-radius: var(--radius-sm);
  }
  .change-password__submit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
</style>
