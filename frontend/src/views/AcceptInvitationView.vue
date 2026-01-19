<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useWorkspaceAccessStore } from '@/stores/workspaceAccessStore';
  import { useWorkspaceStore } from '@/stores/workspaceStore';
  import { useAuthStore } from '@/stores/authStore';
  import AppButton from '@/components/base/AppButton.vue';
  import AppLoadingSpinner from '@/components/base/AppLoadingSpinner.vue';
  import AppContainer from '@/components/base/AppContainer.vue';
  import AppTitle from '@/components/base/AppTitle.vue';

  const route = useRoute();
  const router = useRouter();
  const accessStore = useWorkspaceAccessStore();
  const workspaceStore = useWorkspaceStore();
  const authStore = useAuthStore();

  const token = computed(() => route.params.token as string);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);
  const workspaceName = ref<string | null>(null);

  const isAuthenticated = computed(() => authStore.isAuthenticated);

  onMounted(() => {
    if (!token.value) {
      error.value = 'Invalid invitation link';
    }
  });

  type InvitationView =
    | 'success'
    | 'error'
    | 'unauthenticated'
    | 'accept';

  const view = computed<InvitationView>(() => {
    if (success.value) return 'success';
    if (error.value) return 'error';
    if (!isAuthenticated.value) return 'unauthenticated';
    return 'accept';
  });

  const handleAccept = async () => {
    if (!token.value) return;

    loading.value = true;
    error.value = null;

    try {
      const result = await accessStore.acceptInvitation(token.value);

      success.value = true;
      workspaceName.value = result.workspaceName;

      await workspaceStore.fetchWorkspaces();
      workspaceStore.setCurrentWorkspace(result.workspaceId);

      setTimeout(() => {
        router.push({ name: 'today' });
      }, 2000);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to accept invitation';
      console.error('[AcceptInvitation] Error:', err);
    } finally {
      loading.value = false;
    }
  };

  const handleSignIn = () => {
    localStorage.setItem('pendingInvitation', token.value);
    router.push({ name: 'signin' });
  };

  const handleSignUp = () => {
    localStorage.setItem('pendingInvitation', token.value);
    router.push({ name: 'signup' });
  };

  const handleGoHome = () => {
    router.push({ name: 'today' });
  };

  interface ViewAction {
    label: string;
    action: () => void;
    primary?: boolean;
    secondary?: boolean;
    loading?: boolean;
  }

  interface ViewConfig {
    title: string;
    text: string | null;
    actions?: ViewAction[];
    hint?: string;
    showLoader?: boolean;
    showUser?: boolean;
  }

  const viewConfig = computed<ViewConfig>(() => {
    switch (view.value) {
      case 'success':
        return {
          title: "You're in!",
          text: `You've successfully joined <strong>${workspaceName.value}</strong>`,
          showLoader: true,
        };

      case 'error':
        return {
          title: 'Something went wrong',
          text: error.value,
          actions: [
            {
              label: 'Go to Dashboard',
              action: handleGoHome,
              primary: true,
            },
          ],
        };

      case 'unauthenticated':
        return {
          title: "You're invited!",
          text: `You've been invited to join a workspace in FlowTrack.<br/>
               Sign in or create an account to accept this invitation.`,
          actions: [
            {
              label: 'Sign In',
              action: handleSignIn,
              primary: true,
            },
            {
              label: 'Create Account',
              action: handleSignUp,
              secondary: true,
            },
          ],
          hint: 'After signing in, you\'ll be able to join the workspace',
        };

      case 'accept':
        return {
          title: 'Accept Workspace Invitation',
          text: `You've been invited to collaborate on a team workspace.<br/>
               Click below to join and start working together.`,
          showUser: true,
          actions: [
            {
              label: loading.value ? 'Accepting...' : 'Accept Invitation',
              action: handleAccept,
              primary: true,
              loading: loading.value,
            },
            {
              label: 'Decline',
              action: handleGoHome,
              secondary: true,
            },
          ],
          hint: 'By accepting, you\'ll be added as a member of this workspace',
        };

      default:
        return assertUnreachable(view.value);
    }
  });

  function assertUnreachable(x: never): never {
    throw new Error(`Unhandled view state: ${x}`);
  }
</script>

<template>
  <div class="accept-invitation">

    <div class="accept-invitation__card">
      <app-container size="lg">
        <div class="accept-invitation__header">
          <app-title>
            {{ viewConfig.title }}
          </app-title>
          <p
            v-if="viewConfig.text"
            class="accept-invitation__text"
            v-html="viewConfig.text"
          ></p>
        </div>

        <div v-if="viewConfig.showUser" class="accept-invitation__user">
          <div class="accept-invitation__user-info">
            <div class="accept-invitation__user-label">Signed in as</div>
            <div class="accept-invitation__user-email">
              {{ authStore.userEmail }}
            </div>
          </div>
        </div>

        <div v-if="viewConfig.actions" class="accept-invitation__actions">
          <app-button
            v-for="(action, i) in viewConfig.actions"
            :key="i"
            @click="action.action"
            :primary="action.primary"
            :secondary="action.secondary"
            :loading="action.loading"
            :disabled="action.loading"
          >
            {{ action.label }}
          </app-button>
        </div>

        <app-loading-spinner text="Redirecting to workspace..." v-if="viewConfig.showLoader" />

        <p v-if="viewConfig.hint" class="accept-invitation__hint">
          {{ viewConfig.hint }}
        </p>
      </app-container>
    </div>
  </div>
</template>

<style scoped>
  .accept-invitation {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .accept-invitation__card {
    max-width: 448px;
    width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .accept-invitation__header {
    margin-bottom: var(--space-xl);
  }
  .accept-invitation__text {
    color: var(--color-gray);
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
  }
  .accept-invitation__user {
    margin-bottom: var(--space-xs);
    color: var(--color-black);
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
  }
  .accept-invitation__user-email {
    font-weight: var(--fw-medium);
  }
  .accept-invitation__actions {
    margin: var(--space-xs) 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .accept-invitation__hint {
    color: var(--color-gray);
    font-size: var(--fs-md);
    font-weight: var(--fw-normal);
  }
</style>
