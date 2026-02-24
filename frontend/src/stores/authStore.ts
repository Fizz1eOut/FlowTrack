import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { supabase } from '@/utils/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  CustomAuthResponse,
  UserProfile
} from '@/interface/auth.interface';

let isSignUpInProgress = false;

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
  const userProfile = ref<UserProfile | null>(null);

  const clearError = (): void => {
    error.value = null;
  };

  const loadUserProfile = async () => {
    if (!user.value) return;

    let retries = 5;

    while (retries > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .maybeSingle();

      if (data) {
        userProfile.value = data as UserProfile;
        return;
      }

      if (error) {
        console.warn('[AuthStore] profile fetch error, retrying...', error.message);
      }

      retries--;
      await new Promise(r => setTimeout(r, 300));
    }

    console.error('[AuthStore] profile not found after retries');
  };

  const signUp = async (credentials: RegisterCredentials): Promise<CustomAuthResponse> => {
    if (isSignUpInProgress) {
      return { 
        success: false, 
        error: 'Registration is already in progress. Please wait.' 
      };
    }

    if (loading.value) {
      return { 
        success: false, 
        error: 'Another operation is in progress' 
      };
    }

    try {
      isSignUpInProgress = true;
      loading.value = true;
      error.value = null;

      const normalizedEmail = credentials.email.trim().toLowerCase();
      const normalizedName = credentials.name.trim();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: credentials.password,
        options: {
          data: {
            full_name: normalizedName,
          },
        },
      });

      if (signUpError) {
        if (
          signUpError.message.includes('already registered') ||
        signUpError.message.includes('already exists') ||
        signUpError.message.includes('duplicate') ||
        signUpError.message.includes('User already registered') ||
        signUpError.status === 422 ||
        signUpError.status === 409
        ) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
      
        throw signUpError;
      }
    
      if (!data.user) {
        throw new Error('User creation failed - no user returned from Supabase');
      }

      user.value = data.user;
      session.value = data.session;

      let profileRetries = 5;
      while (profileRetries > 0) {
        try {
          await loadUserProfile();
          break;
        } catch (err) {
          profileRetries--;
          if (profileRetries > 0) {
            await new Promise(r => setTimeout(r, 500));
          } else {
            console.error('[AuthStore] Profile load failed after retries');
          }
        }
      }

      needsOnboarding.value = true;

      const pendingInvitation = localStorage.getItem('pendingInvitation');
      if (pendingInvitation) {
        localStorage.removeItem('pendingInvitation');
        setTimeout(() => {
          window.location.href = `/#/invite/${pendingInvitation}`;
        }, 100);
      }

      return {
        success: true,
        data: { user: data.user, session: data.session },
      };
    } catch (err) {
      const errorMessage = (err as AuthError).message || 'Registration error';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    
      setTimeout(() => {
        isSignUpInProgress = false;
      }, 2000);
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

      await loadUserProfile();
      await checkOnboardingStatus();

      const pendingInvitation = localStorage.getItem('pendingInvitation');
      if (pendingInvitation) {
        localStorage.removeItem('pendingInvitation');

        setTimeout(() => {
          window.location.href = `/#/invite/${pendingInvitation}`;
        }, 100);
      }

      return { 
        success: true, 
        data: { 
          user: data.user, 
          session: data.session 
        } 
      };
    } catch (err) {
      const rawMessage = (err as AuthError).message ?? '';

      const isInvalidCredentials = 
      rawMessage.includes('Invalid login credentials') ||
      rawMessage.includes('Incorrect email or password');

      const errorMessage = isInvalidCredentials
        ? 'Incorrect email or password'
        : 'Login error. Please try again later';

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
        redirectTo: `${window.location.origin}/FlowTrack/#/reset-password`
      });
      console.log(`${window.location.origin}/FlowTrack/#/reset-password`);
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
        await loadUserProfile();
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

  const createWorkspace = async (workspaceType: 'personal' | 'team'): Promise<CustomAuthResponse> => {
    if (!user.value) {
      return { success: false, error: 'The user is not authorized' };
    }

    try {
      loading.value = true;
      error.value = null;

      const workspaceName = workspaceType === 'personal' ? 'Personal' : 'Team Workspace';

      const { error: workspaceError } = await supabase.from('workspaces').insert({
        name: workspaceName,
        type: workspaceType,
        owner_id: user.value.id,
      });

      if (workspaceError) throw workspaceError;

      return { 
        success: true, 
        data: 'Workspace created successfully' 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workspace';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const updateWorkSettings = async (data: {
    workHoursStart: string;
    workHoursEnd: string;
    timezone: string;
  }): Promise<CustomAuthResponse> => {
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

      needsOnboarding.value = false;

      return { 
        success: true, 
        data: 'Settings updated successfully' 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  };

  const initialized = ref(false);
  const initialize = async () => {
    const { data } = await supabase.auth.getSession();

    user.value = data.session?.user ?? null;
    session.value = data.session;

    supabase.auth.onAuthStateChange((event, currentSession) => {
      user.value = currentSession?.user ?? null;
      session.value = currentSession;
    });

    initialized.value = true;
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
    userProfile: readonly(userProfile),

    isAuthenticated,
    userId,
    userEmail,
    userFullName,
    accessToken,
    userCreatedAt,
    userCreatedAtFormatted,

    clearError,
    loadUserProfile,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    getCurrentUser,
    createWorkspace,
    updateWorkSettings,
    initialize,
  };
});
