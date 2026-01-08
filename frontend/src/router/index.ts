import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouterScrollBehavior, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

import WelcomeView from '@/views/WelcomeView.vue';
import SignUpView from '@/views/SignUpView.vue';
import SignInView from '@/views/SignInView.vue';
import OnboardingView from '@/views/OnboardingView.vue';
import DashboardLayoutView from '@/views/DashboardLayoutView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/ResetPasswordView.vue';

import TodayView from '@/views/dashboard/TodayView.vue';

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
  { path: '/onboarding', name: 'onboarding', component: OnboardingView, meta: { title: 'Get Started', requiresAuth: true } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { title: 'Forgot password', requiresAuth: false } },
  { path: '/reset-password', name: 'reset-password', component: ResetPasswordView, meta: { title: 'Reset password', requiresAuth: false } },

  {
    path: '/dashboard',
    component: DashboardLayoutView,
    meta: { requiresAuth: true, title: 'Dashboard' },
    children: [
      { path: '', redirect: '/dashboard/today' },
      { path: 'today', name: 'today', component: TodayView, meta: { title: 'Today' } },
    ],
  },
  
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

  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.requiresAuth;
  const guestOnly = to.meta.guestOnly;
  const needsOnboarding = authStore.needsOnboarding;

  if (requiresAuth && !isAuthenticated) {
    console.log('[Router] Redirect to signin - auth required');
    return next({ name: 'signin', query: { redirect: to.fullPath } });
  }

  if (guestOnly && isAuthenticated) {
    if (needsOnboarding) {
      console.log('[Router] Redirect to onboarding - onboarding required');
      return next({ name: 'onboarding' });
    } else {
      console.log('[Router] Redirect to dashboard - onboarding complete');
      return next({ name: 'today' });
    }
  }

  if (to.name === 'onboarding' && !needsOnboarding) {
    console.log('[Router] Redirect to dashboard - onboarding already done');
    return next({ name: 'today' });
  }

  next();
});

export default router;
