import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouterScrollBehavior, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

import WelcomeView from '@/views/WelcomeView.vue';
import SignUpView from '@/views/SignUpView.vue';
import SignInView from '@/views/SignInView.vue';
import OnboardingView from '@/views/OnboardingView.vue';
import DashboardView from '@/views/DashboardView.vue';

const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition;
  } else if (to.path !== from.path) {
    return { top: 0 };
  }
  return {};
};

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'welcome', component: WelcomeView, meta: { title: 'Welcome to FlowTrack', requiresAuth: false, guestOnly: true } },
  { path: '/signup', name: 'signup', component: SignUpView, meta: { title: 'Sign Up', requiresAuth: false, guestOnly: true } },
  { path: '/signin', name: 'signin', component: SignInView, meta: { title: 'Sign In', requiresAuth: false, guestOnly: true } },
  {path: '/onboarding', name: 'onboarding', component: OnboardingView, meta: { title: 'Get Started', requiresAuth: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard', requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHashHistory('/FlowTrack'),
  routes,
  scrollBehavior,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  document.title = (to.meta.title as string) || 'FlowTrack';

  if (!authStore.user && !authStore.loading) {
    await authStore.initialize();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.requiresAuth;
  const guestOnly = to.meta.guestOnly;

  if (requiresAuth && !isAuthenticated) {
    console.log('[Router] Redirect to signin - auth required');
    return next({ name: 'signin', query: { redirect: to.fullPath } });
  }

  if (guestOnly && isAuthenticated) {
    console.log('[Router] Redirect to dashboard - already authenticated');
    return next({ name: 'onboarding' });
  }
  next();
});

export default router;
