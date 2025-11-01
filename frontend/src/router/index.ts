import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouterScrollBehavior } from 'vue-router';
import WelcomeView from '@/views/WelcomeView.vue';

const scrollBehavior: RouterScrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition;
  } else if (to.path !== from.path) {
    return { top: 0 };
  }
  return {};
};

const router = createRouter({
  history: createWebHashHistory('/FlowTrack'),
  routes: [
    { path: '/', name: 'welcome', component: WelcomeView, meta: { title: 'Welcome' } },
  ],
  scrollBehavior,
});

export default router;  
