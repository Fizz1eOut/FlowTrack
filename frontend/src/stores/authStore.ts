import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { supabase } from '@/utils/supabase';
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  CustomAuthResponse,
  OnboardingData 
} from '@/interface/auth.interface';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const needsOnboarding = ref<boolean>(false);

  const isAuthenticated = computed<boolean>(() => !!user.value);
  const userId = computed<string | undefined>(() => user.value?.id);
  const userEmail = computed<string | undefined>(() => user.value?.email);
  const accessToken = computed<string | undefined>(() => session.value?.access_token);
  const userFullName = computed<string | undefined>(() => user.value?.user_metadata?.full_name);

  const clearError = (): void => {
    error.value = null;
  };

  const signUp = async (credentials: RegisterCredentials): Promise<CustomAuthResponse> => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name,
          },
        },
      });

      if (signUpError) throw signUpError;

      user.value = data.user;
      session.value = data.session;
      
      needsOnboarding.value = true;

      return { 
        success: true, 
        data: { 
          user: data.user, 
          session: data.session 
        } 
      };
    } catch (err) {
      const errorMessage = (err as AuthError).message || 'Registration error';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const signIn = async (credentials: LoginCredentials): Promise<CustomAuthResponse> => {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (signInError) throw signInError;

      user.value = data.user;
      session.value = data.session;

      await checkOnboardingStatus();

      return { 
        success: true, 
        data: { 
          user: data.user, 
          session: data.session 
        } 
      };
    } catch (err) {
      const errorMessage = (err as AuthError).message || 'Login error';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github'): Promise<CustomAuthResponse> => {
    try {
      loading.value = true;
      error.value = null;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/FlowTrack/#/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;

      return { success: true, data: null };
    } catch (err) {
      const errorMessage = (err as AuthError).message || 'OAuth error';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      loading.value = true;
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      user.value = null;
      session.value = null;
      needsOnboarding.value = false;
    } catch (err) {
      const msg = (err as AuthError).message || 'Login error';
      error.value = msg;
      console.error('[AuthStore] signOut error:', msg);
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (email: string): Promise<CustomAuthResponse> => {
    try {
      loading.value = true;
      error.value = null;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/FlowTrack/#/auth/reset-password`,
      });

      if (resetError) throw resetError;

      return { 
        success: true, 
        data: 'Check your email to reset your password.' 
      };
    } catch (err) {
      const errorMessage = (err as AuthError).message || 'Password reset error';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const updatePassword = async (newPassword: string): Promise<CustomAuthResponse> => {
    try {
      loading.value = true;
      error.value = null;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      return { 
        success: true, 
        data: 'Password updated successfully' 
      };
    } catch (err) {
      const errorMessage = (err as AuthError).message || 'Password update error';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const { data } = await supabase.auth.getSession();

      user.value = data.session?.user || null;
      session.value = data.session;

      if (user.value) {
        await checkOnboardingStatus();
      }

      return user.value;
    } catch (err) {
      const msg = (err as AuthError).message || 'Error getting user';
      error.value = msg;
      console.error('[AuthStore] getCurrentUser error:', msg);
      return null;
    }
  };

  const checkOnboardingStatus = async (): Promise<void> => {
    if (!user.value) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.value.id)
        .limit(1);

      if (fetchError) throw fetchError;

      needsOnboarding.value = !data || data.length === 0;
    } catch (err) {
      console.error('[AuthStore] checkOnboardingStatus error:', err);
      needsOnboarding.value = true;
    }
  };

  const completeOnboarding = async (data: OnboardingData): Promise<CustomAuthResponse> => {
    if (!user.value) {
      return { success: false, error: 'The user is not authorized' };
    }

    try {
      loading.value = true;
      error.value = null;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          timezone: data.timezone,
          work_hours_start: data.workHoursStart,
          work_hours_end: data.workHoursEnd,
        })
        .eq('id', user.value.id);

      if (profileError) throw profileError;

      const workspaceName = data.workspaceName || (data.workspaceType === 'personal' ? 'Personal' : 'Team Workspace');

      const { error: workspaceError } = await supabase.from('workspaces').insert({
        name: workspaceName,
        type: data.workspaceType,
        owner_id: user.value.id,
      });

      if (workspaceError) throw workspaceError;

      needsOnboarding.value = false;

      return { 
        success: true, 
        data: 'Onboarding completed' 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Termination error onboarding';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const initialize = async (): Promise<void> => {
    await getCurrentUser();

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession: Session | null) => {
      console.log('[Auth] State changed:', event);

      user.value = currentSession?.user || null;
      session.value = currentSession;

      if (event === 'SIGNED_IN' && currentSession?.user) {
        await checkOnboardingStatus();
      }

      if (event === 'SIGNED_OUT') {
        needsOnboarding.value = false;
      }
    });
  };

  const userCreatedAt = computed(() => user.value?.created_at ?? null);

  const userCreatedAtFormatted = computed(() => {
    if (!user.value?.created_at) return null;
    return new Date(user.value.created_at).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),
    needsOnboarding: readonly(needsOnboarding),

    isAuthenticated,
    userId,
    userEmail,
    userFullName,
    accessToken,
    userCreatedAt,
    userCreatedAtFormatted,

    clearError,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    getCurrentUser,
    completeOnboarding,
    initialize,
  };
});
